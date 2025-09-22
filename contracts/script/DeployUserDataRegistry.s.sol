// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/UserDataRegistry.sol";

/**
 * @title DeployUserDataRegistry
 * @notice Script to deploy the UserDataRegistry for verifying user data
 */
contract DeployUserDataRegistry is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy UserDataRegistry with temporary root (will be updated after)
        bytes32 tempRoot = bytes32(0);
        UserDataRegistry registry = new UserDataRegistry(tempRoot);

        console.log("UserDataRegistry deployed at:", address(registry));

        vm.stopBroadcast();

        // Save deployment info
        console.log("=== DEPLOYMENT SUMMARY ===");
        console.log("Registry Address:", address(registry));
        console.log("Owner:", registry.owner());
        console.log("");
        console.log("This registry verifies user data with 7 fields:");
        console.log("  - userId (string)");
        console.log("  - email (string)");
        console.log("  - userAddress (address)");
        console.log("  - reputation (int256): -100 to 100");
        console.log("  - prePoints (uint256)");
        console.log("  - points (uint256)");
        console.log("  - cumulativePoints (uint256)");
        console.log("");
        console.log("Key functions:");
        console.log("  - verifyUserData(): Verify data against merkle tree");
        console.log("  - getVerifiedReputation(): Get user's verified reputation");
        console.log("  - getVerifiedCumulativePoints(): Get user's verified points");
        console.log("  - meetsReputationRequirement(): Check reputation threshold");
        console.log("  - meetsPointsRequirement(): Check points threshold");
    }
}
