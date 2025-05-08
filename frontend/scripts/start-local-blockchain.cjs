const ganache = require("ganache");

// Define the Ganache server options
const serverOptions = {
  wallet: {
    totalAccounts: 10,  // Create 10 test accounts
    mnemonic: "test test test test test test test test test test test junk",  // Fixed mnemonic for consistent addresses
    defaultBalance: 1000,  // Each account starts with 1000 ETH
  },
  logging: {
    quiet: false,  // Set to true to disable logging
  },
  chain: {
    chainId: 1337,  // Standard ID for local development
  },
  miner: {
    blockTime: 0,  // Mine instantly (0 seconds), set to a value like 3 to simulate block confirmation time
  }
};

// Start the Ganache server
const server = ganache.server(serverOptions);
const PORT = 7545;

// Start listening on specified port
server.listen(PORT, async (err) => {
  if (err) {
    console.error(`Error starting Ganache server: ${err}`);
  } else {
    console.log(`Ganache blockchain server running at http://localhost:${PORT}`);
    console.log("Available Accounts (with 1000 ETH each):");
    
    // Get provider to access accounts
    const provider = server.provider;
    const accounts = await provider.request({ method: "eth_accounts", params: [] });
    
    // Print out the available test accounts
    accounts.forEach((account, i) => {
      console.log(`(${i}) ${account}`);
    });
    
    console.log("\nPrivate Keys (for importing into MetaMask):");
    // The provider doesn't directly expose private keys, but in Ganache they're 
    // derived from the mnemonic in a deterministic way
    console.log("Use the wallet mnemonic to import accounts:");
    console.log(serverOptions.wallet.mnemonic);
    
    console.log("\nPress Ctrl+C to stop the blockchain server");
  }
});