// Base API service for Directus REST API interactions

// Default API base URL - replace with your Directus instance URL
const API_URL = import.meta.env.VITE_DIRECTUS_URL || "http://localhost:8055";

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }
  return response.json();
};

// Generic request function with authentication
const request = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("auth_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  return fetch(`${API_URL}${endpoint}`, config).then(handleResponse);
};

// API service methods
export const api = {
  // Auth methods
  auth: {
    login: (email: string, password: string) => {
      return request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
    },
    logout: () => {
      return request("/auth/logout", { method: "POST" });
    },
    refreshToken: () => {
      return request("/auth/refresh", { method: "POST" });
    },
    getCurrentUser: () => {
      return request("/users/me?fields=*");
    },
  },

  // Elections
  elections: {
    getAll: (params = {}) => {
      const queryParams = new URLSearchParams(
        params as Record<string, string>
      ).toString();
      return request(`/items/elections?${queryParams}`);
    },
    getById: (id: string) => {
      return request(`/items/elections/${id}`);
    },
    create: (data: any) => {
      return request("/items/elections", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    update: (id: string, data: any) => {
      return request(`/items/elections/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
  },

  // Candidates
  candidates: {
    getAll: (params = {}) => {
      const queryParams = new URLSearchParams(
        params as Record<string, string>
      ).toString();
      return request(`/items/candidates?${queryParams}`);
    },
    getByElection: (electionId: string) => {
      return request(
        `/items/candidates?filter={"election":{"_eq":"${electionId}"}}`
      );
    },
  },

  // Votes
  votes: {
    submit: (data: any) => {
      return request("/items/votes", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    getResults: (electionId: string) => {
      return request(
        `/items/votes?filter={"election":{"_eq":"${electionId}"}}&aggregate={"count":"*","groupBy":["candidate_id"]}`
      );
    },
  },

  // Dashboard stats
  stats: {
    getElectionStats: () => {
      return request("/items/election_stats");
    },
  },
};

export default api;
