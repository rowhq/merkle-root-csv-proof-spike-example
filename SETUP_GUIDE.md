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
# Start Anvil with a specific chain ID
anvil --chain-id 31337
```

Keep this terminal open. Anvil will provide you with:
- 10 test accounts with 10,000 ETH each
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`

### 2. Deploy Smart Contract

```bash
# Navigate to contracts directory
cd contracts

# Deploy the UserDataRegistry contract
forge script script/Deploy.s.sol:Deploy --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast

# Note the deployed contract address from the output
```

**Important**: Copy the deployed contract address - you'll need it for the frontend configuration.

### 3. Grant Updater Role (Optional)

If you want to grant updater permissions to a specific address:

```bash
# From contracts directory
./script/manage-roles.sh grant-updater <CONTRACT_ADDRESS> <TARGET_ADDRESS>

# Example:
# ./script/manage-roles.sh grant-updater 0x5FbDB2315678afecb367f032d93F642f64180aa3 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

### 4. Configure Frontend Environment

```bash
# Navigate to frontend directory
cd ../frontend

# Create environment file
cat > .env << EOF
REACT_APP_API_BASE_URL=http://127.0.0.1:3000
REACT_APP_CONTRACT_ADDRESS=<YOUR_DEPLOYED_CONTRACT_ADDRESS>
EOF
```

Replace `<YOUR_DEPLOYED_CONTRACT_ADDRESS>` with the address from step 2.

### 5. Start API Server

```bash
# Navigate to API directory (new terminal)
cd ../api

# Install dependencies (if not done already)
npm install

# Build and start the server
npm run build && npm start
```

The API will be available at:
- Server: `http://127.0.0.1:3000`
- Health check: `http://127.0.0.1:3000/health`
- API docs: `http://127.0.0.1:3000/docs`

### 6. Start Frontend

```bash
# Navigate to frontend directory (new terminal)
cd ../frontend

# Install dependencies (if not done already)
npm install

# Start the React app
npm start
```

The frontend will be available at `http://localhost:3001`

### 7. Configure MetaMask

1. Open MetaMask
2. Add a new network with these settings:
   - **Network Name**: Anvil Local
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: ETH

3. Import one of Anvil's test accounts:
   - Click "Import Account"
   - Use private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - This gives you 10,000 ETH for testing

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

You can verify user data directly on the contract using the generated proofs stored in `api/data/trees/[tree-id]/proofs/[user-address].json`.

## File Structure

```
├── contracts/          # Smart contracts (Foundry)
│   ├── src/UserDataRegistry.sol
│   ├── script/Deploy.s.sol
│   └── script/manage-roles.sh
├── api/                # Backend API (Node.js/Fastify)
│   ├── src/
│   ├── data/trees/     # Generated trees and proofs
│   └── .env            # API configuration
├── frontend/           # React frontend
│   ├── src/
│   └── .env            # Frontend configuration
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
REACT_APP_API_BASE_URL=http://127.0.0.1:3000
REACT_APP_CONTRACT_ADDRESS=<deployed_contract_address>
```

### Contracts (.env) - for scripts
```
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
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

### Contracts
```bash
# Compile contracts
forge build

# Run tests
forge test

# Deploy to local
forge script script/Deploy.s.sol:Deploy --rpc-url http://127.0.0.1:8545 --private-key $PRIVATE_KEY --broadcast
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