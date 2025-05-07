import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HomeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { linkMetaMaskToAccount } from "../utils/auth";

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { authState, signOut, linkWallet } = useAuth();

  // Get user information from auth context
  const { user } = authState;
  const walletAddress =
    user?.ethereum_address || localStorage.getItem("walletAddress");

  // Navigation items
  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <HomeIcon className="w-5 h-5" />,
    },
    {
      name: "Elections",
      path: "/elections",
      icon: <DocumentTextIcon className="w-5 h-5" />,
    },
    {
      name: "Vote",
      path: "/vote",
      icon: <UserGroupIcon className="w-5 h-5" />,
    },
    {
      name: "Results",
      path: "/results",
      icon: <ChartBarIcon className="w-5 h-5" />,
    },
  ];

  // Bottom navigation items
  const bottomNavItems: NavItem[] = [
    {
      name: "Settings",
      path: "/settings",
      icon: <Cog6ToothIcon className="w-5 h-5" />,
    },
  ];

  // Handle user logout
  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  // Handle linking wallet
  const handleLinkWallet = async () => {
    try {
      await linkWallet();
      // Show success message or update UI
      alert("Wallet linked successfully!");
    } catch (error) {
      console.error("Failed to link wallet:", error);
      alert("Failed to link wallet. Please try again.");
    }
  };

  // Animation variants for the sidebar
  const sidebarVariants = {
    open: {
      width: "240px",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
    closed: {
      width: "72px",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <motion.div
        className="bg-[#1A2538] h-screen overflow-hidden flex flex-col"
        animate={isSidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
      >
        {/* Logo */}
        <div className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                V
              </div>
            </div>
            {isSidebarOpen && (
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="ml-2 text-xl font-semibold text-white"
              >
                Votereum
              </motion.h1>
            )}
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 flex flex-col justify-between py-4 overflow-y-auto">
          {/* Main Navigation */}
          <nav className="px-2 space-y-1">
            {navItems.map((item) => (
              <Link to={item.path} key={item.name}>
                <motion.div
                  whileHover={{ backgroundColor: "#253649" }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center px-2 py-3 rounded-md space-x-3 ${
                    location.pathname === item.path
                      ? "bg-[#2D4865] text-[#66B0FF]"
                      : "text-[#A2B5CD] hover:text-white"
                  } transition-all`}
                >
                  <div
                    className={
                      location.pathname === item.path
                        ? "text-[#66B0FF]"
                        : "text-[#A2B5CD]"
                    }
                  >
                    {item.icon}
                  </div>
                  {isSidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="font-medium text-sm"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </motion.div>
              </Link>
            ))}
          </nav>

          {/* Bottom Navigation */}
          <div className="space-y-1 px-2">
            {/* User Display */}
            {user && (
              <div
                className={`mb-2 px-2 py-2 ${isSidebarOpen ? "text-left" : "text-center"}`}
              >
                {isSidebarOpen ? (
                  <div>
                    <p className="text-gray-300 text-xs font-medium">
                      Signed in as
                    </p>
                    <p className="text-white text-sm truncate font-medium">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-gray-400 text-xs truncate">
                      {user.email}
                    </p>
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-600 mx-auto flex items-center justify-center text-white font-bold">
                    {user.first_name.charAt(0)}
                  </div>
                )}
              </div>
            )}

            {/* Wallet Address Display */}
            {walletAddress ? (
              isSidebarOpen && (
                <div className="mt-3 mx-2 px-3 py-2 bg-[#253649] rounded-md text-xs text-[#A2B5CD] truncate">
                  {walletAddress.substring(0, 6)}...
                  {walletAddress.substring(walletAddress.length - 4)}
                </div>
              )
            ) : (
              <button
                onClick={handleLinkWallet}
                className="w-full flex items-center justify-center px-2 py-2 text-xs text-[#A2B5CD] bg-[#253649] rounded-md hover:bg-[#2D4865] transition-colors"
              >
                {isSidebarOpen ? "Connect Wallet" : "⚡"}
              </button>
            )}

            {/* Settings */}
            {bottomNavItems.map((item) => (
              <Link to={item.path} key={item.name}>
                <motion.div
                  whileHover={{ backgroundColor: "#253649" }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center px-2 py-3 rounded-md space-x-3 ${
                    location.pathname === item.path
                      ? "bg-[#2D4865] text-[#66B0FF]"
                      : "text-[#A2B5CD] hover:text-white"
                  } transition-all`}
                >
                  <div
                    className={
                      location.pathname === item.path
                        ? "text-[#66B0FF]"
                        : "text-[#A2B5CD]"
                    }
                  >
                    {item.icon}
                  </div>
                  {isSidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="font-medium text-sm"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </motion.div>
              </Link>
            ))}

            {/* Logout Button */}
            <motion.div
              whileHover={{ backgroundColor: "#253649" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="flex items-center px-2 py-3 rounded-md space-x-3 text-[#A2B5CD] hover:text-white cursor-pointer transition-all"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="font-medium text-sm"
                >
                  Logout
                </motion.span>
              )}
            </motion.div>

            {/* Toggle Button */}
            <div className="mt-3 px-2">
              <motion.button
                whileHover={{ backgroundColor: "#253649" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="w-full flex items-center justify-center p-2 rounded-md bg-transparent text-[#A2B5CD] hover:text-white border border-[#253649]"
                aria-label={
                  isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"
                }
              >
                <ChevronLeftIcon
                  className={`w-5 h-5 transition-transform ${
                    !isSidebarOpen && "transform rotate-180"
                  }`}
                />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
