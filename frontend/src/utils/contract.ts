import { ethers } from "ethers";
import VotingAbi from "../abi/Voting.json";
import VotereumFactoryAbi from "../abi/VotereumFactory.json";

// Get environment variables for contract address and network
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS as string;
const factoryAddress =
  (import.meta.env.VITE_FACTORY_ADDRESS as string) ||
  "0xE35593f242bCCbeCB7F1AAD481901Ff3a28cCa59"; // Using the address from deployment.json as fallback
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
  description: string,
  startTime: number, // Unix timestamp
  endTime: number, // Unix timestamp
  minimumAge: number,
  maxVotesPerUser: number,
  enforceKYC: boolean
) => {
  try {
    // Ensure we have a signer
    if (!signer) {
      await connectWallet();
    }

    if (!factoryContract) {
      throw new Error(
        "Factory contract not initialized. Please connect your wallet first."
      );
    }

    // Call the createElection function on the factory contract
    const tx = await factoryContract.createElection(
      title,
      description,
      startTime,
      endTime,
      minimumAge,
      maxVotesPerUser,
      enforceKYC
    );

    // Wait for the transaction to be mined
    const receipt = await tx.wait();

    // Try to get the election ID from the event logs
    let electionId;
    if (receipt && receipt.logs) {
      const eventTopic = ethers.id("ElectionCreated(uint256,string)");
      const eventLog = receipt.logs.find((log) => log.topics[0] === eventTopic);

      if (eventLog) {
        // Parse the election ID from the event
        electionId = Number(ethers.toNumber(eventLog.topics[1]));
      }
    }

    return {
      transactionHash: tx.hash,
      electionId,
    };
  } catch (error) {
    console.error("Error creating election:", error);
    throw error;
  }
};

// Add a candidate to an election
export const addCandidate = async (
  electionId: number,
  name: string,
  description: string
) => {
  try {
    // Ensure we have a signer
    if (!signer) {
      await connectWallet();
    }

    if (!factoryContract) {
      throw new Error(
        "Factory contract not initialized. Please connect your wallet first."
      );
    }

    // Call the addCandidate function on the factory contract
    const tx = await factoryContract.addCandidate(
      electionId,
      name,
      description
    );

    // Wait for the transaction to be mined
    const receipt = await tx.wait();

    return {
      transactionHash: tx.hash,
      success: true,
    };
  } catch (error) {
    console.error(`Error adding candidate to election ${electionId}:`, error);
    throw error;
  }
};

// Get election details from the blockchain
export const getElectionDetails = async (electionId: number) => {
  try {
    if (!provider) {
      await connectProvider();
    }

    // Create a read-only contract instance if no signer is available
    const contract =
      factoryContract ||
      new ethers.Contract(factoryAddress, VotereumFactoryAbi.abi, provider);

    // Get the election details
    const details = await contract.getElectionDetails(electionId);

    // Format the return value
    return {
      title: details[0],
      description: details[1],
      startTime: Number(details[2]) * 1000, // Convert to milliseconds
      endTime: Number(details[3]) * 1000, // Convert to milliseconds
      state: Number(details[4]),
      totalVotes: Number(details[5]),
      candidateCount: Number(details[6]),
      minimumAge: Number(details[7]),
      maxVotesPerUser: Number(details[8]),
      enforceKYC: details[9],
    };
  } catch (error) {
    console.error(
      `Error getting election details for ID ${electionId}:`,
      error
    );
    throw error;
  }
};

// Get candidates for a specific election from the blockchain
export const getElectionCandidates = async (electionId: number) => {
  try {
    if (!provider) {
      await connectProvider();
    }

    const contract =
      factoryContract ||
      new ethers.Contract(factoryAddress, VotereumFactoryAbi.abi, provider);

    // Get the election results which include candidates
    const results = await contract.getElectionResults(electionId);

    const candidateIds = results[0].map((id: ethers.BigNumberish) =>
      Number(id)
    );
    const voteCounts = results[1].map((count: ethers.BigNumberish) =>
      Number(count)
    );
    const candidateNames = results[2];

    // Format candidates
    return candidateIds.map((id: number, index: number) => ({
      id: id,
      name: candidateNames[index],
      voteCount: voteCounts[index],
    }));
  } catch (error) {
    console.error(
      `Error getting candidates for election ${electionId}:`,
      error
    );
    return []; // Return empty array on error
  }
};

// Start an election
export const startElection = async (electionId: number) => {
  try {
    // Ensure we have a signer
    if (!signer) {
      await connectWallet();
    }

    if (!factoryContract) {
      throw new Error(
        "Factory contract not initialized. Please connect your wallet first."
      );
    }

    // Call the startElection function on the factory contract
    const tx = await factoryContract.startElection(electionId);

    // Wait for the transaction to be mined
    await tx.wait();

    return { success: true, transactionHash: tx.hash };
  } catch (error) {
    console.error(`Error starting election ${electionId}:`, error);
    throw error;
  }
};

// End an election
export const endElection = async (electionId: number) => {
  try {
    // Ensure we have a signer
    if (!signer) {
      await connectWallet();
    }

    if (!factoryContract) {
      throw new Error(
        "Factory contract not initialized. Please connect your wallet first."
      );
    }

    // Call the endElection function on the factory contract
    const tx = await factoryContract.endElection(electionId);

    // Wait for the transaction to be mined
    await tx.wait();

    return { success: true, transactionHash: tx.hash };
  } catch (error) {
    console.error(`Error ending election ${electionId}:`, error);
    throw error;
  }
};

// Vote for a candidate in an election
export const voteInElection = async (
  electionId: number,
  candidateId: number
) => {
  try {
    // Ensure we have a signer
    if (!signer) {
      await connectWallet();
    }

    if (!factoryContract) {
      throw new Error(
        "Factory contract not initialized. Please connect your wallet first."
      );
    }

    // Call the vote function on the factory contract
    const tx = await factoryContract.vote(electionId, candidateId);

    // Wait for the transaction to be mined
    await tx.wait();

    return { success: true, transactionHash: tx.hash };
  } catch (error) {
    console.error(
      `Error voting in election ${electionId} for candidate ${candidateId}:`,
      error
    );
    throw error;
  }
};

// Check if a user has voted in an election
export const hasVotedInElection = async (
  voterAddress: string,
  electionId: number
) => {
  try {
    if (!provider) {
      await connectProvider();
    }

    const contract =
      factoryContract ||
      new ethers.Contract(factoryAddress, VotereumFactoryAbi.abi, provider);

    // Call the hasVoted function
    const hasVoted = await contract.hasVoted(voterAddress, electionId);

    return hasVoted;
  } catch (error) {
    console.error(
      `Error checking if ${voterAddress} has voted in election ${electionId}:`,
      error
    );
    return false; // Assume not voted on error
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

// Declare window.ethereum for TypeScript
declare global {
  interface Window {
    ethereum: any;
  }
}
