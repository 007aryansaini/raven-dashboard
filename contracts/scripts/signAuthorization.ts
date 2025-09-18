import { createWalletClient, http } from 'viem'
import { keccak256, stringToBytes } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'

async function main() {
  const pk = process.env.AUTHORIZER_PK as `0x${string}`
  const delegate = process.env.DELEGATE as `0x${string}`
  const scopeInput = process.env.SCOPE || 'test-scope'
  const nonceStr = process.env.NONCE || '1'
  const expiryStr = process.env.EXPIRY || String(Math.floor(Date.now() / 1000) + 3600)
  const registry = process.env.REGISTRY_ADDRESS as `0x${string}`
  if (!pk || !delegate || !registry) throw new Error('Set AUTHORIZER_PK, DELEGATE, REGISTRY_ADDRESS')

  const account = privateKeyToAccount(pk)
  const client = createWalletClient({ account, chain: sepolia, transport: http(process.env.SEPOLIA_RPC_URL) })

  // Scope: if hex bytes32 provided, use as-is; else keccak256 of string (to match addDelegation.ts)
  const scope = (scopeInput.startsWith('0x') && scopeInput.length === 66
    ? scopeInput
    : keccak256(stringToBytes(scopeInput))) as `0x${string}`

  const nonce = BigInt(nonceStr)
  const expiry = BigInt(expiryStr)

  const domain = { name: 'RavenAuth', version: '1', chainId: sepolia.id, verifyingContract: registry } as const
  const types = {
    Delegation: [
      { name: 'authorizer', type: 'address' },
      { name: 'delegate', type: 'address' },
      { name: 'scope', type: 'bytes32' },
      { name: 'nonce', type: 'uint256' },
      { name: 'expiry', type: 'uint256' },
    ],
  } as const
  const message = {
    authorizer: account.address,
    delegate,
    scope,
    nonce,
    expiry,
  } as const

  const signature = await client.signTypedData({ domain, types, primaryType: 'Delegation', message } as any)
  const payload = {
    authorization: {
      authorizer: message.authorizer,
      delegate: message.delegate,
      scope: message.scope,
      nonce: message.nonce.toString(),
      expiry: message.expiry.toString(),
      signature,
    },
    call: { to: delegate, data: '0x', value: '0' },
  }
  console.log(JSON.stringify(payload))
}

main().catch((e) => { console.error(e); process.exit(1) })
