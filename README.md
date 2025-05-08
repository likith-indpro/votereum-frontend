# Votereum

A blockchain-based voting system built with Ethereum smart contracts, Hardhat, and React.

## Overview

Votereum is a decentralized voting application that leverages blockchain technology to create transparent, secure, and tamper-proof elections. The system uses Ethereum smart contracts to handle the voting logic and data storage, while providing a user-friendly interface built with React and TypeScript.

## Features

- Create and manage elections with custom candidates
- Secure voter verification system
- Transparent and immutable vote recording
- Real-time vote counting and result display
- MetaMask integration for Ethereum transactions
- Responsive user interface with TailwindCSS

## Prerequisites

Before you begin, make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) (v9 or later)
- [MetaMask browser extension](https://metamask.io/download/)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/votereum.git
   cd votereum/votereum-frontend
   ```

2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

## Running the Application

### Start the Local Blockchain

1. Start a local Ethereum blockchain using Ganache:
   ```bash
   npm run blockchain
   ```
   This will start a local blockchain at http://localhost:7545 with 10 test accounts pre-loaded with 1000 ETH each.

### Configure MetaMask

1. Install the [MetaMask browser extension](https://metamask.io/download/) if you haven't already.
2. Click on the MetaMask icon and follow the setup instructions.
3. Add the Ganache network to MetaMask:
   - Click on the network dropdown at the top of MetaMask
   - Select "Add Network" > "Add a network manually"
   - Fill in the network details:
     - Network Name: Ganache Local
     - RPC URL: http://localhost:7545
     - Chain ID: 1337
     - Currency Symbol: ETH
4. Import a test account:
   - Option 1 (using mnemonic):
     - In MetaMask, click on your account icon > Settings > Advanced
     - Scroll down and click "Show Secret Recovery Phrase"
     - Replace with: "test test test test test test test test test test test junk"
   - Option 2 (using private key):
     - Get a private key from the terminal output when running `npm run blockchain`
     - In MetaMask, click on your account icon > Import Account
     - Paste the private key (without 0x prefix) and click Import

### Deploy Smart Contracts

1. In a new terminal, deploy the smart contracts to your local blockchain:
   ```bash
   npm run deploy:contracts
   ```
   This will compile and deploy the Votereum contracts to your local Ganache blockchain.

### Start the Frontend Application

1. Start the development server:
   ```bash
   npm run dev
   ```
   This will start the React application at http://localhost:5173

2. Open your browser and navigate to http://localhost:5173 to access the application.

## Running Tests

To run the smart contract tests:
```bash
npm run test:contracts
```

## Project Structure

- `contracts/`: Solidity smart contracts
  - `VotereumFactory.sol`: Factory contract for creating elections
  - `Voting.sol`: Core voting contract
  - `VoterVerification.sol`: Voter identity verification
- `scripts/`: Deployment and utility scripts
- `test/`: Contract test files
- `src/`: Frontend React application
  - `abi/`: Contract ABI files
  - `components/`: React components
  - `context/`: React context providers
  - `pages/`: Application pages
  - `utils/`: Utility functions

## Deployment to a Testnet

To deploy to the Sepolia testnet:
1. Create a `.env` file in the project root:
   ```
   SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
   PRIVATE_KEY=your_wallet_private_key
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ```
2. Run the deployment script:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

## License

[MIT](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.