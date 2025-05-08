// API service for connecting to Directus backend
// Note: You'll need to install axios with: npm install axios

// Use a dynamic import for axios to avoid crashing if not installed
const getAxios = async () => {
  try {
    return await import("axios").then((module) => module.default);
  } catch (error) {
    console.error("Axios not installed. Using fallback mode.", error);
    return null;
  }
};

// Define the base URL from environment variable or use a default
const DIRECTUS_URL =
  import.meta.env.VITE_DIRECTUS_URL || "http://localhost:8055";

// Mock data for when the API is unavailable
const mockElections = [
  {
    id: "1",
    title: "Presidential Election",
    description: "Vote for the next president of the country.",
    start_date: "2025-05-20T00:00:00.000Z",
    end_date: "2025-06-20T00:00:00.000Z",
    smart_contract_address: "0x1234...",
    status: "published",
    date_created: "2025-01-01T00:00:00.000Z",
    user_created: "admin",
  },
  {
    id: "2",
    title: "Local Board Election",
    description: "Election for local community board members.",
    start_date: "2025-05-01T00:00:00.000Z",
    end_date: "2025-05-30T00:00:00.000Z",
    smart_contract_address: "0x5678...",
    status: "published",
    date_created: "2025-01-15T00:00:00.000Z",
    user_created: "admin",
  },
  {
    id: "3",
    title: "Student Council",
    description: "Vote for student representatives.",
    start_date: "2025-06-01T00:00:00.000Z",
    end_date: "2025-06-15T00:00:00.000Z",
    smart_contract_address: "0xabcd...",
    status: "published",
    date_created: "2025-02-01T00:00:00.000Z",
    user_created: "admin",
  },
  {
    id: "4",
    title: "Corporate Board Election",
    description: "Annual election for board of directors.",
    start_date: "2025-04-05T00:00:00.000Z",
    end_date: "2025-05-05T00:00:00.000Z",
    smart_contract_address: "0xef01...",
    status: "published",
    date_created: "2025-03-01T00:00:00.000Z",
    user_created: "admin",
  },
];

const mockCandidates = {
  "1": [
    {
      id: "101",
      name: "Candidate 1",
      description: "Presidential candidate.",
      election_id: "1",
    },
    {
      id: "102",
      name: "Candidate 2",
      description: "Presidential candidate.",
      election_id: "1",
    },
    {
      id: "103",
      name: "Candidate 3",
      description: "Presidential candidate.",
      election_id: "1",
    },
    {
      id: "104",
      name: "Candidate 4",
      description: "Presidential candidate.",
      election_id: "1",
    },
    {
      id: "105",
      name: "Candidate 5",
      description: "Presidential candidate.",
      election_id: "1",
    },
  ],
  "2": [
    {
      id: "201",
      name: "Candidate A",
      description: "Board candidate.",
      election_id: "2",
    },
    {
      id: "202",
      name: "Candidate B",
      description: "Board candidate.",
      election_id: "2",
    },
    {
      id: "203",
      name: "Candidate C",
      description: "Board candidate.",
      election_id: "2",
    },
    {
      id: "204",
      name: "Candidate D",
      description: "Board candidate.",
      election_id: "2",
    },
  ],
  "3": [
    {
      id: "301",
      name: "Student A",
      description: "Student council candidate.",
      election_id: "3",
    },
    {
      id: "302",
      name: "Student B",
      description: "Student council candidate.",
      election_id: "3",
    },
    {
      id: "303",
      name: "Student C",
      description: "Student council candidate.",
      election_id: "3",
    },
  ],
  "4": [
    {
      id: "401",
      name: "Board Member A",
      description: "Corporate board candidate.",
      election_id: "4",
    },
    {
      id: "402",
      name: "Board Member B",
      description: "Corporate board candidate.",
      election_id: "4",
    },
    {
      id: "403",
      name: "Board Member C",
      description: "Corporate board candidate.",
      election_id: "4",
    },
    {
      id: "404",
      name: "Board Member D",
      description: "Corporate board candidate.",
      election_id: "4",
    },
    {
      id: "405",
      name: "Board Member E",
      description: "Corporate board candidate.",
      election_id: "4",
    },
    {
      id: "406",
      name: "Board Member F",
      description: "Corporate board candidate.",
      election_id: "4",
    },
  ],
};

// Create axios instance with default config if possible
let apiClient: any = null;

// Types based on your Directus schema
export interface Election {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  smart_contract_address: string;
  status: "published" | "draft" | "archived";
  date_created?: string;
  user_created?: string;
}

export interface Candidate {
  id: string;
  name: string;
  description: string;
  election_id: string;
  profile_image?: string;
  sort?: number;
}

export interface VoteRecord {
  id: string;
  election_id: string;
  candidate_id: string;
  voter_address: string;
  tx_hash: string;
  timestamp: string;
  block_number: number;
  vote_type: "online" | "manual" | "smart_contract";
  validity: boolean;
  status: "published" | "draft" | "archived";
}

// Elections API functions
export const electionsAPI = {
  // Initialize the API client if needed
  init: async () => {
    try {
      const axios = await getAxios();
      if (axios) {
        apiClient = axios.create({
          baseURL: DIRECTUS_URL,
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Add a request interceptor for authentication
        apiClient.interceptors.request.use(
          (config: any) => {
            // Get the auth token from localStorage if it exists
            const token = localStorage.getItem("authToken");
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
          },
          (error: any) => {
            return Promise.reject(error);
          }
        );
      }
      return !!apiClient;
    } catch (e) {
      console.error("Failed to initialize API client:", e);
      return false;
    }
  },
  // Create a new election
  createElection: async (electionData: Partial<Election>) => {
    try {
      if (!apiClient) {
        await electionsAPI.init();
      }

      if (apiClient) {
        const response = await apiClient.post("/items/elections", {
          ...electionData,
          status: "published",
        });
        return response.data.data;
      }

      // Fallback if no API client
      console.log("Mock creating election:", electionData);
      return { ...electionData, id: "mock-election-" + Date.now() };
    } catch (error) {
      console.error("Error creating election:", error);
      throw error;
    }
  },

  // Create a new candidate
  createCandidate: async (candidateData: Partial<Candidate>) => {
    try {
      if (!apiClient) {
        await electionsAPI.init();
      }

      if (apiClient) {
        const response = await apiClient.post("/items/candidates", {
          ...candidateData,
          status: "published",
        });
        return response.data.data;
      }

      // Fallback if no API
      console.log("Mock creating candidate:", candidateData);
      return { ...candidateData, id: "mock-candidate-" + Date.now() };
    } catch (error) {
      console.error("Error creating candidate:", error);
      throw error;
    }
  },

  // Get all elections with optional filters
  getElections: async (filters?: any) => {
    try {
      if (!apiClient) {
        await electionsAPI.init();
      }

      if (apiClient) {
        const response = await apiClient.get("/items/elections", {
          params: {
            filter: filters,
            sort: "-date_created",
          },
        });
        return response.data.data;
      }

      // Use mock data if API client is not available
      console.log("Using mock election data");
      return mockElections;
    } catch (error) {
      console.error("Error fetching elections:", error);
      // Fallback to mock data
      console.log("Error occurred, using mock election data");
      return mockElections;
    }
  },

  // Get a single election by ID
  getElection: async (id: string) => {
    try {
      if (!apiClient) {
        await electionsAPI.init();
      }

      if (apiClient) {
        const response = await apiClient.get(`/items/elections/${id}`);
        return response.data.data;
      }

      // Use mock data if API client is not available
      return mockElections.find((e) => e.id === id);
    } catch (error) {
      console.error(`Error fetching election with ID ${id}:`, error);
      // Fallback to mock data
      return mockElections.find((e) => e.id === id);
    }
  },

  // Get candidates for a specific election
  getCandidates: async (electionId: string) => {
    try {
      if (!apiClient) {
        await electionsAPI.init();
      }

      if (apiClient) {
        const response = await apiClient.get("/items/candidates", {
          params: {
            filter: { election_id: { _eq: electionId } },
          },
        });
        return response.data.data;
      }

      // Use mock data if API client is not available
      return mockCandidates[electionId as keyof typeof mockCandidates] || [];
    } catch (error) {
      console.error(
        `Error fetching candidates for election ${electionId}:`,
        error
      );
      // Fallback to mock data
      return mockCandidates[electionId as keyof typeof mockCandidates] || [];
    }
  },

  // Record a vote in the backend
  recordVote: async (voteData: Partial<VoteRecord>) => {
    try {
      if (!apiClient) {
        await electionsAPI.init();
      }

      if (apiClient) {
        const response = await apiClient.post("/items/vote_records", {
          ...voteData,
          status: "published",
          timestamp: new Date().toISOString(),
        });
        return response.data.data;
      }

      // Mock response if API client is not available
      console.log("Mock recording vote:", voteData);
      return { ...voteData, id: "mock-vote-" + Date.now() };
    } catch (error) {
      console.error("Error recording vote:", error);
      // Return a mock response
      return { ...voteData, id: "error-vote-" + Date.now() };
    }
  },

  // Get vote records for a user
  getUserVotes: async (voterAddress: string) => {
    try {
      if (!apiClient) {
        await electionsAPI.init();
      }

      if (apiClient) {
        const response = await apiClient.get("/items/vote_records", {
          params: {
            filter: { voter_address: { _eq: voterAddress } },
          },
        });
        return response.data.data;
      }

      // Mock response if API client is not available
      return [];
    } catch (error) {
      console.error(`Error fetching votes for user ${voterAddress}:`, error);
      return [];
    }
  },

  // Check if a user has voted in a specific election
  hasVoted: async (electionId: string, voterAddress: string) => {
    try {
      if (!apiClient) {
        await electionsAPI.init();
      }

      if (apiClient) {
        const response = await apiClient.get("/items/vote_records", {
          params: {
            filter: {
              _and: [
                { election_id: { _eq: electionId } },
                { voter_address: { _eq: voterAddress } },
              ],
            },
            limit: 1,
          },
        });
        return response.data.data.length > 0;
      }

      // Mock response if API client is not available
      return false;
    } catch (error) {
      console.error(
        `Error checking if user ${voterAddress} has voted in election ${electionId}:`,
        error
      );
      return false;
    }
  },

  // Update an existing election
  updateElection: async (id: string, updateData: Partial<Election>) => {
    try {
      if (!apiClient) {
        await electionsAPI.init();
      }

      if (apiClient) {
        const response = await apiClient.patch(
          `/items/elections/${id}`,
          updateData
        );
        return response.data.data;
      }

      // Fallback if no API client
      console.log("Mock updating election:", id, updateData);
      return { id, ...updateData };
    } catch (error) {
      console.error(`Error updating election ${id}:`, error);
      throw error;
    }
  },

  // Update a candidate
  updateCandidate: async (id: string, updateData: Partial<Candidate>) => {
    try {
      if (!apiClient) {
        await electionsAPI.init();
      }

      if (apiClient) {
        const response = await apiClient.patch(
          `/items/candidates/${id}`,
          updateData
        );
        return response.data.data;
      }

      // Fallback if no API client
      console.log("Mock updating candidate:", id, updateData);
      return { id, ...updateData };
    } catch (error) {
      console.error(`Error updating candidate ${id}:`, error);
      throw error;
    }
  },
};

export default electionsAPI;
