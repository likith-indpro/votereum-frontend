import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Vote from "../components/Vote";

const VotePage = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    // Get wallet address from localStorage if it exists
    const storedAddress = localStorage.getItem("walletAddress");
    if (storedAddress) {
      setWalletAddress(storedAddress);
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Vote</h1>
        <p className="text-gray-600 mt-2">
          Cast your vote in the current election
        </p>
      </div>

      {walletAddress ? (
        <Vote walletAddress={walletAddress} />
      ) : (
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
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default VotePage;
