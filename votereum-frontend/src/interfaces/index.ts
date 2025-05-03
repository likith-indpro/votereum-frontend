// Common interfaces for the blockchain-based voting system

// Election interfaces
export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "completed";
  totalVotes?: number;
  contractAddress?: string;
}

// Candidate interfaces
export interface Candidate {
  id: string;
  name: string;
  bio: string;
  electionId: string;
  imageUrl?: string;
  position?: string;
  voteCount?: number;
}

// Vote interfaces
export interface Vote {
  id: string;
  electionId: string;
  candidateId: string;
  voterAddress: string;
  timestamp: string;
  transactionHash: string;
}

// User interfaces
export interface User {
  id: string;
  address: string;
  displayName?: string;
  isAdmin: boolean;
  isVerified: boolean;
}

// Election Results
export interface ElectionResult {
  electionId: string;
  candidates: {
    id: string;
    name: string;
    voteCount: number;
  }[];
  totalVotes: number;
}

// API Response interfaces
export interface ApiResponse<T> {
  data: T;
  meta?: {
    total_count?: number;
    filter_count?: number;
  };
}

export interface ApiError {
  message: string;
  code?: number;
  errors?: Record<string, string[]>;
}

// Blockchain transaction interface
export interface BlockchainTransaction {
  hash: string;
  blockNumber?: number;
  timestamp?: string;
  confirmations: number;
  status: "pending" | "confirmed" | "failed";
}
