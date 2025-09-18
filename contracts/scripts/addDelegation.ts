import { ethers } from "hardhat";

async function main() {
  const registryAddr = process.env.REGISTRY_ADDRESS as string;
  const delegate = process.env.DELEGATE as string;
  const scopeStr = process.env.SCOPE || "test-scope";
  const nonceStr = process.env.NONCE || "1";
  const expiryStr = process.env.EXPIRY; // epoch seconds
  if (!registryAddr || !delegate) throw new Error("Set REGISTRY_ADDRESS and DELEGATE");

  const [authorizer] = await ethers.getSigners();
  const authorizerAddr = await authorizer.getAddress();
  const registry = await ethers.getContractAt("AuthorizationRegistry", registryAddr);

  const scope = ethers.id(scopeStr);
  const nonce = BigInt(nonceStr);
  const nowSec = BigInt(Math.floor(Date.now() / 1000));
  const defaultExpiry = nowSec + 60n * 60n * 24n * 7n; // +7 days
  const expiry = expiryStr ? BigInt(expiryStr) : defaultExpiry;

  const domain = {
    name: "RavenAuth",
    version: "1",
    chainId: (await ethers.provider.getNetwork()).chainId,
    verifyingContract: registryAddr,
  };
  const types = {
    Delegation: [
      { name: "authorizer", type: "address" },
      { name: "delegate", type: "address" },
      { name: "scope", type: "bytes32" },
      { name: "nonce", type: "uint256" },
      { name: "expiry", type: "uint256" },
    ],
  } as const;
  const message = {
    authorizer: authorizerAddr,
    delegate,
    scope,
    nonce,
    expiry,
  } as const;

  const signature = await authorizer.signTypedData(domain as any, types as any, message as any);
  const tx = await registry.addDelegation(message.authorizer, message.delegate, message.scope, message.nonce, message.expiry, signature);
  const rcpt = await tx.wait();
  console.log("Delegation added. Tx:", rcpt?.hash);
}

main().catch((e) => { console.error(e); process.exit(1); });


