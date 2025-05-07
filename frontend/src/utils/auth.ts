import axios from "axios";
import { ethers } from "ethers";

// Define the base URL for Directus API
const API_URL =
  import.meta.env.VITE_DIRECTUS_API_URL || "http://localhost:8055";

// Types defined locally to avoid import errors
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  ethereum_address?: string;
  is_voter?: boolean;
  is_verified?: boolean;
  verification_status?: string;
  avatar?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires: number;
  user: User;
}

// Setup axios instance for API calls
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests when available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Register a new user with Directus
 */
export const registerUser = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  ethereumAddress?: string
): Promise<User> => {
  try {
    // Create a new user via the /users endpoint with POST method
    const response = await api.post("/users", {
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: password,
      ethereum_address: ethereumAddress || null,
      is_voter: true, // By default all registered users can vote
      is_verified: false, // Users start unverified
      verification_status: "unverified",
    });

    console.log("Registration successful:", response.data);
    return response.data.data;
  } catch (error: any) {
    console.error("Registration error:", error);

    // Improved error handling to show more details
    const errorMessage =
      error.response?.data?.errors?.[0]?.message ||
      error.response?.data?.message ||
      error.message ||
      "Registration failed";

    console.error(
      "Detailed error:",
      JSON.stringify(error.response?.data || error.message)
    );
    throw new Error(errorMessage);
  }
};

/**
 * Login with email and password
 */
export const loginWithCredentials = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    // Store auth tokens
    localStorage.setItem("access_token", response.data.data.access_token);
    localStorage.setItem("refresh_token", response.data.data.refresh_token);

    return response.data.data;
  } catch (error: any) {
    console.error("Login error:", error);
    throw new Error(
      error.response?.data?.errors?.[0]?.message || "Login failed"
    );
  }
};

/**
 * Sign a message with MetaMask to prove ownership of an Ethereum address
 */
const signMessageWithMetaMask = async (address: string): Promise<string> => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  try {
    // Create a unique message to sign that includes a timestamp to prevent replay attacks
    const timestamp = Date.now();
    const message = `Sign this message to authenticate with Votereum: ${timestamp}`;

    // Request the user to sign the message
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signature = await signer.signMessage(message);

    return signature;
  } catch (error) {
    console.error("Error signing message:", error);
    throw new Error("Failed to sign message with MetaMask");
  }
};

/**
 * Login or register with MetaMask
 */
export const authenticateWithMetaMask = async (): Promise<LoginResponse> => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  try {
    // Force MetaMask to show the account selection modal by clearing any cached permissions
    await window.ethereum.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }],
    });

    // Now request account access - this should show the account selection modal
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found in MetaMask");
    }

    const address = accounts[0];

    // Get the user's signature to prove they own the address
    const signature = await signMessageWithMetaMask(address);

    try {
      // Try to authenticate with the Ethereum address
      const response = await api.post("/auth/login", {
        mode: "ethereum",
        ethereum_address: address,
        signature: signature,
      });

      // Store auth tokens
      localStorage.setItem("access_token", response.data.data.access_token);
      localStorage.setItem("refresh_token", response.data.data.refresh_token);
      localStorage.setItem("walletAddress", address);

      return response.data.data;
    } catch (error: any) {
      // If the error is 401 Unauthorized, the user doesn't exist yet
      if (error.response?.status === 401) {
        // Ask for email to create a new account
        const email = prompt("Please enter your email address to register:");
        if (!email) {
          throw new Error("Email is required for registration");
        }

        // Create a new user with the Ethereum address
        const firstName = prompt("Please enter your first name:") || "User";
        const lastName = prompt("Please enter your last name:") || "";

        // Generate a random password (user will authenticate with MetaMask)
        const password = Math.random().toString(36).slice(-10);

        // Register the user
        await registerUser(firstName, lastName, email, password, address);

        // Now try to log in again
        const loginResponse = await api.post("/auth/login", {
          mode: "ethereum",
          ethereum_address: address,
          signature: signature,
        });

        // Store auth tokens
        localStorage.setItem(
          "access_token",
          loginResponse.data.data.access_token
        );
        localStorage.setItem(
          "refresh_token",
          loginResponse.data.data.refresh_token
        );
        localStorage.setItem("walletAddress", address);

        return loginResponse.data.data;
      } else {
        throw error;
      }
    }
  } catch (error: any) {
    console.error("MetaMask authentication error:", error);
    throw new Error(
      error.response?.data?.errors?.[0]?.message ||
        "MetaMask authentication failed"
    );
  }
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const token = localStorage.getItem("access_token");
  if (!token) return null;

  try {
    const response = await api.get("/users/me", {
      params: {
        fields: [
          "id",
          "first_name",
          "last_name",
          "email",
          "ethereum_address",
          "is_voter",
          "is_verified",
          "verification_status",
          "avatar",
        ],
      },
    });

    return response.data.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

/**
 * Connect/link a MetaMask wallet to an existing account
 */
export const linkMetaMaskToAccount = async (): Promise<User> => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  try {
    // Force MetaMask to show the account selection modal by clearing any cached permissions
    await window.ethereum.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }],
    });

    // Request account access - this will show the account selection dialog
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found in MetaMask");
    }

    const address = accounts[0];

    // Get the user's signature to prove they own the address
    const signature = await signMessageWithMetaMask(address);

    // Update the user profile with the Ethereum address
    const response = await api.patch("/users/me", {
      ethereum_address: address,
    });

    localStorage.setItem("walletAddress", address);
    return response.data.data;
  } catch (error: any) {
    console.error("Error linking MetaMask:", error);
    throw new Error(
      error.response?.data?.errors?.[0]?.message ||
        "Failed to link MetaMask wallet"
    );
  }
};

/**
 * Update the current user's profile information
 */
export const updateUserProfile = async (
  userData: Partial<User>
): Promise<User> => {
  try {
    const response = await api.patch("/users/me", userData);
    return response.data.data;
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    throw new Error(
      error.response?.data?.errors?.[0]?.message ||
        error.response?.data?.message ||
        "Failed to update profile"
    );
  }
};

/**
 * Disconnect a MetaMask wallet from an account
 */
export const disconnectWallet = async (): Promise<User> => {
  try {
    const response = await api.patch("/users/me", {
      ethereum_address: null,
    });

    localStorage.removeItem("walletAddress");
    return response.data.data;
  } catch (error: any) {
    console.error("Error disconnecting wallet:", error);
    throw new Error(
      error.response?.data?.errors?.[0]?.message ||
        "Failed to disconnect wallet"
    );
  }
};

/**
 * Logout the current user
 */
export const logout = async (): Promise<void> => {
  const refreshToken = localStorage.getItem("refresh_token");

  try {
    if (refreshToken) {
      await api.post("/auth/logout", { refresh_token: refreshToken });
    }
  } catch (error) {
    console.error("Error during logout:", error);
  } finally {
    // Clear local storage regardless of API call success
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("votereumPrivateKey");
  }
};

/**
 * Refresh the access token
 */
export const refreshToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  try {
    const response = await api.post("/auth/refresh", {
      refresh_token: refreshToken,
    });

    localStorage.setItem("access_token", response.data.data.access_token);
    return response.data.data.access_token;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    throw new Error("Session expired. Please log in again.");
  }
};

/**
 * Request a password reset email
 */
export const requestPasswordReset = async (email: string): Promise<boolean> => {
  try {
    // Directus expects a POST to /auth/password/request with the email
    await api.post("/auth/password/request", {
      email: email,
    });

    return true;
  } catch (error: any) {
    console.error("Error requesting password reset:", error);
    throw new Error(
      error.response?.data?.errors?.[0]?.message ||
        error.response?.data?.message ||
        "Failed to request password reset"
    );
  }
};

/**
 * Reset password using token from email
 */
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<boolean> => {
  try {
    // Directus expects a POST to /auth/password/reset with token and new password
    await api.post("/auth/password/reset", {
      token: token,
      password: newPassword,
    });

    return true;
  } catch (error: any) {
    console.error("Error resetting password:", error);
    throw new Error(
      error.response?.data?.errors?.[0]?.message ||
        error.response?.data?.message ||
        "Failed to reset password"
    );
  }
};

// For TypeScript
declare global {
  interface Window {
    ethereum: any;
  }
}
