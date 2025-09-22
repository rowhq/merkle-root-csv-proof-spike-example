# Merkle User Data Registry (Foundry + TypeScript)

Blockchain-verified user data registry system using Merkle trees. Allows on-chain verification and querying of user data (reputation, points, email).

**Main components:**
- `UserDataRegistry.sol` — Main contract for user data verification
- `MockToken.sol` — Test token for testing
- `toolkit/` — TypeScript tools for generating Merkle trees
- Automated deployment and testing scripts

**User data schema:**
```
struct UserData {
    string userId;           // Unique user identifier
    string email;           // User email
    address userAddress;    // EVM address
    int256 reputation;      // Reputation score (-100 to 100)
    uint256 prePoints;      // Previous points
    uint256 points;         // Current points
    uint256 cumulativePoints; // Total cumulative points
}
```

## Requirements
- Node.js 18+
- Foundry (forge, cast, anvil)
- pnpm / npm / yarn

## Installation
```bash
# Install Node.js dependencies
pnpm install

# Install Foundry dependencies (contracts)
forge install
```

## Input data format
CSV in `data/input.csv` with headers:
```
userId,email,userAddress,reputation,prePoints,points,cummulativePoints
user001,user1@example.com,0x1111111111111111111111111111111111111111,85,-1,150,500
user002,user2@example.com,0x2222222222222222222222222222222222222222,-20,0,75,300
...
```

## Generate Merkle tree
```bash
pnpm run build:tree -- --in data/input.csv
```
Generates files in `toolkit/out/`:
- `merkle-root.txt` — Tree root for the contract
- `claims.json` — Data and proofs by address
- `manifest.json` — Tree metadata

## Verify data locally
```bash
pnpm run verify:leaf -- --address 0x1111111111111111111111111111111111111111
```
Verifies that data and proof are valid against the Merkle root.

## Deployment and testing

### Complete local test
```bash
# Runs the complete flow: generate tree + deploy + verify
pnpm run test:full-flow
```

This script:
1. Starts anvil (local blockchain)
2. Generates Merkle tree from `data/input.csv`
3. Deploys `UserDataRegistry.sol`
4. Updates Merkle root in the contract
5. Verifies user data on-chain

### Manual deployment
```bash
# 1. Generate Merkle tree
pnpm run build:tree -- --in data/input.csv

# 2. Deploy UserDataRegistry
forge script contracts/script/DeployUserDataRegistry.s.sol:DeployUserDataRegistry --rpc-url $RPC_URL --broadcast

# 3. Update Merkle root (replace REGISTRY_ADDRESS and MERKLE_ROOT)
forge script contracts/script/UpdateRegistryRoot.s.sol:UpdateRegistryRoot --sig "run(address,bytes32)" $REGISTRY_ADDRESS $MERKLE_ROOT --rpc-url $RPC_URL --broadcast
```

## UserDataRegistry contract functions

### Query functions
```solidity
// Verify user data
function verifyUserData(UserData calldata userData, bytes32[] calldata proof) returns (bool)

// Get verified reputation
function getVerifiedReputation(UserData calldata userData, bytes32[] calldata proof) returns (int256)

// Get verified cumulative points
function getVerifiedCumulativePoints(UserData calldata userData, bytes32[] calldata proof) returns (uint256)

// Check if meets minimum reputation requirement
function meetsReputationRequirement(UserData calldata userData, bytes32[] calldata proof, int256 minReputation) returns (bool)

// Check if meets minimum points requirement
function meetsPointsRequirement(UserData calldata userData, bytes32[] calldata proof, uint256 minPoints) returns (bool)
```

### Administrative functions (owner only)
```solidity
// Update Merkle root
function updateMerkleRoot(bytes32 _merkleRoot)

// Update IPFS data source
function updateDataSource(string calldata _ipfsHash)
```

## Use cases

- **Reputation systems**: Verify reputation score on-chain
- **Loyalty programs**: Query users' accumulated points
- **Requirement gating**: Restrict access based on minimum reputation/points
- **Data auditing**: Prove user data integrity without revealing entire database

## Security notes

- Data includes emails (PII) - consider privacy before public deployment
- Reputation limited to -100 to 100 range by contract validation
- Only owner can update Merkle root and data source
- Users can only query their own data (except owner)

## License
MIT