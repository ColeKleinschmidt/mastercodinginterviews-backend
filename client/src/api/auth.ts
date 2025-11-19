import axios from 'axios';
import { AxiosError } from 'axios';

export type AuthUser = {
  id?: string;
  email: string;
  name?: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

const TOKEN_KEY = 'mci_auth_token';

const client = axios.create({ baseURL: '/api/auth' });

export const getStoredToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string | null) => {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem(TOKEN_KEY);
    delete client.defaults.headers.common.Authorization;
  }
};

export const signup = async (payload: { name: string; email: string; password: string }) => {
  const { data } = await client.post<AuthResponse>('/signup', payload);
  return data;
};

export const login = async (payload: { email: string; password: string }) => {
  const { data } = await client.post<AuthResponse>('/login', payload);
  return data;
};

export const fetchCurrentUser = async () => {
  const { data } = await client.get<AuthUser>('/me');
  return data;
};

export const extractErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError && error.response?.data) {
    const responseData = error.response.data as { message?: string };
    return responseData.message ?? 'Request failed';
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
};
