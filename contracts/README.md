## Deploy AuthorizationRegistry to Sepolia

1. Create `.env` with:
```
SEPOLIA_RPC_URL=<your sepolia rpc>
PRIVATE_KEY=<deployer private key>
REGISTRY_NAME=RavenAuth
REGISTRY_VERSION=1
```

2. Install and compile:
```
npm install
npx hardhat compile
```

3. Deploy:
```
npx hardhat run scripts/deploy.ts --network sepolia
```

The script prints the deployed address.

## Verify on Etherscan
```
ETHERSCAN_API_KEY=<key> REGISTRY_ADDRESS=0x... npx hardhat run scripts/verify.ts --network sepolia
```

## Add / Revoke Delegation (Sepolia)
```
REGISTRY_ADDRESS=0x... DELEGATE=0x... npx hardhat run scripts/addDelegation.ts --network sepolia
REGISTRY_ADDRESS=0x... DELEGATE=0x... npx hardhat run scripts/revokeDelegation.ts --network sepolia
```


