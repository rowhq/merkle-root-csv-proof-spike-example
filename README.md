# Merkle User Data Registry (Foundry + TypeScript)

High-performance blockchain-verified user data registry system using Merkle trees. Enables on-chain verification and querying of user data (reputation, points, email) with support for large datasets (tested with 50,000+ users).

## 🚀 Key Features

- **Merkle Tree Verification**: Cryptographic proof of user data without storing it all on-chain
- **Large Dataset Support**: Optimized for 50,000+ users with efficient proof generation
- **JSON & CSV Support**: Flexible input formats with JSON being 3% faster for large datasets
- **Timestamped Data**: Tracks when data was generated with UTC timestamps
- **IPFS Integration Ready**: Contract supports storing IPFS hash references
- **Gas Efficient**: Constant verification cost regardless of dataset size
- **Performance Tested**: Comprehensive benchmarking tools included

## 📦 Main Components

- `UserDataRegistry.sol` — Main contract for user data verification with timestamp tracking
- `toolkit/lib/` — TypeScript libraries for data generation and Merkle tree operations
- `toolkit/scripts/` — Automated testing and benchmarking scripts
- `contracts/script/` — Foundry deployment and update scripts

## 📊 User Data Schema

```solidity
struct UserData {
    string userId;             // Unique user identifier
    string email;              // User email
    address userAddress;       // Valid EVM address
    int256 reputation;         // Reputation score (-100 to 100)
    uint256 prePoints;         // Previous points
    uint256 points;            // Current points
    uint256 cumulativePoints;  // Total cumulative points
}
```

## 🛠️ Requirements

- Node.js 18+
- Foundry (forge, cast, anvil)
- pnpm / npm / yarn

## 📥 Installation

```bash
# Install Node.js dependencies (including ethers for address generation)
npm install

# Install Foundry dependencies (OpenZeppelin contracts)
forge install
```

## 📝 Input Data Formats

### JSON Format (Recommended - 3% faster)
```json
{
  "date_generated": 1758585813,
  "users_data": [
    {
      "UserId": "user_001",
      "Email": "user001@example.com",
      "UserAddress": "0x1234abcd55ee77aa99bbccddeeff001122334455",
      "Reputation": 85,
      "PrePoints": 100,
      "Points": 150,
      "CummulativePoints": 500
    }
  ]
}
```

### CSV Format (Legacy Support)
```csv
UserId,Email,UserAddress,Reputation,PrePoints,Points,CummulativePoints
user_001,user001@example.com,0x1234abcd55ee77aa99bbccddeeff001122334455,85,100,150,500
```

## 🎯 Quick Start

### Generate Test Data
```bash
# Generate 1,000 users in JSON format
npm run generate:data -- --count 1000 --format json --output data/test-1000.json

# Generate 50,000 users in JSON format
npm run generate:data -- --count 50000 --format json --output data/test-50000.json

# Generate CSV format (legacy)
npm run generate:data -- --count 1000 --format csv --output data/test-1000.csv
```

### Build Merkle Tree
```bash
# From JSON (extracts date_generated automatically)
npm run build:tree -- --in data/test-1000.json

# From CSV
npm run build:tree -- --in data/test-1000.csv
```

Generates files in `toolkit/out/`:
- `merkle-root.txt` — Tree root hash for the contract
- `claims.json` — User data and proofs indexed by address
- `manifest.json` — Tree metadata with timestamp

### Verify Data Locally
```bash
npm run verify:leaf -- --address 0x1234abcd55ee77aa99bbccddeeff001122334455
```

## 🚀 Automated Testing

### Complete Local Test Flow
```bash
npm run test:full-flow
```

This script automatically:
1. Starts anvil (local blockchain)
2. Generates 1,000 users in JSON format
3. Builds Merkle tree with timestamp
4. Deploys `UserDataRegistry.sol` contract
5. Updates contract with Merkle root and dateGenerated
6. Verifies user data on-chain

### Performance Testing
```bash
# Test with multiple dataset sizes
npm run test:performance

# Benchmark 50k users (CSV vs JSON comparison)
npx tsx toolkit/scripts/benchmark-50k.ts
```

## 📈 Performance Metrics

### 50,000 Users Benchmark Results
| Operation | CSV | JSON | Improvement |
|-----------|-----|------|-------------|
| Parsing | 0.26s | 0.07s | 73% faster |
| Tree Building | 20.46s | 17.86s | 13% faster |
| Proof Generation | 30.53s | 31.78s | 4% slower |
| **Total Time** | **51.24s** | **49.71s** | **3% faster** |
| File Size | 4.7 MB | 12.3 MB | 2.6x larger |
| Memory Usage | 150 MB | 186 MB | 24% more |

## 📜 Smart Contract Deployment

### Manual Deployment
```bash
# 1. Set environment variables
cp .env.example .env
# Edit .env with your private key and RPC URL

# 2. Deploy UserDataRegistry
forge script contracts/script/DeployUserDataRegistry.s.sol:DeployUserDataRegistry \
  --rpc-url $RPC_URL --broadcast

# 3. Update Merkle root with timestamp
forge script contracts/script/UpdateRegistryRoot.s.sol:UpdateRegistryRoot \
  --sig "run(address,bytes32,uint256)" \
  $REGISTRY_ADDRESS $MERKLE_ROOT $DATE_GENERATED \
  --rpc-url $RPC_URL --broadcast
```

## 🔧 Contract Functions

### Query Functions
```solidity
// Verify user data against Merkle tree
function verifyUserData(UserData calldata userData, bytes32[] calldata proof) returns (bool)

// Get verified reputation (requires valid proof)
function getVerifiedReputation(UserData calldata userData, bytes32[] calldata proof) returns (int256)

// Get verified cumulative points
function getVerifiedCumulativePoints(UserData calldata userData, bytes32[] calldata proof) returns (uint256)

// Check reputation threshold
function meetsReputationRequirement(UserData calldata userData, bytes32[] calldata proof, int256 minReputation) returns (bool)

// Check points threshold
function meetsPointsRequirement(UserData calldata userData, bytes32[] calldata proof, uint256 minPoints) returns (bool)

// Get registry metadata
function getRegistryInfo() returns (bytes32 root, uint256 lastUpdate, uint256 generated, string ipfsHash)
```

### Administrative Functions (Owner Only)
```solidity
// Update Merkle root with timestamp
function updateMerkleRoot(bytes32 _merkleRoot, uint256 _dateGenerated)

// Update IPFS data source
function updateDataSource(string calldata _ipfsHash)

// Get when data was generated
function getDateGenerated() returns (uint256)
```

## 🎯 Use Cases

- **Reputation Systems**: On-chain verification of user reputation scores
- **Loyalty Programs**: Query and verify accumulated user points
- **Access Control**: Gate features based on reputation/points thresholds
- **Airdrops**: Verify eligibility without exposing entire user list
- **Compliance**: Prove data integrity with timestamp verification
- **DAO Governance**: Weight voting power by verified reputation

## 🔒 Security Considerations

- **Privacy**: Email data (PII) is included - implement privacy measures for production
- **Validation**: Reputation scores enforced between -100 and 100
- **Access Control**: Only users can query their own data (except contract owner)
- **Immutability**: Merkle root updates are logged with timestamps
- **Gas Optimization**: Proof verification is O(log n) complexity

## 📁 Project Structure

```
├── contracts/
│   ├── src/
│   │   └── UserDataRegistry.sol    # Main registry contract
│   └── script/
│       ├── DeployUserDataRegistry.s.sol
│       └── UpdateRegistryRoot.s.sol
├── toolkit/
│   ├── lib/
│   │   ├── generate-test-data.ts   # Data generation with valid EVM addresses
│   │   ├── build-tree.ts          # Merkle tree construction
│   │   └── verify-leaf.ts         # Local proof verification
│   └── scripts/
│       ├── test-full-flow.ts      # End-to-end testing
│       ├── test-performance.ts    # Multi-size benchmarking
│       └── benchmark-50k.ts       # Detailed 50k comparison
├── data/                           # Test datasets (gitignored)
└── toolkit/out/                    # Generated Merkle trees
```

## 🧪 Testing Commands

```bash
# Format Solidity code
forge fmt

# Run Foundry tests
forge test

# Generate coverage report
forge coverage
```

## 📊 Proof Size Scaling

| Users | Proof Elements | Storage |
|-------|---------------|---------|
| 100 | 7 | 224 bytes |
| 1,000 | 10 | 320 bytes |
| 10,000 | 14 | 448 bytes |
| 50,000 | 16 | 512 bytes |
| 100,000 | 17 | 544 bytes |

Proof size grows logarithmically: O(log₂ n)

## 📝 License

MIT