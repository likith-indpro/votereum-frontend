import { ethers } from "ethers";
import VotingAbi from "../abi/Voting.json";

// Get environment variables for contract address and network
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS as string;
const ganacheNetwork = import.meta.env.VITE_GANACHE_NETWORK as string;

// Initialize provider and contract interfaces
let provider: ethers.JsonRpcProvider;
let signer: ethers.Signer;
let votingContract: ethers.Contract;

// Connect to Ethereum provider
export const connectProvider = async () => {
  try {
    // Connect to the Ethereum network
    provider = new ethers.JsonRpcProvider(ganacheNetwork);
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

// Connect wallet and get signer
export const connectWallet = async () => {
  try {
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

    // Initialize the contract with a signer for write operations
    votingContract = new ethers.Contract(contractAddress, VotingAbi, signer);

    return { address, signer };
  } catch (error) {
    console.error("Error connecting wallet:", error);
    throw error;
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

// Vote for a candidate
export const voteForCandidate = async (candidateId: number) => {
  try {
    if (!votingContract) {
      throw new Error(
        "Contract not initialized. Please connect your wallet first."
      );
    }

    // Call the vote function on the contract
    const tx = await votingContract.vote(candidateId);

    // Wait for the transaction to be mined
    await tx.wait();

    return tx;
  } catch (error) {
    console.error("Error voting for candidate:", error);
    throw error;
  }
};

// Declare window.ethereum for TypeScript
declare global {
  interface Window {
    ethereum: any;
  }
}
