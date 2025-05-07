import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { connectProvider } from "./utils/contract";
import Register from "./components/Register";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Elections from "./pages/Elections";
import VotePage from "./pages/VotePage";
import Results from "./pages/Results";
import Settings from "./pages/Settings";
import "./App.css";

function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize the provider connection when app loads
        await connectProvider();
        setIsInitialized(true);

        // Check if wallet address is in local storage
        const savedAddress = localStorage.getItem("walletAddress");
        if (savedAddress) {
          setWalletAddress(savedAddress);
        }
      } catch (error) {
        console.error("Failed to initialize blockchain connection:", error);
      }
    };

    initializeApp();
  }, []);

  const handleWalletConnected = (address: string) => {
    setWalletAddress(address);
    // Save wallet address to localStorage
    localStorage.setItem("walletAddress", address);
  };

  // Render loading state if blockchain connection is still initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Connecting to blockchain...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing/Login Route */}
        <Route
          path="/"
          element={
            walletAddress ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md mx-auto">
                  <header className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Votereum
                    </h1>
                    <p className="text-gray-600">
                      Secure blockchain-based voting system
                    </p>
                  </header>
                  <Register onWalletConnected={handleWalletConnected} />
                  <footer className="mt-12 text-center text-sm text-gray-500">
                    <p>
                      &copy; {new Date().getFullYear()} Votereum. All rights
                      reserved.
                    </p>
                  </footer>
                </div>
              </div>
            )
          }
        />

        {/* Dashboard Routes (Protected) */}
        <Route
          element={
            walletAddress ? <DashboardLayout /> : <Navigate to="/" replace />
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/elections" element={<Elections />} />
          <Route path="/vote" element={<VotePage />} />
          <Route path="/results" element={<Results />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* 404 Route */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-lg text-gray-600 mb-6">Page not found</p>
                <a
                  href="/"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Go Home
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
