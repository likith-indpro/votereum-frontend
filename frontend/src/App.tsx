import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { connectProvider } from "./utils/contract";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Register from "./components/Register"; // Import Register component
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Elections from "./pages/Elections";
import VotePage from "./pages/VotePage";
import Results from "./pages/Results";
import Settings from "./pages/Settings";
import "./App.css";

// Protected route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { authState, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { authState } = useAuth();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize the provider connection when app loads
        await connectProvider();
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize blockchain connection:", error);
      }
    };

    initializeApp();
  }, []);

  // Render loading state if blockchain connection is still initializing
  if (!isInitialized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Connecting to blockchain...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          authState.isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <div className="h-screen w-screen bg-gray-100 flex items-center justify-center overflow-hidden">
              <Login />
            </div>
          )
        }
      />

      <Route
        path="/signup"
        element={
          authState.isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <div className="h-screen w-screen bg-gray-100 flex items-center justify-center overflow-hidden">
              <Signup />
            </div>
          )
        }
      />

      {/* Add Register route */}
      <Route
        path="/register"
        element={
          authState.isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <div className=" min-w-2xl bg-gray-100 flex items-center justify-center overflow-hidden">
              <Register
                onWalletConnected={(address) => {
                  console.log("Wallet connected:", address);
                  localStorage.setItem("walletAddress", address);
                }}
              />
            </div>
          )
        }
      />

      {/* Redirect root to either dashboard or login */}
      <Route
        path="/"
        element={
          authState.isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
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
          <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-800">404</h1>
              <p className="text-xl text-gray-600 mt-2">Page not found</p>
              <div className="mt-6">
                <a
                  href="/"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Go Home
                </a>
              </div>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
