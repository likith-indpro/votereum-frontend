import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { connectWallet, checkIfMetaMaskIsInstalled } from "../utils/contract";
import { ethers } from "ethers";
import { useAuth } from "../context/AuthContext";

interface RegisterProps {
  onWalletConnected?: (address: string) => void;
}

const Register = ({ onWalletConnected }: RegisterProps) => {
  const navigate = useNavigate();
  const { register } = useAuth();

  // User registration form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Registration state
  const [step, setStep] = useState<"userInfo" | "wallet">("userInfo");
  const [isRegistering, setIsRegistering] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  // Wallet connection state
  const [isConnecting, setIsConnecting] = useState(false);
  const [isGeneratingWallet, setIsGeneratingWallet] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<
    boolean | null
  >(null);
  const [registrationMethod, setRegistrationMethod] = useState<
    "metamask" | "generate" | "import" | "skip"
  >("metamask");
  const [importedPrivateKey, setImportedPrivateKey] = useState("");
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  useEffect(() => {
    setIsMetaMaskInstalled(checkIfMetaMaskIsInstalled());
  }, []);

  // Validate the user registration form
  const validateForm = () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }

    setError(null);
    return true;
  };

  // Handle user registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsRegistering(true);
    setError(null);

    try {
      await register(firstName, lastName, email, password);
      setSuccess("Account created successfully!");
      setAccountCreated(true);
      setStep("wallet"); // Move to wallet connection step
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  // Connect MetaMask wallet
  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // Connect wallet using the utility function
      const { address } = await connectWallet();

      // Save the wallet address
      setWalletAddress(address);

      // Update UI with success message
      setSuccess(`Wallet connected: ${address}`);

      // Notify parent component about successful connection
      if (onWalletConnected) {
        onWalletConnected(address);
      }

      // If account was already created, redirect to dashboard
      if (accountCreated) {
        setTimeout(() => navigate("/dashboard"), 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
      console.error("Error connecting wallet:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  // Generate a new wallet
  const generateNewWallet = async () => {
    try {
      setIsGeneratingWallet(true);
      setError(null);

      // Generate a new random wallet
      const wallet = ethers.Wallet.createRandom();

      // Save private key to localStorage
      localStorage.setItem("votereumPrivateKey", wallet.privateKey);

      // Update state with wallet address
      setWalletAddress(wallet.address);

      // Set success message and notify parent
      setSuccess(`New wallet created with address: ${wallet.address}`);

      if (onWalletConnected) {
        onWalletConnected(wallet.address);
      }

      // If account was already created, redirect to dashboard
      if (accountCreated) {
        setTimeout(() => navigate("/dashboard"), 2000);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate wallet"
      );
      console.error("Error generating wallet:", err);
    } finally {
      setIsGeneratingWallet(false);
    }
  };

  // Import an existing wallet
  const importWallet = async () => {
    try {
      setIsGeneratingWallet(true);
      setError(null);

      if (!importedPrivateKey.trim()) {
        throw new Error("Please enter a private key");
      }

      // Clean up the private key input - remove spaces, new lines, etc.
      let cleanedKey = importedPrivateKey.trim();

      try {
        // Try to create a wallet directly - ethers can handle some format variations
        const wallet = new ethers.Wallet(cleanedKey);

        // If we got here, the key was valid, so save it
        localStorage.setItem("votereumPrivateKey", wallet.privateKey);

        // Update state with wallet address
        setWalletAddress(wallet.address);

        // Set success message and notify parent
        setSuccess(`Wallet imported with address: ${wallet.address}`);

        if (onWalletConnected) {
          onWalletConnected(wallet.address);
        }

        // If account was already created, redirect to dashboard
        if (accountCreated) {
          setTimeout(() => navigate("/dashboard"), 2000);
        }
      } catch (err) {
        // If direct creation failed, try additional formatting
        // Try adding 0x prefix if it's missing and looks like a hex string
        if (!cleanedKey.startsWith("0x") && /^[0-9a-fA-F]+$/.test(cleanedKey)) {
          cleanedKey = `0x${cleanedKey}`;
          try {
            const wallet = new ethers.Wallet(cleanedKey);
            localStorage.setItem("votereumPrivateKey", wallet.privateKey);
            setWalletAddress(wallet.address);
            setSuccess(`Wallet imported with address: ${wallet.address}`);

            if (onWalletConnected) {
              onWalletConnected(wallet.address);
            }

            // If account was already created, redirect to dashboard
            if (accountCreated) {
              setTimeout(() => navigate("/dashboard"), 2000);
            }
            return;
          } catch (e) {
            throw new Error(
              "Invalid private key format. Please check that you've entered the correct key"
            );
          }
        } else {
          throw new Error(
            "Invalid private key. Please ensure you're using a valid Ethereum private key"
          );
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid private key");
      console.error("Error importing wallet:", err);
    } finally {
      setIsGeneratingWallet(false);
    }
  };

  // Skip wallet connection
  const skipWalletConnection = () => {
    setSuccess("You can connect a wallet later in your account settings.");
    if (accountCreated) {
      setTimeout(() => navigate("/dashboard"), 2000);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Page Title */}
      <h2 className="text-2xl font-bold mb-4">Create Your Votereum Account</h2>

      {/* Error and Success Messages */}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {success && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      {/* Step 1: User Information */}
      {step === "userInfo" && (
        <form onSubmit={handleRegister} className="space-y-4">
          <p className="mb-4 text-gray-700">
            Enter your information to create a Votereum account.
          </p>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="••••••••"
            />
            <p className="mt-1 text-xs text-gray-500">
              Must be at least 8 characters
            </p>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isRegistering}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isRegistering ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isRegistering ? "Creating Account..." : "Create Account"}
            </button>
          </div>

          {/* Sign In Link */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      )}

      {/* Step 2: Wallet Connection */}
      {step === "wallet" && (
        <div>
          <p className="mb-4 text-gray-700">
            Connect or create a wallet to use with Votereum. This will allow you
            to vote securely on the blockchain.
          </p>

          {/* Registration Method Selector */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setRegistrationMethod("metamask")}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  registrationMethod === "metamask"
                    ? "bg-blue-100 text-blue-700 border-blue-200 border"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                MetaMask
              </button>
              <button
                onClick={() => setRegistrationMethod("generate")}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  registrationMethod === "generate"
                    ? "bg-blue-100 text-blue-700 border-blue-200 border"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Generate New Wallet
              </button>
              <button
                onClick={() => setRegistrationMethod("import")}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  registrationMethod === "import"
                    ? "bg-blue-100 text-blue-700 border-blue-200 border"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Import Private Key
              </button>
              <button
                onClick={() => setRegistrationMethod("skip")}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  registrationMethod === "skip"
                    ? "bg-blue-100 text-blue-700 border-blue-200 border"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Skip for Now
              </button>
            </div>
          </div>

          {/* MetaMask Connection */}
          {registrationMethod === "metamask" && (
            <>
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
                {isConnecting ? "Connecting..." : "Connect MetaMask"}
              </button>

              {isMetaMaskInstalled && (
                <div className="mt-4 text-sm text-gray-600">
                  <p>Click the button above to connect your MetaMask wallet.</p>
                </div>
              )}
            </>
          )}

          {/* Generate New Wallet */}
          {registrationMethod === "generate" && (
            <>
              <div className="mb-4 text-sm text-gray-700">
                <p>
                  Generate a new wallet with a random private key. This will be
                  stored in your browser and used for voting.{" "}
                  <strong>Make sure to back up your private key!</strong>
                </p>
              </div>

              <button
                onClick={generateNewWallet}
                disabled={isGeneratingWallet}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
              >
                {isGeneratingWallet ? "Generating..." : "Generate New Wallet"}
              </button>

              {walletAddress && localStorage.getItem("votereumPrivateKey") && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Your Private Key
                    </label>
                    <button
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                      type="button"
                    >
                      {showPrivateKey ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div className="mt-1 relative">
                    <input
                      type={showPrivateKey ? "text" : "password"}
                      className="block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                      value={localStorage.getItem("votereumPrivateKey") || ""}
                      readOnly
                      title="Your private key"
                      placeholder="Your private key will appear here"
                      aria-label="Your private key"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          localStorage.getItem("votereumPrivateKey") || ""
                        );
                        alert("Private key copied to clipboard");
                      }}
                      className="absolute inset-y-0 right-0 px-3 bg-gray-100 hover:bg-gray-200 border-l border-gray-300 rounded-r-md flex items-center text-sm font-medium text-gray-600"
                      type="button"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-red-600">
                    Never share your private key with anyone! Back it up
                    securely.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Import Private Key */}
          {registrationMethod === "import" && (
            <>
              <div className="mb-4 text-sm text-gray-700">
                <p>
                  Import an existing wallet by entering your private key. This
                  will be stored in your browser and used for voting.
                </p>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="privateKey"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Private Key
                </label>
                <div className="mt-1 relative">
                  <input
                    id="privateKey"
                    type={showPrivateKey ? "text" : "password"}
                    placeholder="Enter your private key (with or without 0x prefix)"
                    value={importedPrivateKey}
                    onChange={(e) => setImportedPrivateKey(e.target.value)}
                    className="block w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    className="absolute inset-y-0 right-0 px-3 bg-gray-100 hover:bg-gray-200 border-l border-gray-300 rounded-r-md flex items-center text-sm font-medium text-gray-600"
                    type="button"
                  >
                    {showPrivateKey ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                onClick={importWallet}
                disabled={isGeneratingWallet || !importedPrivateKey.trim()}
                className={`w-full ${
                  !importedPrivateKey.trim()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out`}
              >
                {isGeneratingWallet ? "Importing..." : "Import Wallet"}
              </button>
            </>
          )}

          {/* Skip Wallet Connection */}
          {registrationMethod === "skip" && (
            <>
              <div className="mb-4 text-sm text-gray-700">
                <p>
                  You can skip connecting a wallet for now and add one later
                  from your account settings.
                </p>
              </div>

              <button
                onClick={skipWalletConnection}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
              >
                Continue without Wallet
              </button>
            </>
          )}

          {/* Back to user info button */}
          <div className="mt-6">
            <button
              onClick={() => setStep("userInfo")}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to User Information
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
