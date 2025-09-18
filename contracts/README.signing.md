## Sign Delegation Authorization (for relayer)

Usage:
```
AUTHORIZER_PK=0x<authorizer_private_key> \
DELEGATE=0x<delegate_address> \
REGISTRY_ADDRESS=0x6553c9F9c59224ef6fd7D15556B358f14DE00CF7 \
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/<key> \
npx hardhat run scripts/signAuthorization.ts --network sepolia
```
This prints JSON like:
```
{
  "authorization": {
    "authorizer": "0x...",
    "delegate": "0x...",
    "scope": "0x...",
    "nonce": "2",
    "expiry": "1759999999",
    "signature": "0x..."
  },
  "call": { "to": "0x...", "data": "0x", "value": "0" }
}
```
POST this JSON to your relayer:
```
curl -s -X POST http://localhost:8787/relay/execute \
  -H "Content-Type: application/json" \
  -d @payload.json
```
