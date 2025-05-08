import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { connectWallet, getCurrentWalletAddress } from "../utils/contract";
import integrationService from "../utils/integrationService";

interface CreateElectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onElectionCreated: (electionData: any) => void;
}

const CreateElectionModal: React.FC<CreateElectionModalProps> = ({
  isOpen,
  onClose,
  onElectionCreated,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minimumAge, setMinimumAge] = useState(18);
  const [maxVotesPerUser, setMaxVotesPerUser] = useState(1);
  const [enforceKYC, setEnforceKYC] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if wallet is connected on mount and when modal opens
  useEffect(() => {
    if (isOpen) {
      checkWalletConnection();
    }
  }, [isOpen]);

  // Check wallet connection status
  const checkWalletConnection = async () => {
    try {
      const address = await getCurrentWalletAddress();
      setWalletAddress(address);
    } catch (err) {
      console.error("Error checking wallet connection:", err);
    }
  };

  // Connect to blockchain wallet
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setError("");

    try {
      const { address } = await connectWallet();
      setWalletAddress(address);
    } catch (err: any) {
      console.error("Error connecting wallet:", err);
      setError(err.message || "Failed to connect wallet. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  // Reset form when modal closes
  const handleClose = () => {
    setTitle("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setMinimumAge(18);
    setMaxVotesPerUser(1);
    setEnforceKYC(false);
    setError("");
    onClose();
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError("");

    try {
      // Validate form
      if (!title || !description) {
        throw new Error("Please fill all required fields");
      }

      // Check if wallet is connected
      if (!walletAddress) {
        throw new Error("Please connect your wallet to create an election");
      }

      // Simplified flow: Create the election using our integration service
      console.log("Creating election through integration service...");

      const result = await integrationService.createElection(
        title,
        description
      );

      console.log("Election created successfully:", result);

      // Calculate duration in minutes if start and end dates are provided
      if (startDate && endDate) {
        const startTimestamp = new Date(startDate).getTime();
        const endTimestamp = new Date(endDate).getTime();
        const durationInMinutes = Math.floor(
          (endTimestamp - startTimestamp) / (60 * 1000)
        );

        if (durationInMinutes > 0) {
          console.log(`Election duration: ${durationInMinutes} minutes`);
          // Store the start/end dates for future use when starting the election
          localStorage.setItem(`election-${result.id}-startDate`, startDate);
          localStorage.setItem(`election-${result.id}-endDate`, endDate);
        }
      }

      // Notify parent component that election is created
      onElectionCreated(result);

      // Close modal
      handleClose();
    } catch (err: any) {
      console.error("Error creating election:", err);
      setError(err.message || "Failed to create election. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      ></div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white rounded-lg p-6 w-full max-w-md z-10"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Create New Election
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title*
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description*
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Start Date*
              </label>
              <input
                id="startDate"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                End Date*
              </label>
              <input
                id="endDate"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="minimumAge"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Minimum Age
              </label>
              <input
                id="minimumAge"
                type="number"
                value={minimumAge}
                onChange={(e) => setMinimumAge(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min={0}
              />
            </div>
            <div>
              <label
                htmlFor="maxVotesPerUser"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Max Votes per User
              </label>
              <input
                id="maxVotesPerUser"
                type="number"
                value={maxVotesPerUser}
                onChange={(e) => setMaxVotesPerUser(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min={1}
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center">
              <input
                id="enforceKYC"
                type="checkbox"
                checked={enforceKYC}
                onChange={(e) => setEnforceKYC(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="enforceKYC"
                className="ml-2 block text-sm text-gray-700"
              >
                Enforce KYC verification for voters
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#66B0FF] text-white rounded-md hover:bg-[#5AA0EF] transition-colors flex items-center"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Election"
              )}
            </button>
          </div>
        </form>

        <div className="mt-4">
          {walletAddress ? (
            <div className="text-sm text-gray-600">
              Wallet connected:{" "}
              <span className="font-medium">{walletAddress}</span>
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              className="w-full px-4 py-2 bg-[#66B0FF] text-white rounded-md hover:bg-[#5AA0EF] transition-colors flex items-center justify-center"
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Connecting...
                </>
              ) : (
                "Connect Wallet"
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CreateElectionModal;
