// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title StakingPool
 * @dev Users can stake B3TR tokens to earn rewards
 */
contract StakingPool is Ownable {
    IERC20 public b3trToken;

    struct Stake {
        uint256 amount;
        uint256 stakedAt;
        uint256 rewardDebt;
    }

    mapping(address => Stake) public stakes;

    uint256 public totalStaked;
    uint256 public rewardRate = 10; // 10% APY
    uint256 public constant YEAR_IN_SECONDS = 365 days;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);

    constructor(address _b3trToken) Ownable(msg.sender) {
        b3trToken = IERC20(_b3trToken);
    }

    function stake(uint256 _amount) external {
        require(_amount > 0, "Cannot stake 0");

        // Claim pending rewards first
        if (stakes[msg.sender].amount > 0) {
            _claimRewards();
        }

        require(b3trToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        stakes[msg.sender].amount += _amount;
        stakes[msg.sender].stakedAt = block.timestamp;
        totalStaked += _amount;

        emit Staked(msg.sender, _amount);
    }

    function unstake(uint256 _amount) external {
        require(stakes[msg.sender].amount >= _amount, "Insufficient stake");

        // Claim rewards before unstaking
        _claimRewards();

        stakes[msg.sender].amount -= _amount;
        totalStaked -= _amount;

        require(b3trToken.transfer(msg.sender, _amount), "Transfer failed");

        emit Unstaked(msg.sender, _amount);
    }

    function claimRewards() external {
        _claimRewards();
    }

    function _claimRewards() internal {
        uint256 reward = calculateReward(msg.sender);
        if (reward > 0) {
            stakes[msg.sender].stakedAt = block.timestamp;
            require(b3trToken.transfer(msg.sender, reward), "Reward transfer failed");
            emit RewardClaimed(msg.sender, reward);
        }
    }

    function calculateReward(address _user) public view returns (uint256) {
        Stake memory userStake = stakes[_user];
        if (userStake.amount == 0) return 0;

        uint256 stakingDuration = block.timestamp - userStake.stakedAt;
        uint256 reward = (userStake.amount * rewardRate * stakingDuration) / (100 * YEAR_IN_SECONDS);

        return reward;
    }

    function getStakeInfo(address _user) external view returns (uint256 amount, uint256 stakedAt, uint256 pendingReward) {
        Stake memory userStake = stakes[_user];
        return (userStake.amount, userStake.stakedAt, calculateReward(_user));
    }

    function getStake(address _user) external view returns (uint256) {
        return stakes[_user].amount;
    }

    function setRewardRate(uint256 _newRate) external onlyOwner {
        rewardRate = _newRate;
    }

    // Fund the staking pool with rewards
    function fundPool(uint256 _amount) external onlyOwner {
        require(b3trToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
    }
}
