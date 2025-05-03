import { ethers } from "ethers";

// We'll need to import your smart contract ABI and address
// This is just a placeholder - you'll replace with your actual contract ABI
const VOTING_CONTRACT_ABI = [
  // Replace with your actual contract ABI
];

// Contract addresses - Replace with actual deployed contract addresses
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";

export class BlockchainService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private votingContract: ethers.Contract | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.initProvider();
  }

  private async initProvider() {
    // Check if window.ethereum exists (MetaMask or other wallet)
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        this.provider = new ethers.BrowserProvider(window.ethereum);

        // Listen for account changes
        window.ethereum.on("accountsChanged", () => {
          window.location.reload();
        });

        // Listen for chain changes
        window.ethereum.on("chainChanged", () => {
          window.location.reload();
        });
      } catch (error) {
        console.error("Failed to connect to Ethereum provider:", error);
      }
    } else {
      console.warn(
        "No Ethereum wallet detected. Please install MetaMask or another web3 wallet."
      );
    }
  }

  /**
   * Connect to wallet and initialize contracts
   */
  async connect() {
    if (!this.provider) {
      await this.initProvider();
      if (!this.provider) {
        throw new Error("Cannot connect to Ethereum provider");
      }
    }

    try {
      // Request account access
      const accounts = await this.provider.send("eth_requestAccounts", []);

      // Get signer
      this.signer = await this.provider.getSigner();

      // Initialize contract
      if (CONTRACT_ADDRESS) {
        this.votingContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          VOTING_CONTRACT_ABI,
          this.signer
        );
      }

      this.isConnected = true;
      return accounts[0];
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  }

  /**
   * Check if wallet is connected
   */
  async checkConnection() {
    if (!this.provider) {
      return false;
    }

    try {
      const accounts = await this.provider.send("eth_accounts", []);
      if (accounts && accounts.length > 0) {
        // Get signer and initialize contracts if not already done
        if (!this.signer) {
          this.signer = await this.provider.getSigner();

          if (CONTRACT_ADDRESS) {
            this.votingContract = new ethers.Contract(
              CONTRACT_ADDRESS,
              VOTING_CONTRACT_ABI,
              this.signer
            );
          }
        }

        this.isConnected = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking wallet connection:", error);
      return false;
    }
  }

  /**
   * Get current connected account address
   */
  async getAccount() {
    if (!this.provider) {
      return null;
    }

    try {
      const accounts = await this.provider.send("eth_accounts", []);
      return accounts[0] || null;
    } catch (error) {
      console.error("Error getting account:", error);
      return null;
    }
  }

  /**
   * Cast a vote in an election
   */
  async castVote(electionId: string, candidateId: string) {
    if (!this.votingContract || !this.signer) {
      throw new Error("Blockchain not connected");
    }

    try {
      // Call your voting contract method
      const tx = await this.votingContract.castVote(electionId, candidateId);

      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("Error casting vote on blockchain:", error);
      throw error;
    }
  }

  /**
   * Get election details from blockchain
   */
  async getElection(electionId: string) {
    if (!this.votingContract) {
      throw new Error("Blockchain not connected");
    }

    try {
      const election = await this.votingContract.getElection(electionId);
      return election;
    } catch (error) {
      console.error("Error getting election from blockchain:", error);
      throw error;
    }
  }

  /**
   * Get vote count for each candidate in an election
   */
  async getVoteCounts(electionId: string) {
    if (!this.votingContract) {
      throw new Error("Blockchain not connected");
    }

    try {
      const voteCount = await this.votingContract.getVoteCounts(electionId);
      return voteCount;
    } catch (error) {
      console.error("Error getting vote counts from blockchain:", error);
      throw error;
    }
  }

  /**
   * Check if user has voted in an election
   */
  async hasVoted(electionId: string) {
    if (!this.votingContract || !this.signer) {
      throw new Error("Blockchain not connected");
    }

    try {
      const address = await this.signer.getAddress();
      const hasVoted = await this.votingContract.hasVoted(electionId, address);
      return hasVoted;
    } catch (error) {
      console.error("Error checking if user voted:", error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const blockchainService = new BlockchainService();

export default blockchainService;
