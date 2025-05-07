import { useState, useEffect } from "react";
import { connectWallet, checkIfMetaMaskIsInstalled } from "../utils/contract";

interface RegisterProps {
  onWalletConnected: (address: string) => void;
}

const Register = ({ onWalletConnected }: RegisterProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    setIsMetaMaskInstalled(checkIfMetaMaskIsInstalled());
  }, []);

  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // Connect wallet using the utility function
      const { address } = await connectWallet();

      // Notify parent component about successful connection
      onWalletConnected(address);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
      console.error("Error connecting wallet:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Connect to Votereum</h2>
      <p className="mb-4 text-gray-700">
        Connect your Ethereum wallet to register and participate in voting.
      </p>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {isMetaMaskInstalled === false && (
        <div className="mb-6">
          <div
            className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4"
            role="alert"
          >
            <p className="font-bold">MetaMask is not installed</p>
            <p>You need MetaMask to interact with this application.</p>
          </div>

          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded flex justify-center items-center mb-4"
          >
            Download MetaMask
          </a>

          <ol className="list-decimal list-inside text-sm text-gray-700 mb-4 space-y-2">
            <li>Install the MetaMask browser extension</li>
            <li>Create a new wallet or import an existing one</li>
            <li>
              Connect to the Ganache network (Chain ID: 1337, RPC URL:
              http://127.0.0.1:8545)
            </li>
            <li>Import a Ganache account using its private key</li>
            <li>Refresh this page</li>
          </ol>
        </div>
      )}

      <button
        onClick={handleConnectWallet}
        disabled={isConnecting || isMetaMaskInstalled === false}
        className={`w-full ${
          isMetaMaskInstalled === false
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out`}
      >
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </button>

      {isMetaMaskInstalled && (
        <div className="mt-4 text-sm text-gray-600">
          <p>Click the button above to connect your MetaMask wallet.</p>
        </div>
      )}
    </div>
  );
};

export default Register;
