import 'dotenv/config';
import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { createPublicClient, createWalletClient, http, verifyTypedData, isAddress, Hex, encodeFunctionData } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import Redis from 'ioredis';
import { SignJWT, jwtVerify } from 'jose';
import { z } from 'zod';

type NonceRecord = {
  address: string;
  nonce: string; // 0x-prefixed bytes32
  chainId: number;
  expiresAt: number; // epoch seconds
  used: boolean;
};

type RefreshRecord = {
  jti: string;
  address: string;
  expiresAt: number; // epoch seconds
  revoked: boolean;
};

const server = Fastify({ logger: true });
await server.register(fastifyCors, { origin: true });

const nonceStore = new Map<string, NonceRecord>(); // key: nonce
const refreshStore = new Map<string, RefreshRecord>(); // key: jti

// Simple in-memory rate limiter: fixed window counters per IP and endpoint
type RateKey = string; // `${ip}:${route}`
const rateCounters = new Map<RateKey, { count: number; windowStartMs: number }>();
const RATE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  '/auth/nonce': { limit: 10, windowMs: 60_000 },
  '/auth/verify': { limit: 15, windowMs: 60_000 },
};

function checkRateLimit(ip: string, route: string): boolean {
  const cfg = RATE_LIMITS[route];
  if (!cfg) return true;
  const now = Date.now();
  const key = `${ip}:${route}`;
  const rec = rateCounters.get(key);
  if (!rec || now - rec.windowStartMs >= cfg.windowMs) {
    rateCounters.set(key, { count: 1, windowStartMs: now });
    return true;
  }
  if (rec.count < cfg.limit) {
    rec.count += 1;
    return true;
  }
  return false;
}

// Periodic cleanup of stale rate windows and expired nonces
setInterval(() => {
  const now = Date.now();
  for (const [key, rec] of rateCounters) {
    const route = key.split(':').slice(1).join(':');
    const cfg = RATE_LIMITS[route];
    if (!cfg) continue;
    if (now - rec.windowStartMs >= cfg.windowMs) rateCounters.delete(key);
  }
  const nowSec = Math.floor(now / 1000);
  for (const [nonce, record] of nonceStore) {
    if (record.used || record.expiresAt < nowSec - 60) {
      nonceStore.delete(nonce);
    }
  }
}, 30_000).unref();

const TARGET_CHAIN_ID = Number(process.env.TARGET_CHAIN_ID || mainnet.id);
const REGISTRY_ADDRESS = process.env.REGISTRY_ADDRESS as `0x${string}` | undefined;
const publicClient = createPublicClient({ chain: sepolia, transport: http(process.env.SEPOLIA_RPC_URL) });
const RELAYER_PK = process.env.PRIVATE_KEY as `0x${string}` | undefined;
const relayerAccount = RELAYER_PK ? privateKeyToAccount(RELAYER_PK) : undefined;
const walletClient = relayerAccount ? createWalletClient({ account: relayerAccount, chain: sepolia, transport: http(process.env.SEPOLIA_RPC_URL) }) : undefined;

// Redis (optional). If REDIS_URL is unset, we fallback to in-memory for tests.
const useRedis = !!process.env.REDIS_URL;
const redis = useRedis ? new Redis(process.env.REDIS_URL!) : (null as unknown as Redis);

// EIP-712 domain and types for login
const EIP712_DOMAIN = (chainId: number) => ({
  name: 'Raven',
  version: '1',
  chainId,
  verifyingContract: '0x0000000000000000000000000000000000000000' as const,
});

const LOGIN_TYPES = {
  Login: [
    { name: 'address', type: 'address' },
    { name: 'nonce', type: 'bytes32' },
    { name: 'chainId', type: 'uint256' },
    { name: 'expiry', type: 'uint256' },
  ],
} as const;

const JWT_ISSUER = 'raven-auth';
const JWT_AUDIENCE = 'raven-api';
const JWT_TTL_SECONDS = 10 * 60; // 10 minutes
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

// Ephemeral key for demo; replace with env-managed key pair
let jwtSecret: Uint8Array | null = null;

function randomHex(bytes: number): string {
  const r = crypto.getRandomValues(new Uint8Array(bytes));
  return '0x' + Array.from(r).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Initialize JWT secret at boot so refresh/logout work pre-login
if (!jwtSecret) {
  jwtSecret = crypto.getRandomValues(new Uint8Array(32));
}

server.get('/health', async () => ({ ok: true }));

server.get('/auth/nonce', async (req, reply) => {
  const ip = (req.ip || 'unknown');
  if (!checkRateLimit(ip, '/auth/nonce')) {
    server.log.warn({ ip }, 'rate limit exceeded on /auth/nonce');
    return reply.code(429).send({ error: 'rate limit exceeded' });
  }
  const address = (req.query as any)?.address as string | undefined;
  if (!address || !isAddress(address)) {
    return reply.code(400).send({ error: 'address required' });
  }
  const chainId = TARGET_CHAIN_ID;
  const nonce = randomHex(32);
  const expiresAt = Math.floor(Date.now() / 1000) + 5 * 60; // 5 minutes
  const rec: NonceRecord = { address, nonce, chainId, expiresAt, used: false };
  nonceStore.set(nonce, rec);
  const domain = EIP712_DOMAIN(chainId);
  const message = { address, nonce, chainId, expiry: expiresAt };
  return { nonce, chainId, expiry: expiresAt, domain, types: LOGIN_TYPES, primaryType: 'Login', message };
});

const VerifySchema = z.object({
  address: z.string(),
  signature: z.string(),
  nonce: z.string(),
});

server.post('/auth/verify', async (req, reply) => {
  const ip = (req.ip || 'unknown');
  if (!checkRateLimit(ip, '/auth/verify')) {
    server.log.warn({ ip }, 'rate limit exceeded on /auth/verify');
    return reply.code(429).send({ error: 'rate limit exceeded' });
  }
  const parsed = VerifySchema.safeParse(req.body);
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body' });
  const { address, signature, nonce } = parsed.data;
  const rec = nonceStore.get(nonce);
  if (!rec) return reply.code(400).send({ error: 'unknown nonce' });
  if (rec.used) return reply.code(400).send({ error: 'nonce used' });
  if (rec.expiresAt < Math.floor(Date.now() / 1000)) return reply.code(400).send({ error: 'nonce expired' });
  if (rec.address.toLowerCase() !== address.toLowerCase()) return reply.code(400).send({ error: 'address mismatch' });

  const domain = EIP712_DOMAIN(rec.chainId);
  const message = { address: rec.address as `0x${string}` , nonce: rec.nonce as Hex, chainId: BigInt(rec.chainId), expiry: BigInt(rec.expiresAt) } as const;

  const ok = await verifyTypedData({
    address: rec.address as `0x${string}`,
    domain,
    types: LOGIN_TYPES,
    primaryType: 'Login',
    message,
    signature: signature as `0x${string}`,
  }).catch(() => false);

  if (!ok) {
    server.log.warn({ ip, address, nonce }, 'signature verification failed');
    return reply.code(401).send({ error: 'invalid signature' });
  }

  rec.used = true;
  nonceStore.set(nonce, rec);

  if (!jwtSecret) {
    jwtSecret = crypto.getRandomValues(new Uint8Array(32));
  }

  const now = Math.floor(Date.now() / 1000);
  const jwt = await new SignJWT({ sub: rec.address, chainId: rec.chainId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setIssuer('raven-auth')
    .setAudience('raven-api')
    .setExpirationTime(now + 600)
    .sign(jwtSecret!);

  const refreshJti = randomHex(16);
  const refresh = await new SignJWT({ sub: rec.address, type: 'refresh', jti: refreshJti })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setIssuer('raven-auth')
    .setAudience('raven-api')
    .setExpirationTime(now + 604800)
    .sign(jwtSecret!);

  refreshStore.set(refreshJti, {
    jti: refreshJti,
    address: rec.address,
    expiresAt: now + 604800,
    revoked: false,
  });

  return {
    token: jwt,
    tokenType: 'Bearer',
    expiresIn: 600,
    refreshToken: refresh,
    refreshExpiresIn: 604800,
  };
});

// JWT verification utility
async function verifyAccessToken(authHeader?: string) {
  if (!authHeader) throw new Error('missing auth');
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) throw new Error('bad auth');
  if (!jwtSecret) throw new Error('server not initialized');
  const { payload } = await jwtVerify(token, jwtSecret, {
    issuer: 'raven-auth',
    audience: 'raven-api',
  });
  return payload as unknown as { sub: string; chainId: number; iat: number; exp: number };
}

// POST /auth/refresh
const RefreshSchema = z.object({ refreshToken: z.string() });
server.post('/auth/refresh', async (req, reply) => {
  const ip = (req.ip || 'unknown');
  const parsed = RefreshSchema.safeParse(req.body);
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body' });
  const { refreshToken } = parsed.data;
  if (!jwtSecret) return reply.code(500).send({ error: 'server not ready' });
  try {
    const { payload } = await jwtVerify(refreshToken, jwtSecret, {
      issuer: 'raven-auth',
      audience: 'raven-api',
    });
    const jti = (payload as any).jti as string | undefined;
    const address = (payload as any).sub as string | undefined;
    if (!jti || !address) throw new Error('bad token');
    const rec = refreshStore.get(jti);
    if (!rec || rec.revoked) return reply.code(401).send({ error: 'refresh invalid' });
    if (rec.expiresAt < Math.floor(Date.now() / 1000)) return reply.code(401).send({ error: 'refresh expired' });
    // rotate: revoke old, issue new pair
    rec.revoked = true;
    refreshStore.set(jti, rec);

    const now = Math.floor(Date.now() / 1000);
    const access = await new SignJWT({ sub: address, chainId: TARGET_CHAIN_ID })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(now)
      .setIssuer('raven-auth')
      .setAudience('raven-api')
      .setExpirationTime(now + 600)
      .sign(jwtSecret!);

    const newJti = randomHex(16);
    const newRefresh = await new SignJWT({ sub: address, type: 'refresh', jti: newJti })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(now)
      .setIssuer('raven-auth')
      .setAudience('raven-api')
      .setExpirationTime(now + 604800)
      .sign(jwtSecret!);

    refreshStore.set(newJti, { jti: newJti, address, expiresAt: now + 604800, revoked: false });

    server.log.info({ ip, address }, 'refresh rotated');
    return reply.send({ token: access, tokenType: 'Bearer', expiresIn: 600, refreshToken: newRefresh, refreshExpiresIn: 604800 });
  } catch (e) {
    server.log.warn({ ip }, 'refresh failed');
    return reply.code(401).send({ error: 'invalid refresh token' });
  }
});

// POST /auth/logout
const LogoutSchema = z.object({ refreshToken: z.string() });
server.post('/auth/logout', async (req, reply) => {
  const parsed = LogoutSchema.safeParse(req.body);
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body' });
  const { refreshToken } = parsed.data;
  if (!jwtSecret) return reply.code(200).send({ ok: true });
  try {
    const { payload } = await jwtVerify(refreshToken, jwtSecret, { issuer: 'raven-auth', audience: 'raven-api' });
    const jti = (payload as any).jti as string | undefined;
    if (jti) {
      const rec = refreshStore.get(jti);
      if (rec) { rec.revoked = true; refreshStore.set(jti, rec); }
    }
  } catch {}
  return reply.send({ ok: true });
});

// Protected route example
server.get('/me', async (req, reply) => {
  try {
    const payload = await verifyAccessToken(req.headers['authorization']);
    return { address: payload.sub, chainId: payload.chainId, tokenExpiresAt: payload.exp };
  } catch (e) {
    return reply.code(401).send({ error: 'unauthorized' });
  }
});

// Registry read endpoint
server.get('/registry/is-active', async (req, reply) => {
  try {
    if (!REGISTRY_ADDRESS) return reply.code(500).send({ error: 'REGISTRY_ADDRESS not set' });
    const q = req.query as any;
    const authorizer = q.authorizer as `0x${string}`;
    const delegate = q.delegate as `0x${string}`;
    const scope = q.scope as `0x${string}`;
    if (!isAddress(authorizer) || !isAddress(delegate) || !scope) return reply.code(400).send({ error: 'bad params' });

    // Minimal ABI for isDelegationActive
    const abi = [{
      "inputs": [
        {"internalType":"address","name":"authorizer","type":"address"},
        {"internalType":"address","name":"delegate","type":"address"},
        {"internalType":"bytes32","name":"scope","type":"bytes32"}
      ],
      "name":"isDelegationActive",
      "outputs":[{"internalType":"bool","name":"","type":"bool"}],
      "stateMutability":"view","type":"function"
    }] as const;

    const active = await publicClient.readContract({
      address: REGISTRY_ADDRESS,
      abi,
      functionName: 'isDelegationActive',
      args: [authorizer, delegate, scope]
    });
    return { active };
  } catch (e) {
    server.log.warn(e, 'registry read failed');
    return reply.code(500).send({ error: 'registry read failed' });
  }
});

// Relayer: EIP-712 Delegation type (must match contract)
const DELEGATION_TYPES = {
  Delegation: [
    { name: 'authorizer', type: 'address' },
    { name: 'delegate', type: 'address' },
    { name: 'scope', type: 'bytes32' },
    { name: 'nonce', type: 'uint256' },
    { name: 'expiry', type: 'uint256' },
  ],
} as const;

type Authorization = {
  authorizer: `0x${string}`
  delegate: `0x${string}`
  scope: Hex
  nonce: bigint
  expiry: bigint
  signature: `0x${string}`
}

// Anti-replay store for authorizer nonces seen by relayer
const seenNonceByAuthorizer = new Map<string, bigint>();
const QUEUE_KEY = 'relay:queue';
const NONCE_KEY_PREFIX = 'relay:nonce:'; // + lowercased authorizer

// Simple in-memory queue
type RelayJob = { to: `0x${string}`; data: Hex; value?: bigint; auth: Authorization };
const relayQueue: RelayJob[] = [];
let isWorkerRunning = false;

async function enqueue(job: RelayJob) {
  if (useRedis) {
    await redis.rpush(QUEUE_KEY, JSON.stringify({
      to: job.to,
      data: job.data,
      value: (job.value ?? 0n).toString(),
      auth: job.auth,
    }));
  } else {
    relayQueue.push(job);
  }
  runWorker();
}

async function runWorker() {
  if (isWorkerRunning) return;
  isWorkerRunning = true;
  try {
    if (useRedis) {
      while (true) {
        const raw = await redis.lpop(QUEUE_KEY);
        if (!raw) break;
        const parsed = JSON.parse(raw) as any;
        const job: RelayJob = {
          to: parsed.to,
          data: parsed.data,
          value: BigInt(parsed.value || '0'),
          auth: parsed.auth,
        };
        if (!walletClient || !relayerAccount) {
          server.log.error('relayer wallet not configured');
          await redis.lpush(QUEUE_KEY, raw);
          break;
        }
        try {
          const hash = await walletClient.sendTransaction({
            account: relayerAccount,
            to: job.to,
            data: job.data,
            value: job.value || 0n,
          });
          server.log.info({ hash }, 'relayed tx sent');
        } catch (e) {
          server.log.error(e, 'relay tx failed');
          await redis.rpush(QUEUE_KEY, raw);
        }
      }
    } else {
      while (relayQueue.length > 0) {
        const job = relayQueue.shift()!;
        if (!walletClient || !relayerAccount) {
          server.log.error('relayer wallet not configured');
          // push back and exit
          relayQueue.unshift(job);
          break;
        }
        try {
          const hash = await walletClient.sendTransaction({
            account: relayerAccount,
            to: job.to,
            data: job.data,
            value: job.value || 0n,
          });
          server.log.info({ hash }, 'relayed tx sent');
        } catch (e) {
          server.log.error(e, 'relay tx failed');
          // simple backoff: push to tail
          relayQueue.push(job);
        }
      }
    }
  } finally {
    isWorkerRunning = false;
  }
}

const RelaySchema = z.object({
  authorization: z.object({
    authorizer: z.string(),
    delegate: z.string(),
    scope: z.string(),
    nonce: z.string(),
    expiry: z.string(),
    signature: z.string(),
  }),
  call: z.object({ to: z.string(), data: z.string().optional(), value: z.string().optional() })
});

function delegationDomain(verifyingContract: `0x${string}`) {
  return {
    name: 'RavenAuth',
    version: '1',
    chainId: sepolia.id,
    verifyingContract,
  } as const;
}

async function validateAuthorization(auth: Authorization) {
  if (!REGISTRY_ADDRESS) throw new Error('REGISTRY_ADDRESS not set');
  if (!isAddress(auth.authorizer) || !isAddress(auth.delegate)) throw new Error('bad address');
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (auth.expiry < now) throw new Error('authorization expired');
  const key = NONCE_KEY_PREFIX + auth.authorizer.toLowerCase();
  const lastMem = seenNonceByAuthorizer.get(auth.authorizer.toLowerCase()) || 0n;
  const lastRedis = useRedis ? await redis.get(key) : null;
  const last = lastRedis ? BigInt(lastRedis) : lastMem;
  if (auth.nonce <= last) throw new Error('nonce replay');

  const ok = await verifyTypedData({
    address: auth.authorizer,
    domain: delegationDomain(REGISTRY_ADDRESS),
    types: DELEGATION_TYPES,
    primaryType: 'Delegation',
    message: {
      authorizer: auth.authorizer,
      delegate: auth.delegate,
      scope: auth.scope,
      nonce: auth.nonce,
      expiry: auth.expiry,
    },
    signature: auth.signature,
  }).catch(() => false);
  if (!ok) throw new Error('bad signature');

  // optional live check with registry
  const abi = [{
    inputs: [
      { internalType: 'address', name: 'authorizer', type: 'address' },
      { internalType: 'address', name: 'delegate', type: 'address' },
      { internalType: 'bytes32', name: 'scope', type: 'bytes32' },
    ], name: 'isDelegationActive', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'view', type: 'function'
  }] as const;
  const active = await publicClient.readContract({ address: REGISTRY_ADDRESS, abi, functionName: 'isDelegationActive', args: [auth.authorizer, auth.delegate, auth.scope] });
  if (!active) throw new Error('delegation not active');

  seenNonceByAuthorizer.set(auth.authorizer.toLowerCase(), auth.nonce);
  if (useRedis) await redis.set(key, auth.nonce.toString());
}

server.post('/relay/execute', async (req, reply) => {
  if (!walletClient) return reply.code(500).send({ error: 'relayer not configured' });
  const parsed = RelaySchema.safeParse(req.body);
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body' });
  const a = parsed.data.authorization;
  const c = parsed.data.call;
  const auth: Authorization = {
    authorizer: a.authorizer as `0x${string}`,
    delegate: a.delegate as `0x${string}`,
    scope: a.scope as Hex,
    nonce: BigInt(a.nonce),
    expiry: BigInt(a.expiry),
    signature: a.signature as `0x${string}`,
  };
  try {
    await validateAuthorization(auth);
    const job: RelayJob = { to: c.to as `0x${string}`, data: (c.data as Hex) || '0x', value: c.value ? BigInt(c.value) : 0n, auth };
    await enqueue(job);
    return { enqueued: true };
  } catch (e: any) {
    return reply.code(400).send({ error: e?.message || 'validation failed' });
  }
});

server.post('/relay/batch', async (req, reply) => {
  if (!walletClient) return reply.code(500).send({ error: 'relayer not configured' });
  const body = req.body as any;
  if (!Array.isArray(body)) return reply.code(400).send({ error: 'array expected' });
  const results: any[] = [];
  for (const item of body) {
    const parsed = RelaySchema.safeParse(item);
    if (!parsed.success) { results.push({ enqueued: false, error: 'invalid item' }); continue; }
    const a = parsed.data.authorization;
    const c = parsed.data.call;
    const auth: Authorization = {
      authorizer: a.authorizer as `0x${string}`,
      delegate: a.delegate as `0x${string}`,
      scope: a.scope as Hex,
      nonce: BigInt(a.nonce),
      expiry: BigInt(a.expiry),
      signature: a.signature as `0x${string}`,
    };
    try {
      await validateAuthorization(auth);
      const job: RelayJob = { to: c.to as `0x${string}`, data: (c.data as Hex) || '0x', value: c.value ? BigInt(c.value) : 0n, auth };
      await enqueue(job);
      results.push({ enqueued: true });
    } catch (e: any) {
      results.push({ enqueued: false, error: e?.message || 'validation failed' });
    }
  }
  return { results };
});

// ABI encode helper for demo/UI usage
const EncodeSchema = z.object({
  abi: z.array(z.any()),
  functionName: z.string(),
  args: z.array(z.any()).optional(),
});
server.post('/encode', async (req, reply) => {
  const parsed = EncodeSchema.safeParse(req.body);
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body' });
  try {
    const data = encodeFunctionData({
      abi: parsed.data.abi as any,
      functionName: parsed.data.functionName as any,
      args: (parsed.data.args || []) as any,
    });
    return { data };
  } catch (e: any) {
    return reply.code(400).send({ error: e?.message || 'encode failed' });
  }
});

const PORT = Number(process.env.PORT || 8787);
server.listen({ port: PORT, host: '0.0.0.0' }).then(() => {
  server.log.info(`Auth server listening on http://localhost:${PORT}`);
});
