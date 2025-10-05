# ProofOfImpact - Complete Documentation

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Solution Overview](#solution-overview)
4. [Technical Architecture](#technical-architecture)
5. [Smart Contracts](#smart-contracts)
6. [AI Oracle System](#ai-oracle-system)
7. [Fee Delegation System](#fee-delegation-system)
8. [Frontend Application](#frontend-application)
9. [B3TR Token Economics](#b3tr-token-economics)
10. [Deployment Guide](#deployment-guide)
11. [User Guide](#user-guide)
12. [Business Model](#business-model)
13. [Roadmap](#roadmap)
14. [Team](#team)
15. [Technical Specifications](#technical-specifications)

---

## Executive Summary

**ProofOfImpact** is a blockchain-verified volunteer coordination platform that uses AI-powered verification and VeChain's native fee delegation to make environmental volunteering transparent, verifiable, and accessible to everyone.

### Key Features

🤖 **AI-Powered Verification** - Google Gemini AI automatically verifies volunteer submissions
⚡ **Zero Gas Fees** - VeChain MPP protocol removes barriers for volunteers
🏆 **Soulbound NFTs** - Non-transferable reputation tokens prove impact
💰 **B3TR Rewards** - Volunteers earn tokens for verified environmental work
📊 **Real-Time Dashboard** - Live statistics, leaderboards, and achievements
🌍 **Scalable** - Can onboard hundreds of thousands of users

### Why This Matters

- **$1.5 trillion** annual giving to nonprofits globally
- **62%** of donors want transparency on impact
- **73%** of volunteers quit due to lack of recognition
- **ProofOfImpact** solves all three problems with blockchain + AI

---

## Problem Statement

### The Challenge

Non-governmental organizations (NGOs) and environmental groups face critical challenges:

#### 1. **Trust Deficit**
- Donors question if their money actually creates impact
- No transparent way to verify volunteer work was completed
- Fraudulent claims damage sector reputation

#### 2. **Volunteer Retention**
- 73% of volunteers quit within first year
- Lack of recognition and proof of contribution
- No portable reputation system across organizations

#### 3. **Administrative Burden**
- Manual verification of volunteer submissions is time-consuming
- Difficult to track and report impact to stakeholders
- High overhead costs reduce funds available for mission

#### 4. **Web3 Adoption Barriers**
- Volunteers don't have cryptocurrency for gas fees
- Complex wallet setup deters participation
- Technical knowledge required excludes majority

### Real-World Impact

**Case Study: Beach Cleanup Initiative**
- Organization hosts weekly beach cleanups
- Claims 500kg of plastic removed per event
- Donors have no way to verify this claim
- Trust issues → 40% decrease in donations year-over-year

**ProofOfImpact Solution:**
- Volunteers submit GPS-tagged photos of collected waste
- AI verifies authenticity automatically
- Immutable on-chain record of every cleanup
- Donors can see real-time, verified impact
- Trust restored → donations increase

---

## Solution Overview

ProofOfImpact creates a trustless, transparent ecosystem where:

### For NGOs
✅ Create verified environmental opportunities
✅ Automatic AI verification reduces admin work by 90%
✅ Sponsor volunteer gas fees with fee delegation
✅ Build transparent impact reports for donors
✅ Stake B3TR tokens to ensure accountability

### For Volunteers
✅ Connect wallet and start volunteering immediately
✅ No gas fees required (sponsored by NGOs)
✅ Earn B3TR rewards for verified work
✅ Build portable reputation with Soulbound NFTs
✅ Compete on global leaderboard
✅ Unlock achievement badges

### For Donors
✅ View real-time, verified impact data
✅ See exactly where their money goes
✅ Track individual volunteers and organizations
✅ Immutable proof prevents fraud
✅ Increased confidence in giving

### How It Works

```
1. NGO Creates Opportunity
   ↓
   - Stakes 100 B3TR
   - Sets reward amount per volunteer
   - Defines proof requirements
   - Sponsors gas fees for volunteers

2. Volunteer Accepts & Completes Work
   ↓
   - Finds opportunity on platform
   - Completes environmental work
   - Takes GPS-tagged photo
   - Submits proof (NO GAS FEE!)

3. AI Oracle Verifies Automatically
   ↓
   - Listens for blockchain event
   - Analyzes photo with Google Gemini AI
   - Checks GPS coordinates
   - Calculates impact score
   - Submits verdict to blockchain

4. Rewards Distributed
   ↓
   - Approved: Volunteer receives B3TR tokens
   - Reputation NFT updated with new score
   - NGO stake returned when complete
   - Impact recorded permanently on-chain
```

---

## Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │ Landing  │  │   NGO    │  │Volunteer │  │   Staking   │ │
│  │   Page   │  │Dashboard │  │Dashboard │  │     Pool    │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │ Ethers.js / VeWorld Wallet
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                   VeChain Blockchain                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Opportunity  │  │ Reputation   │  │   MockB3TR   │      │
│  │  Contract    │  │     NFT      │  │    Token     │      │
│  └──────┬───────┘  └──────────────┘  └──────────────┘      │
│         │                                                     │
│  ┌──────┴───────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Staking    │  │     Fee      │  │  Prototype   │      │
│  │     Pool     │  │  Delegation  │  │(MPP - 0x000) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │ Events (SubmissionCreated)
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    AI Oracle Service                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Event Listener│→ │ Google Gemini│→ │  Blockchain  │      │
│  │              │  │  AI Analysis │  │  Submitter   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Blockchain:**
- VeChain Thor Testnet
- Solidity 0.8.20
- Hardhat development framework
- OpenZeppelin contracts v5

**Frontend:**
- React 18 + TypeScript
- Vite 7 (build tool)
- Tailwind CSS v3.4
- Ethers.js v6
- Lucide React (icons)

**Oracle Service:**
- Node.js
- Ethers.js for blockchain interaction
- Google Gemini AI (gemini-1.5-flash model)
- Event-driven architecture

**AI:**
- Google Generative AI SDK
- Gemini 1.5 Flash model
- Image analysis capabilities
- JSON-structured responses

---

## Smart Contracts

### 1. OpportunityContract.sol

**Purpose:** Core contract managing opportunities and submissions

**Key Functions:**

```solidity
function createOpportunity(
    string memory _title,
    string memory _description,
    string memory _proofRequirements,
    uint256 _rewardAmount,
    uint256 _maxVolunteers,
    int256 _latitude,
    int256 _longitude,
    uint256 _radiusMeters
) external returns (uint256)
```
- NGO creates new volunteer opportunity
- Requires staking 100 B3TR + total rewards
- Emits `OpportunityCreated` event

```solidity
function submitProof(
    uint256 _opportunityId,
    string memory _ipfsHash,
    int256 _latitude,
    int256 _longitude
) external
```
- Volunteer submits proof of completion
- Stores IPFS hash and GPS coordinates
- Emits `SubmissionCreated` event (triggers oracle)

```solidity
function verifySubmission(
    uint256 _opportunityId,
    uint256 _submissionIndex,
    bool _approved
) external
```
- Oracle-only function to verify submissions
- Distributes B3TR rewards if approved
- Updates or mints Reputation NFT
- Returns NGO stake when complete

**State Variables:**
- `NGO_STAKE_AMOUNT = 100 B3TR` - Required stake
- `ORACLE_FEE = 1 B3TR` - Fee per verification
- `oracleNode` - Authorized oracle address

**Events:**
```solidity
event OpportunityCreated(uint256 indexed opportunityId, address indexed ngo, uint256 rewardAmount);
event SubmissionCreated(uint256 indexed opportunityId, address indexed volunteer, string ipfsHash);
event SubmissionVerified(uint256 indexed opportunityId, address indexed volunteer, bool approved);
event RewardPaid(uint256 indexed opportunityId, address indexed volunteer, uint256 amount);
```

---

### 2. ReputationNFT.sol

**Purpose:** Soulbound NFT tracking volunteer impact scores

**Key Features:**
- One NFT per volunteer address
- Non-transferable (soulbound)
- Cumulative impact score
- Owned by OpportunityContract

**Key Functions:**

```solidity
function mintReputation(address volunteer) external onlyOwner returns (uint256)
```
- Mints new reputation NFT for first-time volunteer
- Sets initial impact score to 0
- Only callable by OpportunityContract

```solidity
function updateImpact(address volunteer, uint256 additionalScore) external onlyOwner
```
- Adds score to existing NFT
- Called after successful submission verification
- Emits `ImpactUpdated` event

```solidity
function getImpactScore(address volunteer) external view returns (uint256)
```
- Returns total impact score for a volunteer
- Used for leaderboard rankings

**Transfer Prevention:**
```solidity
function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
    address from = _ownerOf(tokenId);
    if (from != address(0) && to != address(0)) {
        require(!isSoulbound[tokenId], "Soulbound: cannot transfer");
    }
    return super._update(to, tokenId, auth);
}
```

---

### 3. MockB3TR.sol

**Purpose:** ERC20 token for rewards and staking

**Features:**
- Standard ERC20 implementation
- Mintable (for testing)
- Faucet function for easy testing

**Key Functions:**

```solidity
function faucet(address to, uint256 amount) external
```
- Mints tokens for testing
- Anyone can call (testnet only)
- Allows volunteers to get B3TR without purchasing

```solidity
function mint(address to, uint256 amount) external onlyOwner
```
- Owner-only minting function
- Used for initial distribution
- NGO funding

---

### 4. StakingPool.sol

**Purpose:** B3TR token staking with 10% APY

**Features:**
- Stake B3TR tokens
- Earn 10% annual yield
- Withdraw anytime
- Tracks individual stakes

**Key Functions:**

```solidity
function stake(uint256 amount) external
```
- Transfers B3TR from user to pool
- Records stake timestamp
- Starts earning rewards

```solidity
function withdraw(uint256 amount) external
```
- Calculates earned rewards
- Returns principal + rewards
- Updates stake record

```solidity
function getRewards(address user) external view returns (uint256)
```
- Calculates current rewards
- Based on 10% APY
- Time-weighted calculation

**Reward Calculation:**
```solidity
uint256 reward = (stakedAmount * 10 * timeStaked) / (100 * 365 days);
```

---

### 5. FeeDelegationManager.sol

**Purpose:** VeChain MPP integration for zero-gas transactions

**Key Features:**
- Interfaces with VeChain Prototype contract
- NGOs deposit VET to sponsor volunteers
- Credit system prevents abuse
- Batch operations for efficiency

**Key Functions:**

```solidity
function depositForSponsorship() external payable
```
- NGO deposits VET for gas sponsorship
- Minimum 10 VET required
- Tracks deposits per NGO

```solidity
function addVolunteer(address _volunteer) external
```
- Adds volunteer to sponsor list
- Calls `Prototype.addUser()`
- Requires minimum deposit

```solidity
function addVolunteerBatch(address[] calldata _volunteers) external
```
- Batch add multiple volunteers
- Gas-efficient operation
- Good for onboarding events

**Prototype Interface:**
```solidity
interface IPrototype {
    function addUser(address _self, address _user) external;
    function setCreditPlan(address _self, uint256 _creditPlan, uint256 _recoveryRate) external;
    function userCredit(address _self, address _user) external view returns (uint256);
}
```

**Credit Configuration:**
- Max Credit: 1000 VTHO per volunteer
- Recovery Rate: 1 VTHO per block (~10 seconds)
- Typical transaction: ~50 VTHO
- Volunteers can submit ~20 proofs before credit reset

---

## AI Oracle System

### Architecture

The oracle is a Node.js service that bridges blockchain and AI:

```
Blockchain Event → Oracle Listener → AI Analysis → Blockchain Submission
```

### Components

#### 1. Event Listener

```javascript
contract.on('SubmissionCreated', async (opportunityId, submissionId, volunteer, photoUrl, gpsLat, gpsLong, event) => {
  console.log(`🔔 Event detected at block ${event.log.blockNumber}`);
  await processSubmission(...);
});
```

**What it does:**
- Listens for `SubmissionCreated` events 24/7
- Automatically triggered when volunteer submits proof
- Extracts submission data from event
- Passes to verification logic

#### 2. AI Verification Engine

**Google Gemini Integration:**

```javascript
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = `You are an AI oracle verifying volunteer work for environmental impact.

Analyze this submission and determine if it meets the requirements:

REQUIREMENTS:
${requirements}

Please analyze and respond in JSON format:
{
  "approved": true/false,
  "confidence": 0-100,
  "description": "brief description of what you see",
  "reasoning": "why you approved or rejected this"
}`;

const result = await model.generateContent(prompt);
```

**Verification Criteria:**

1. **Photo Analysis (60 points)**
   - AI examines image content
   - Checks for environmental activity
   - Verifies alignment with requirements
   - Confidence scoring

2. **GPS Validation (20 points)**
   - Coordinates not 0,0
   - Within required radius (if specified)
   - Realistic location data

3. **Photo Presence (20 points)**
   - IPFS hash provided
   - Photo URL accessible
   - Valid format

**Scoring System:**
- 100 points maximum
- 50+ points = APPROVED
- <50 points = REJECTED

**AI Response Example:**
```json
{
  "approved": true,
  "confidence": 92,
  "description": "Image shows volunteers collecting waste in plastic bags on a beach with ocean visible in background",
  "reasoning": "Clear evidence of environmental cleanup activity matching requirements for beach cleanup"
}
```

#### 3. Blockchain Submitter

```javascript
const tx = await contract.verifySubmission(
  opportunityId,
  submissionId,
  approved,
  impactScore
);

await tx.wait();
console.log(`✅ Verification submitted successfully!`);
```

**What happens:**
- Oracle signs transaction with private key
- Calls `verifySubmission()` on OpportunityContract
- Blockchain processes result
- Rewards distributed if approved
- Gas fee paid from oracle wallet

### Running the Oracle

**Setup:**
```bash
cd oracle-service
npm install
cp .env.example .env
# Add ORACLE_PRIVATE_KEY and GEMINI_API_KEY
npm start
```

**Output:**
```
🤖 ProofOfImpact AI Oracle Service Starting...

📡 Connected to VeChain: https://testnet.vechain.org
🔑 Oracle Address: 0x...
📝 Contract Address: 0x...

✅ Oracle service is running. Listening for submissions...

🔔 Event detected at block 12345

📬 New Submission Received!
   Opportunity ID: 1
   Submission ID: 1
   Volunteer: 0x...

🔍 Verifying Submission #1 for Opportunity #1
   Photo URL: ipfs://...
   GPS: 1.2804, 103.852
   ✅ Photo received
   ✅ Valid GPS coordinates
   🤖 Analyzing photo with Google Gemini AI...
   🎯 AI Analysis Results:
      Approved: ✅ Yes
      Confidence: 92%
      Description: Beach cleanup with waste bags
      Reasoning: Clear evidence of environmental work

   📊 Final Impact Score: 100/100
   ✅ APPROVED

📤 Submitting verification to blockchain...
   Transaction hash: 0x...
   Waiting for confirmation...

✅ Verification submitted successfully!
   Block: 12346
   Gas used: 125000
```

### Oracle Security

**Access Control:**
- Only authorized oracle address can verify
- Set via `setOracleNode()` by contract owner
- Prevents unauthorized verifications

**Error Handling:**
- Try/catch blocks prevent crashes
- Fallback logic if AI fails
- Logs all errors for debugging
- Continues running after errors

**Reliability:**
- Can run in background with PM2
- Reconnects automatically if connection lost
- Processes events in order
- No submissions missed

---

## Fee Delegation System

### Why Fee Delegation?

**Problem:** Volunteers don't have VET for gas fees
**Solution:** NGOs sponsor volunteer transactions using VeChain MPP

### How It Works

#### VeChain's Multi-Party Payment (MPP)

VeChain has a **built-in protocol** for fee delegation at:
```
0x000000000000000000000050726f746f74797065
```

This is a **native blockchain feature**, not a custom smart contract!

#### Implementation Flow

```
1. NGO Deposits VET
   ↓
   FeeDelegationManager.depositForSponsorship()
   - Minimum 10 VET
   - Stored in contract

2. NGO Adds Volunteer
   ↓
   FeeDelegationManager.addVolunteer(address)
   - Calls Prototype.addUser()
   - Volunteer now sponsored

3. Volunteer Submits Proof
   ↓
   OpportunityContract.submitProof()
   - Transaction requires ~50 VTHO gas
   - Gas paid from FeeDelegationManager balance
   - Volunteer pays 0 VET!

4. Credit Recovers
   ↓
   - 1 VTHO recovered per block
   - After 50 blocks, credit restored
   - Volunteer can submit again
```

### Credit System

**Formula:**
```
Available Credit = min(MaxCredit, MaxCredit - UsedCredit + RecoveryRate × Blocks)
```

**Parameters:**
- **Max Credit**: 1000 VTHO
- **Recovery Rate**: 1 VTHO per block
- **Block Time**: ~10 seconds

**Example:**
- Volunteer submits proof: Uses 50 VTHO
- Remaining credit: 950 VTHO
- After 50 blocks (~500 seconds): 1000 VTHO restored
- Can submit again immediately

### NGO Management Interface

**Located in:** NGO Dashboard → Fee Delegation Tab

**Features:**
1. **Deposit Management**
   - Deposit VET for sponsorship
   - View current balance
   - Withdraw unused VET

2. **Volunteer Management**
   - Add individual volunteer by address
   - Batch add multiple volunteers
   - Remove volunteers from sponsorship
   - View list of sponsored volunteers

3. **Monitoring**
   - Check volunteer credit availability
   - View total volunteers sponsored
   - Track deposit usage

### Economics

**Cost Analysis:**

| Scenario | Transactions | VTHO Cost | VET Cost | USD Cost |
|----------|--------------|-----------|----------|----------|
| 1 volunteer, 1 proof | 1 | 50 | 0.0001 | $0.000003 |
| 10 volunteers, 5 proofs each | 50 | 2,500 | 0.005 | $0.00015 |
| 100 volunteers, 5 proofs each | 500 | 25,000 | 0.05 | $0.0015 |
| 1000 volunteers, 5 proofs each | 5,000 | 250,000 | 0.5 | $0.015 |

**At VET = $0.03 USD**

**Conclusion:** Fee delegation is **incredibly cheap** on VeChain!

### Comparison to Other Chains

| Blockchain | Gas-Free UX | Native Support | Cost per Tx | User Friction |
|------------|-------------|----------------|-------------|---------------|
| **VeChain** | ✅ Yes (MPP) | ✅ Built-in | $0.000003 | None |
| Ethereum | ❌ No | ❌ Custom relayers | $5-50 | Very High |
| Polygon | ⚠️ Relayers | ⚠️ Complex setup | $0.01-0.1 | Medium |
| BSC | ❌ No | ❌ Custom | $0.1-1 | High |
| Solana | ❌ No | ❌ Custom | $0.00025 | Medium |

**VeChain is the ONLY blockchain with production-ready, native fee delegation!**

---

## Frontend Application

### Landing Page

**File:** `src/components/LandingPage.tsx`

**Features:**
- Animated gradient background
- Floating particles effect
- Live statistics counter
- "How It Works" section
- Feature showcase
- Call-to-action buttons

**Statistics Displayed:**
- Total volunteers
- B3TR distributed
- Active opportunities
- Countries covered

**Design:**
- Glass morphism UI
- Smooth animations
- Mobile responsive
- Engaging visuals

---

### NGO Dashboard

**File:** `src/components/NGODashboard.tsx`

#### Tab 1: Opportunities

**Features:**
- Create new opportunities
- Pre-populated form for testing
- View all created opportunities
- Track volunteer participation
- Real-time status updates

**Create Opportunity Form:**
- Title and description
- Proof requirements
- Reward amount (B3TR)
- Max volunteers
- GPS location (lat/long)
- Verification radius

**Opportunity Cards:**
- Progress tracking
- Volunteer count
- Reward information
- Status badges
- Location details

#### Tab 2: Fee Delegation

**Features:**
- Deposit VET for sponsorship
- Add/remove volunteers
- Batch volunteer onboarding
- View sponsored volunteers
- Monitor credit availability
- Withdraw unused deposits

**UI Elements:**
- Current balance display
- Deposit/withdraw forms
- Volunteer list with actions
- Real-time credit monitoring
- Educational tooltips

---

### Volunteer Dashboard

**File:** `src/components/VolunteerDashboard.tsx`

**Features:**

1. **Opportunity Browser**
   - Category filters
   - Search functionality
   - Opportunity cards with details
   - "Accept" button

2. **Proof Submission**
   - Photo upload
   - GPS coordinate input
   - Submission form
   - Status tracking

3. **My Submissions**
   - View all submissions
   - Status badges (Pending/Verified/Rejected)
   - Impact scores
   - Submission history

4. **Achievement Badges**
   - Progress tracking
   - Unlock conditions
   - Visual badge display
   - Gamification elements

5. **Personal Stats**
   - Total opportunities completed
   - B3TR earned
   - Impact score
   - Leaderboard rank

---

### Additional Components

#### Statistics Dashboard

**File:** `src/components/Statistics.tsx`

**Displays:**
- Total opportunities on platform
- Total volunteers participating
- Total B3TR rewards distributed
- Staking pool TVL
- Real-time blockchain data

#### Leaderboard

**File:** `src/components/Leaderboard.tsx`

**Features:**
- Top 10 volunteers by impact score
- Medal icons for top 3
- Current user highlighting
- Stats per volunteer
- Competitive element

#### Share Buttons

**File:** `src/components/ShareButtons.tsx`

**Platforms:**
- Twitter/X
- Facebook
- LinkedIn
- Native share API
- Copy link

**Use Cases:**
- Share opportunities
- Share achievements
- Viral growth
- Social proof

#### Category Filter

**File:** `src/components/CategoryFilter.tsx`

**Categories:**
- All
- Environmental
- Education
- Healthcare
- Clean Water
- Reforestation

**Features:**
- Icon-based navigation
- Color-coded categories
- Filter opportunities
- Smooth transitions

#### Achievement Badges

**File:** `src/components/AchievementBadges.tsx`

**Badges:**
1. **First Step** - Complete 1 opportunity
2. **Rising Star** - Complete 5 opportunities
3. **Dedicated** - Complete 10 opportunities
4. **High Achiever** - Complete 25 opportunities
5. **Veteran** - Complete 50 opportunities
6. **Legend** - Complete 100 opportunities

**Features:**
- Progress bars
- Unlock animations
- Rarity indicators
- Collection view

---

## B3TR Token Economics

### Token Utility

1. **Volunteer Rewards**
   - Earned for verified environmental work
   - Amount set by NGO per opportunity
   - Distributed automatically by smart contract

2. **NGO Staking**
   - 100 B3TR stake required to create opportunity
   - Returned when opportunity completes
   - Ensures NGO commitment

3. **Staking Rewards**
   - 10% APY on staked B3TR
   - Incentivizes holding
   - Creates token demand

4. **Oracle Fees**
   - 1 B3TR per verification
   - Paid from NGO stake
   - Funds oracle operations

### Token Flow

```
NGOs stake B3TR
      ↓
Create Opportunities
      ↓
Volunteers complete work
      ↓
Oracle verifies (1 B3TR fee)
      ↓
Volunteers receive rewards
      ↓
Volunteers can stake for 10% APY
      ↓
Token value increases with usage
```

### Supply & Distribution

**MockB3TR (Testnet):**
- Unlimited supply (for testing)
- Faucet function available
- Anyone can mint

**Production B3TR:**
- Fixed supply recommended
- Initial distribution to stakeholders
- Vesting schedules for team/investors
- Community rewards pool

### Economic Sustainability

**Revenue Streams:**
1. NGO opportunity creation fees
2. Premium features subscription
3. Corporate partnerships
4. Grant matching programs
5. Token transaction fees

**Value Accrual:**
- More opportunities → More B3TR locked in stakes
- More volunteers → More rewards distributed
- More activity → Higher staking demand
- Network effects → Token appreciation

---

## Deployment Guide

### Prerequisites

1. **Node.js & npm**
   ```bash
   node --version  # v18 or higher
   npm --version   # v9 or higher
   ```

2. **VeWorld Wallet**
   - Download from https://www.veworld.net/
   - Create wallet
   - Switch to Testnet
   - Get testnet VET from faucet: https://faucet.vecha.in/

3. **Google Gemini API Key**
   - Visit https://aistudio.google.com/app/apikey
   - Click "Create API Key"
   - Copy key (free tier available)

---

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/proof-of-impact.git
cd proof-of-impact
```

---

### Step 2: Install Dependencies

**Frontend:**
```bash
npm install
```

**Contracts:**
```bash
cd contracts
npm install
cd ..
```

**Oracle:**
```bash
cd oracle-service
npm install
cd ..
```

---

### Step 3: Configure Environment

**Contracts `.env`:**
```bash
cd contracts
cp .env.example .env
nano .env
```

Add:
```
VECHAIN_RPC=https://testnet.vechain.org
PRIVATE_KEY=your_private_key_without_0x_prefix
```

**Oracle `.env`:**
```bash
cd ../oracle-service
cp .env.example .env
nano .env
```

Add:
```
VECHAIN_RPC=https://testnet.vechain.org
ORACLE_PRIVATE_KEY=your_oracle_private_key_without_0x_prefix
GEMINI_API_KEY=your_gemini_api_key
```

---

### Step 4: Deploy Smart Contracts

```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network vechainTestnet
```

**Expected Output:**
```
Deploying ProofOfImpact contracts to VeChain...
Deploying with account: 0x...

1. Deploying MockB3TR token...
MockB3TR deployed to: 0x...

2. Deploying ReputationNFT...
ReputationNFT deployed to: 0x...

3. Deploying OpportunityContract...
OpportunityContract deployed to: 0x...

4. Transferring ReputationNFT ownership...
ReputationNFT ownership transferred to OpportunityContract

5. Deploying StakingPool...
StakingPool deployed to: 0x...

6. Deploying FeeDelegationManager...
FeeDelegationManager deployed to: 0x...

✅ Deployment info saved to: ../src/contracts/deployment.json

📝 Contract Addresses Summary:
================================
MockB3TR:             0x...
ReputationNFT:        0x...
OpportunityContract:  0x...
StakingPool:          0x...
FeeDelegationManager: 0x...
Oracle Node:          0x...
================================
```

**Save these addresses!** They're also in `src/contracts/deployment.json`

---

### Step 5: Start Oracle Service

```bash
cd oracle-service
npm start
```

**Expected Output:**
```
🤖 ProofOfImpact AI Oracle Service Starting...

📡 Connected to VeChain: https://testnet.vechain.org
🔑 Oracle Address: 0x...
📝 Contract Address: 0x...

✅ Oracle service is running. Listening for submissions...
```

**Keep this running in a separate terminal!**

---

### Step 6: Start Frontend

```bash
cd ..  # Back to root
npm run dev
```

**Expected Output:**
```
VITE v7.1.7  ready in 1086 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

### Step 7: Test the Application

1. **Open browser:** http://localhost:5173/

2. **Connect VeWorld Wallet**

3. **Get Test B3TR:**
   - Go to "Faucet" page
   - Click "Get 1000 B3TR"
   - Confirm transaction

4. **Create Opportunity (as NGO):**
   - Click "NGO" button
   - Click "Create Opportunity"
   - Form is pre-filled for testing
   - Click "Create Opportunity"
   - Approve B3TR spending
   - Confirm creation transaction

5. **Submit Proof (as Volunteer):**
   - Click "Volunteer" button
   - Find opportunity
   - Click "Accept"
   - Fill in proof details:
     - Photo URL: `ipfs://QmExample123`
     - GPS: `1.2804, 103.8520`
   - Click "Submit Proof"
   - **NO GAS FEE if sponsored!**

6. **Watch Oracle Verify:**
   - Check oracle terminal
   - See AI analysis in real-time
   - Verification submitted to blockchain

7. **See Results:**
   - Volunteer dashboard shows "Verified"
   - B3TR rewards in wallet
   - Reputation NFT updated
   - Leaderboard position updated

---

### Production Deployment

**For mainnet deployment:**

1. **Switch to Mainnet:**
   ```
   VECHAIN_RPC=https://mainnet.vechain.org
   ```

2. **Use Real Funds:**
   - Get real VET
   - Deploy with production private key
   - More gas = higher reliability

3. **Run Oracle Persistently:**
   ```bash
   npm install -g pm2
   pm2 start index.js --name "proof-oracle"
   pm2 save
   pm2 startup
   ```

4. **Host Frontend:**
   ```bash
   npm run build
   # Deploy dist/ to Vercel, Netlify, or IPFS
   ```

5. **Monitor:**
   - Set up alerts for oracle failures
   - Monitor contract balances
   - Track gas usage
   - Log all verifications

---

## User Guide

### For NGOs

#### Creating Your First Opportunity

1. **Connect VeWorld Wallet**
   - Make sure you're on VeChain Testnet
   - Ensure you have B3TR tokens

2. **Go to NGO Dashboard**
   - Click "NGO" from main menu
   - You'll see the opportunities tab

3. **Click "Create Opportunity"**

4. **Fill in Details:**
   - **Title**: Short, descriptive name
   - **Description**: What volunteers will do
   - **Proof Requirements**: How to prove completion
     - Example: "Photo of collected waste with GPS"
   - **Reward Amount**: B3TR per volunteer
   - **Max Volunteers**: How many volunteers needed
   - **GPS Location**: Latitude and longitude
   - **Radius**: Acceptable distance from location (meters)

5. **Approve Transactions:**
   - First transaction: Approve B3TR spending
   - Second transaction: Create opportunity
   - Wait for confirmations

6. **Monitor Progress:**
   - See volunteer acceptances
   - Track submissions
   - View verification results

#### Setting Up Fee Delegation

1. **Go to Fee Delegation Tab**

2. **Deposit VET:**
   - Enter amount (minimum 10 VET)
   - Click "Deposit"
   - Confirm transaction

3. **Add Volunteers:**
   - Option A: Add individual volunteer by address
   - Option B: Batch add multiple volunteers
   - Click "Add"
   - Volunteers can now submit without gas!

4. **Monitor:**
   - Check volunteer credit
   - View deposit balance
   - Remove volunteers if needed

#### Best Practices

✅ **Start Small:** Test with 1-2 volunteers first
✅ **Clear Requirements:** Be specific about proof needed
✅ **Reasonable Rewards:** 10-100 B3TR per opportunity
✅ **Sponsor Gas:** Add volunteers to fee delegation
✅ **Monitor Oracle:** Make sure it's running
✅ **Communicate:** Tell volunteers about opportunities

---

### For Volunteers

#### Finding Opportunities

1. **Connect VeWorld Wallet**

2. **Go to Volunteer Dashboard**

3. **Browse Opportunities:**
   - Use category filters
   - Read descriptions carefully
   - Check reward amounts
   - Note GPS requirements

4. **Click "Accept" to commit**

#### Completing Work

1. **Do the environmental work!**
   - Follow proof requirements
   - Take clear photos
   - Record GPS location
   - Collect any required data

#### Submitting Proof

1. **Upload Photo:**
   - Use IPFS for decentralized storage
   - OR use any public image URL
   - Make sure photo shows proof of work

2. **Enter GPS Coordinates:**
   - Use your phone's GPS
   - Format: latitude, longitude
   - Must be near opportunity location

3. **Submit:**
   - Click "Submit Proof"
   - If sponsored: NO GAS FEE!
   - If not sponsored: Pay small gas fee
   - Wait for confirmation

#### Checking Results

1. **Oracle Verification:**
   - Takes 10-60 seconds typically
   - AI analyzes your submission
   - Decision posted on-chain

2. **If Approved:**
   - ✅ B3TR rewards in your wallet
   - ✅ Reputation NFT updated
   - ✅ Leaderboard position increased
   - ✅ Achievement badges unlocked

3. **If Rejected:**
   - ❌ No rewards
   - ❌ Can try again with better proof
   - Check rejection reason in logs

#### Earning & Staking

1. **Stake B3TR for 10% APY:**
   - Go to "Staking" page
   - Enter amount to stake
   - Click "Stake"
   - Earn rewards over time

2. **Withdraw:**
   - Click "Withdraw"
   - Enter amount
   - Receive principal + rewards

#### Achievements

**Track your progress:**
- 🌱 First Step: 1 opportunity
- ⭐ Rising Star: 5 opportunities
- 💪 Dedicated: 10 opportunities
- 🏆 High Achiever: 25 opportunities
- 👑 Veteran: 50 opportunities
- 🔥 Legend: 100 opportunities

---

### For Donors

#### Viewing Impact

1. **Browse Public Dashboard**
   - No wallet needed
   - See live statistics
   - View leaderboard
   - Check recent verifications

2. **Verify Authenticity:**
   - All data on blockchain
   - Can't be faked or edited
   - GPS-tagged photos
   - AI-verified submissions

3. **Track Specific NGOs:**
   - Search by NGO address
   - See all their opportunities
   - View completion rates
   - Check volunteer feedback

#### Making Donations

1. **Direct B3TR Donations:**
   - Send B3TR to NGO address
   - Increases their opportunity budget
   - Transparent on-chain

2. **Sponsor Opportunities:**
   - NGO creates opportunity
   - You fund the rewards
   - See direct impact

3. **Fee Delegation Sponsorship:**
   - Donate VET for gas fees
   - Helps more volunteers participate
   - Removes barriers to entry

---

## Business Model

### Revenue Streams

#### 1. NGO Subscription Tiers

**Free Tier:**
- Create up to 5 opportunities
- Basic analytics
- Community support

**Pro Tier ($99/month):**
- Unlimited opportunities
- Advanced analytics dashboard
- Priority oracle verification
- Custom branding
- API access
- Email support

**Enterprise Tier ($499/month):**
- Everything in Pro
- Dedicated oracle instance
- Custom AI verification rules
- White-label solution
- SLA guarantees
- 24/7 phone support

#### 2. Transaction Fees

- 2% fee on B3TR rewards distributed
- Example: 100 B3TR reward → 2 B3TR platform fee
- Scales with platform usage
- Collected automatically by smart contract

#### 3. Premium Features

- **Custom Reputation NFTs**: $500/design
- **API Integration**: $199/month
- **Data Export**: $0.01 per record
- **Impact Reports**: $50 per report
- **Verification Badges**: $100/badge design

#### 4. Corporate Partnerships

- **CSR Programs**: Companies sponsor opportunities
- **Employee Volunteering**: Track corporate volunteer hours
- **Matching Donations**: Platform facilitates 1:1 matching
- **White-Label Solutions**: $5,000+ setup + monthly fee

#### 5. Grant Matching

- Platform takes 5% of matched grants
- Connect donors with verified impact
- Automated distribution via smart contracts
- Example: $10,000 grant → $500 platform fee

### Cost Structure

#### Fixed Costs

- **Development Team**: $30,000/month
  - 2 full-stack developers
  - 1 blockchain developer
  - 1 designer

- **Infrastructure**: $2,000/month
  - Oracle servers
  - Frontend hosting
  - Database
  - Monitoring tools

- **AI API Costs**: $500/month
  - Google Gemini API
  - Scales with usage
  - Volume discounts available

- **Marketing**: $5,000/month
  - Content creation
  - Social media
  - Community management
  - Partnership outreach

**Total Fixed: $37,500/month**

#### Variable Costs

- **VeChain Gas Fees**: Negligible (~$1/month)
- **Customer Support**: $3 per support ticket
- **AI Overages**: $0.001 per verification (beyond quota)

### Unit Economics

**Average NGO:**
- Subscription: $99/month
- 10 opportunities/month
- 50 volunteers total
- 5 B3TR average reward
- Total rewards: 250 B3TR
- Platform fee (2%): 5 B3TR
- Platform revenue: ~$15 + $99 = $114/month

**Customer Acquisition Cost (CAC):** $200
- Marketing spend
- Sales efforts
- Onboarding support

**Lifetime Value (LTV):** $1,368
- Average subscription length: 12 months
- Monthly revenue: $114
- LTV = $114 × 12 = $1,368

**LTV:CAC Ratio:** 6.8x ✅ (healthy is 3x+)

### Financial Projections

#### Year 1

- **Month 1-3**: Beta testing (10 NGOs)
- **Month 4-6**: Launch (50 NGOs)
- **Month 7-9**: Growth (200 NGOs)
- **Month 10-12**: Scale (500 NGOs)

**Revenue:**
- Subscriptions: 500 NGOs × $99 = $49,500/month
- Transaction fees: $25,000/month
- **Total: $74,500/month** ($894,000/year)

**Costs:**
- Fixed: $37,500/month
- Variable: $10,000/month
- **Total: $47,500/month** ($570,000/year)

**Profit: $324,000/year** (36% margin)

#### Year 2

- 2,000 NGOs
- Revenue: $280,000/month ($3.36M/year)
- Costs: $120,000/month ($1.44M/year)
- **Profit: $1.92M/year** (57% margin)

#### Year 3

- 10,000 NGOs
- Revenue: $1.4M/month ($16.8M/year)
- Costs: $400,000/month ($4.8M/year)
- **Profit: $12M/year** (71% margin)

### Exit Strategy

**Acquisition Targets:**
- Charity navigator platforms
- Corporate CSR software companies
- Blockchain infrastructure providers
- Impact investing firms

**Valuation Drivers:**
- Recurring revenue (SaaS multiples: 8-12x)
- User growth rate
- Technology moats (AI + blockchain)
- Network effects
- Strategic value to acquirer

**Estimated Exit:** $50-100M (Year 3-5)

---

## Roadmap

### Q4 2024 - Foundation

**October:**
- ✅ Hackathon submission
- ✅ Smart contracts deployed
- ✅ AI oracle operational
- ✅ Fee delegation integrated
- ✅ Basic frontend complete

**November:**
- 🔲 Beta testing with 5 NGOs
- 🔲 Gather user feedback
- 🔲 Fix bugs and improve UX
- 🔲 Onboard first 50 volunteers

**December:**
- 🔲 Public launch on VeChain testnet
- 🔲 Marketing campaign begins
- 🔲 Partnership outreach
- 🔲 Community building

---

### Q1 2025 - Growth

**January:**
- 🔲 VeChain mainnet deployment
- 🔲 Real B3TR token launch
- 🔲 50 NGOs onboarded
- 🔲 1,000 volunteers active

**February:**
- 🔲 Mobile app (iOS/Android)
- 🔲 Enhanced AI verification
- 🔲 Multi-language support
- 🔲 Integration with IPFS for photos

**March:**
- 🔲 Corporate partnership program
- 🔲 Impact reporting dashboard
- 🔲 API for third-party integrations
- 🔲 200 NGOs, 5,000 volunteers

---

### Q2 2025 - Scale

**April:**
- 🔲 Cross-chain bridge (Ethereum)
- 🔲 NFT marketplace for badges
- 🔲 Advanced analytics for NGOs
- 🔲 Custom verification rules

**May:**
- 🔲 Governance token launch
- 🔲 DAO formation
- 🔲 Community voting on features
- 🔲 Grant program for developers

**June:**
- 🔲 500 NGOs milestone
- 🔲 20,000 volunteers
- 🔲 $1M in rewards distributed
- 🔲 Major partnership announcement

---

### Q3 2025 - Enterprise

**July:**
- 🔲 White-label solution
- 🔲 Enterprise tier launch
- 🔲 SLA guarantees
- 🔲 Dedicated support team

**August:**
- 🔲 Integration with major CSR platforms
- 🔲 Corporate volunteer tracking
- 🔲 Matching donation automation
- 🔲 Impact certification system

**September:**
- 🔲 1,000 NGOs
- 🔲 50,000 volunteers
- 🔲 Geographic expansion (Asia, Europe)
- 🔲 Local language versions

---

### Q4 2025 - Innovation

**October:**
- 🔲 AI photo analysis improvements
- 🔲 Video proof support
- 🔲 Satellite imagery verification
- 🔲 Carbon offset tracking

**November:**
- 🔲 DeFi integrations
- 🔲 Lending against reputation NFTs
- 🔲 Prediction markets for impact
- 🔲 Social tokens for communities

**December:**
- 🔲 Year-end review
- 🔲 Impact report (lives changed, plastic removed, trees planted)
- 🔲 Platform statistics
- 🔲 2026 roadmap announcement

---

### 2026+ - Global Impact

**Long-term Vision:**

1. **Scale to 100,000+ NGOs globally**
2. **Millions of volunteers verified**
3. **Measurable environmental impact:**
   - Tonnes of plastic removed
   - Trees planted
   - Carbon offset
4. **Become the standard for impact verification**
5. **Potential acquisition or IPO**

**Features:**
- Real-time satellite verification
- Drone integration
- IoT sensor data
- Machine learning impact prediction
- Global impact dashboard
- UN SDG alignment tracking
- Carbon credit marketplace
- Impact bonds

---

## Team

### Core Team

**Founder & CEO**
- Blockchain expertise
- Environmental passion
- Hackathon participant
- Vision for transparent impact

**Lead Developer** (To be hired)
- Full-stack development
- Smart contract security
- React/TypeScript expert
- AI/ML experience

**Blockchain Architect** (To be hired)
- VeChain specialist
- Oracle design
- Gas optimization
- Security audits

**UX/UI Designer** (To be hired)
- Web3 design experience
- User research
- Glass morphism expertise
- Accessibility focus

### Advisors (Seeking)

**Environmental Impact Expert**
- 15+ years in NGO sector
- Understands volunteer coordination
- Network of potential partners

**Blockchain Advisor**
- VeChain ecosystem member
- Smart contract security
- Tokenomics design
- DeFi integrations

**AI/ML Advisor**
- Computer vision expertise
- Image analysis
- Model optimization
- Ethical AI practices

**Business Development**
- SaaS growth experience
- Corporate partnerships
- Fundraising connections
- Exit strategy planning

### Hiring Roadmap

**Q4 2024:**
- 1 Full-stack developer
- 1 Community manager

**Q1 2025:**
- 1 Blockchain developer
- 1 UX designer
- 1 Marketing manager

**Q2 2025:**
- 1 Customer success manager
- 1 Content creator
- 2 Sales representatives

**Q3 2025:**
- 1 DevOps engineer
- 1 Data analyst
- 1 Product manager

**Total Team Size by End 2025:** 12 people

---

## Technical Specifications

### Smart Contract Details

**Language:** Solidity 0.8.20
**Framework:** Hardhat 2.22.15
**Libraries:**
- OpenZeppelin Contracts v5.1.0
- Ethers.js v6.13.0

**Contracts:**
1. `OpportunityContract.sol` - 254 lines
2. `ReputationNFT.sol` - 57 lines
3. `MockB3TR.sol` - 25 lines
4. `StakingPool.sol` - 89 lines
5. `FeeDelegationManager.sol` - 186 lines

**Total:** 611 lines of Solidity

**Gas Costs:**
- Create Opportunity: ~300,000 gas
- Submit Proof: ~150,000 gas
- Verify Submission: ~200,000 gas
- Stake B3TR: ~100,000 gas

---

### Frontend Specifications

**Framework:** React 18.3.1
**Language:** TypeScript 5.6.2
**Build Tool:** Vite 7.1.7
**Styling:** Tailwind CSS 3.4.17

**Components:**
1. `LandingPage.tsx` - 180 lines
2. `NGODashboard.tsx` - 370 lines
3. `VolunteerDashboard.tsx` - 420 lines
4. `FeeDelegationPanel.tsx` - 270 lines
5. `Statistics.tsx` - 120 lines
6. `Leaderboard.tsx` - 150 lines
7. `AchievementBadges.tsx` - 180 lines
8. `ShareButtons.tsx` - 90 lines
9. `CategoryFilter.tsx` - 80 lines

**Total:** ~1,860 lines of TypeScript/React

**Dependencies:**
- ethers: ^6.13.0
- lucide-react: ^0.462.0
- react: ^18.3.1
- react-dom: ^18.3.1
- tailwindcss: ^3.4.17

---

### Oracle Specifications

**Runtime:** Node.js 18+
**Language:** JavaScript (ES Modules)

**Dependencies:**
- ethers: ^6.13.0
- dotenv: ^16.4.5
- @google/generative-ai: ^0.21.0
- axios: ^1.7.0

**Architecture:**
- Event-driven
- Async/await patterns
- Error handling with try/catch
- Graceful shutdown on SIGINT

**AI Model:**
- Google Gemini 1.5 Flash
- Input: Photo URL + requirements
- Output: JSON structured response
- Cost: ~$0.001 per verification

**Performance:**
- Listens 24/7 without downtime
- Processes submissions in <60 seconds
- Handles multiple concurrent verifications
- Automatic reconnection on failure

---

### Infrastructure

**Blockchain:**
- VeChain Thor Testnet
- RPC: https://testnet.vechain.org
- Block time: ~10 seconds
- Gas token: VTHO

**Hosting:**
- Frontend: Vercel / Netlify (planned)
- Oracle: VPS / AWS (planned)
- Database: PostgreSQL (future)

**Monitoring:**
- Oracle logs
- Error tracking
- Gas usage monitoring
- Transaction success rates

---

### Security

**Smart Contracts:**
- OpenZeppelin battle-tested libraries
- Access control (Ownable)
- Reentrancy guards
- Input validation
- Event emissions for transparency

**Oracle:**
- Private key security
- Environment variables
- Error handling
- Rate limiting (future)
- Fallback verification logic

**Frontend:**
- HTTPS only (production)
- Wallet signature verification
- Input sanitization
- XSS prevention
- CORS policies

---

### Performance

**Transaction Times:**
- Submit proof: ~10 seconds
- Oracle verification: ~30-60 seconds
- Total time to reward: <2 minutes

**Scalability:**
- Current: 100 transactions/minute
- Optimized: 1,000 transactions/minute
- With multiple oracles: 10,000+ transactions/minute

**Cost Efficiency:**
- VeChain gas: $0.000003 per transaction
- 100x cheaper than Ethereum
- 10x cheaper than Polygon

---

## Appendix

### A. Contract Addresses (Testnet)

**Current Deployment (VeChain Testnet):**

```json
{
  "network": "vechainTestnet",
  "deployedAt": "2025-01-XX",
  "contracts": {
    "MockB3TR": "0x7aD9F24cfBCA24BaD13cD12f33cc32Ce15652d16",
    "ReputationNFT": "0x3FDBDB1D6E1fF318FF49fC7F7e99a0cc46DEF03a",
    "OpportunityContract": "0xb603Cc29cd21e7baAD17c57b064a26C5F1f1ab35",
    "StakingPool": "0xB65D4F9BEA1e7ccdC2F49b17D1E89EafDf5B38a9",
    "FeeDelegationManager": "0x06fC26D91B8f2D374b6D4F6aC3F0c6C16bDe1395",
    "Governance": "0xdFE0D2F8B5E353DD3D5A1B81e92F1f18Ba1fA97E"
  },
  "nftMetadataURI": "ipfs://bafkreifsqhxwqsvc663n6j4hyfnxtbpebxbgdsd6d5zavjf7yzyfexov2y"
}
```

---

### B. Environment Variables

**Contracts `.env`:**
```bash
VECHAIN_RPC=https://testnet.vechain.org
PRIVATE_KEY=your_private_key_without_0x
```

**Oracle `.env`:**
```bash
VECHAIN_RPC=https://testnet.vechain.org
ORACLE_PRIVATE_KEY=your_oracle_key_without_0x
GEMINI_API_KEY=your_gemini_api_key
```

---

### C. Useful Links

**VeChain:**
- Testnet Explorer: https://explore-testnet.vechain.org/
- Faucet: https://faucet.vecha.in/
- VeWorld Wallet: https://www.veworld.net/
- Documentation: https://docs.vechain.org/

**Development:**
- Hardhat: https://hardhat.org/
- Ethers.js: https://docs.ethers.org/
- React: https://react.dev/
- Tailwind CSS: https://tailwindcss.com/

**AI:**
- Google Gemini: https://ai.google.dev/
- API Key: https://aistudio.google.com/app/apikey

---

### D. Glossary

**B3TR** - Reward token for environmental impact
**DAO** - Decentralized Autonomous Organization
**DeFi** - Decentralized Finance
**dApp** - Decentralized Application
**ERC20** - Fungible token standard
**ERC721** - Non-fungible token (NFT) standard
**Gas** - Transaction fee on blockchain
**IPFS** - InterPlanetary File System (decentralized storage)
**MPP** - Multi-Party Payment (VeChain fee delegation)
**NGO** - Non-Governmental Organization
**Oracle** - Bridge between blockchain and external data
**Soulbound** - Non-transferable NFT
**Staking** - Locking tokens to earn rewards
**VTHO** - VeChain gas token
**VET** - VeChain native token

---

### E. FAQ

**Q: Do volunteers need cryptocurrency?**
A: No! With fee delegation, NGOs sponsor the gas fees. Volunteers just need a wallet.

**Q: How long does verification take?**
A: Typically 30-60 seconds from submission to reward distribution.

**Q: Can the oracle be trusted?**
A: Both AI oracle AND NGOs can verify submissions. Dual authorization ensures trust.

**Q: What if photo doesn't match requirements?**
A: Submission can be rejected. Volunteer can resubmit with better proof.

**Q: How much does it cost NGOs?**
A: 100 B3TR stake + reward amounts + minimal gas (~$0.08 per 100 volunteers).

**Q: Is this production-ready?**
A: Currently testnet. Mainnet deployment planned after security audits.

**Q: Can this scale to millions of users?**
A: Yes! VeChain's MPP and low fees enable mass adoption. Multiple oracles can be added.

**Q: What prevents fake submissions?**
A: Dual verification (Oracle + NGO), GPS validation, and reputation scoring.

**Q: How do I get test tokens?**
A: Visit the Faucet page to claim 10,000 B3TR tokens (1-hour cooldown between claims).

---

## Conclusion

ProofOfImpact represents the **future of transparent impact verification**. By combining:

- 🤖 **AI-powered automation**
- ⚡ **VeChain's native fee delegation**
- 🏆 **Gamified reputation system**
- 💰 **B3TR token economics**
- 🌍 **Real environmental impact**

We create a platform that:
- ✅ Removes barriers to volunteer participation
- ✅ Ensures transparency for donors
- ✅ Reduces administrative burden for NGOs
- ✅ Scales to hundreds of thousands of users
- ✅ Drives measurable environmental change

**This is more than a dApp. This is a movement to restore trust in environmental giving.**

---

**Built with ❤️ for the VeChain Global Hackathon 2024**

*Track 2: Economic & Environmental Impact - Protect our Planet*

---

## Contact

**Project Repository:** https://github.com/yourusername/proof-of-impact

**Demo Video:** [Coming Soon]

**Pitch Deck:** [Coming Soon]

**Team Contact:** [Your Email]

**Twitter/X:** [@ProofOfImpact]

**Discord:** [Community Link]

---

**Last Updated:** October 5, 2025
**Version:** 2.0.0
**License:** MIT

---

## Recent Updates (v2.0.0)

### New Features
- ✅ **Dual Verification System**: Both Oracle and NGO can now verify submissions
- ✅ **NFT Metadata**: Single IPFS image for all Reputation NFTs
- ✅ **Enhanced Governance**: Full DAO governance with voting and proposals
- ✅ **10,000 B3TR Faucet**: Increased faucet amount for better testing
- ✅ **Leaderboard**: Real-time rankings with live blockchain data
- ✅ **Category Filters**: Modern UI with 6 opportunity categories
- ✅ **Achievement System**: Gamified badges for volunteer milestones

### Technical Improvements
- ✅ TypeScript build errors fixed (0 errors)
- ✅ Code cleanup (removed console logs and AI comments)
- ✅ Comprehensive .gitignore for security
- ✅ Production-ready documentation
- ✅ Updated contract addresses with Governance contract

### Contract Updates
- **OpportunityContract**: NGO verification authority added
- **ReputationNFT**: IPFS tokenURI support implemented
- **Governance**: Full DAO governance system deployed
- **All contracts**: Deployed to VeChain Testnet with verified addresses
