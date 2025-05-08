require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Local development network - Hardhat's built-in network
    hardhat: {
      chainId: 1337
    },
    // Local Ganache network
    ganache: {
      url: "http://127.0.0.1:7545",
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 10
      },
      chainId: 1337
    },
    // Sepolia testnet for testing before mainnet
    sepolia: {
      url: process.env.SEPOLIA_URL || "",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : []
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./src/artifacts"
  },
  // For gas reporting
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD"
  },
  // For Etherscan verification
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
