import { run } from "hardhat";

async function main() {
  const address = process.env.REGISTRY_ADDRESS;
  const name = process.env.REGISTRY_NAME || "RavenAuth";
  const version = process.env.REGISTRY_VERSION || "1";
  if (!address) throw new Error("Set REGISTRY_ADDRESS in .env");
  await run("verify:verify", {
    address,
    constructorArguments: [name, version],
  });
  console.log("Verified", address);
}

main().catch((e) => { console.error(e); process.exit(1); });


