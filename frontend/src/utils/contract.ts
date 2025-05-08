import { ethers } from "ethers";
import VotingAbi from "../abi/Voting.json";
import VotereumFactoryAbi from "../abi/VotereumFactory.json";

// Get environment variables for contract address and network
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS as string;
const factoryAddress =
  (import.meta.env.VITE_FACTORY_ADDRESS as string) ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Updated with newly deployed factory address
const ganacheNetwork =
  (import.meta.env.VITE_GANACHE_NETWORK as string) || "http://127.0.0.1:7545";

// Initialize provider and contract interfaces
let provider: ethers.JsonRpcProvider;
let signer: ethers.Signer;
let votingContract: ethers.Contract;
let factoryContract: ethers.Contract;

// Connect to Ethereum provider
export const connectProvider = async () => {
  try {
    // Connect to the Ethereum network
    provider = new ethers.JsonRpcProvider(ganacheNetwork);

    // Check if we have a private key in localStorage
    const privateKey = localStorage.getItem("votereumPrivateKey");
    if (privateKey) {
      // If we have a private key, create a signer from it
      signer = new ethers.Wallet(privateKey, provider);

      // Initialize the contracts with the signer
      votingContract = new ethers.Contract(
        contractAddress,
        VotingAbi.abi,
        signer
      );
      factoryContract = new ethers.Contract(
        factoryAddress,
        VotereumFactoryAbi.abi,
        signer
      );
    } else {
      // Initialize read-only contract instances
      votingContract = new ethers.Contract(
        contractAddress,
        VotingAbi.abi,
        provider
      );
      factoryContract = new ethers.Contract(
        factoryAddress,
        VotereumFactoryAbi.abi,
        provider
      );
    }

    return provider;
  } catch (error) {
    console.error("Error connecting to Ethereum provider:", error);
    throw error;
  }
};

// Check if MetaMask is installed
export const checkIfMetaMaskIsInstalled = () => {
  return window.ethereum !== undefined;
};

// Request network switch to Ganache
export const switchToGanacheNetwork = async () => {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    // Try to switch to the Ganache network
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x539" }], // 0x539 is hex for 1337
      });
    } catch (switchError: any) {
      // Network doesn't exist in MetaMask, so we need to add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x539", // 1337 in hex
              chainName: "Ganache Local",
              rpcUrls: [ganacheNetwork],
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18,
              },
            },
          ],
        });
      } else {
        throw switchError;
      }
    }

    return true;
  } catch (error) {
    console.error("Error switching to Ganache network:", error);
    throw error;
  }
};

//voteforCandidate
export const voteForCandidate = async (candidateId: number) => {
  try {
    // Ensure we have a signer
    if (!signer) {
      await connectWallet();
    }

    if (!votingContract) {
      throw new Error(
        "Voting contract not initialized. Please connect your wallet first."
      );
    }

    // Call the vote function on the voting contract
    const tx = await votingContract.vote(candidateId);

    // Wait for the transaction to be mined
    await tx.wait();

    return { success: true, transactionHash: tx.hash };
  } catch (error) {
    console.error(`Error voting for candidate ${candidateId}:`, error);
    throw error;
  }
};

// Connect wallet and get signer
export const connectWallet = async () => {
  try {
    // First check if we already have a private key in localStorage
    const privateKey = localStorage.getItem("votereumPrivateKey");
    if (privateKey) {
      if (!provider) {
        await connectProvider();
      }

      // Create a wallet instance with the private key
      const wallet = new ethers.Wallet(privateKey, provider);
      signer = wallet;

      // Initialize the contract with the signer
      votingContract = new ethers.Contract(
        contractAddress,
        VotingAbi.abi,
        signer
      );
      factoryContract = new ethers.Contract(
        factoryAddress,
        VotereumFactoryAbi.abi,
        signer
      );

      return { address: await wallet.getAddress(), signer: wallet };
    }

    // If no private key in localStorage, try to use MetaMask
    // Check if ethereum is available in the browser
    if (!window.ethereum) {
      throw new Error(
        "Ethereum provider not found. Please install MetaMask from metamask.io"
      );
    }

    // Request account access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found. Please unlock your MetaMask wallet.");
    }

    // Create Web3Provider using window.ethereum
    const ethersProvider = new ethers.BrowserProvider(window.ethereum);
    signer = await ethersProvider.getSigner();

    // Get the connected wallet address
    const address = await signer.getAddress();

    // Check if connected to the correct network (Ganache)
    const network = await ethersProvider.getNetwork();
    const chainId = Number(network.chainId);

    if (chainId !== 1337) {
      // Try to switch to Ganache network automatically
      await switchToGanacheNetwork();

      // Refresh the page to reconnect with the right network
      window.location.reload();

      throw new Error(
        "Switching to Ganache network. Please try connecting again."
      );
    }

    // Initialize the contracts with a signer for write operations
    votingContract = new ethers.Contract(
      contractAddress,
      VotingAbi.abi,
      signer
    );
    factoryContract = new ethers.Contract(
      factoryAddress,
      VotereumFactoryAbi.abi,
      signer
    );

    return { address, signer };
  } catch (error) {
    console.error("Error connecting wallet:", error);
    throw error;
  }
};

// Get the current connected wallet address
export const getCurrentWalletAddress = async (): Promise<string | null> => {
  try {
    // First check if we have a private key in localStorage
    const privateKey = localStorage.getItem("votereumPrivateKey");
    if (privateKey) {
      if (!provider) {
        await connectProvider();
      }
      const wallet = new ethers.Wallet(privateKey, provider);
      return wallet.address;
    }

    // If no private key, check if we have an address in localStorage (for MetaMask)
    const savedAddress = localStorage.getItem("walletAddress");
    if (savedAddress) {
      return savedAddress;
    }

    // If no address saved, we're not connected
    return null;
  } catch (error) {
    console.error("Error getting current wallet:", error);
    return null;
  }
};

// Get all candidates
export const getCandidates = async () => {
  try {
    if (!provider) {
      await connectProvider();
    }

    // Create a read-only contract instance if no signer is available
    const contract =
      votingContract ||
      new ethers.Contract(contractAddress, VotingAbi, provider);

    // Get the number of candidates
    const candidatesCount = await contract.candidatesCount();

    // Create an array to store all candidates
    const candidates = [];

    // Loop through all candidates and add them to the array
    for (let i = 1; i <= candidatesCount; i++) {
      const candidate = await contract.candidates(i);
      candidates.push({
        id: Number(candidate.id),
        name: candidate.name,
        voteCount: Number(candidate.voteCount),
      });
    }

    return candidates;
  } catch (error) {
    console.error("Error getting candidates:", error);
    throw error;
  }
};

// Create a new election
export const createElection = async (
  title: string,
  description: string
) => {
  try {
    console.log("createElection called with:", { title, description });

    // Ensure we have a signer
    if (!signer) {
      console.log("No signer found, attempting to connect wallet");
      try {
        const walletResult = await connectWallet();
        console.log("Wallet connected successfully:", walletResult.address);
      } catch (walletError) {
        console.error("Failed to connect wallet:", walletError);
        throw new Error(`Wallet connection failed: ${walletError.message}`);
      }
    }

    if (!provider) {
      await connectProvider();
    }
    
    // Import the artifacts directly (just for this function to ensure correct ABI)
    const factoryArtifact = await import("../artifacts/contracts/VotereumFactory.sol/VotereumFactory.json");
    
    // Create a fresh contract instance using the artifacts
    const contract = new ethers.Contract(
      factoryAddress,
      factoryArtifact.abi,
      signer
    );

    console.log("Contract ABI functions:", Object.keys(contract.interface.functions));
    console.log("Calling createElection on contract:", factoryAddress);
    console.log("Using parameters:", { title, description });

    // Call the function with the correct parameters - try both direct and function fragment approach
    let tx;
    try {
      // Direct approach
      tx = await contract.createElection(title, description);
    } catch (directError) {
      console.error("Direct call failed:", directError);
      
      try {
        // Try with function selector
        const functionFragment = contract.interface.getFunction("createElection(string,string)");
        if (!functionFragment) {
          throw new Error("createElection function not found in ABI");
        }
        
        console.log("Using function fragment:", functionFragment.format());
        tx = await contract[functionFragment.format()](title, description);
      } catch (fragmentError) {
        console.error("Function fragment call failed:", fragmentError);
        
        // Try a raw call as last resort
        const data = contract.interface.encodeFunctionData("createElection", [title, description]);
        tx = await signer.sendTransaction({
          to: factoryAddress,
          data
        });
      }
    }

    console.log("Transaction submitted:", tx.hash);

    // Wait for the transaction to be mined
    console.log("Waiting for transaction confirmation...");
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);

    // Try to get the election address from the event logs
    let electionAddress;
    if (receipt && receipt.logs) {
      try {
        for (const log of receipt.logs) {
          try {
            const parsedLog = contract.interface.parseLog({
              topics: log.topics as string[],
              data: log.data
            });
            
            if (parsedLog && parsedLog.name === 'ElectionCreated') {
              electionAddress = parsedLog.args[0];
              console.log("Election address parsed from logs:", electionAddress);
              break;
            }
          } catch (e) {
            // Not a matching log, continue to next one
            continue;
          }
        }
        
        if (!electionAddress) {
          console.log("Could not find ElectionCreated event in logs");
        }
      } catch (parseError) {
        console.error("Error parsing logs:", parseError);
      }
    }

    return {
      transactionHash: tx.hash,
      electionAddress
    };
  } catch (error) {
    console.error("Error creating election:", error);
    throw error;
  }
};

// Add a candidate to an election
export const addCandidate = async (
  electionAddress: string,
  name: string,
  party: string,
  imageUrl: string
) => {
  try {
    // Ensure we have a signer
    if (!signer) {
      await connectWallet();
    }

    // Create an instance of the Voting contract at the election address
    const electionContract = new ethers.Contract(
      electionAddress,
      VotingAbi.abi,
      signer
    );

    // Call the addCandidate function on the Voting contract using the explicit function signature
    const tx = await electionContract["addCandidate(string,string,string)"](
      name,
      party,
      imageUrl
    );

    console.log("Add candidate transaction submitted:", tx.hash);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log("Add candidate transaction confirmed:", receipt);

    // Try to extract candidate ID from event
    let candidateId;
    if (receipt && receipt.logs) {
      try {
        const abi = VotingAbi.abi;
        const iface = new ethers.Interface(abi);

        for (const log of receipt.logs) {
          try {
            const parsedLog = iface.parseLog({
              topics: log.topics as string[],
              data: log.data,
            });

            if (parsedLog && parsedLog.name === "CandidateAdded") {
              candidateId = Number(parsedLog.args[0]);
              console.log("Candidate ID parsed:", candidateId);
              break;
            }
          } catch (e) {
            // Not a matching log, continue to next one
            continue;
          }
        }
      } catch (parseError) {
        console.error("Error parsing logs:", parseError);
      }
    }

    return {
      transactionHash: tx.hash,
      candidateId,
      success: true,
    };
  } catch (error) {
    console.error(
      `Error adding candidate to election at ${electionAddress}:`,
      error
    );
    throw error;
  }
};

// Get election details from a specific Voting contract
export const getElectionDetails = async (electionAddress: string) => {
  try {
    if (!provider) {
      await connectProvider();
    }

    // Create a contract instance for the specific election
    const electionContract = new ethers.Contract(
      electionAddress,
      VotingAbi.abi,
      provider
    );

    // Get the basic election details
    const electionName = await electionContract.electionName();
    const electionDescription = await electionContract.electionDescription();
    const startTime = await electionContract.startTime();
    const endTime = await electionContract.endTime();
    const isActive = await electionContract.isActive();
    const totalVotes = await electionContract.totalVotes();
    const candidateCount = await electionContract.candidateCount();

    // Format the return value
    return {
      title: electionName,
      description: electionDescription,
      startTime: Number(startTime) * 1000, // Convert to milliseconds
      endTime: Number(endTime) * 1000, // Convert to milliseconds
      isActive,
      totalVotes: Number(totalVotes),
      candidateCount: Number(candidateCount),
      hasEnded: await electionContract.hasEnded(),
    };
  } catch (error) {
    console.error(
      `Error getting election details for address ${electionAddress}:`,
      error
    );
    throw error;
  }
};

// Get candidates for a specific election from the blockchain
export const getElectionCandidates = async (electionAddress: string) => {
  try {
    if (!provider) {
      await connectProvider();
    }

    // Create an instance of the Voting contract at the election address
    const electionContract = new ethers.Contract(
      electionAddress,
      VotingAbi.abi,
      provider
    );

    // Get the number of candidates
    const candidateCount = await electionContract.candidateCount();
    const candidates = [];

    // Loop through all candidates and retrieve their details
    for (let i = 1; i <= Number(candidateCount); i++) {
      const [id, name, party, imageUrl, voteCount] =
        await electionContract.getCandidate(i);
      candidates.push({
        id: Number(id),
        name: name,
        party: party,
        imageUrl: imageUrl,
        voteCount: Number(voteCount),
      });
    }

    return candidates;
  } catch (error) {
    console.error(
      `Error getting candidates for election at ${electionAddress}:`,
      error
    );
    return []; // Return empty array on error
  }
};

// Get all elections deployed by the factory contract
export const getAllElections = async () => {
  try {
    if (!provider) {
      await connectProvider();
    }

    const contract =
      factoryContract ||
      new ethers.Contract(factoryAddress, VotereumFactoryAbi.abi, provider);

    // Get all deployed elections
    const deployedElections = await contract.getDeployedElections();

    // Format the results
    return deployedElections;
  } catch (error) {
    console.error("Error getting all elections:", error);
    return []; // Return empty array on error
  }
};

// Check if a voter has voted in a specific election
export const hasVoted = async (
  electionAddress: string,
  voterAddress: string
) => {
  try {
    if (!provider) {
      await connectProvider();
    }

    // Create an instance of the Voting contract at the election address
    const electionContract = new ethers.Contract(
      electionAddress,
      VotingAbi.abi,
      provider
    );

    // Get the voter information
    const voter = await electionContract.voters(voterAddress);

    // Return whether the voter has already voted
    return voter.hasVoted;
  } catch (error) {
    console.error(
      `Error checking if ${voterAddress} has voted in election at ${electionAddress}:`,
      error
    );
    return false; // Assume not voted on error
  }
};

// Register a voter for a specific election
export const registerVoter = async (
  electionAddress: string,
  voterAddress: string
) => {
  try {
    // Ensure we have a signer
    if (!signer) {
      await connectWallet();
    }

    // Create an instance of the Voting contract at the election address
    const electionContract = new ethers.Contract(
      electionAddress,
      VotingAbi.abi,
      signer
    );

    // Register the voter
    const tx = await electionContract.registerVoter(voterAddress);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();

    return { success: true, transactionHash: tx.hash };
  } catch (error) {
    console.error(
      `Error registering voter ${voterAddress} for election at ${electionAddress}:`,
      error
    );
    throw error;
  }
};

// Disconnect wallet
export const disconnectWallet = () => {
  // Clear wallet from localStorage
  localStorage.removeItem("votereumPrivateKey");
  localStorage.removeItem("walletAddress");

  // Reset provider state
  signer = undefined as any;
  votingContract = undefined as any;

  return true;
};

// Vote in a specific election
export const voteInElection = async (
  electionAddress: string,
  candidateId: number
) => {
  try {
    // Ensure we have a signer
    if (!signer) {
      await connectWallet();
    }
    
    console.log(`Voting for candidate ${candidateId} in election at ${electionAddress}`);
    
    // Create an instance of the Voting contract at the election address
    const electionContract = new ethers.Contract(
      electionAddress,
      VotingAbi.abi,
      signer
    );
    
    // Debug info
    console.log("Contract functions:", Object.keys(electionContract.interface.functions));
    
    // Find the castVote function in the ABI
    const voteFn = electionContract.interface.getFunction("vote(uint256)") || 
                  electionContract.interface.getFunction("castVote(uint256)");
                  
    if (!voteFn) {
      throw new Error("Vote function not found in contract ABI");
    }
    
    console.log("Found voting function in ABI:", voteFn.format());
    
    // Call the vote function - try both possible function names
    let tx;
    try {
      if (electionContract.interface.hasFunction("vote(uint256)")) {
        tx = await electionContract.vote(candidateId);
      } else {
        tx = await electionContract.castVote(candidateId);
      }
    } catch (callError) {
      console.error("Error calling vote function:", callError);
      
      // If that fails, try with the explicit function name
      tx = await electionContract["castVote(uint256)"](candidateId);
    }
    
    console.log("Vote transaction submitted:", tx.hash);
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log("Vote transaction confirmed:", receipt);
    
    return {
      success: true,
      transactionHash: tx.hash
    };
  } catch (error) {
    console.error(`Error voting in election at ${electionAddress}:`, error);
    throw error;
  }
};

// Declare window.ethereum for TypeScript
declare global {
  interface Window {
    ethereum: any;
  }
}
