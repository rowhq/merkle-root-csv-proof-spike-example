// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockToken
 * @notice Token ERC20 simple para testing del airdrop
 */
contract MockToken is ERC20 {
    constructor(string memory name, string memory symbol, uint256 totalSupply) ERC20(name, symbol) {
        _mint(msg.sender, totalSupply);
    }

    /**
     * @notice Mint adicional para testing (cualquiera puede llamar)
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
