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
  ChevronLeftIcon,
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

  // Animation variants for the sidebar
  const sidebarVariants = {
    open: { width: "260px" },
    closed: { width: "64px" },
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden fixed inset-0 m-0 p-0">
      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        animate={isSidebarOpen ? "open" : "closed"}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-[#18222F] text-white h-full flex flex-col shadow-lg border-r border-[#253649]"
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-center border-b border-[#253649] h-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-semibold text-white"
          >
            {isSidebarOpen ? "VOTEREUM" : "V"}
          </motion.div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-3 flex flex-col gap-1 px-2">
          {navItems.map((item) => (
            <Link to={item.path} key={item.name}>
              <motion.div
                whileHover={{ backgroundColor: "#253649" }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 py-2 px-3 rounded-md ${
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
        </div>

        {/* Bottom Section - Settings and Profile */}
        <div className="py-3 flex flex-col gap-1 px-2 border-t border-[#253649]">
          {bottomNavItems.map((item) => (
            <Link to={item.path} key={item.name}>
              <motion.div
                whileHover={{ backgroundColor: "#253649" }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 py-2 px-3 rounded-md ${
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

          {/* Wallet Address Display */}
          {walletAddress && isSidebarOpen && (
            <div className="mt-3 mx-2 px-3 py-2 bg-[#253649] rounded-md text-xs text-[#A2B5CD] truncate">
              {walletAddress.substring(0, 6)}...
              {walletAddress.substring(walletAddress.length - 4)}
            </div>
          )}

          {/* Toggle Button */}
          <div className="mt-3 px-2">
            <motion.button
              whileHover={{ backgroundColor: "#253649" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-full flex items-center justify-center p-2 rounded-md bg-transparent text-[#A2B5CD] hover:text-white border border-[#253649]"
              aria-label={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <ChevronLeftIcon
                className={`w-5 h-5 transition-transform ${
                  isSidebarOpen ? "" : "rotate-180"
                }`}
              />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-[#F5F7FA] w-full h-full">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center shadow-sm">
          <h1 className="text-lg font-medium text-gray-800">
            {navItems.find((item) => item.path === location.pathname)?.name ||
              bottomNavItems.find((item) => item.path === location.pathname)
                ?.name ||
              "Dashboard"}
          </h1>
        </header>

        {/* Content */}
        <div className="p-6 h-[calc(100%-4rem)]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
