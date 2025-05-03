import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { blockchainService } from "../services/blockchain";

interface BlockchainContextType {
  isConnected: boolean;
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  account: string | null;
  createVotingSystem: () => Promise<string>;
  createElection: (
    electionId: string,
    votingSystemAddress: string,
    title: string,
    description: string,
    startTime: number,
    endTime: number
  ) => Promise<any>;
  getAllVotingSystems: () => Promise<string[]>;
  getElection: (electionId: string, numericElectionId: number) => Promise<any>;
  addCandidate: (
    electionId: string,
    numericElectionId: number,
    name: string,
    metadata: string
  ) => Promise<void>;
  getAllCandidates: (
    electionId: string,
    numericElectionId: number
  ) => Promise<any[]>;
  castVote: (
    electionId: string,
    numericElectionId: number,
    candidateId: number
  ) => Promise<void>;
  hasVoted: (electionId: string, numericElectionId: number) => Promise<boolean>;
  finalizeElection: (
    electionId: string,
    numericElectionId: number
  ) => Promise<void>;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(
  undefined
);

export const BlockchainProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [account, setAccount] = useState<string | null>(null);

  // Check if user is already connected on page load
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = await blockchainService.checkConnection();
        if (connected) {
          const acc = await blockchainService.getAccount();
          setAccount(acc);
          setIsConnected(true);
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    };

    checkConnection();
  }, []);

  // Connect wallet function
  const connectWallet = async () => {
    try {
      setIsLoading(true);
      const acc = await blockchainService.connect();
      setAccount(acc);
      setIsConnected(true);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new voting system
  const createVotingSystem = async () => {
    try {
      return await blockchainService.createVotingSystem();
    } catch (error) {
      console.error("Error creating voting system:", error);
      throw error;
    }
  };

  // Create a new election
  const createElection = async (
    electionId: string,
    votingSystemAddress: string,
    title: string,
    description: string,
    startTime: number,
    endTime: number
  ) => {
    try {
      return await blockchainService.createElection(
        electionId,
        votingSystemAddress,
        title,
        description,
        startTime,
        endTime
      );
    } catch (error) {
      console.error("Error creating election:", error);
      throw error;
    }
  };

  // Get all voting systems
  const getAllVotingSystems = async () => {
    try {
      return await blockchainService.getAllVotingSystems();
    } catch (error) {
      console.error("Error getting all voting systems:", error);
      throw error;
    }
  };

  // Get election details
  const getElection = async (electionId: string, numericElectionId: number) => {
    try {
      return await blockchainService.getElection(electionId, numericElectionId);
    } catch (error) {
      console.error("Error getting election details:", error);
      throw error;
    }
  };

  // Add a candidate to an election
  const addCandidate = async (
    electionId: string,
    numericElectionId: number,
    name: string,
    metadata: string
  ) => {
    try {
      await blockchainService.addCandidate(
        electionId,
        numericElectionId,
        name,
        metadata
      );
    } catch (error) {
      console.error("Error adding candidate:", error);
      throw error;
    }
  };

  // Get all candidates for an election
  const getAllCandidates = async (
    electionId: string,
    numericElectionId: number
  ) => {
    try {
      return await blockchainService.getAllCandidates(
        electionId,
        numericElectionId
      );
    } catch (error) {
      console.error("Error getting candidates:", error);
      throw error;
    }
  };

  // Cast a vote
  const castVote = async (
    electionId: string,
    numericElectionId: number,
    candidateId: number
  ) => {
    try {
      await blockchainService.castVote(
        electionId,
        numericElectionId,
        candidateId
      );
    } catch (error) {
      console.error("Error casting vote:", error);
      throw error;
    }
  };

  // Check if user has voted
  const hasVoted = async (electionId: string, numericElectionId: number) => {
    try {
      return await blockchainService.hasVoted(electionId, numericElectionId);
    } catch (error) {
      console.error("Error checking if user has voted:", error);
      throw error;
    }
  };

  // Finalize an election
  const finalizeElection = async (
    electionId: string,
    numericElectionId: number
  ) => {
    try {
      await blockchainService.finalizeElection(electionId, numericElectionId);
    } catch (error) {
      console.error("Error finalizing election:", error);
      throw error;
    }
  };

  const value = {
    isConnected,
    isLoading,
    connectWallet,
    account,
    createVotingSystem,
    createElection,
    getAllVotingSystems,
    getElection,
    addCandidate,
    getAllCandidates,
    castVote,
    hasVoted,
    finalizeElection,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};

// Custom hook to use the blockchain context
export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error("useBlockchain must be used within a BlockchainProvider");
  }
  return context;
};
