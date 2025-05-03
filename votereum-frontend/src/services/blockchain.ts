import { ethers } from "ethers";

// Import ABIs from compiled contracts
import VotingSystemABI from "../contracts/VotingSystem.json";
import VotingSystemFactoryABI from "../contracts/VotingSystemFactory.json";

// Contract addresses - Replace with actual deployed contract addresses
const FACTORY_ADDRESS = import.meta.env.VITE_FACTORY_CONTRACT_ADDRESS || "";

export class BlockchainService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private factoryContract: ethers.Contract | null = null;
  private votingContracts: Map<string, ethers.Contract> = new Map();
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

      // Initialize factory contract
      if (FACTORY_ADDRESS) {
        this.factoryContract = new ethers.Contract(
          FACTORY_ADDRESS,
          VotingSystemFactoryABI.abi,
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

          if (FACTORY_ADDRESS) {
            this.factoryContract = new ethers.Contract(
              FACTORY_ADDRESS,
              VotingSystemFactoryABI.abi,
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
   * Get the voting system contract for a specific election
   */
  private async getVotingSystemContract(electionId: string) {
    if (!this.factoryContract || !this.signer) {
      throw new Error("Factory contract not initialized");
    }

    // Check if we already have this contract instance
    if (this.votingContracts.has(electionId)) {
      return this.votingContracts.get(electionId)!;
    }

    // If this is a voting system address rather than an election ID, use it directly
    let votingSystemAddress = electionId;

    // If it doesn't look like an address, try to get it from the factory
    if (
      !votingSystemAddress.startsWith("0x") ||
      votingSystemAddress.length !== 42
    ) {
      // Get the address of the voting system for this election from the factory
      const electionHash = ethers.id(electionId);
      votingSystemAddress =
        await this.factoryContract.getVotingSystemForElection(electionHash);
    }

    if (votingSystemAddress === ethers.ZeroAddress) {
      throw new Error(`No voting system found for election ${electionId}`);
    }

    // Create and store the contract instance
    const votingSystemContract = new ethers.Contract(
      votingSystemAddress,
      VotingSystemABI.abi,
      this.signer
    );

    this.votingContracts.set(electionId, votingSystemContract);
    return votingSystemContract;
  }

  /**
   * Create a new voting system
   */
  async createVotingSystem() {
    if (!this.factoryContract || !this.signer) {
      throw new Error("Factory contract not initialized");
    }

    try {
      const tx = await this.factoryContract.createVotingSystem();
      const receipt = await tx.wait();

      // Extract the created voting system address from the event logs
      const event = receipt.logs
        .filter(
          (log: any) =>
            log.fragment && log.fragment.name === "VotingSystemCreated"
        )
        .map((log: any) => {
          const parsedLog = this.factoryContract!.interface.parseLog({
            topics: log.topics,
            data: log.data,
          });
          return parsedLog?.args;
        })
        .find(Boolean);

      if (!event || !event.votingSystem) {
        throw new Error(
          "Failed to extract voting system address from transaction"
        );
      }

      const votingSystemAddress = event.votingSystem;

      // Create and store the contract instance
      const votingSystemContract = new ethers.Contract(
        votingSystemAddress,
        VotingSystemABI.abi,
        this.signer
      );

      this.votingContracts.set(votingSystemAddress, votingSystemContract);
      return votingSystemAddress;
    } catch (error) {
      console.error("Failed to create voting system:", error);
      throw error;
    }
  }

  /**
   * Register an election with a voting system
   */
  async createElection(
    electionId: string,
    votingSystemAddress: string,
    title: string,
    description: string,
    startTime: number,
    endTime: number
  ) {
    if (!this.factoryContract || !this.signer) {
      throw new Error("Factory contract not initialized");
    }

    try {
      // Hash the election ID
      const electionHash = ethers.id(electionId);

      // Register the election in the factory
      const tx = await this.factoryContract.registerElection(
        electionHash,
        votingSystemAddress
      );
      await tx.wait();

      // Get the voting system contract to create the election
      const votingSystemContract =
        await this.getVotingSystemContract(votingSystemAddress);

      // Create the election in the voting system
      const createTx = await votingSystemContract.createElection(
        title,
        description,
        startTime,
        endTime
      );

      const receipt = await createTx.wait();
      return receipt;
    } catch (error) {
      console.error("Failed to create election:", error);
      throw error;
    }
  }

  /**
   * Get all deployed voting systems
   */
  async getAllVotingSystems() {
    if (!this.factoryContract) {
      throw new Error("Factory contract not initialized");
    }

    try {
      const votingSystems = await this.factoryContract.getAllVotingSystems();
      return votingSystems;
    } catch (error) {
      console.error("Failed to get voting systems:", error);
      throw error;
    }
  }

  /**
   * Get election details
   */
  async getElection(electionId: string, numericElectionId: number) {
    try {
      const votingSystemContract =
        await this.getVotingSystemContract(electionId);

      const election =
        await votingSystemContract.getElection(numericElectionId);

      // Get additional information
      const candidateCount =
        await votingSystemContract.getCandidateCount(numericElectionId);
      const totalVotes =
        await votingSystemContract.getTotalVotes(numericElectionId);
      const creator = await votingSystemContract.owner();

      return {
        title: election.title,
        description: election.description,
        startTime: Number(election.startTime),
        endTime: Number(election.endTime),
        finalized: election.finalized,
        candidateCount: Number(candidateCount),
        totalVotes: Number(totalVotes),
        creator,
      };
    } catch (error) {
      console.error(`Failed to get election ${electionId}:`, error);
      throw error;
    }
  }

  /**
   * Add a candidate to an election
   */
  async addCandidate(
    electionId: string,
    numericElectionId: number,
    name: string,
    metadata: string
  ) {
    try {
      const votingSystemContract =
        await this.getVotingSystemContract(electionId);

      const tx = await votingSystemContract.addCandidate(
        numericElectionId,
        name,
        metadata
      );

      await tx.wait();
    } catch (error) {
      console.error("Failed to add candidate:", error);
      throw error;
    }
  }

  /**
   * Get all candidates for an election
   */
  async getAllCandidates(electionId: string, numericElectionId: number) {
    try {
      const votingSystemContract =
        await this.getVotingSystemContract(electionId);

      const candidateCount =
        await votingSystemContract.getCandidateCount(numericElectionId);
      const candidates = [];

      for (let i = 1; i <= candidateCount; i++) {
        const candidate = await votingSystemContract.getCandidate(
          numericElectionId,
          i
        );
        candidates.push({
          id: i,
          name: candidate.name,
          metadata: candidate.metadata,
          voteCount: Number(candidate.voteCount),
        });
      }

      return candidates;
    } catch (error) {
      console.error("Failed to get candidates:", error);
      throw error;
    }
  }

  /**
   * Cast a vote for a candidate
   */
  async castVote(
    electionId: string,
    numericElectionId: number,
    candidateId: number
  ) {
    try {
      const votingSystemContract =
        await this.getVotingSystemContract(electionId);

      const tx = await votingSystemContract.vote(
        numericElectionId,
        candidateId
      );
      await tx.wait();
    } catch (error) {
      console.error("Failed to cast vote:", error);
      throw error;
    }
  }

  /**
   * Check if the connected account has voted in an election
   */
  async hasVoted(electionId: string, numericElectionId: number) {
    try {
      if (!this.signer) {
        throw new Error("No signer available");
      }

      const address = await this.signer.getAddress();
      const votingSystemContract =
        await this.getVotingSystemContract(electionId);

      return await votingSystemContract.hasVoted(numericElectionId, address);
    } catch (error) {
      console.error("Failed to check if has voted:", error);
      throw error;
    }
  }

  /**
   * Finalize an election (only callable by the election owner)
   */
  async finalizeElection(electionId: string, numericElectionId: number) {
    try {
      const votingSystemContract =
        await this.getVotingSystemContract(electionId);

      const tx = await votingSystemContract.finalizeElection(numericElectionId);
      await tx.wait();
    } catch (error) {
      console.error("Failed to finalize election:", error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const blockchainService = new BlockchainService();

export default blockchainService;
