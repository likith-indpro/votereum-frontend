import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { electionsAPI, type Election } from "../utils/api";
import CreateElectionModal from "../components/CreateElectionModal";
import AddCandidateModal from "../components/AddCandidateModal";
import {
  startElection,
  endElection,
  getCurrentWalletAddress,
} from "../utils/contract";

// Interface for our frontend election model
interface ElectionWithStatus extends Omit<Election, "status"> {
  status: "active" | "upcoming" | "completed" | "pending" | "error";
  candidates: number;
  organizer: string;
  startDate: string;
  endDate: string;
}

// Simple date formatter function to avoid date-fns dependency
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateString;
  }
};

const Elections = () => {
  const [filter, setFilter] = useState<
    "all" | "active" | "upcoming" | "completed"
  >("all");
  const [elections, setElections] = useState<ElectionWithStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const currentDate = new Date();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<{
    [key: string]: boolean;
  }>({});
  const [updateError, setUpdateError] = useState<{ [key: string]: string }>({});

  // State for modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddCandidateModalOpen, setIsAddCandidateModalOpen] = useState(false);
  const [selectedElection, setSelectedElection] = useState<{
    id: string;
    blockchainElectionId: number;
  } | null>(null);

  // Check wallet connection on component mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        const address = await getCurrentWalletAddress();
        setWalletAddress(address);
      } catch (err) {
        console.error("Error checking wallet connection:", err);
      }
    };

    checkWalletConnection();
  }, []);

  // Fetch elections from the backend
  const fetchElections = async () => {
    try {
      setLoading(true);

      // Fetch published elections from the API
      const fetchedElections = await electionsAPI.getElections({
        status: { _eq: "published" },
      });

      // Transform the data to match our frontend model
      const transformedElections: ElectionWithStatus[] = fetchedElections.map(
        (election: Election) => {
          const startDate = new Date(election.start_date);
          const endDate = new Date(election.end_date);

          // Determine election status based on dates
          let status: "active" | "upcoming" | "completed" | "pending" | "error";

          // Check for pending or error status first
          if (election.status === "pending") {
            status = "pending";
          } else if (election.status === "error") {
            status = "error";
          } else if (currentDate < startDate) {
            status = "upcoming";
          } else if (currentDate > endDate) {
            status = "completed";
          } else {
            status = "active";
          }

          // Format dates for display
          const formattedStartDate = formatDate(election.start_date);
          const formattedEndDate = formatDate(election.end_date);

          // Return transformed election object
          return {
            ...election,
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            status,
            candidates: 0, // Will be updated in the next step
            organizer: election.user_created
              ? "Election Commission"
              : "Unknown Organizer",
          };
        }
      );

      // Fetch candidate counts for each election
      const updatedElections = [...transformedElections];
      for (let i = 0; i < updatedElections.length; i++) {
        try {
          const candidates = await electionsAPI.getCandidates(
            updatedElections[i].id
          );
          updatedElections[i].candidates = candidates.length;
        } catch (err) {
          console.error(
            `Error fetching candidates for election ${updatedElections[i].id}:`,
            err
          );
          // Keep the default value of 0
        }
      }

      setElections(updatedElections);
      setError(null);
    } catch (err) {
      console.error("Error fetching elections:", err);
      setError("Failed to load elections. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  // Filter elections based on the selected filter
  const filteredElections =
    filter === "all"
      ? elections
      : elections.filter((election) => election.status === filter);

  // Handle election created
  const handleElectionCreated = (electionData: any) => {
    // Add the newly created election to the state
    setElections([
      {
        ...electionData,
        startDate: formatDate(electionData.start_date),
        endDate: formatDate(electionData.end_date),
        status: electionData.status === "pending" ? "pending" : "upcoming",
        candidates: 0,
        organizer: electionData.user_created || "Election Commission",
      },
      ...elections,
    ]);
  };

  // Handle candidate added
  const handleCandidateAdded = (candidateData: any) => {
    // Update candidate count for the election
    setElections(
      elections.map((election) => {
        if (election.id === candidateData.election_id) {
          return {
            ...election,
            candidates: election.candidates + 1,
          };
        }
        return election;
      })
    );
  };

  // Render status badges with appropriate colors
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-[#ECFDF3] text-green-600">
            Active
          </span>
        );
      case "upcoming":
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-[#FFFAEB] text-yellow-700">
            Upcoming
          </span>
        );
      case "completed":
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-gray-100 text-gray-700">
            Completed
          </span>
        );
      case "pending":
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-blue-100 text-blue-700">
            Pending
          </span>
        );
      case "error":
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-red-100 text-red-700">
            Error
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-gray-100 text-gray-700">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
    }
  };

  // Handle starting an election
  const handleStartElection = async (election: ElectionWithStatus) => {
    if (!walletAddress) {
      alert("Please connect your wallet to start an election");
      return;
    }

    try {
      setIsUpdatingStatus((prev) => ({ ...prev, [election.id]: true }));
      setUpdateError((prev) => ({ ...prev, [election.id]: "" }));

      // Check if the blockchain election ID is valid
      const blockchainElectionId = parseInt(election.smart_contract_address);

      if (
        isNaN(blockchainElectionId) ||
        election.smart_contract_address === "pending"
      ) {
        // If the blockchain ID is not valid, we can only update the status in the backend
        console.log(
          "Election has no valid blockchain ID yet. Updating only in backend."
        );

        // Update the backend status without blockchain interaction
        await electionsAPI.updateElection(election.id, {
          status: "published",
        });

        // Update local state
        setElections((prev) =>
          prev.map((e) =>
            e.id === election.id ? { ...e, status: "active" } : e
          )
        );

        // Show a message to the user
        alert(
          "Election started in the database. Note: This election doesn't have a valid blockchain ID yet, so it was only updated in the database."
        );
        return;
      }

      // Call the blockchain method to start the election
      const result = await startElection(blockchainElectionId);

      if (result.success) {
        // Update the backend status
        await electionsAPI.updateElection(election.id, {
          status: "published",
        });

        // Update local state
        setElections((prev) =>
          prev.map((e) =>
            e.id === election.id ? { ...e, status: "active" } : e
          )
        );
      }
    } catch (err: any) {
      console.error(`Error starting election ${election.id}:`, err);
      setUpdateError((prev) => ({
        ...prev,
        [election.id]: err.message || "Failed to start election",
      }));
    } finally {
      setIsUpdatingStatus((prev) => ({ ...prev, [election.id]: false }));
    }
  };

  // Handle ending an election
  const handleEndElection = async (election: ElectionWithStatus) => {
    if (!walletAddress) {
      alert("Please connect your wallet to end an election");
      return;
    }

    try {
      setIsUpdatingStatus((prev) => ({ ...prev, [election.id]: true }));
      setUpdateError((prev) => ({ ...prev, [election.id]: "" }));

      const blockchainElectionId = parseInt(election.smart_contract_address);
      if (isNaN(blockchainElectionId)) {
        throw new Error("Invalid blockchain election ID");
      }

      // Call the blockchain method to end the election
      const result = await endElection(blockchainElectionId);

      if (result.success) {
        // Update the backend status
        await electionsAPI.updateElection(election.id, {
          status: "published",
        });

        // Update local state
        setElections((prev) =>
          prev.map((e) =>
            e.id === election.id ? { ...e, status: "completed" } : e
          )
        );
      }
    } catch (err: any) {
      console.error(`Error ending election ${election.id}:`, err);
      setUpdateError((prev) => ({
        ...prev,
        [election.id]: err.message || "Failed to end election",
      }));
    } finally {
      setIsUpdatingStatus((prev) => ({ ...prev, [election.id]: false }));
    }
  };

  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Elections</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Election
            </button>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 text-sm font-medium rounded-md mr-2 ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Elections
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-4 py-2 text-sm font-medium rounded-md mr-2 ${
              filter === "active"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-4 py-2 text-sm font-medium rounded-md mr-2 ${
              filter === "upcoming"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              filter === "completed"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Completed
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <svg
              className="animate-spin h-5 w-5 mx-auto text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v16a8 8 0 01-8-8zm16 0a8 8 0 01-8 8V4a8 8 0 018 8z"
              />
            </svg>
            <p className="mt-2 text-gray-500">Loading elections...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredElections.map((election) => (
              <div
                key={election.id}
                className="bg-white shadow rounded-lg overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {election.title}
                    </h2>
                    <div className="flex-shrink-0">
                      {renderStatusBadge(election.status)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 mb-4">
                    <p className="mb-1">
                      <strong>Organizer:</strong> {election.organizer}
                    </p>
                    <p className="mb-1">
                      <strong>Start Date:</strong> {election.startDate}
                    </p>
                    <p className="mb-1">
                      <strong>End Date:</strong> {election.endDate}
                    </p>
                    <p className="mb-1">
                      <strong>Location:</strong> {election.location}
                    </p>
                    <p className="mb-1">
                      <strong>Type:</strong> {election.election_type}
                    </p>
                    <p className="mb-1">
                      <strong>Candidates:</strong> {election.candidates}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/elections/${election.id}`}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View Details
                    </Link>
                    {election.status === "upcoming" && (
                      <button
                        onClick={() => handleStartElection(election)}
                        disabled={isUpdatingStatus[election.id]}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        {isUpdatingStatus[election.id] ? (
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v16a8 8 0 01-8-8zm16 0a8 8 0 01-8 8V4a8 8 0 018 8z"
                            />
                          </svg>
                        ) : (
                          "Start Election"
                        )}
                      </button>
                    )}
                    {election.status === "active" && (
                      <button
                        onClick={() => handleEndElection(election)}
                        disabled={isUpdatingStatus[election.id]}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        {isUpdatingStatus[election.id] ? (
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v16a8 8 0 01-8-8zm16 0a8 8 0 01-8 8V4a8 8 0 018 8z"
                            />
                          </svg>
                        ) : (
                          "End Election"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Election Modal */}
        {isCreateModalOpen && (
          <CreateElectionModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onElectionCreated={handleElectionCreated}
          />
        )}

        {/* Add Candidate Modal */}
        {isAddCandidateModalOpen && selectedElection && (
          <AddCandidateModal
            isOpen={isAddCandidateModalOpen}
            onClose={() => setIsAddCandidateModalOpen(false)}
            electionId={selectedElection.id}
            blockchainElectionId={selectedElection.blockchainElectionId}
            onCandidateAdded={handleCandidateAdded}
          />
        )}
      </div>
    </div>
  );
};

export default Elections;
