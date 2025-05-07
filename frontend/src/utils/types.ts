// User-related type definitions

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

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}
