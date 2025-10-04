import { VeChainProvider, createVeChainContract } from './vechain-provider';
import OpportunityContractABI from '../contracts/OpportunityContract.json';
import ReputationNFTABI from '../contracts/ReputationNFT.json';
import MockB3TRABI from '../contracts/MockB3TR.json';
import GovernanceABI from '../contracts/Governance.json';

// Contract addresses from environment variables
const CONTRACT_ADDRESSES = {
  MockB3TR: import.meta.env.VITE_MOCKB3TR_ADDRESS,
  ReputationNFT: import.meta.env.VITE_REPUTATION_NFT_ADDRESS,
  OpportunityContract: import.meta.env.VITE_OPPORTUNITY_CONTRACT_ADDRESS,
  StakingPool: import.meta.env.VITE_STAKING_POOL_ADDRESS,
  FeeDelegationManager: import.meta.env.VITE_FEE_DELEGATION_ADDRESS,
  Governance: import.meta.env.VITE_GOVERNANCE_ADDRESS,
};

// Staking Pool ABI
const StakingPoolABI = {
  abi: [
    {
      inputs: [{ internalType: "address", name: "_b3trToken", type: "address" }],
      stateMutability: "nonpayable",
      type: "constructor"
    },
    {
      inputs: [{ internalType: "uint256", name: "_amount", type: "uint256" }],
      name: "stake",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [{ internalType: "uint256", name: "_amount", type: "uint256" }],
      name: "unstake",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      name: "claimRewards",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [{ internalType: "address", name: "_user", type: "address" }],
      name: "getStakeInfo",
      outputs: [
        { internalType: "uint256", name: "amount", type: "uint256" },
        { internalType: "uint256", name: "stakedAt", type: "uint256" },
        { internalType: "uint256", name: "pendingReward", type: "uint256" }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "getAddress",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "totalStaked",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function"
    }
  ]
};

export const getContracts = async (connex: any, account: string) => {
  // Create VeChain provider wrapper using Connex
  const provider = new VeChainProvider(connex, account);

  // Create contract instances using VeChain SDK
  const opportunityContract = createVeChainContract(
    CONTRACT_ADDRESSES.OpportunityContract,
    OpportunityContractABI.abi,
    provider
  );

  const reputationNFT = createVeChainContract(
    CONTRACT_ADDRESSES.ReputationNFT,
    ReputationNFTABI.abi,
    provider
  );

  const b3trToken = createVeChainContract(
    CONTRACT_ADDRESSES.MockB3TR,
    MockB3TRABI.abi,
    provider
  );

  const stakingPool = createVeChainContract(
    CONTRACT_ADDRESSES.StakingPool,
    StakingPoolABI.abi,
    provider
  );

  const governanceContract = createVeChainContract(
    CONTRACT_ADDRESSES.Governance,
    GovernanceABI.abi,
    provider
  );

  return {
    opportunityContract,
    reputationNFT,
    b3trToken,
    stakingPool,
    governanceContract,
  };
};
