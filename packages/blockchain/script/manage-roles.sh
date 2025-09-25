#!/bin/bash

# UserDataRegistry Role Management Script
# Usage: ./manage-roles.sh <operation> <registry-address> <target-address> [network]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to display usage
usage() {
    echo -e "${BLUE}UserDataRegistry Role Management${NC}"
    echo ""
    echo "Usage: $0 <operation> <registry-address> <target-address> [network]"
    echo ""
    echo -e "${YELLOW}Operations:${NC}"
    echo "  grant-admin     Grant admin role to target address"
    echo "  grant-updater   Grant updater role to target address"
    echo "  revoke-admin    Revoke admin role from target address"
    echo "  revoke-updater  Revoke updater role from target address"
    echo "  check-roles     Check roles for target address"
    echo ""
    echo -e "${YELLOW}Networks:${NC}"
    echo "  localhost       Local network (default)"
    echo "  sepolia         Sepolia testnet"
    echo "  mainnet         Ethereum mainnet"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 grant-updater 0x123... 0xabc..."
    echo "  $0 check-roles 0x123... 0xabc... sepolia"
    echo ""
    echo -e "${YELLOW}Environment Variables Required:${NC}"
    echo "  PRIVATE_KEY     Private key of the account with permission to manage roles"
    echo ""
}

# Check arguments
if [ $# -lt 3 ]; then
    echo -e "${RED}Error: Missing required arguments${NC}"
    echo ""
    usage
    exit 1
fi

OPERATION=$1
REGISTRY_ADDRESS=$2
TARGET_ADDRESS=$3
NETWORK=${4:-localhost}

# Validate operation
case $OPERATION in
    grant-admin|grant-updater|revoke-admin|revoke-updater|check-roles)
        ;;
    *)
        echo -e "${RED}Error: Invalid operation '$OPERATION'${NC}"
        echo ""
        usage
        exit 1
        ;;
esac

# Validate addresses (basic check for 0x prefix and length)
if [[ ! $REGISTRY_ADDRESS =~ ^0x[a-fA-F0-9]{40}$ ]]; then
    echo -e "${RED}Error: Invalid registry address format${NC}"
    exit 1
fi

if [[ ! $TARGET_ADDRESS =~ ^0x[a-fA-F0-9]{40}$ ]]; then
    echo -e "${RED}Error: Invalid target address format${NC}"
    exit 1
fi

# Get script directory and find .env file
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BLOCKCHAIN_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$BLOCKCHAIN_ROOT/.env"

# Load .env file if it exists
if [ -f "$ENV_FILE" ]; then
    echo -e "${BLUE}Loading environment variables from $ENV_FILE${NC}"
    set -a  # automatically export all variables
    source "$ENV_FILE"
    set +a
fi

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}Error: PRIVATE_KEY environment variable is required${NC}"
    echo "Either:"
    echo "  1. Add PRIVATE_KEY to .env file in project root"
    echo "  2. Export your private key: export PRIVATE_KEY=0x..."
    exit 1
fi

# Set network parameters
case $NETWORK in
    localhost)
        RPC_URL="http://127.0.0.1:8545"
        ;;
    sepolia)
        if [ -z "$SEPOLIA_RPC_URL" ]; then
            echo -e "${RED}Error: SEPOLIA_RPC_URL environment variable is required for sepolia network${NC}"
            exit 1
        fi
        RPC_URL=$SEPOLIA_RPC_URL
        ;;
    mainnet)
        if [ -z "$MAINNET_RPC_URL" ]; then
            echo -e "${RED}Error: MAINNET_RPC_URL environment variable is required for mainnet network${NC}"
            exit 1
        fi
        RPC_URL=$MAINNET_RPC_URL
        ;;
    *)
        echo -e "${RED}Error: Invalid network '$NETWORK'${NC}"
        usage
        exit 1
        ;;
esac

echo -e "${BLUE}=== UserDataRegistry Role Management ===${NC}"
echo -e "${YELLOW}Operation:${NC} $OPERATION"
echo -e "${YELLOW}Registry:${NC} $REGISTRY_ADDRESS"
echo -e "${YELLOW}Target:${NC} $TARGET_ADDRESS"
echo -e "${YELLOW}Network:${NC} $NETWORK"
echo ""

# Change to contracts directory (relative to script location)
cd "$SCRIPT_DIR/.."

# Execute the forge script
if [ "$OPERATION" = "check-roles" ]; then
    # For check-roles, we don't need to broadcast
    forge script script/ManageRoles.s.sol:ManageRoles \
        --sig "run(string,address,address)" \
        "$OPERATION" \
        "$REGISTRY_ADDRESS" \
        "$TARGET_ADDRESS" \
        --rpc-url "$RPC_URL"
else
    # For other operations, we need to broadcast
    forge script script/ManageRoles.s.sol:ManageRoles \
        --sig "run(string,address,address)" \
        "$OPERATION" \
        "$REGISTRY_ADDRESS" \
        "$TARGET_ADDRESS" \
        --rpc-url "$RPC_URL" \
        --broadcast
fi

echo ""
echo -e "${GREEN}Operation completed successfully!${NC}"