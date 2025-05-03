import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { blockchainService } from '../services/blockchain';

interface BlockchainContextType {
  isConnected: boolean;
  account: string | null;
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  castVote: (electionId: string, candidateId: string) => Promise<any>;
  hasVoted: (electionId: string) => Promise<boolean>;
  getVoteCounts: (electionId: string) => Promise<any>;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export const BlockchainProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsLoading(true);
        const connected = await blockchainService.checkConnection();
        setIsConnected(connected);
        
        if (connected) {
          const acc = await blockchainService.getAccount();
          setAccount(acc);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
        setIsConnected(false);
        setAccount(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      const account = await blockchainService.connect();
      setIsConnected(true);
      setAccount(account);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const castVote = async (electionId: string, candidateId: string) => {
    return blockchainService.castVote(electionId, candidateId);
  };

  const hasVoted = async (electionId: string) => {
    return blockchainService.hasVoted(electionId);
  };

  const getVoteCounts = async (electionId: string) => {
    return blockchainService.getVoteCounts(electionId);
  };

  return (
    <BlockchainContext.Provider
      value={{
        isConnected,
        account,
        isLoading,
        connectWallet,
        castVote,
        hasVoted,
        getVoteCounts,
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};