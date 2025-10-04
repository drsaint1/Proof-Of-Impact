const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Deploying ProofOfImpact contracts to VeChain...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy MockB3TR token
  console.log("\n1. Deploying MockB3TR token...");
  const MockB3TR = await hre.ethers.getContractFactory("MockB3TR");
  const b3trToken = await MockB3TR.deploy();
  await b3trToken.waitForDeployment();
  const b3trAddress = await b3trToken.getAddress();
  console.log("MockB3TR deployed to:", b3trAddress);

  // Deploy ReputationNFT
  console.log("\n2. Deploying ReputationNFT...");
  const ReputationNFT = await hre.ethers.getContractFactory("ReputationNFT");
  const reputationNFT = await ReputationNFT.deploy();
  await reputationNFT.waitForDeployment();
  const reputationAddress = await reputationNFT.getAddress();
  console.log("ReputationNFT deployed to:", reputationAddress);

  // Use deployer as oracle for now
  const oracleNode = deployer.address;

  // Deploy OpportunityContract
  console.log("\n3. Deploying OpportunityContract...");
  const OpportunityContract = await hre.ethers.getContractFactory("OpportunityContract");
  const opportunityContract = await OpportunityContract.deploy(b3trAddress, reputationAddress, oracleNode);
  await opportunityContract.waitForDeployment();
  const opportunityAddress = await opportunityContract.getAddress();
  console.log("OpportunityContract deployed to:", opportunityAddress);

  // Set NFT metadata URI before transferring ownership
  console.log("\n4. Setting NFT metadata URI...");
  const nftMetadataURI = "ipfs://bafkreifsqhxwqsvc663n6j4hyfnxtbpebxbgdsd6d5zavjf7yzyfexov2y";
  await reputationNFT.setTokenURI(nftMetadataURI);
  console.log("NFT metadata URI set to:", nftMetadataURI);

  // Transfer ReputationNFT ownership to OpportunityContract
  console.log("\n5. Transferring ReputationNFT ownership...");
  await reputationNFT.transferOwnership(opportunityAddress);
  console.log("ReputationNFT ownership transferred to OpportunityContract");

  // Deploy StakingPool
  console.log("\n6. Deploying StakingPool...");
  const StakingPool = await hre.ethers.getContractFactory("StakingPool");
  const stakingPool = await StakingPool.deploy(b3trAddress);
  await stakingPool.waitForDeployment();
  const stakingPoolAddress = await stakingPool.getAddress();
  console.log("StakingPool deployed to:", stakingPoolAddress);

  // Deploy FeeDelegationManager
  console.log("\n7. Deploying FeeDelegationManager...");
  const FeeDelegationManager = await hre.ethers.getContractFactory("FeeDelegationManager");
  const feeDelegation = await FeeDelegationManager.deploy();
  await feeDelegation.waitForDeployment();
  const feeDelegationAddress = await feeDelegation.getAddress();
  console.log("FeeDelegationManager deployed to:", feeDelegationAddress);

  // Deploy Governance
  console.log("\n8. Deploying Governance...");
  const Governance = await hre.ethers.getContractFactory("Governance");
  const governance = await Governance.deploy(b3trAddress, stakingPoolAddress);
  await governance.waitForDeployment();
  const governanceAddress = await governance.getAddress();
  console.log("Governance deployed to:", governanceAddress);

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
    contracts: {
      MockB3TR: b3trAddress,
      ReputationNFT: reputationAddress,
      OpportunityContract: opportunityAddress,
      StakingPool: stakingPoolAddress,
      FeeDelegationManager: feeDelegationAddress,
      Governance: governanceAddress,
    },
    oracleNode: oracleNode
  };

  const deploymentPath = "../src/contracts/deployment.json";
  fs.mkdirSync("../src/contracts", { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n✅ Deployment info saved to:", deploymentPath);

  console.log("\n📝 Contract Addresses Summary:");
  console.log("================================");
  console.log("MockB3TR:            ", b3trAddress);
  console.log("ReputationNFT:       ", reputationAddress);
  console.log("OpportunityContract: ", opportunityAddress);
  console.log("StakingPool:         ", stakingPoolAddress);
  console.log("FeeDelegationManager:", feeDelegationAddress);
  console.log("Governance:          ", governanceAddress);
  console.log("Oracle Node:         ", oracleNode);
  console.log("================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
