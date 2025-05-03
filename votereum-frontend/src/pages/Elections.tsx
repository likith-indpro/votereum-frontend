import { useState } from "react";
import { useBlockchain } from "../context/BlockchainContext";
import ElectionCreationForm from "../components/elections/ElectionCreationForm";
import ElectionList from "../components/elections/ElectionList";
import ElectionDetail from "../components/elections/ElectionDetail";

enum ElectionView {
  LIST,
  DETAIL,
  CREATE,
}

const Elections = () => {
  const { isConnected, connectWallet, isLoading, account } = useBlockchain();
  const [currentView, setCurrentView] = useState<ElectionView>(
    ElectionView.LIST
  );
  const [selectedElection, setSelectedElection] = useState<{
    id: string;
    numericId: number;
  } | null>(null);

  const handleSelectElection = (
    electionId: string,
    numericElectionId: number
  ) => {
    setSelectedElection({
      id: electionId,
      numericId: numericElectionId,
    });
    setCurrentView(ElectionView.DETAIL);
  };

  const handleCreateSuccess = (
    electionId: string,
    numericElectionId: number
  ) => {
    // After successfully creating an election, show its details
    handleSelectElection(electionId, numericElectionId);
  };

  // If not connected to the blockchain
  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md mx-auto text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-blue-500 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>

          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">
            To participate in elections or create your own, you need to connect
            your Ethereum wallet.
          </p>

          <button
            onClick={connectWallet}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg w-full disabled:bg-gray-300"
          >
            {isLoading ? "Connecting..." : "Connect Wallet"}
          </button>
        </div>
      </div>
    );
  }

  // If connected and viewing the list of elections
  if (currentView === ElectionView.LIST) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Elections</h1>

          <button
            onClick={() => setCurrentView(ElectionView.CREATE)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Create New Election
          </button>
        </div>

        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-blue-700">
                <span className="font-medium">Connected:</span>{" "}
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </p>
              <p className="text-xs text-blue-600">
                You can now browse, create, and participate in blockchain
                elections
              </p>
            </div>
          </div>
        </div>

        <ElectionList onSelectElection={handleSelectElection} />
      </div>
    );
  }

  // If viewing election details
  if (currentView === ElectionView.DETAIL && selectedElection) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => setCurrentView(ElectionView.LIST)}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Elections
          </button>
        </div>

        <ElectionDetail
          electionId={selectedElection.id}
          numericElectionId={selectedElection.numericId}
        />
      </div>
    );
  }

  // If creating a new election
  if (currentView === ElectionView.CREATE) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => setCurrentView(ElectionView.LIST)}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Elections
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-8">Create a New Election</h1>

        <ElectionCreationForm onSuccess={handleCreateSuccess} />
      </div>
    );
  }

  // Fallback
  return <div>Something went wrong</div>;
};

export default Elections;
