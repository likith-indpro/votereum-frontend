import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { connectWallet, getCurrentWalletAddress } from "../utils/contract";
import integrationService from "../utils/integrationService";

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  electionId: string;
  electionAddress: string;
  onCandidateAdded: (candidateData: any) => void;
}

const AddCandidateModal: React.FC<AddCandidateModalProps> = ({
  isOpen,
  onClose,
  electionId,
  electionAddress,
  onCandidateAdded,
}) => {
  const [name, setName] = useState("");
  const [party, setParty] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
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
    setName("");
    setParty("");
    setImageUrl("");
    setError("");
    onClose();
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    setError("");

    try {
      // Validate form
      if (!name || !party) {
        throw new Error("Please fill required fields (name and party)");
      }

      // Check if wallet is connected
      if (!walletAddress) {
        throw new Error("Please connect your wallet to continue");
      }

      // Add candidate using the integration service
      console.log("Adding candidate via integration service...");
      const result = await integrationService.addCandidate(
        electionId,
        electionAddress,
        name,
        party,
        imageUrl || "https://via.placeholder.com/150" // Default image if none provided
      );

      console.log("Candidate added successfully:", result);

      // Notify parent component about the new candidate
      onCandidateAdded(result);

      // Close modal
      handleClose();
    } catch (err: any) {
      console.error("Error adding candidate:", err);
      setError(err.message || "Failed to add candidate. Please try again.");
    } finally {
      setIsAdding(false);
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
            Add New Candidate
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
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name*
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="party"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Party or Affiliation*
            </label>
            <input
              id="party"
              type="text"
              value={party}
              onChange={(e) => setParty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="imageUrl"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Profile Image URL
            </label>
            <input
              id="imageUrl"
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank for a default placeholder image
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              disabled={isAdding}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#66B0FF] text-white rounded-md hover:bg-[#5AA0EF] transition-colors flex items-center"
              disabled={isAdding}
            >
              {isAdding ? (
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
                  Adding...
                </>
              ) : (
                "Add Candidate"
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

export default AddCandidateModal;
