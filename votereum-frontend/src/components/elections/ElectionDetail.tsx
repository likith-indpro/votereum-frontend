import { useState, useEffect } from "react";
import { useBlockchain } from "../../context/BlockchainContext";
import CandidateAdditionForm from "./CandidateAdditionForm";
import CandidateList from "./CandidateList";

interface ElectionDetailProps {
  electionId: string;
  numericElectionId: number;
}

interface Election {
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  finalized: boolean;
  totalVotes: number;
  creator: string;
  candidateCount: number;
}

const ElectionDetail = ({
  electionId,
  numericElectionId,
}: ElectionDetailProps) => {
  const { getElection, finalizeElection, account } = useBlockchain();
  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [finalizing, setFinalizing] = useState(false);

  useEffect(() => {
    const fetchElection = async () => {
      try {
        setLoading(true);
        const electionData = await getElection(electionId, numericElectionId);
        setElection(electionData);
      } catch (err: any) {
        console.error("Error fetching election:", err);
        setError("Failed to load election details.");
      } finally {
        setLoading(false);
      }
    };

    fetchElection();
  }, [getElection, electionId, numericElectionId, refreshKey]);

  const handleFinalizeElection = async () => {
    try {
      setFinalizing(true);
      await finalizeElection(electionId, numericElectionId);
      // Refresh election data
      setRefreshKey((prev) => prev + 1);
    } catch (err: any) {
      console.error("Error finalizing election:", err);
      setError("Failed to finalize election: " + err.message);
    } finally {
      setFinalizing(false);
    }
  };

  const handleCandidateAdded = () => {
    // Refresh election data
    setRefreshKey((prev) => prev + 1);
  };

  const handleVoteSuccess = () => {
    // Refresh election data
    setRefreshKey((prev) => prev + 1);
  };

  // Get election status
  const getStatus = () => {
    if (!election) return "Unknown";

    const now = Math.floor(Date.now() / 1000);

    if (election.finalized) return "Finalized";
    if (now < election.startTime) return "Upcoming";
    if (now >= election.startTime && now <= election.endTime) return "Active";
    if (now > election.endTime) return "Ended";

    return "Unknown";
  };

  const status = getStatus();
  const isOwner =
    election &&
    account &&
    election.creator.toLowerCase() === account.toLowerCase();
  const canAddCandidates = status === "Upcoming" && isOwner;
  const canFinalize =
    (status === "Ended" || status === "Active") &&
    isOwner &&
    !election?.finalized;
  const isActive = status === "Active" && !election?.finalized;

  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-32 bg-gray-200 rounded mb-4"></div>
      </div>
    );
  }

  if (error || !election) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || "Failed to load election details."}
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

  return (
    <div className="space-y-6">
      {/* Election Header */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">{election.title}</h2>

            <div className="mb-4">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                  ${
                    status === "Active"
                      ? "bg-green-100 text-green-800"
                      : status === "Upcoming"
                        ? "bg-blue-100 text-blue-800"
                        : status === "Ended"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                  }`}
              >
                {status}
              </span>

              <span className="ml-2 text-sm text-gray-500">
                Total Votes: {election.totalVotes}
              </span>
            </div>

            <p className="text-gray-700 mb-4">{election.description}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Start Date:</span>{" "}
                {new Date(election.startTime * 1000).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">End Date:</span>{" "}
                {new Date(election.endTime * 1000).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Election ID:</span>{" "}
                <span className="font-mono text-xs">
                  {electionId.substring(0, 10)}...
                </span>
              </div>
              <div>
                <span className="font-medium">Creator:</span>{" "}
                <span className="font-mono text-xs">
                  {election.creator.substring(0, 10)}...
                </span>
              </div>
            </div>
          </div>

          {canFinalize && (
            <button
              onClick={handleFinalizeElection}
              disabled={finalizing}
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {finalizing ? "Finalizing..." : "Finalize Election"}
            </button>
          )}
        </div>
      </div>

      {/* Add Candidate Form (only for election creator and only before the election starts) */}
      {canAddCandidates && (
        <CandidateAdditionForm
          electionId={electionId}
          numericElectionId={numericElectionId}
          onSuccess={handleCandidateAdded}
        />
      )}

      {/* Candidate List */}
      <CandidateList
        electionId={electionId}
        numericElectionId={numericElectionId}
        isFinalized={election.finalized}
        onVoteSuccess={handleVoteSuccess}
      />

      {/* Election Timeline */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Election Timeline</h3>

        <div className="relative">
          <div className="absolute left-0 inset-y-0 w-1 bg-gray-200 rounded"></div>

          <ul className="space-y-6 relative z-10">
            <li className="pl-6 relative">
              <div
                className={`absolute left-0 -translate-x-1/2 w-4 h-4 rounded-full ${status !== "Upcoming" ? "bg-green-500" : "bg-gray-400"}`}
              ></div>
              <div className="font-medium">Creation</div>
              <div className="text-sm text-gray-500">
                Election created on the blockchain
              </div>
            </li>

            <li className="pl-6 relative">
              <div
                className={`absolute left-0 -translate-x-1/2 w-4 h-4 rounded-full ${status !== "Upcoming" ? "bg-green-500" : "bg-gray-400"}`}
              ></div>
              <div className="font-medium">Voting Begins</div>
              <div className="text-sm text-gray-500">
                {new Date(election.startTime * 1000).toLocaleString()}
              </div>
            </li>

            <li className="pl-6 relative">
              <div
                className={`absolute left-0 -translate-x-1/2 w-4 h-4 rounded-full ${status === "Ended" || status === "Finalized" ? "bg-green-500" : "bg-gray-400"}`}
              ></div>
              <div className="font-medium">Voting Ends</div>
              <div className="text-sm text-gray-500">
                {new Date(election.endTime * 1000).toLocaleString()}
              </div>
            </li>

            <li className="pl-6 relative">
              <div
                className={`absolute left-0 -translate-x-1/2 w-4 h-4 rounded-full ${election.finalized ? "bg-green-500" : "bg-gray-400"}`}
              ></div>
              <div className="font-medium">Results Finalized</div>
              <div className="text-sm text-gray-500">
                {election.finalized
                  ? "Election results have been finalized"
                  : "Pending finalization by the election creator"}
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ElectionDetail;
