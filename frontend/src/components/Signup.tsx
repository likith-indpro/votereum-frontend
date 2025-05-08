import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { register, connectWithMetaMask, error: authError } = useAuth();

  const validateForm = () => {
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return false;
    }

    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters");
      return false;
    }

    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await register(firstName, lastName, email, password);
    } catch (err) {
      setLocalError(
        (err as Error).message || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMetaMaskSignup = async () => {
    setIsLoading(true);
    setLocalError(null);

    try {
      await connectWithMetaMask();
    } catch (err) {
      setLocalError(
        (err as Error).message || "MetaMask signup failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const error = localError || authError;

  return (
    <div className="flex min-h-screen min-w-full bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Left side - Background */}
      <div
        className={`w-0 md:w-1/2 bg-gradient-to-br from-blue-500 to-blue-700 p-12 flex-col justify-center items-center hidden md:flex transition-all duration-700 transform ${
          true ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        }`}
      >
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Welcome to Votereum
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join us to participate in secure voting using blockchain technology
          </p>
          <div className="mb-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-24 w-24 mx-auto text-white/80"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <p className="text-blue-100">Secure. Transparent. Decentralized.</p>
        </div>
      </div>

      {/* Right side - Signup Form */}
      <div
        className={`w-full md:w-1/2 p-8 md:p-12 transition-all duration-700 transform ${
          true ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Join Votereum</h1>
          <p className="text-gray-600 mt-2">
            Create your account to participate in secure voting
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
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

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleMetaMaskSignup}
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 512 512"
              >
                <path
                  d="M256.31 1.164l-148.69 127.61 27.531 45.688L256.31 1.164zm148.72 127.61L256.31 1.164l121.16 173.3 27.56-45.69zM256.76 184.45l-101.84-50.915-29.07 87.593 130.91-36.678zm-.45 0l101.84-50.915 29.07 87.593-130.91-36.678zm-131.52 60.612l21.147 68.835 103.48-9.248-124.627-59.587zm131.96 59.587l103.49 9.248 21.15-68.835-124.64 59.587zM246.4 335.8l-93.12 42.3L232.96 512l13.44-176.2zm19.32 0l-13.44 176.2L332 378.1l-66.28-42.3zm104.15-23.77L307 344.05l61.75 49.726-78.67-122.393 79.79 40.647zm-227.92 0l17.88-81.746 79.79-40.647-78.67 122.393 61.75-49.726L142 312.03z"
                  fill="#f6851b"
                  fillRule="evenodd"
                  stroke="#f6851b"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="8.178"
                />
              </svg>
              Sign up with MetaMask
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
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
      </div>
    </div>
  );
};

export default Signup;
