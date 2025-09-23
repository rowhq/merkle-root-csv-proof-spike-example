// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/UserDataRegistry.sol";

/**
 * @title UpdateRegistryRoot
 * @notice Script to update the merkle root in UserDataRegistry
 * @dev Usage: forge script script/UpdateRegistryRoot.s.sol:UpdateRegistryRoot <registryAddress> <merkleRoot> --rpc-url <url> --broadcast
 */
contract UpdateRegistryRoot is Script {
    function run(address registryAddress, bytes32 merkleRoot, uint256 dateGenerated) external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        UserDataRegistry registry = UserDataRegistry(registryAddress);

        console.log("Updating merkle root to:", vm.toString(merkleRoot));
        console.log("Registry contract:", registryAddress);
        console.log("Date generated:", dateGenerated);

        // Use new function with dateGenerated
        registry.updateMerkleRoot(merkleRoot, dateGenerated);

        console.log("Merkle root updated successfully!");
        console.log("New root:", vm.toString(registry.merkleRoot()));
        console.log("Update timestamp:", registry.lastUpdateTimestamp());
        console.log("Date generated:", registry.getDateGenerated());

        vm.stopBroadcast();
    }
}
