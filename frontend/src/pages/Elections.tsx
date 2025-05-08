import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { electionsAPI, type Election } from "../utils/api";
import CreateElectionModal from "../components/CreateElectionModal";
import AddCandidateModal from "../components/AddCandidateModal";

// Interface for our frontend election model
interface ElectionWithStatus extends Omit<Election, "status"> {
  status: "active" | "upcoming" | "completed";
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

  // State for modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddCandidateModalOpen, setIsAddCandidateModalOpen] = useState(false);
  const [selectedElection, setSelectedElection] = useState<{
    id: string;
    blockchainElectionId: number;
  } | null>(null);

  // Fetch elections from the backend
  useEffect(() => {
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
            let status: "active" | "upcoming" | "completed";

            if (currentDate < startDate) {
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

    fetchElections();
  }, []);

  // Filter elections based on the selected filter
  const filteredElections =
    filter === "all"
      ? elections
      : elections.filter((election) => election.status === filter);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Filter and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filter === "all"
                ? "bg-[#EFF8FF] text-[#66B0FF]"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filter === "active"
                ? "bg-[#ECFDF3] text-green-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filter === "upcoming"
                ? "bg-[#FFFAEB] text-yellow-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filter === "completed"
                ? "bg-gray-100 text-gray-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Completed
          </button>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-[#66B0FF] hover:bg-[#5AA0EF] text-white rounded-md text-sm font-medium transition-colors flex items-center"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
          Create Election
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
          <div className="mx-auto w-16 h-16 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#66B0FF]"></div>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mt-4">
            Loading elections...
          </h3>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
          <div className="mx-auto w-16 h-16 flex items-center justify-center text-red-500">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mt-4">
            Something went wrong
          </h3>
          <p className="text-gray-500 text-sm mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#66B0FF] text-white rounded-md text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Elections Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredElections.map((election) => (
            <motion.div
              key={election.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
            >
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-medium text-gray-800">
                  {election.title}
                </h2>
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                    election.status === "active"
                      ? "bg-[#ECFDF3] text-green-600"
                      : election.status === "upcoming"
                        ? "bg-[#FFFAEB] text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {election.status.charAt(0).toUpperCase() +
                    election.status.slice(1)}
                </span>
              </div>
              <p className="text-gray-600 mt-2 text-sm">
                {election.description}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">Start Date</div>
                  <div className="text-sm font-medium">
                    {election.startDate}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">End Date</div>
                  <div className="text-sm font-medium">{election.endDate}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">Candidates</div>
                  <div className="text-sm font-medium">
                    {election.candidates}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">Organizer</div>
                  <div className="text-sm font-medium truncate">
                    {election.organizer}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                {/* Add Candidate Button */}
                {election.status === "upcoming" && (
                  <button
                    onClick={() => {
                      setSelectedElection({
                        id: election.id,
                        blockchainElectionId: parseInt(
                          election.smart_contract_address
                        ),
                      });
                      setIsAddCandidateModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-md text-white text-sm font-medium transition-colors bg-green-500 hover:bg-green-600"
                  >
                    Add Candidate
                  </button>
                )}

                {election.status === "active" ? (
                  <Link
                    to={`/vote?election=${election.id}`}
                    className="ml-auto"
                  >
                    <button className="px-4 py-2 rounded-md text-white text-sm font-medium transition-colors bg-[#66B0FF] hover:bg-[#5AA0EF]">
                      Vote Now
                    </button>
                  </Link>
                ) : election.status === "upcoming" ? (
                  <button
                    className="px-4 py-2 rounded-md text-white text-sm font-medium bg-gray-300 cursor-not-allowed ml-auto"
                    disabled
                  >
                    Coming Soon
                  </button>
                ) : (
                  <Link
                    to={`/results?election=${election.id}`}
                    className="ml-auto"
                  >
                    <button className="px-4 py-2 rounded-md text-white text-sm font-medium transition-colors bg-gray-500 hover:bg-gray-600">
                      View Results
                    </button>
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredElections.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 flex items-center justify-center rounded-full mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800">
            No elections found
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            There are no {filter !== "all" ? filter : ""} elections available at
            the moment.
          </p>
        </div>
      )}

      {/* Create Election Modal */}
      {isCreateModalOpen && (
        <CreateElectionModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onElectionCreated={(newElection) => {
            setElections((prevElections) => [...prevElections, newElection]);
            setIsCreateModalOpen(false);
          }}
        />
      )}

      {/* Add Candidate Modal */}
      {isAddCandidateModalOpen && selectedElection && (
        <AddCandidateModal
          isOpen={isAddCandidateModalOpen}
          onClose={() => setIsAddCandidateModalOpen(false)}
          electionId={selectedElection.id}
          blockchainElectionId={selectedElection.blockchainElectionId}
          onCandidateAdded={(candidate) => {
            setElections((prevElections) =>
              prevElections.map((election) =>
                election.id === selectedElection.id
                  ? { ...election, candidates: election.candidates + 1 }
                  : election
              )
            );
          }}
        />
      )}
    </motion.div>
  );
};

export default Elections;
