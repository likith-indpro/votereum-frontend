import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  getCurrentUser,
  updateUserProfile,
  linkMetaMaskToAccount,
  disconnectWallet,
} from "../utils/auth";

const Settings = () => {
  // User profile state
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Form data state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  // App preferences state
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUser();
        if (userData) {
          setUser(userData);
          setFormData({
            first_name: userData.first_name || "",
            last_name: userData.last_name || "",
            email: userData.email || "",
          });
        }
      } catch (error) {
        setMessage({
          text: "Error loading user data. Please try again.",
          type: "error",
        });
        console.error("Failed to load user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  // Handle profile update
  const handleSaveChanges = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const updatedUser = await updateUserProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
      });

      setUser(updatedUser);
      setMessage({ text: "Profile updated successfully", type: "success" });

      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    } catch (error: any) {
      setMessage({
        text: error.message || "Failed to update profile",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Connect MetaMask wallet
  const handleConnectWallet = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const updatedUser = await linkMetaMaskToAccount();
      setUser(updatedUser);
      setMessage({ text: "Wallet connected successfully", type: "success" });

      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    } catch (error: any) {
      setMessage({
        text: error.message || "Failed to connect wallet",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Disconnect wallet
  const handleDisconnectWallet = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const updatedUser = await disconnectWallet();
      setUser(updatedUser);
      setMessage({ text: "Wallet disconnected successfully", type: "success" });

      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    } catch (error: any) {
      setMessage({
        text: error.message || "Failed to disconnect wallet",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Format Ethereum address for display
  const formatEthAddress = (address?: string) => {
    if (!address) return "Not connected";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account preferences</p>
      </div>

      {message && (
        <div
          className={`mb-4 p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Account Settings
          </h2>

          {/* Profile Information */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              Profile Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  value={formData.first_name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  value={formData.last_name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label
                  htmlFor="verification_status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Verification Status
                </label>
                <div className="p-2 border rounded-md bg-gray-50">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user?.is_verified
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {user?.verification_status || "Unverified"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Information */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              Wallet Information
            </h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Connected Wallet
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatEthAddress(user?.ethereum_address)}
                  </p>
                </div>
                {user?.ethereum_address ? (
                  <button
                    className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={handleDisconnectWallet}
                    disabled={saving}
                  >
                    {saving ? "Processing..." : "Disconnect"}
                  </button>
                ) : (
                  <button
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                    onClick={handleConnectWallet}
                    disabled={saving}
                  >
                    {saving ? "Processing..." : "Connect MetaMask"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* App Preferences */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              App Preferences
            </h3>

            <div className="space-y-4">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Dark Mode</p>
                  <p className="text-xs text-gray-500">
                    Use dark theme for the application
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDarkMode(!darkMode)}
                  aria-label={`${darkMode ? "Disable" : "Enable"} dark mode`}
                  className={`${
                    darkMode ? "bg-blue-600" : "bg-gray-200"
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                >
                  <span
                    className={`${
                      darkMode ? "translate-x-5" : "translate-x-0"
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>

              {/* Notifications Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Notifications
                  </p>
                  <p className="text-xs text-gray-500">
                    Receive notifications about elections
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifications(!notifications)}
                  aria-label={`${notifications ? "Disable" : "Enable"} notifications`}
                  className={`${
                    notifications ? "bg-blue-600" : "bg-gray-200"
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                >
                  <span
                    className={`${
                      notifications ? "translate-x-5" : "translate-x-0"
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>

              {/* Privacy Mode Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Privacy Mode
                  </p>
                  <p className="text-xs text-gray-500">
                    Hide your voting activity from other users
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrivacyMode(!privacyMode)}
                  aria-label={`${privacyMode ? "Disable" : "Enable"} privacy mode`}
                  className={`${
                    privacyMode ? "bg-blue-600" : "bg-gray-200"
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                >
                  <span
                    className={`${
                      privacyMode ? "translate-x-5" : "translate-x-0"
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Security</h3>
            <div className="space-y-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Change Password
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                Enable Two-Factor Authentication
              </button>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6 flex justify-end space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              onClick={() => {
                // Reset form data to original user data
                if (user) {
                  setFormData({
                    first_name: user.first_name || "",
                    last_name: user.last_name || "",
                    email: user.email || "",
                  });
                }
              }}
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onClick={handleSaveChanges}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
