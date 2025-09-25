# Merkle User Data Registry - Full Stack Application

Complete full-stack application for blockchain-verified user data registry using Merkle trees. Includes smart contracts, API backend, React frontend, and comprehensive tooling for managing large datasets (tested with 50,000+ users).

## 🚀 Key Features

- **Full Stack Solution**: Smart contracts, REST API, React frontend, and CLI tools
- **Merkle Tree Verification**: Cryptographic proof of user data without storing it all on-chain
- **Large Dataset Support**: Optimized for 50,000+ users with efficient proof generation
- **JSON & CSV Support**: Flexible input formats with JSON being 3% faster for large datasets
- **Role-Based Access Control**: ADMIN and UPDATER roles for secure contract management
- **MetaMask Integration**: Direct browser wallet connectivity for contract interaction
- **Real-time Updates**: Frontend displays live contract state and transaction status
- **Timestamped Data**: Tracks when data was generated with UTC timestamps
- **IPFS Integration Ready**: Contract supports storing IPFS hash references
- **Gas Efficient**: Constant verification cost regardless of dataset size
- **Performance Tested**: Comprehensive benchmarking tools included

## 📦 Architecture Overview

- `packages/blockchain/` — Foundry smart contracts with deployment scripts
- `packages/api/` — Node.js/Fastify REST API for Merkle tree generation and management
- `packages/frontend/` — React application with MetaMask integration
- `packages/toolkit/` — CLI utilities for data generation and testing

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
- MetaMask browser extension
- pnpm / npm / yarn

## 📥 Quick Setup

For complete setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)

```bash
# Install dependencies for all packages
cd packages/api && npm install
cd ../frontend && npm install
cd ../toolkit && npm install
cd ../blockchain && forge install

# Start local blockchain
anvil --chain-id 31337 --host 0.0.0.0 --port 8545

# Deploy contract and setup roles (see SETUP_GUIDE.md for details)
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

## 🎯 Application Usage

### 1. Start the Stack
```bash
# Terminal 1: Start local blockchain
anvil --chain-id 31337 --host 0.0.0.0 --port 8545

# Terminal 2: Start API server
cd packages/api && npm run build && npm start

# Terminal 3: Start React frontend
cd packages/frontend && npm start

# Visit: http://localhost:3001
```

### 2. Using the Frontend
1. **Upload JSON File**: Use the file upload component with sample data from `data/` directory
2. **Generate Merkle Tree**: Click "Generate Tree" to create the tree via API
3. **Update Smart Contract**: Click "Update Contract" to store the Merkle root on-chain
4. **View Contract State**: See current root, timestamps, and transaction status

### 3. CLI Tools (Advanced)

Generate test data:
```bash
cd packages/toolkit
# Generate 1,000 users in JSON format
npm run generate:data -- --count 1000 --format json --output ../data/test-1000.json
```

Build Merkle tree:
```bash
cd packages/toolkit
# From JSON (extracts date_generated automatically)
npm run build:tree -- --in ../data/test-1000.json
```

Verify data locally:
```bash
cd packages/toolkit
npm run verify:leaf -- --address 0x1234abcd55ee77aa99bbccddeeff001122334455
```

## 🚀 Automated Testing

### Complete Local Test Flow
```bash
cd packages/toolkit
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
cd packages/toolkit
# Test with multiple dataset sizes
npm run test:performance

# Benchmark 50k users (CSV vs JSON comparison)
npx tsx scripts/benchmark-50k.ts
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
cd packages/blockchain

# 1. Set environment variables
cp .env.example .env
# Edit .env with your private key and RPC URL

# 2. Deploy UserDataRegistry
source .env
forge script script/DeployUserDataRegistry.s.sol:DeployUserDataRegistry \
  --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast

# 3. Grant UPDATER role to frontend wallet
./script/manage-roles.sh grant-updater <CONTRACT_ADDRESS> <YOUR_METAMASK_ADDRESS>

# 4. Update Merkle root with timestamp
forge script script/UpdateRegistryRoot.s.sol:UpdateRegistryRoot \
  --sig "run(address,bytes32,uint256)" \
  $REGISTRY_ADDRESS $MERKLE_ROOT $DATE_GENERATED \
  --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast
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
- **Enterprise Solutions**: Full-stack application ready for business deployment

## 🔒 Security Considerations

- **Role-Based Access**: ADMIN and UPDATER roles protect contract functions
- **Privacy**: Email data (PII) is included - implement privacy measures for production
- **Validation**: Reputation scores enforced between -100 and 100
- **MetaMask Security**: Secure wallet integration with transaction confirmation
- **Immutability**: Merkle root updates are logged with timestamps
- **Gas Optimization**: Proof verification is O(log n) complexity

## 📁 Project Structure

```
├── packages/
│   ├── blockchain/                 # Smart contracts (Foundry)
│   │   ├── src/UserDataRegistry.sol
│   │   ├── script/
│   │   │   ├── DeployUserDataRegistry.s.sol
│   │   │   ├── UpdateRegistryRoot.s.sol
│   │   │   └── manage-roles.sh     # Role management script
│   │   └── foundry.toml
│   ├── api/                        # REST API Server (Node.js/Fastify)
│   │   ├── src/
│   │   │   ├── controllers/        # API endpoints
│   │   │   ├── services/           # Business logic
│   │   │   └── server.ts
│   │   └── package.json
│   ├── frontend/                   # React Application
│   │   ├── src/
│   │   │   ├── components/         # UI components
│   │   │   ├── services/           # Contract & API integration
│   │   │   └── App.tsx
│   │   └── package.json
│   └── toolkit/                    # CLI Utilities
│       ├── lib/
│       │   ├── generate-test-data.ts
│       │   ├── build-tree.ts
│       │   └── verify-leaf.ts
│       └── scripts/                # Automated testing
├── data/                           # Test datasets (gitignored)
├── SETUP_GUIDE.md                  # Complete setup instructions
└── README.md                       # This file
```

## 🧪 Development Commands

### Smart Contract Testing
```bash
cd packages/blockchain

# Format Solidity code
forge fmt

# Run Foundry tests
forge test

# Generate coverage report
forge coverage
```

### API Development
```bash
cd packages/api

# Development mode with auto-reload
npm run dev

# Build and start production server
npm run build && npm start

# Run tests
npm test
```

### Frontend Development
```bash
cd packages/frontend

# Start development server
npm start

# Build for production
npm run build
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