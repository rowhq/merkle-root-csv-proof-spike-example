# Setup Guide: Merkle Tree Application

This guide walks you through setting up and running the complete Merkle Tree application stack from scratch.

## Prerequisites

- Node.js (v18+)
- Foundry (for smart contracts)
- MetaMask browser extension
- Git

## Quick Start

### 1. Start Anvil (Local Blockchain)

```bash
# Start Anvil with CORS support for frontend connectivity
anvil --chain-id 31337 --host 0.0.0.0 --port 8545
```

Keep this terminal open. Anvil will provide you with:
- 10 test accounts with 10,000 ETH each
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`

### 2. Deploy Smart Contract

```bash
# Navigate to blockchain directory
cd packages/blockchain

# Load environment variables
source .env

# Deploy the UserDataRegistry contract
forge script script/DeployUserDataRegistry.s.sol:DeployUserDataRegistry --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast

# Note the deployed contract address from the output
```

**Important**: Copy the deployed contract address - you'll need it for the frontend configuration.

### 3. Grant Updater Role (Required for Frontend)

**Important**: To use the frontend, you must grant UPDATER_ROLE to your MetaMask address:

```bash
# From blockchain directory
# Replace <CONTRACT_ADDRESS> with the deployed contract address from step 2
# Replace <YOUR_METAMASK_ADDRESS> with your MetaMask wallet address
./script/manage-roles.sh grant-updater <CONTRACT_ADDRESS> <YOUR_METAMASK_ADDRESS>

# Example:
# ./script/manage-roles.sh grant-updater 0x5FbDB2315678afecb367f032d93F642f64180aa3 0xC59D87aC46b494142155c462b88A18EFaC9239AB
```

**How to find your MetaMask address**: Open MetaMask, click on your account name to copy the address.

### 4. Send ETH to Test Address (Optional)

If you need to send ETH to a test address for transaction fees:

```bash
# From blockchain directory
# Load environment variables first
source .env

# Send ETH to target address (replace <TARGET_ADDRESS> with actual address)
cast send --private-key $PRIVATE_KEY --rpc-url $RPC_URL <TARGET_ADDRESS> --value <x ether>

# Example:
# cast send --private-key $PRIVATE_KEY --rpc-url $RPC_URL 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --value 10ether
```

### 5. Configure Frontend Environment

```bash
# Navigate to frontend directory
cd ../../packages/frontend

# Copy the environment template and update contract address
cp .env.example .env

# Update the contract address in .env file
Replace `<YOUR_DEPLOYED_CONTRACT_ADDRESS>` with the address from step 2.

### 6. Start API Server

```bash
# Navigate to API directory (new terminal)
cd packages/api

# Install dependencies (if not done already)
npm install

# Build and start the server
npm run build && npm start
```

The API will be available at:
- Server: `http://127.0.0.1:3000`
- Health check: `http://127.0.0.1:3000/health`
- API docs: `http://127.0.0.1:3000/docs`

### 7. Start Frontend

```bash
# Navigate to frontend directory (new terminal)
cd packages/frontend

# Install dependencies (if not done already)
npm install

# Start the React app (will use PORT from .env file)
npm start
```

The frontend will be available at `http://localhost:3001` (configured in .env)

### 8. Configure MetaMask

1. Open MetaMask
2. Add a new network with these settings:
   - **Network Name**: Anvil Local
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: ETH

3. Import one of Anvil's test accounts OR use your existing MetaMask account:

   **Option A - Import Anvil account (recommended for testing):**
   - Click "Import Account"
   - Use the private key from your `packages/blockchain/.env` file (PRIVATE_KEY variable)
   - This gives you 10,000 ETH for testing

   **Option B - Use your existing account:**
   - Use your current MetaMask account
   - You'll need to send some ETH to it using step 4 above

## Using the Application

### 1. Prepare Test Data

Sample JSON files are available in the `data/` directory. Or create your own with this structure:

```json
{
  "date_generated": 1693920000,
  "users_data": [
    {
      "UserId": "user1",
      "Email": "user1@example.com",
      "UserAddress": "0x1234567890123456789012345678901234567890",
      "Reputation": "85",
      "PrePoints": "100",
      "Points": "250",
      "CummulativePoints": "350"
    }
  ]
}
```

### 2. Application Workflow

1. **Upload JSON File**: Use the file upload in step 1
2. **Generate Merkle Tree**: Click "Generate Tree" - this calls the API to create the tree and proofs
3. **Update Contract**: Click "Update Contract" - this stores the Merkle root on-chain
4. **View Results**: The contract state will show current root, timestamps, and IPFS hash

### 3. Verify User Data (Contract Function)

You can verify user data directly on the contract using the generated proofs stored in `packages/api/data/trees/[tree-id]/proofs/[user-address].json`.

## File Structure

```
├── packages/
│   ├── blockchain/     # Smart contracts (Foundry)
│   │   ├── src/UserDataRegistry.sol
│   │   ├── script/Deploy.s.sol
│   │   └── script/manage-roles.sh
│   ├── api/            # Backend API (Node.js/Fastify)
│   │   ├── src/
│   │   ├── data/trees/ # Generated trees and proofs
│   │   └── .env        # API configuration
│   ├── frontend/       # React frontend
│   │   ├── src/
│   │   └── .env        # Frontend configuration
│   └── toolkit/        # Utility scripts
│       ├── lib/
│       └── scripts/
└── data/               # Sample JSON files
```

## Environment Variables

### API (.env)
```
PORT=3000
HOST=127.0.0.1
BODY_LIMIT_MB=50
```

### Frontend (.env)
```
PORT=3001
REACT_APP_API_BASE_URL=http://127.0.0.1:3000
REACT_APP_CONTRACT_ADDRESS=<deployed_contract_address>
```

### Blockchain (.env) - for contract deployment
```
# Located at: packages/blockchain/.env
# Foundry Default Private Key (Account #0)
# Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Local Anvil RPC
RPC_URL=http://127.0.0.1:8545
```

## Troubleshooting

### Contract Deployment Issues
- Ensure Anvil is running on the correct port (8545)
- Check that you're using a valid private key
- Verify the RPC URL in your deployment command

### Frontend Connection Issues
- Verify the contract address in frontend `.env`
- Check that MetaMask is connected to the Anvil network
- Ensure the API server is running on port 3000

### API File Upload Issues
- Default body limit is 50MB, configurable via `BODY_LIMIT_MB`
- Check API logs for detailed error messages
- Verify JSON file structure matches expected format

### MetaMask Issues
- Make sure you're on the Anvil network (Chain ID 31337)
- Try refreshing the page or reconnecting MetaMask
- Check that you have sufficient ETH for transactions

## Development Commands

### Blockchain (Smart Contracts)
```bash
# Navigate to blockchain directory
cd packages/blockchain

# Compile contracts
forge build

# Run tests
forge test

# Deploy to local (load .env from current directory)
source .env
forge script script/DeployUserDataRegistry.s.sol:DeployUserDataRegistry --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast
```

### API
```bash
# Development mode with auto-reload
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start
```

### Frontend
```bash
# Development server
npm start

# Build for production
npm run build
```

## Architecture Overview

1. **Smart Contract**: Stores Merkle roots and provides verification functions with role-based access control
2. **API Server**: Generates Merkle trees from JSON data, stores proofs, and provides verification endpoints
3. **Frontend**: React app for uploading data, triggering tree generation, and updating the smart contract
4. **Local Blockchain**: Anvil provides a local Ethereum-compatible blockchain for testing

This setup provides a complete end-to-end system for generating, storing, and verifying Merkle proofs with on-chain validation.