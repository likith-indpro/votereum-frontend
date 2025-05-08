import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Vote from "../components/Vote";
import { electionsAPI } from "../utils/api";
import { connectWallet, getCurrentWalletAddress } from "../utils/contract";
import { useSearchParams } from "react-router-dom";

interface Election {
  id: string;
  title: string;
  description: string;
  status: string;
  smart_contract_address: string;
}

const VotePage = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<Election | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [searchParams] = useSearchParams();

  // Check if an election ID was provided in URL parameters
  const electionIdFromUrl = searchParams.get("election");

  // Fetch active elections from the backend
  const fetchElections = async () => {
    try {
      setIsLoading(true);
      const fetchedElections = await electionsAPI.getElections();

      // Filter to only show active elections
      const activeElections = fetchedElections.filter((election: any) => {
        const startDate = new Date(election.start_date);
        const endDate = new Date(election.end_date);
        const now = new Date();
        return now >= startDate && now <= endDate;
      });

      setElections(activeElections);

      // If there's an election ID in the URL, select that election
      if (electionIdFromUrl) {
        const electionFromUrl = activeElections.find(
          (e: Election) => e.id === electionIdFromUrl
        );
        if (electionFromUrl) {
          setSelectedElection(electionFromUrl);
        }
      }
    } catch (err) {
      console.error("Error fetching elections:", err);
      setError("Failed to load elections. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Check wallet connection and load elections on component mount
  useEffect(() => {
    const initPage = async () => {
      try {
        // Check wallet connection
        const address = await getCurrentWalletAddress();
        setWalletAddress(address);

        // Load elections
        await fetchElections();
      } catch (err) {
        console.error("Error initializing page:", err);
      }
    };

    initPage();
  }, [electionIdFromUrl]);

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true);
      const { address } = await connectWallet();
      setWalletAddress(address);
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError("Failed to connect wallet. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Vote</h1>
        <p className="text-gray-600 mt-2">Cast your vote in active elections</p>
      </div>

      {!walletAddress ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No wallet connected
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Please connect your wallet to continue.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            </div>
          </div>
        </div>
      ) : !selectedElection ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Active Elections</h2>
            <div className="text-sm text-gray-500">
              Connected:{" "}
              <span className="font-mono text-xs">
                {walletAddress.substring(0, 6)}...
                {walletAddress.substring(walletAddress.length - 4)}
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading elections...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : elections.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No active elections available.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {elections.map((election) => (
                <div
                  key={election.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedElection(election)}
                >
                  <h3 className="font-bold">{election.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {election.description.substring(0, 100)}
                    {election.description.length > 100 && "..."}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Status: {election.status}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Smart Contract: {election.smart_contract_address}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <button
              onClick={() => setSelectedElection(null)}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to all elections
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">{selectedElection.title}</h2>
            <p className="text-gray-600 mb-6">{selectedElection.description}</p>

            <Vote
              walletAddress={walletAddress}
              electionId={selectedElection.id}
              blockchainElectionId={
                parseInt(selectedElection.smart_contract_address) || 0
              }
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default VotePage;
