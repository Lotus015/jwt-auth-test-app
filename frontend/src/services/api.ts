import axios from 'axios';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for auth API
export interface User {
  id: number;
  username: string;
  email: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface MeResponse {
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
}

// Auth API methods
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  refresh: async (): Promise<RefreshResponse> => {
    const response = await api.post<RefreshResponse>('/auth/refresh');
    return response.data;
  },

  me: async (accessToken: string): Promise<MeResponse> => {
    const response = await api.get<MeResponse>('/auth/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },
};
