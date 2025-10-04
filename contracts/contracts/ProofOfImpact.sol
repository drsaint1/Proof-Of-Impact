// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReputationNFT
 * @dev Soulbound NFT that tracks volunteer impact score
 */
contract ReputationNFT is ERC721, Ownable {
    uint256 private _nextTokenId;

    mapping(uint256 => uint256) public impactScores;
    mapping(address => uint256) public userToToken;
    mapping(uint256 => bool) public isSoulbound;
    string private _tokenURI;

    event ImpactUpdated(uint256 indexed tokenId, uint256 newScore);

    constructor() ERC721("ProofOfImpact Reputation", "POI") Ownable(msg.sender) {
        _tokenURI = "";
    }

    function setTokenURI(string memory uri) external onlyOwner {
        _tokenURI = uri;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURI;
    }

    function mintReputation(address volunteer) external onlyOwner returns (uint256) {
        require(userToToken[volunteer] == 0, "Already has reputation NFT");

        uint256 tokenId = ++_nextTokenId;

        _safeMint(volunteer, tokenId);
        userToToken[volunteer] = tokenId;
        isSoulbound[tokenId] = true;
        impactScores[tokenId] = 0;

        return tokenId;
    }

    function updateImpact(address volunteer, uint256 additionalScore) external onlyOwner {
        uint256 tokenId = userToToken[volunteer];
        require(tokenId != 0, "No reputation NFT");

        impactScores[tokenId] += additionalScore;
        emit ImpactUpdated(tokenId, impactScores[tokenId]);
    }

    function getImpactScore(address volunteer) external view returns (uint256) {
        uint256 tokenId = userToToken[volunteer];
        return impactScores[tokenId];
    }

    // Override transfer functions to make soulbound
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            require(!isSoulbound[tokenId], "Soulbound: cannot transfer");
        }
        return super._update(to, tokenId, auth);
    }
}

/**
 * @title OpportunityContract
 * @dev Manages NGO opportunities and volunteer submissions with on-chain verification
 */
contract OpportunityContract is Ownable {
    uint256 private _nextOpportunityId;

    IERC20 public b3trToken;
    ReputationNFT public reputationNFT;

    uint256 public constant NGO_STAKE_AMOUNT = 100 * 10**18; // 100 B3TR
    uint256 public constant ORACLE_FEE = 1 * 10**18; // 1 B3TR per verification

    address public oracleNode;

    enum OpportunityStatus { Active, Completed, Cancelled }
    enum SubmissionStatus { Pending, Verified, Rejected }

    struct Opportunity {
        uint256 id;
        address ngo;
        string title;
        string description;
        string proofRequirements;
        uint256 rewardAmount;
        uint256 stakeAmount;
        uint256 maxVolunteers;
        uint256 currentVolunteers;
        OpportunityStatus status;
        int256 latitude;
        int256 longitude;
        uint256 radiusMeters;
        uint256 createdAt;
    }

    struct Submission {
        uint256 opportunityId;
        address volunteer;
        string ipfsHash;
        int256 latitude;
        int256 longitude;
        uint256 timestamp;
        SubmissionStatus status;
        uint256 submittedAt;
    }

    mapping(uint256 => Opportunity) public opportunities;
    mapping(uint256 => Submission[]) public opportunitySubmissions;
    mapping(address => uint256[]) public ngoOpportunities;
    mapping(address => uint256[]) public volunteerSubmissions;

    event OpportunityCreated(uint256 indexed opportunityId, address indexed ngo, uint256 rewardAmount);
    event SubmissionCreated(uint256 indexed opportunityId, address indexed volunteer, string ipfsHash);
    event SubmissionVerified(uint256 indexed opportunityId, address indexed volunteer, bool approved);
    event RewardPaid(uint256 indexed opportunityId, address indexed volunteer, uint256 amount);

    constructor(address _b3trToken, address _reputationNFT, address _oracleNode) Ownable(msg.sender) {
        b3trToken = IERC20(_b3trToken);
        reputationNFT = ReputationNFT(_reputationNFT);
        oracleNode = _oracleNode;
    }

    function createOpportunity(
        string memory _title,
        string memory _description,
        string memory _proofRequirements,
        uint256 _rewardAmount,
        uint256 _maxVolunteers,
        int256 _latitude,
        int256 _longitude,
        uint256 _radiusMeters
    ) external returns (uint256) {
        require(_rewardAmount > 0, "Reward must be positive");
        require(_maxVolunteers > 0, "Max volunteers must be positive");

        uint256 totalRequired = NGO_STAKE_AMOUNT + (_rewardAmount * _maxVolunteers);
        require(b3trToken.transferFrom(msg.sender, address(this), totalRequired), "Transfer failed");

        uint256 newOpportunityId = ++_nextOpportunityId;

        opportunities[newOpportunityId] = Opportunity({
            id: newOpportunityId,
            ngo: msg.sender,
            title: _title,
            description: _description,
            proofRequirements: _proofRequirements,
            rewardAmount: _rewardAmount,
            stakeAmount: NGO_STAKE_AMOUNT,
            maxVolunteers: _maxVolunteers,
            currentVolunteers: 0,
            status: OpportunityStatus.Active,
            latitude: _latitude,
            longitude: _longitude,
            radiusMeters: _radiusMeters,
            createdAt: block.timestamp
        });

        ngoOpportunities[msg.sender].push(newOpportunityId);

        emit OpportunityCreated(newOpportunityId, msg.sender, _rewardAmount);
        return newOpportunityId;
    }

    function submitProof(
        uint256 _opportunityId,
        string memory _ipfsHash,
        int256 _latitude,
        int256 _longitude
    ) external {
        Opportunity storage opp = opportunities[_opportunityId];
        require(opp.status == OpportunityStatus.Active, "Opportunity not active");
        require(opp.currentVolunteers < opp.maxVolunteers, "Max volunteers reached");

        Submission memory newSubmission = Submission({
            opportunityId: _opportunityId,
            volunteer: msg.sender,
            ipfsHash: _ipfsHash,
            latitude: _latitude,
            longitude: _longitude,
            timestamp: block.timestamp,
            status: SubmissionStatus.Pending,
            submittedAt: block.timestamp
        });

        opportunitySubmissions[_opportunityId].push(newSubmission);
        volunteerSubmissions[msg.sender].push(_opportunityId);

        emit SubmissionCreated(_opportunityId, msg.sender, _ipfsHash);
    }

    function verifySubmission(
        uint256 _opportunityId,
        uint256 _submissionIndex,
        bool _approved
    ) external {
        Opportunity storage opp = opportunities[_opportunityId];

        // Allow both oracle and the NGO who created the opportunity to verify
        require(
            msg.sender == oracleNode || msg.sender == opp.ngo,
            "Only oracle or opportunity creator can verify"
        );

        Submission storage submission = opportunitySubmissions[_opportunityId][_submissionIndex];
        require(submission.status == SubmissionStatus.Pending, "Already processed");

        if (_approved) {
            submission.status = SubmissionStatus.Verified;
            opp.currentVolunteers++;

            // Pay reward to volunteer
            require(b3trToken.transfer(submission.volunteer, opp.rewardAmount), "Reward transfer failed");

            // Pay oracle fee
            require(b3trToken.transfer(oracleNode, ORACLE_FEE), "Oracle fee transfer failed");

            // Update or mint reputation NFT
            if (reputationNFT.userToToken(submission.volunteer) == 0) {
                reputationNFT.mintReputation(submission.volunteer);
            }
            reputationNFT.updateImpact(submission.volunteer, opp.rewardAmount / 10**18);

            emit RewardPaid(_opportunityId, submission.volunteer, opp.rewardAmount);

            // Complete opportunity if max volunteers reached
            if (opp.currentVolunteers >= opp.maxVolunteers) {
                opp.status = OpportunityStatus.Completed;
                // Return stake to NGO
                require(b3trToken.transfer(opp.ngo, opp.stakeAmount), "Stake return failed");
            }
        } else {
            submission.status = SubmissionStatus.Rejected;
        }

        emit SubmissionVerified(_opportunityId, submission.volunteer, _approved);
    }

    function getOpportunity(uint256 _opportunityId) external view returns (Opportunity memory) {
        return opportunities[_opportunityId];
    }

    function getAllOpportunities() external view returns (Opportunity[] memory) {
        uint256 totalOpportunities = _nextOpportunityId;
        Opportunity[] memory allOpps = new Opportunity[](totalOpportunities);

        for (uint256 i = 1; i <= totalOpportunities; i++) {
            allOpps[i - 1] = opportunities[i];
        }

        return allOpps;
    }

    function getOpportunitySubmissions(uint256 _opportunityId) external view returns (Submission[] memory) {
        return opportunitySubmissions[_opportunityId];
    }

    function setOracleNode(address _newOracle) external onlyOwner {
        oracleNode = _newOracle;
    }
}
