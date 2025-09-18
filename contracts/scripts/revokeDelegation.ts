import { ethers } from "hardhat";

async function main() {
  const registryAddr = process.env.REGISTRY_ADDRESS as string;
  const delegate = process.env.DELEGATE as string;
  if (!registryAddr || !delegate) throw new Error("Set REGISTRY_ADDRESS and DELEGATE");

  const [authorizer] = await ethers.getSigners();
  const registry = await ethers.getContractAt("AuthorizationRegistry", registryAddr);
  const tx = await registry.connect(authorizer).revokeDelegation(delegate);
  const rcpt = await tx.wait();
  console.log("Delegation revoked. Tx:", rcpt?.hash);
}

main().catch((e) => { console.error(e); process.exit(1); });


