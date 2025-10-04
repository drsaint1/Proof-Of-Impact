require("@nomicfoundation/hardhat-toolbox");
require("@vechain/sdk-hardhat-plugin");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "paris"
    }
  },
  networks: {
    vechainTestnet: {
      url: "https://testnet.vechain.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      restful: true,
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1,
      debug: true,
      enableDelegation: false
    },
    vechainMainnet: {
      url: "https://mainnet.vechain.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      restful: true,
      gas: "auto",
      gasPrice: "auto"
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
