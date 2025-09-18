import { ethers } from "hardhat";

async function main() {
  const name = process.env.REGISTRY_NAME || "RavenAuth";
  const version = process.env.REGISTRY_VERSION || "1";
  const Factory = await ethers.getContractFactory("AuthorizationRegistry");
  const contract = await Factory.deploy(name, version);
  await contract.waitForDeployment();
  const addr = await contract.getAddress();
  console.log("AuthorizationRegistry deployed:", addr);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


