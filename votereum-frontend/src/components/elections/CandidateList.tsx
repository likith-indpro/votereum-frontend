import { useState, useEffect } from "react";
import { useBlockchain } from "../../context/BlockchainContext";

interface Candidate {
  id: number;
  name: string;
  metadata: string;
  voteCount: number;
}

interface CandidateListProps {
  electionId: string;
  numericElectionId: number;
  isFinalized: boolean;
  onVoteSuccess?: () => void;
}

const CandidateList = ({
  electionId,
  numericElectionId,
  isFinalized,
  onVoteSuccess,
}: CandidateListProps) => {
  const { getAllCandidates, castVote, hasVoted } = useBlockchain();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userHasVoted, setUserHasVoted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load candidates
  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setLoading(true);
        const candidateList = await getAllCandidates(
          electionId,
          numericElectionId
        );
        setCandidates(candidateList);

        // Check if the user has already voted
        const voted = await hasVoted(electionId, numericElectionId);
        setUserHasVoted(voted);
      } catch (err: any) {
        console.error("Error loading candidates:", err);
        setError("Failed to load candidates. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    };

    loadCandidates();
  }, [getAllCandidates, electionId, numericElectionId, hasVoted, refreshKey]);

  const handleVote = async () => {
    if (selectedCandidate === null) {
      setError("Please select a candidate to vote for.");
      return;
    }

    try {
      setVoting(true);
      setError(null);

      await castVote(electionId, numericElectionId, selectedCandidate);

      setUserHasVoted(true);
      setSelectedCandidate(null);
      setRefreshKey((prev) => prev + 1); // Trigger a refresh

      if (onVoteSuccess) {
        onVoteSuccess();
      }
    } catch (err: any) {
      console.error("Error casting vote:", err);
      setError(err.message || "Failed to cast your vote. Please try again.");
    } finally {
      setVoting(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-4 flex items-center border rounded p-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="ml-auto h-4 bg-gray-200 rounded w-12"></div>
          </div>
        ))}
      </div>
    );
  }

  // Render error state
  if (error && candidates.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={() => setRefreshKey((prev) => prev + 1)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  // If no candidates are found
  if (candidates.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-gray-700">
          No candidates have been added to this election yet.
        </p>
      </div>
    );
  }

  // Sort candidates by vote count (highest first) if election is finalized
  const sortedCandidates = isFinalized
    ? [...candidates].sort((a, b) => b.voteCount - a.voteCount)
    : candidates;

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4">Candidates</h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        {sortedCandidates.map((candidate, index) => {
          // Try to parse the metadata as JSON in case it contains image URLs
          let metadata = {};
          try {
            metadata = JSON.parse(candidate.metadata);
          } catch (e) {
            // If it's not valid JSON, no problem
          }

          // Calculate percentage of votes if the election is finalized
          const totalVotes = sortedCandidates.reduce(
            (sum, c) => sum + c.voteCount,
            0
          );
          const votePercentage =
            totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;

          return (
            <div
              key={candidate.id}
              className={`mb-2 border rounded p-4 ${
                selectedCandidate === candidate.id
                  ? "border-blue-500 bg-blue-50"
                  : ""
              } ${isFinalized && index === 0 ? "border-green-500 bg-green-50" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <span className="font-medium">{candidate.name}</span>

                  {isFinalized && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${votePercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span>{candidate.voteCount} votes</span>
                        <span>{votePercentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  )}
                </div>

                {!isFinalized && !userHasVoted && (
                  <div className="ml-4">
                    <input
                      type="radio"
                      name="candidate"
                      id={`candidate-${candidate.id}`}
                      checked={selectedCandidate === candidate.id}
                      onChange={() => setSelectedCandidate(candidate.id)}
                      className="mr-2"
                    />
                    <label htmlFor={`candidate-${candidate.id}`}>Select</label>
                  </div>
                )}

                {isFinalized && index === 0 && (
                  <div className="ml-4 px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                    Winner
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!isFinalized && !userHasVoted && (
        <div className="mt-4">
          <button
            onClick={handleVote}
            disabled={selectedCandidate === null || voting}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {voting ? "Casting Vote..." : "Cast Vote"}
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Once you cast your vote, it cannot be changed.
          </p>
        </div>
      )}

      {userHasVoted && !isFinalized && (
        <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p className="font-medium">Thank you for voting!</p>
          <p className="text-sm">
            Your vote has been recorded on the blockchain.
          </p>
        </div>
      )}

      {isFinalized && (
        <div className="mt-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <p className="font-medium">This election has been finalized.</p>
          <p className="text-sm">Final results are displayed above.</p>
        </div>
      )}
    </div>
  );
};

export default CandidateList;
