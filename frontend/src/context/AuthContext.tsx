import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  loginWithCredentials,
  registerUser,
  authenticateWithMetaMask,
  logout,
  getCurrentUser,
  linkMetaMaskToAccount,
} from "../utils/auth";
import type { User } from "../utils/auth";

// Define AuthState interface locally to avoid import issues
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

interface AuthContextProps {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => Promise<void>;
  connectWithMetaMask: () => Promise<void>;
  linkWallet: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: localStorage.getItem("access_token"),
    refreshToken: localStorage.getItem("refresh_token"),
    isAuthenticated: !!localStorage.getItem("access_token"),
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initial auth state check
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        if (authState.accessToken) {
          const user = await getCurrentUser();
          if (user) {
            setAuthState({
              user,
              accessToken: authState.accessToken,
              refreshToken: authState.refreshToken,
              isAuthenticated: true,
            });
          } else {
            // If we have a token but can't get the user, tokens might be invalid
            await signOut();
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Reset auth state if there's an error
        setAuthState({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginWithCredentials(email, password);
      setAuthState({
        user: response.user,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        isAuthenticated: true,
      });
    } catch (err: any) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Starting registration process");
      const user = await registerUser(firstName, lastName, email, password);
      console.log("Registration successful:", user);

      // After registration, log user in
      await login(email, password);
    } catch (err: any) {
      console.error("Registration failed:", err);

      // Set a more user-friendly error message
      if (
        err.message.includes("User with this email already exists") ||
        err.message.includes("duplicate key")
      ) {
        setError("An account with this email address already exists.");
      } else if (
        err.message.includes("network") ||
        err.message.includes("fetch")
      ) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(err.message || "Registration failed. Please try again.");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const connectWithMetaMask = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authenticateWithMetaMask();
      setAuthState({
        user: response.user,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        isAuthenticated: true,
      });
    } catch (err: any) {
      setError(err.message || "MetaMask authentication failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const linkWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await linkMetaMaskToAccount();
      setAuthState((prev) => ({
        ...prev,
        user: updatedUser,
      }));
    } catch (err: any) {
      setError(err.message || "Failed to link wallet");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await logout();
      setAuthState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    } catch (err: any) {
      setError(err.message || "Logout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        register,
        connectWithMetaMask,
        linkWallet,
        signOut,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
