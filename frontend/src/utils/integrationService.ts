// integrationService.ts - Connects blockchain operations with backend database
import * as contractUtils from './contract';
import electionsAPI, { Election, Candidate, VoteRecord } from './api';

/**
 * Integration service to sync blockchain operations with the backend database
 */
export const integrationService = {
  /**
   * Create a new election both on blockchain and in database
   * @param title - The title of the election
   * @param description - The description of the election
   * @returns The created election data
   */
  createElection: async (title: string, description: string) => {
    try {
      console.log("Creating election on blockchain and in database:", { title, description });
      
      // First create the election on the blockchain
      const blockchainResult = await contractUtils.createElection(title, description);
      
      if (!blockchainResult.electionAddress) {
        throw new Error("Failed to get election address from blockchain transaction");
      }
      
      // Then save the election in the database with the smart contract address
      const databaseResult = await electionsAPI.createElection({
        title,
        description,
        smart_contract_address: blockchainResult.electionAddress,
        status: "published",
        // Set start_date and end_date to empty strings initially - they'll be updated when election starts
        start_date: "",
        end_date: ""
      });
      
      console.log("Election created successfully:", { 
        blockchainTx: blockchainResult.transactionHash,
        contractAddress: blockchainResult.electionAddress,
        databaseId: databaseResult.id
      });
      
      return {
        ...databaseResult,
        blockchainTx: blockchainResult.transactionHash,
        contractAddress: blockchainResult.electionAddress
      };
    } catch (error) {
      console.error("Error creating integrated election:", error);
      throw error;
    }
  },
  
  /**
   * Add a candidate to an election both on blockchain and in database
   * @param electionId - The database ID of the election
   * @param electionAddress - The blockchain address of the election contract
   * @param name - The candidate name
   * @param party - The candidate's party
   * @param imageUrl - URL to candidate's profile image
   * @returns The created candidate data
   */
  addCandidate: async (
    electionId: string, 
    electionAddress: string, 
    name: string, 
    party: string, 
    imageUrl: string
  ) => {
    try {
      console.log("Adding candidate to blockchain and database:", { 
        electionId, electionAddress, name, party 
      });
      
      // First add the candidate to the blockchain
      const blockchainResult = await contractUtils.addCandidate(
        electionAddress,
        name,
        party,
        imageUrl
      );
      
      // Then save the candidate in the database
      const databaseResult = await electionsAPI.createCandidate({
        name,
        description: party, // Using party as description
        election_id: electionId,
        profile_image: imageUrl
      });
      
      console.log("Candidate added successfully:", { 
        blockchainTx: blockchainResult.transactionHash,
        candidateId: blockchainResult.candidateId,
        databaseId: databaseResult.id
      });
      
      return {
        ...databaseResult,
        blockchainTx: blockchainResult.transactionHash,
        blockchainCandidateId: blockchainResult.candidateId
      };
    } catch (error) {
      console.error("Error adding integrated candidate:", error);
      throw error;
    }
  },
  
  /**
   * Start an election on the blockchain and update the database
   * @param electionId - The database ID of the election
   * @param electionAddress - The blockchain address of the election contract
   * @param durationInMinutes - Duration of the election in minutes
   * @returns The updated election data
   */
  startElection: async (
    electionId: string,
    electionAddress: string,
    durationInMinutes: number
  ) => {
    try {
      console.log("Starting election on blockchain and updating database:", {
        electionId, electionAddress, durationInMinutes
      });
      
      // Start the election on the blockchain
      const blockchainResult = await contractUtils.startElection(
        electionAddress,
        durationInMinutes
      );
      
      // Get updated election details from blockchain
      const electionDetails = await contractUtils.getElectionDetails(electionAddress);
      
      // Update the election in the database
      const startDate = new Date(electionDetails.startTime).toISOString();
      const endDate = new Date(electionDetails.endTime).toISOString();
      
      const databaseResult = await electionsAPI.updateElection(electionId, {
        start_date: startDate,
        end_date: endDate,
        status: "published"
      });
      
      console.log("Election started successfully:", {
        blockchainTx: blockchainResult.transactionHash,
        startDate,
        endDate
      });
      
      return {
        ...databaseResult,
        blockchainTx: blockchainResult.transactionHash,
        startTime: electionDetails.startTime,
        endTime: electionDetails.endTime
      };
    } catch (error) {
      console.error("Error starting integrated election:", error);
      throw error;
    }
  },
  
  /**
   * End an election on blockchain and update the database
   * @param electionId - The database ID of the election
   * @param electionAddress - The blockchain address of the election contract
   * @returns The updated election data
   */
  endElection: async (electionId: string, electionAddress: string) => {
    try {
      console.log("Ending election on blockchain and updating database:", {
        electionId, electionAddress
      });
      
      // End the election on the blockchain
      const blockchainResult = await contractUtils.endElection(electionAddress);
      
      // Get updated election details from blockchain
      const electionDetails = await contractUtils.getElectionDetails(electionAddress);
      
      // Update the election in the database
      const databaseResult = await electionsAPI.updateElection(electionId, {
        status: "archived" // Mark as archived when ended
      });
      
      console.log("Election ended successfully:", {
        blockchainTx: blockchainResult.transactionHash
      });
      
      return {
        ...databaseResult,
        blockchainTx: blockchainResult.transactionHash,
        hasEnded: electionDetails.hasEnded
      };
    } catch (error) {
      console.error("Error ending integrated election:", error);
      throw error;
    }
  },
  
  /**
   * Cast a vote in an election on blockchain and record it in the database
   * @param electionId - The database ID of the election
   * @param electionAddress - The blockchain address of the election contract
   * @param candidateId - The blockchain ID of the candidate
   * @param candidateDatabaseId - The database ID of the candidate
   * @param voterAddress - The voter's blockchain address
   * @returns The recorded vote data
   */
  castVote: async (
    electionId: string,
    electionAddress: string,
    candidateId: number,
    candidateDatabaseId: string,
    voterAddress: string
  ) => {
    try {
      console.log("Casting vote on blockchain and recording in database:", {
        electionId, electionAddress, candidateId, voterAddress
      });
      
      // First check if the voter has already voted in this election
      const hasAlreadyVoted = await contractUtils.hasVoted(electionAddress, voterAddress);
      if (hasAlreadyVoted) {
        throw new Error("Voter has already voted in this election");
      }
      
      // Cast vote on the blockchain
      const blockchainResult = await contractUtils.voteInElection(
        electionAddress,
        candidateId
      );
      
      // Record the vote in the database
      const databaseResult = await electionsAPI.recordVote({
        election_id: electionId,
        candidate_id: candidateDatabaseId,
        voter_address: voterAddress,
        tx_hash: blockchainResult.transactionHash,
        timestamp: new Date().toISOString(),
        vote_type: "smart_contract",
        validity: true,
        status: "published"
      });
      
      console.log("Vote cast successfully:", {
        blockchainTx: blockchainResult.transactionHash,
        voteId: databaseResult.id
      });
      
      return {
        ...databaseResult,
        blockchainTx: blockchainResult.transactionHash
      };
    } catch (error) {
      console.error("Error casting integrated vote:", error);
      throw error;
    }
  },
  
  /**
   * Fetch all elections from the blockchain and sync with the database
   * @returns Array of synchronized elections
   */
  syncElections: async () => {
    try {
      console.log("Synchronizing all elections between blockchain and database");
      
      // Get all elections from blockchain
      const blockchainElectionAddresses = await contractUtils.getAllElections();
      
      // Get all elections from database
      const databaseElections = await electionsAPI.getElections();
      
      // Create a map of database elections by smart contract address
      const databaseElectionsByAddress = databaseElections.reduce((map: any, election: Election) => {
        if (election.smart_contract_address) {
          map[election.smart_contract_address.toLowerCase()] = election;
        }
        return map;
      }, {});
      
      const syncedElections = [];
      
      // Process each blockchain election
      for (const address of blockchainElectionAddresses) {
        const electionAddress = address.toLowerCase();
        
        // Get election details from blockchain
        const blockchainElection = await contractUtils.getElectionDetails(electionAddress);
        
        if (databaseElectionsByAddress[electionAddress]) {
          // Election exists in database, update if needed
          const dbElection = databaseElectionsByAddress[electionAddress];
          
          // Check if election needs updating in database
          const needsUpdate = 
            (blockchainElection.hasEnded && dbElection.status !== "archived") ||
            (blockchainElection.startTime > 0 && !dbElection.start_date);
          
          if (needsUpdate) {
            // Update the election in the database
            const startDate = blockchainElection.startTime > 0 
              ? new Date(blockchainElection.startTime).toISOString() 
              : dbElection.start_date;
              
            const endDate = blockchainElection.endTime > 0 
              ? new Date(blockchainElection.endTime).toISOString() 
              : dbElection.end_date;
              
            const status = blockchainElection.hasEnded 
              ? "archived" 
              : blockchainElection.isActive 
                ? "published" 
                : dbElection.status;
            
            const updatedElection = await electionsAPI.updateElection(dbElection.id, {
              start_date: startDate,
              end_date: endDate,
              status
            });
            
            syncedElections.push({
              ...updatedElection,
              blockchain: blockchainElection,
              synced: true,
              updated: true
            });
          } else {
            // No update needed
            syncedElections.push({
              ...dbElection,
              blockchain: blockchainElection,
              synced: true,
              updated: false
            });
          }
        } else {
          // Election doesn't exist in database, create it
          console.log(`Found new election on blockchain: ${electionAddress}`);
          
          const newElection = await electionsAPI.createElection({
            title: blockchainElection.title || "Unnamed Election",
            description: blockchainElection.description || "No description",
            smart_contract_address: electionAddress,
            start_date: blockchainElection.startTime > 0 
              ? new Date(blockchainElection.startTime).toISOString() 
              : "",
            end_date: blockchainElection.endTime > 0 
              ? new Date(blockchainElection.endTime).toISOString() 
              : "",
            status: blockchainElection.hasEnded 
              ? "archived" 
              : blockchainElection.isActive 
                ? "published" 
                : "draft"
          });
          
          syncedElections.push({
            ...newElection,
            blockchain: blockchainElection,
            synced: true,
            created: true
          });
        }
      }
      
      console.log(`Synchronization complete. ${syncedElections.length} elections processed.`);
      return syncedElections;
    } catch (error) {
      console.error("Error syncing elections:", error);
      throw error;
    }
  },
  
  /**
   * Sync candidates for a specific election
   * @param electionId - The database ID of the election
   * @param electionAddress - The blockchain address of the election contract
   * @returns Array of synchronized candidates
   */
  syncCandidates: async (electionId: string, electionAddress: string) => {
    try {
      console.log("Synchronizing candidates for election:", { electionId, electionAddress });
      
      // Get candidates from blockchain
      const blockchainCandidates = await contractUtils.getElectionCandidates(electionAddress);
      
      // Get candidates from database
      const databaseCandidates = await electionsAPI.getCandidates(electionId);
      
      // Map database candidates by name for easy lookup (assuming names are unique per election)
      const candidatesByName: { [key: string]: Candidate } = {};
      for (const candidate of databaseCandidates) {
        candidatesByName[candidate.name.toLowerCase()] = candidate;
      }
      
      const syncedCandidates = [];
      
      // Process each blockchain candidate
      for (const blockchainCandidate of blockchainCandidates) {
        const candidateName = blockchainCandidate.name.toLowerCase();
        
        if (candidatesByName[candidateName]) {
          // Candidate exists in database, update if needed
          const dbCandidate = candidatesByName[candidateName];
          
          // Update vote count in database if needed (could be done periodically)
          syncedCandidates.push({
            ...dbCandidate,
            blockchain: blockchainCandidate,
            synced: true,
            updated: false // We're not updating vote counts in this function
          });
        } else {
          // Candidate doesn't exist in database, create it
          console.log(`Found new candidate on blockchain: ${blockchainCandidate.name}`);
          
          const newCandidate = await electionsAPI.createCandidate({
            name: blockchainCandidate.name,
            description: blockchainCandidate.party,
            election_id: electionId,
            profile_image: blockchainCandidate.imageUrl
          });
          
          syncedCandidates.push({
            ...newCandidate,
            blockchain: blockchainCandidate,
            synced: true,
            created: true
          });
        }
      }
      
      console.log(`Candidate synchronization complete. ${syncedCandidates.length} candidates processed.`);
      return syncedCandidates;
    } catch (error) {
      console.error("Error syncing candidates:", error);
      throw error;
    }
  },
  
  /**
   * Get full election details including blockchain data and database records
   * @param electionId - Database ID of the election
   * @returns Comprehensive election data
   */
  getFullElectionDetails: async (electionId: string) => {
    try {
      // Get election from database
      const dbElection = await electionsAPI.getElection(electionId);
      if (!dbElection) {
        throw new Error(`Election with ID ${electionId} not found in database`);
      }
      
      const electionAddress = dbElection.smart_contract_address;
      if (!electionAddress) {
        throw new Error(`Election with ID ${electionId} has no blockchain address`);
      }
      
      // Get data from blockchain
      const blockchainElection = await contractUtils.getElectionDetails(electionAddress);
      const blockchainCandidates = await contractUtils.getElectionCandidates(electionAddress);
      
      // Get candidates from database
      const dbCandidates = await electionsAPI.getCandidates(electionId);
      
      // Combine the data
      return {
        id: electionId,
        address: electionAddress,
        database: {
          ...dbElection,
          candidates: dbCandidates
        },
        blockchain: {
          ...blockchainElection,
          candidates: blockchainCandidates
        }
      };
    } catch (error) {
      console.error(`Error getting full election details for ${electionId}:`, error);
      throw error;
    }
  }
};

export default integrationService;