import { useState, useEffect } from "react";
import {
  hasVotedInElection,
  voteInElection,
  getElectionCandidates,
} from "../utils/contract";
import { electionsAPI } from "../utils/api";

interface Candidate {
  id: number;
  name: string;
  description?: string;
  voteCount: number;
}

interface VoteProps {
  walletAddress: string;
  electionId: string;
  blockchainElectionId: number;
}

const Vote = ({
  walletAddress,
  electionId,
  blockchainElectionId,
}: VoteProps) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [votingSuccess, setVotingSuccess] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(
    null
  );

  useEffect(() => {
    loadCandidates();
    checkIfUserHasVoted();
  }, [electionId, blockchainElectionId, walletAddress]);

  const checkIfUserHasVoted = async () => {
    try {
      // Check if the user has already voted in this election
      if (isNaN(blockchainElectionId) || blockchainElectionId <= 0) {
        console.log(
          "Invalid blockchain election ID. Cannot check if user has voted."
        );
        return;
      }

      const voted = await hasVotedInElection(
        walletAddress,
        blockchainElectionId
      );
      setHasVoted(voted);

      if (voted) {
        console.log("User has already voted in this election.");
      }
    } catch (err) {
      console.error("Error checking if user has voted:", err);
    }
  };

  const loadCandidates = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to get candidates from the blockchain first
      let candidateList: Candidate[] = [];

      if (!isNaN(blockchainElectionId) && blockchainElectionId > 0) {
        try {
          candidateList = await getElectionCandidates(blockchainElectionId);
          console.log("Candidates loaded from blockchain:", candidateList);
        } catch (blockchainErr) {
          console.error(
            "Error loading candidates from blockchain:",
            blockchainErr
          );
        }
      }

      // If no candidates were found on the blockchain or there was an error,
      // fall back to getting them from the backend
      if (candidateList.length === 0) {
        console.log(
          "Loading candidates from backend for election:",
          electionId
        );
        const backendCandidates = await electionsAPI.getCandidates(electionId);

        // Transform backend candidates to match the Candidate interface
        candidateList = backendCandidates.map((candidate: any) => ({
          id: parseInt(candidate.id),
          name: candidate.name,
          description: candidate.description,
          voteCount: 0, // Backend doesn't have vote counts
        }));
      }

      setCandidates(candidateList);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load candidates"
      );
      console.error("Error loading candidates:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (candidateId: number) => {
    if (hasVoted) {
      setError("You have already voted in this election.");
      return;
    }

    try {
      setIsVoting(true);
      setError(null);
      setVotingSuccess(false);
      setSelectedCandidate(candidateId);

      if (isNaN(blockchainElectionId) || blockchainElectionId <= 0) {
        throw new Error("Invalid election. Cannot process vote.");
      }

      // Vote on the blockchain
      const result = await voteInElection(blockchainElectionId, candidateId);
      console.log("Vote transaction result:", result);

      // Record the vote in the backend
      await electionsAPI.recordVote({
        election_id: electionId,
        candidate_id: candidateId.toString(),
        voter_address: walletAddress,
        tx_hash: result.transactionHash,
        vote_type: "smart_contract",
        validity: true,
        block_number: 0, // This would be updated with the actual block number if available
      });

      // Show success message
      setVotingSuccess(true);
      setHasVoted(true);

      // Reload candidates to see updated vote counts
      await loadCandidates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Voting failed");
      console.error("Error voting:", err);
    } finally {
      setIsVoting(false);
      setSelectedCandidate(null);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading candidates...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold">Cast Your Vote</h2>
        {hasVoted ? (
          <p className="text-sm text-green-600 mt-1">
            You have already voted in this election.
          </p>
        ) : (
          <p className="text-sm text-gray-500 mt-1">
            Select a candidate below to cast your vote.
          </p>
        )}
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {votingSuccess && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          <span className="block sm:inline">
            Your vote was cast successfully!
          </span>
        </div>
      )}

      <div className="space-y-4 mt-6">
        {candidates.length === 0 ? (
          <p className="text-center text-gray-500">
            No candidates available for this election.
          </p>
        ) : (
          candidates.map((candidate) => (
            <div
              key={candidate.id}
              className={`border rounded-lg p-4 ${
                hasVoted ? "bg-gray-50" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{candidate.name}</h3>
                  {candidate.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {candidate.description}
                    </p>
                  )}
                  {candidate.voteCount > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      Current votes: {candidate.voteCount}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleVote(candidate.id)}
                  disabled={isVoting || hasVoted}
                  className={`px-4 py-2 rounded text-white ${
                    isVoting && selectedCandidate === candidate.id
                      ? "bg-blue-400"
                      : hasVoted
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isVoting && selectedCandidate === candidate.id
                    ? "Voting..."
                    : hasVoted
                      ? "Voted"
                      : "Vote"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {!hasVoted && (
        <div className="mt-6 text-sm text-gray-500">
          <p>
            <strong>Note:</strong> Once you cast your vote, it cannot be
            changed.
          </p>
          <p className="mt-1">
            Voting requires a blockchain transaction, which may take a few
            moments to complete.
          </p>
        </div>
      )}

      <button
        onClick={loadCandidates}
        className="mt-6 w-full border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50"
      >
        Refresh Candidates
      </button>
    </div>
  );
};

export default Vote;
