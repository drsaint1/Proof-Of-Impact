// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockB3TR
 * @dev Mock B3TR token for testing purposes
 */
contract MockB3TR is ERC20 {
    mapping(address => uint256) public lastClaim;
    uint256 public constant CLAIM_AMOUNT = 10000 * 10**18; // 10000 B3TR
    uint256 public constant COOLDOWN_TIME = 1 hours;

    constructor() ERC20("Better Token", "B3TR") {
        // Mint 1 million tokens to deployer for testing
        _mint(msg.sender, 1000000 * 10**18);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function faucet() external {
        require(
            block.timestamp >= lastClaim[msg.sender] + COOLDOWN_TIME,
            "Cooldown not finished. Wait 1 hour between claims"
        );

        lastClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, CLAIM_AMOUNT);
    }

    function getTimeUntilNextClaim(address user) external view returns (uint256) {
        if (block.timestamp >= lastClaim[user] + COOLDOWN_TIME) {
            return 0;
        }
        return (lastClaim[user] + COOLDOWN_TIME) - block.timestamp;
    }
}
