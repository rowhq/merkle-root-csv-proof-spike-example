// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/UserDataRegistry.sol";

/**
 * @title ManageRoles
 * @notice Script to manage roles in UserDataRegistry contract
 */
contract ManageRoles is Script {
    function run(string memory operation, address registryAddress, address targetAddress) external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        UserDataRegistry registry = UserDataRegistry(registryAddress);

        console.log("=== ROLE MANAGEMENT SCRIPT ===");
        console.log("Registry Address:", registryAddress);
        console.log("Current Owner:", registry.owner());
        console.log("Operation:", operation);
        console.log("Target Address:", targetAddress);
        console.log("");

        if (keccak256(bytes(operation)) == keccak256(bytes("grant-admin"))) {
            grantAdminRole(registry, targetAddress);
        } else if (keccak256(bytes(operation)) == keccak256(bytes("grant-updater"))) {
            grantUpdaterRole(registry, targetAddress);
        } else if (keccak256(bytes(operation)) == keccak256(bytes("revoke-admin"))) {
            revokeAdminRole(registry, targetAddress);
        } else if (keccak256(bytes(operation)) == keccak256(bytes("revoke-updater"))) {
            revokeUpdaterRole(registry, targetAddress);
        } else if (keccak256(bytes(operation)) == keccak256(bytes("check-roles"))) {
            checkRoles(registry, targetAddress);
        } else {
            console.log("Unknown operation. Available operations:");
            console.log("  - grant-admin: Grant admin role to target address");
            console.log("  - grant-updater: Grant updater role to target address");
            console.log("  - revoke-admin: Revoke admin role from target address");
            console.log("  - revoke-updater: Revoke updater role from target address");
            console.log("  - check-roles: Check roles for target address");
            revert("Invalid operation");
        }

        vm.stopBroadcast();
    }

    function grantAdminRole(UserDataRegistry registry, address account) internal {
        console.log("Granting ADMIN_ROLE to:", account);
        registry.grantAdminRole(account);
        console.log("Successfully granted ADMIN_ROLE to:", account);
    }

    function grantUpdaterRole(UserDataRegistry registry, address account) internal {
        console.log("Granting UPDATER_ROLE to:", account);
        registry.grantUpdaterRole(account);
        console.log("Successfully granted UPDATER_ROLE to:", account);
    }

    function revokeAdminRole(UserDataRegistry registry, address account) internal {
        console.log("Revoking ADMIN_ROLE from:", account);
        registry.revokeAdminRole(account);
        console.log("Successfully revoked ADMIN_ROLE from:", account);
    }

    function revokeUpdaterRole(UserDataRegistry registry, address account) internal {
        console.log("Revoking UPDATER_ROLE from:", account);
        registry.revokeUpdaterRole(account);
    }

    function checkRoles(UserDataRegistry registry, address account) internal view {
        bytes32 adminRole = registry.ADMIN_ROLE();
        bytes32 updaterRole = registry.UPDATER_ROLE();
        bytes32 defaultAdminRole = registry.DEFAULT_ADMIN_ROLE();

        console.log("=== ROLE STATUS FOR", account, "===");
        console.log("Has DEFAULT_ADMIN_ROLE:", registry.hasRole(defaultAdminRole, account));
        console.log("Has ADMIN_ROLE:", registry.hasRole(adminRole, account));
        console.log("Has UPDATER_ROLE:", registry.hasRole(updaterRole, account));
        console.log("Is Owner:", registry.owner() == account);
    }
}
