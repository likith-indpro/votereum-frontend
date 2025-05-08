import { useState, useEffect } from "react";
import { getCandidates } from "../utils/contract";
import { voteForCandidate } from "../utils/contract";

// interface Candidate {
//   id: number;
//   name: string;
//   voteCount: number;
// }

// interface VoteProps {
//   walletAddress: string;
// }

const Vote = ({ walletAddress }: VoteProps) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [votingSuccess, setVotingSuccess] = useState(false);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const candidateList = await getCandidates();
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
    try {
      setIsVoting(true);
      setError(null);
      setVotingSuccess(false);

      // Vote for the selected candidate
      await voteForCandidate(candidateId);

      // Show success message
      setVotingSuccess(true);

      // Reload candidates to see updated vote counts
      await loadCandidates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Voting failed");
      console.error("Error voting:", err);
    } finally {
      setIsVoting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading candidates...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Cast Your Vote</h2>
        <div className="text-sm text-gray-500">
          Connected:{" "}
          <span className="font-mono text-xs">
            {walletAddress.substring(0, 6)}...
            {walletAddress.substring(walletAddress.length - 4)}
          </span>
        </div>
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

      <div className="space-y-4">
        {candidates.length === 0 ? (
          <p className="text-center text-gray-500">No candidates available.</p>
        ) : (
          candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="border rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{candidate.name}</h3>
                  <p className="text-sm text-gray-600">
                    Votes: {candidate.voteCount}
                  </p>
                </div>
                <button
                  onClick={() => handleVote(candidate.id)}
                  disabled={isVoting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  {isVoting ? "Voting..." : "Vote"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={loadCandidates}
        className="mt-6 w-full border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50"
      >
        Refresh Results
      </button>
    </div>
  );
};

export default Vote;
