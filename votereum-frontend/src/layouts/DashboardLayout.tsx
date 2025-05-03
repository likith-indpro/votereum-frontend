import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useBlockchain } from "../context/BlockchainContext";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { isConnected, account, connectWallet, isLoading } = useBlockchain();

  // Format Ethereum address for display
  const formatAddress = (address: string | null) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Votereum</h1>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link to="/" className="hover:text-blue-600">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/vote" className="hover:text-blue-600">
                  Vote
                </Link>
              </li>
              <li>
                <Link to="/candidates" className="hover:text-blue-600">
                  Candidates
                </Link>
              </li>
              <li>
                <Link to="/results" className="hover:text-blue-600">
                  Results
                </Link>
              </li>
            </ul>
          </nav>
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="bg-gray-100 px-4 py-2 rounded-md text-gray-700">
                {formatAddress(account)}
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isLoading ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 mt-8">{children}</main>

      <footer className="bg-gray-800 text-white p-6 mt-12">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Votereum</h2>
              <p className="text-gray-300">Blockchain-based Voting System</p>
            </div>
            <div>
              <p>
                &copy; {new Date().getFullYear()} Votereum. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
