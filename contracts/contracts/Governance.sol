// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IB3TR {
    function balanceOf(address) external view returns (uint256);
}

interface IStakingPool {
    function getStake(address user) external view returns (uint256);
}

contract Governance {
    enum VoteOption { Against, For, Abstain }
    enum ProposalState { Active, Defeated, Passed, Executed, Cancelled }

    struct Proposal {
        address proposer;
        bytes32 ipfsHash;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        bool executed;
        bool cancelled;
        mapping(address => bool) voted;
        mapping(address => VoteOption) voteChoice;
        uint256 commentCount;
    }

    struct Comment {
        address commenter;
        bytes32 ipfsHash;
        uint256 timestamp;
    }

    IB3TR public token;
    IStakingPool public stakingPool;
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(uint256 => Comment)) public proposalComments;

    uint256 public constant MIN_STAKE = 100e18; // 100 B3TR staked required
    uint256 public constant VOTING_PERIOD = 3 days;

    event ProposalCreated(uint256 indexed id, address indexed proposer, bytes32 ipfsHash, uint256 startTime, uint256 endTime);
    event VoteCast(uint256 indexed id, address indexed voter, VoteOption option, uint256 weight);
    event ProposalExecuted(uint256 indexed id);
    event ProposalCancelled(uint256 indexed id);
    event CommentAdded(uint256 indexed proposalId, address indexed commenter, bytes32 ipfsHash, uint256 commentId);

    constructor(address _token, address _stakingPool) {
        token = IB3TR(_token);
        stakingPool = IStakingPool(_stakingPool);
    }

    modifier hasMinStake() {
        require(stakingPool.getStake(msg.sender) >= MIN_STAKE, "Need 100+ B3TR staked");
        _;
    }

    function createProposal(bytes32 ipfsHash) external hasMinStake returns (uint256) {
        uint256 id = ++proposalCount;
        Proposal storage p = proposals[id];
        p.proposer = msg.sender;
        p.ipfsHash = ipfsHash;
        p.startTime = block.timestamp;
        p.endTime = block.timestamp + VOTING_PERIOD;
        emit ProposalCreated(id, msg.sender, ipfsHash, p.startTime, p.endTime);
        return id;
    }

    function castVote(uint256 id, VoteOption option) external hasMinStake {
        Proposal storage p = proposals[id];
        require(id > 0 && id <= proposalCount, "Invalid proposal");
        require(block.timestamp >= p.startTime, "Not started");
        require(block.timestamp <= p.endTime, "Voting ended");
        require(!p.cancelled, "Cancelled");
        require(!p.voted[msg.sender], "Already voted");

        // Vote weight based on staked amount
        uint256 weight = stakingPool.getStake(msg.sender);
        p.voted[msg.sender] = true;
        p.voteChoice[msg.sender] = option;

        if (option == VoteOption.For) {
            p.forVotes += weight;
        } else if (option == VoteOption.Against) {
            p.againstVotes += weight;
        } else {
            p.abstainVotes += weight;
        }

        emit VoteCast(id, msg.sender, option, weight);
    }

    function executeProposal(uint256 id) external {
        Proposal storage p = proposals[id];
        require(id > 0 && id <= proposalCount, "Invalid proposal");
        require(block.timestamp > p.endTime, "Voting not ended");
        require(!p.executed, "Already executed");
        require(!p.cancelled, "Cancelled");
        require(p.forVotes > p.againstVotes, "Not passed");

        p.executed = true;
        emit ProposalExecuted(id);
    }

    function cancelProposal(uint256 id) external {
        Proposal storage p = proposals[id];
        require(id > 0 && id <= proposalCount, "Invalid proposal");
        require(msg.sender == p.proposer, "Only proposer");
        require(block.timestamp <= p.endTime, "Voting ended");
        require(!p.executed, "Already executed");
        require(!p.cancelled, "Already cancelled");

        p.cancelled = true;
        emit ProposalCancelled(id);
    }

    function getProposalState(uint256 id) external view returns (ProposalState) {
        Proposal storage p = proposals[id];
        require(id > 0 && id <= proposalCount, "Invalid proposal");

        if (p.cancelled) return ProposalState.Cancelled;
        if (p.executed) return ProposalState.Executed;
        if (block.timestamp <= p.endTime) return ProposalState.Active;
        if (p.forVotes > p.againstVotes) return ProposalState.Passed;
        return ProposalState.Defeated;
    }

    function getProposal(uint256 id) external view returns (
        address proposer,
        bytes32 ipfsHash,
        uint256 startTime,
        uint256 endTime,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 abstainVotes,
        bool executed,
        bool cancelled
    ) {
        Proposal storage p = proposals[id];
        return (p.proposer, p.ipfsHash, p.startTime, p.endTime, p.forVotes, p.againstVotes, p.abstainVotes, p.executed, p.cancelled);
    }

    function hasVoted(uint256 id, address user) external view returns (bool) {
        return proposals[id].voted[user];
    }

    function getUserVote(uint256 id, address user) external view returns (VoteOption) {
        require(proposals[id].voted[user], "Not voted");
        return proposals[id].voteChoice[user];
    }

    function getAllProposalIds() external view returns (uint256[] memory) {
        uint256[] memory ids = new uint256[](proposalCount);
        for (uint256 i = 0; i < proposalCount; i++) {
            ids[i] = i + 1;
        }
        return ids;
    }

    function addComment(uint256 proposalId, bytes32 ipfsHash) external hasMinStake {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal");
        Proposal storage p = proposals[proposalId];
        require(!p.cancelled, "Proposal cancelled");

        uint256 commentId = ++p.commentCount;
        Comment storage c = proposalComments[proposalId][commentId];
        c.commenter = msg.sender;
        c.ipfsHash = ipfsHash;
        c.timestamp = block.timestamp;

        emit CommentAdded(proposalId, msg.sender, ipfsHash, commentId);
    }

    function getCommentCount(uint256 proposalId) external view returns (uint256) {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal");
        return proposals[proposalId].commentCount;
    }

    function getComment(uint256 proposalId, uint256 commentId) external view returns (
        address commenter,
        bytes32 ipfsHash,
        uint256 timestamp
    ) {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal");
        require(commentId > 0 && commentId <= proposals[proposalId].commentCount, "Invalid comment");
        Comment storage c = proposalComments[proposalId][commentId];
        return (c.commenter, c.ipfsHash, c.timestamp);
    }

    function getAllComments(uint256 proposalId) external view returns (
        address[] memory commenters,
        bytes32[] memory ipfsHashes,
        uint256[] memory timestamps
    ) {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal");
        uint256 count = proposals[proposalId].commentCount;

        commenters = new address[](count);
        ipfsHashes = new bytes32[](count);
        timestamps = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            Comment storage c = proposalComments[proposalId][i + 1];
            commenters[i] = c.commenter;
            ipfsHashes[i] = c.ipfsHash;
            timestamps[i] = c.timestamp;
        }

        return (commenters, ipfsHashes, timestamps);
    }
}
