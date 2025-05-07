import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HomeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  // Get wallet address from localStorage if it exists
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    const storedAddress = localStorage.getItem("walletAddress");
    if (storedAddress) {
      setWalletAddress(storedAddress);
    }
  }, []);

  // Navigation items
  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <HomeIcon className="w-6 h-6" />,
    },
    {
      name: "Elections",
      path: "/elections",
      icon: <DocumentTextIcon className="w-6 h-6" />,
    },
    {
      name: "Vote",
      path: "/vote",
      icon: <UserGroupIcon className="w-6 h-6" />,
    },
    {
      name: "Results",
      path: "/results",
      icon: <ChartBarIcon className="w-6 h-6" />,
    },
  ];

  // Bottom navigation items
  const bottomNavItems: NavItem[] = [
    {
      name: "Settings",
      path: "/settings",
      icon: <Cog6ToothIcon className="w-6 h-6" />,
    },
  ];

  // Animation variants for the sidebar
  const sidebarVariants = {
    open: { width: "240px" },
    closed: { width: "80px" },
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        animate={isSidebarOpen ? "open" : "closed"}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-black text-white h-full flex flex-col shadow-lg"
      >
        {/* Logo */}
        <div className="p-5 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-bold text-blue-400"
          >
            {isSidebarOpen ? "Votereum" : "V"}
          </motion.div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-6 flex flex-col gap-2 px-3">
          {navItems.map((item) => (
            <Link to={item.path} key={item.name}>
              <motion.div
                whileHover={{ scale: 1.03, backgroundColor: "#1e40af" }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  location.pathname === item.path
                    ? "bg-blue-700 text-white"
                    : "hover:bg-blue-600 text-gray-300"
                } transition-all`}
              >
                {item.icon}
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="font-medium"
                  >
                    {item.name}
                  </motion.span>
                )}
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Bottom Section - Settings and Profile */}
        <div className="py-6 flex flex-col gap-2 px-3 border-t border-gray-800">
          {bottomNavItems.map((item) => (
            <Link to={item.path} key={item.name}>
              <motion.div
                whileHover={{ scale: 1.03, backgroundColor: "#1e40af" }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  location.pathname === item.path
                    ? "bg-blue-700 text-white"
                    : "hover:bg-blue-600 text-gray-300"
                } transition-all`}
              >
                {item.icon}
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="font-medium"
                  >
                    {item.name}
                  </motion.span>
                )}
              </motion.div>
            </Link>
          ))}

          {/* Wallet Address Display */}
          {walletAddress && isSidebarOpen && (
            <div className="mt-3 px-3 py-2 bg-gray-800 rounded-md text-xs text-gray-300 truncate">
              {walletAddress.substring(0, 6)}...
              {walletAddress.substring(walletAddress.length - 4)}
            </div>
          )}

          {/* Toggle Button */}
          <div className="mt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-full flex items-center justify-center p-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSidebarOpen ? (
                <ArrowRightOnRectangleIcon className="w-6 h-6" />
              ) : (
                <ArrowRightOnRectangleIcon className="w-6 h-6 rotate-180" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
