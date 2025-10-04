// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IPrototype
 * @dev Interface for VeChain's built-in Prototype contract (MPP)
 * Deployed at: 0x000000000000000000000050726f746f74797065
 */
interface IPrototype {
    /**
     * @dev Add a user to receive sponsored transactions
     * @param _self The sponsor account
     * @param _user The user to be sponsored
     */
    function addUser(address _self, address _user) external;

    /**
     * @dev Remove a user from sponsorship
     * @param _self The sponsor account
     * @param _user The user to remove
     */
    function removeUser(address _self, address _user) external;

    /**
     * @dev Check if an address is a sponsored user
     * @param _self The sponsor account
     * @param _user The user to check
     * @return true if user is sponsored
     */
    function isUser(address _self, address _user) external view returns (bool);

    /**
     * @dev Set credit plan for sponsored users
     * @param _self The sponsor account
     * @param _creditPlan Max credit in VTHO
     * @param _recoveryRate Credit recovery rate per block
     */
    function setCreditPlan(address _self, uint256 _creditPlan, uint256 _recoveryRate) external;

    /**
     * @dev Get current credit plan
     * @param _self The sponsor account
     * @return creditPlan Max credit
     * @return recoveryRate Recovery rate per block
     */
    function creditPlan(address _self) external view returns (uint256 creditPlan, uint256 recoveryRate);

    /**
     * @dev Check available credit for a user
     * @param _self The sponsor account
     * @param _user The user to check
     * @return Available credit in VTHO
     */
    function userCredit(address _self, address _user) external view returns (uint256);

    /**
     * @dev Sponsor an account (make this contract a sponsor)
     * @param _self The account to sponsor
     * @param _sponsor The sponsor (this contract)
     */
    function sponsor(address _self, address _sponsor) external;

    /**
     * @dev Remove sponsorship
     * @param _self The sponsored account
     * @param _sponsor The sponsor to remove
     */
    function unsponsor(address _self, address _sponsor) external;

    /**
     * @dev Select current active sponsor
     * @param _self The account
     * @param _sponsor The sponsor to select
     */
    function selectSponsor(address _self, address _sponsor) external;

    /**
     * @dev Check if an address is a sponsor
     * @param _self The sponsored account
     * @param _sponsor The sponsor to check
     * @return true if sponsor is active
     */
    function isSponsor(address _self, address _sponsor) external view returns (bool);

    /**
     * @dev Get current active sponsor
     * @param _self The account
     * @return The active sponsor address
     */
    function currentSponsor(address _self) external view returns (address);
}

/**
 * @title FeeDelegationManager
 * @dev Manages fee delegation for ProofOfImpact volunteers using VeChain MPP
 *
 * How it works:
 * 1. NGOs deposit VET into this contract
 * 2. Contract sponsors their volunteers' transactions
 * 3. Volunteers submit proofs WITHOUT needing VET for gas
 * 4. Gas fees are paid from this contract's balance
 */
contract FeeDelegationManager is Ownable {
    // VeChain built-in Prototype contract address
    IPrototype public constant PROTOTYPE = IPrototype(0x000000000000000000000050726f746F74797065);

    // Credit plan settings
    uint256 public constant MAX_CREDIT = 1000 * 10**18; // 1000 VTHO max credit per user
    uint256 public constant RECOVERY_RATE = 1 * 10**18; // 1 VTHO per block recovery

    // Mapping of NGO => approved volunteers
    mapping(address => address[]) public ngoVolunteers;
    mapping(address => mapping(address => bool)) public isApprovedVolunteer;

    // Track NGO deposits for gas sponsorship
    mapping(address => uint256) public ngoDeposits;

    // Minimum deposit required from NGO to sponsor volunteers
    uint256 public constant MINIMUM_DEPOSIT = 10 * 10**18; // 10 VET

    event VolunteerAdded(address indexed ngo, address indexed volunteer);
    event VolunteerRemoved(address indexed ngo, address indexed volunteer);
    event DepositReceived(address indexed ngo, uint256 amount);
    event WithdrawalMade(address indexed ngo, uint256 amount);
    event CreditPlanUpdated(uint256 maxCredit, uint256 recoveryRate);

    constructor() Ownable(msg.sender) {
        // Initialize credit plan for this contract
        PROTOTYPE.setCreditPlan(address(this), MAX_CREDIT, RECOVERY_RATE);
    }

    /**
     * @dev NGO deposits VET to sponsor volunteers' gas fees
     */
    function depositForSponsorship() external payable {
        require(msg.value >= MINIMUM_DEPOSIT, "Deposit too small");
        ngoDeposits[msg.sender] += msg.value;
        emit DepositReceived(msg.sender, msg.value);
    }

    /**
     * @dev NGO adds a volunteer to receive fee delegation
     * @param _volunteer Address of the volunteer
     */
    function addVolunteer(address _volunteer) external {
        require(ngoDeposits[msg.sender] >= MINIMUM_DEPOSIT, "Insufficient deposit");
        require(!isApprovedVolunteer[msg.sender][_volunteer], "Already approved");

        // Add volunteer to sponsor list
        PROTOTYPE.addUser(address(this), _volunteer);

        ngoVolunteers[msg.sender].push(_volunteer);
        isApprovedVolunteer[msg.sender][_volunteer] = true;

        emit VolunteerAdded(msg.sender, _volunteer);
    }

    /**
     * @dev NGO removes a volunteer from fee delegation
     * @param _volunteer Address of the volunteer
     */
    function removeVolunteer(address _volunteer) external {
        require(isApprovedVolunteer[msg.sender][_volunteer], "Not approved");

        // Remove volunteer from sponsor list
        PROTOTYPE.removeUser(address(this), _volunteer);

        isApprovedVolunteer[msg.sender][_volunteer] = false;

        emit VolunteerRemoved(msg.sender, _volunteer);
    }

    /**
     * @dev Batch add multiple volunteers (gas efficient)
     * @param _volunteers Array of volunteer addresses
     */
    function addVolunteerBatch(address[] calldata _volunteers) external {
        require(ngoDeposits[msg.sender] >= MINIMUM_DEPOSIT, "Insufficient deposit");

        for (uint256 i = 0; i < _volunteers.length; i++) {
            address volunteer = _volunteers[i];

            if (!isApprovedVolunteer[msg.sender][volunteer]) {
                PROTOTYPE.addUser(address(this), volunteer);
                ngoVolunteers[msg.sender].push(volunteer);
                isApprovedVolunteer[msg.sender][volunteer] = true;
                emit VolunteerAdded(msg.sender, volunteer);
            }
        }
    }

    /**
     * @dev NGO withdraws unused VET deposit
     * @param _amount Amount to withdraw
     */
    function withdraw(uint256 _amount) external {
        require(ngoDeposits[msg.sender] >= _amount, "Insufficient balance");
        ngoDeposits[msg.sender] -= _amount;

        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "Transfer failed");

        emit WithdrawalMade(msg.sender, _amount);
    }

    /**
     * @dev Check if a volunteer is sponsored
     * @param _volunteer Address to check
     */
    function isSponsored(address _volunteer) external view returns (bool) {
        return PROTOTYPE.isUser(address(this), _volunteer);
    }

    /**
     * @dev Get available credit for a volunteer
     * @param _volunteer Address to check
     */
    function getAvailableCredit(address _volunteer) external view returns (uint256) {
        return PROTOTYPE.userCredit(address(this), _volunteer);
    }

    /**
     * @dev Get all volunteers sponsored by an NGO
     * @param _ngo NGO address
     */
    function getNGOVolunteers(address _ngo) external view returns (address[] memory) {
        return ngoVolunteers[_ngo];
    }

    /**
     * @dev Get NGO deposit balance
     * @param _ngo NGO address
     */
    function getNGODeposit(address _ngo) external view returns (uint256) {
        return ngoDeposits[_ngo];
    }

    /**
     * @dev Get current credit plan
     */
    function getCreditPlan() external view returns (uint256 maxCredit, uint256 recoveryRate) {
        return PROTOTYPE.creditPlan(address(this));
    }

    /**
     * @dev Update credit plan (only owner)
     * @param _maxCredit New max credit
     * @param _recoveryRate New recovery rate
     */
    function updateCreditPlan(uint256 _maxCredit, uint256 _recoveryRate) external onlyOwner {
        PROTOTYPE.setCreditPlan(address(this), _maxCredit, _recoveryRate);
        emit CreditPlanUpdated(_maxCredit, _recoveryRate);
    }

    /**
     * @dev Receive VET deposits
     */
    receive() external payable {
        ngoDeposits[msg.sender] += msg.value;
        emit DepositReceived(msg.sender, msg.value);
    }
}
