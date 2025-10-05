# ProofOfImpact - VeChain Social Impact Platform

A decentralized platform built on VeChain that connects NGOs with volunteers, enabling verifiable proof of social and environmental impact through blockchain technology.

## 🌟 Overview

ProofOfImpact transforms volunteer work into verified, immutable records on the blockchain. NGOs create opportunities, volunteers complete tasks and submit proof (photos, GPS data), and an AI oracle verifies submissions. Volunteers earn B3TR tokens and soulbound Reputation NFTs that track their impact score.

## ✨ Key Features

- **🎯 Opportunity Management**: NGOs create geolocated volunteer opportunities with customizable rewards
- **📸 Proof Submission**: Volunteers submit photo evidence and GPS coordinates via IPFS
- **🤖 AI Verification**: Automated oracle service verifies submissions using AI
- **🏆 Reputation NFTs**: Soulbound NFTs track volunteer impact scores
- **💰 B3TR Token Rewards**: Volunteers earn B3TR tokens for verified contributions
- **🔒 Staking & Governance**: Stake B3TR tokens to participate in platform governance
- **⛽ Fee Delegation**: NGOs can sponsor transaction fees for volunteers (VeChain MPP)
- **📊 Leaderboards**: Real-time rankings of top volunteers by impact score
- **🎖️ Achievement Badges**: Unlock badges based on milestones

## 🏗️ Architecture

### Smart Contracts (Solidity)

#### Core Contracts

**ProofOfImpact.sol**
- **ReputationNFT**: Soulbound ERC721 NFTs tracking volunteer impact scores
  - Non-transferable reputation tokens
  - Dynamic impact score updates
  - IPFS metadata for NFT image

- **OpportunityContract**: Main contract managing opportunities and submissions
  - NGOs stake 100 B3TR + rewards to create opportunities
  - Volunteers submit proof (IPFS hash + GPS coordinates)
  - Oracle or NGO can verify submissions
  - Automatic B3TR distribution upon verification
  - NFT minting and impact score updates

**MockB3TR.sol**
- Test token implementation with faucet functionality
- 10,000 B3TR per claim with 1-hour cooldown
- Used for rewards and staking

**StakingPool.sol**
- Stake B3TR tokens to earn rewards
- Time-weighted reward distribution
- Automatic reward calculations based on stake duration

**Governance.sol**
- Create and vote on platform proposals
- Weighted voting based on staked B3TR
- 3-day voting period with 51% threshold
- Execute approved proposals

**FeeDelegation.sol**
- VeChain Multi-Party Payment (MPP) integration
- NGOs sponsor transaction fees for volunteers
- Deposit VET to cover gas costs

### Frontend (React + TypeScript)

**Technology Stack**
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- VeChain Connex SDK for blockchain interaction
- Ethers.js v6 for contract interactions
- Pinata for IPFS storage

**Key Components**
- `VolunteerDashboard`: Browse and submit to opportunities
- `NGODashboard`: Create opportunities and verify submissions
- `GovernanceDashboard`: Create proposals and vote
- `Leaderboard`: Top volunteers by impact score
- `Staking`: Stake/unstake B3TR tokens
- `FeeDelegationPanel`: Manage fee sponsorship
- `Faucet`: Claim test B3TR tokens

## 📜 Deployed Contracts (VeChain Testnet)

```javascript
MockB3TR:             0xb04cb26b6a4c3b48ba7b8f3a7c7423dc346b7fe9
ReputationNFT:        0x1f4022cf5428eff9c84403ddd0355018219a8475
OpportunityContract:  0x07e2cb461de5a58eb8a753dd992229802a1ec350
StakingPool:          0x3f398eb28beefdc65811e10879fcd74f8b9e1a3b
FeeDelegationManager: 0x7992cc0c07b4c8c66cce01ad42b302205ec49f61
Governance:           0x7d9c8a54fd33dc01b6af497fa45035bd115ed958
```

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- VeChain Thor wallet (e.g., Sync2, VeWorld)
- VeChain testnet VET for deployment

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd proof-of-impact
```

2. **Install dependencies**
```bash
npm install
cd contracts && npm install
cd ..
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```env
# Pinata IPFS Configuration
VITE_PINATA_JWT=your_pinata_jwt_token
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key

# Contract Addresses (VeChain Testnet)
VITE_MOCKB3TR_ADDRESS=0xb04cb26b6a4c3b48ba7b8f3a7c7423dc346b7fe9
VITE_REPUTATION_NFT_ADDRESS=0x1f4022cf5428eff9c84403ddd0355018219a8475
VITE_OPPORTUNITY_CONTRACT_ADDRESS=0x07e2cb461de5a58eb8a753dd992229802a1ec350
VITE_STAKING_POOL_ADDRESS=0x3f398eb28beefdc65811e10879fcd74f8b9e1a3b
VITE_FEE_DELEGATION_ADDRESS=0x7992cc0c07b4c8c66cce01ad42b302205ec49f61
VITE_GOVERNANCE_ADDRESS=0x7d9c8a54fd33dc01b6af497fa45035bd115ed958
```

4. **Run the development server**
```bash
npm run dev
```

Visit `http://localhost:5173` to view the application.

### Smart Contract Deployment

1. **Configure Hardhat**

Create `contracts/.env`:
```env
PRIVATE_KEY=your_private_key_here
```

2. **Compile contracts**
```bash
cd contracts
npx hardhat compile
```

3. **Deploy to VeChain Testnet**
```bash
npx hardhat run scripts/deploy.js --network vechainTestnet
```

The deployment script will:
- Deploy all contracts
- Set NFT metadata URI
- Transfer ownership
- Save addresses to `src/contracts/deployment.json`

## 📖 Usage Guide

### For Volunteers

1. **Connect Wallet**: Click "Connect Wallet" and approve VeChain Connex connection
2. **Claim B3TR Tokens**: Visit Faucet to claim 10,000 B3TR (1-hour cooldown)
3. **Browse Opportunities**: Filter by category (Environmental, Education, Healthcare, etc.)
4. **Submit Proof**:
   - Click "Submit Proof" on an opportunity
   - Upload photo evidence
   - Allow location access or manually enter GPS coordinates
   - Submit to blockchain
5. **Earn Rewards**: Once verified by oracle/NGO, receive B3TR tokens and Reputation NFT
6. **Track Progress**: View your impact score and rank on the leaderboard

### For NGOs

1. **Connect Wallet**: Connect your VeChain wallet
2. **Claim B3TR**: Get tokens from faucet for testing
3. **Create Opportunity**:
   - Fill in title, description, proof requirements
   - Set reward amount per volunteer
   - Set max volunteers
   - Add GPS coordinates and radius for geofencing
   - Approve B3TR transfer (stake + rewards)
4. **Review Submissions**: View pending submissions with photo evidence
5. **Verify/Reject**: Approve valid submissions to distribute rewards

### For Governance Participants

1. **Stake B3TR**: Lock tokens in StakingPool to gain voting power
2. **Create Proposals**: Submit governance proposals with descriptions
3. **Vote**: Cast votes on active proposals (weighted by stake)
4. **Execute**: Execute approved proposals after voting period ends

## 🔐 Security Features

- **Soulbound NFTs**: Reputation tokens are non-transferable
- **NGO Staking**: 100 B3TR stake required to create opportunities
- **Oracle Verification**: AI verification prevents fraud
- **Dual Authorization**: Both oracle and NGO can verify submissions
- **Geolocation Validation**: GPS coordinates ensure work location
- **IPFS Storage**: Decentralized proof storage via Pinata

## 🛠️ Technology Stack

**Blockchain**
- VeChain Thor blockchain
- Solidity 0.8.20
- OpenZeppelin contracts
- Hardhat development environment

**Frontend**
- React 18
- TypeScript
- Vite
- TailwindCSS
- Ethers.js v6
- VeChain Connex

**Storage & Services**
- Pinata IPFS for file storage
- VeChain Fee Delegation (MPP)

## 📁 Project Structure

```
proof-of-impact/
├── contracts/
│   ├── contracts/
│   │   ├── ProofOfImpact.sol      # Core opportunity & NFT contracts
│   │   ├── MockB3TR.sol            # Test token with faucet
│   │   ├── StakingPool.sol         # Token staking
│   │   ├── Governance.sol          # DAO governance
│   │   └── FeeDelegation.sol       # VeChain MPP
│   ├── scripts/
│   │   └── deploy.js               # Deployment script
│   └── hardhat.config.js
├── src/
│   ├── components/
│   │   ├── VolunteerDashboard.tsx
│   │   ├── NGODashboard.tsx
│   │   ├── GovernanceDashboard.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── Staking.tsx
│   │   ├── Faucet.tsx
│   │   └── ...
│   ├── utils/
│   │   ├── contracts.ts            # Contract instances
│   │   ├── vechain-provider.ts     # VeChain connection
│   │   └── ipfs.ts                 # IPFS upload
│   └── App.tsx
├── .env
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License

## 🔗 Links

- [VeChain Documentation](https://docs.vechain.org/)
- [VeChain Testnet Explorer](https://explore-testnet.vechain.org/)
- [Connex Documentation](https://docs.vechain.org/connex/)

## 💡 Future Enhancements

- AI oracle service implementation
- Mobile app (React Native)
- Multi-chain support
- Advanced analytics dashboard
- Volunteer skill matching
- Impact reporting tools
- Integration with real NGO partners

---

Built with ❤️ on VeChain
