
import { create } from 'zustand';
import { User } from '../types';
import { MOCK_USER } from '../constants';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => void; // Simulate checking auth status on app load
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem('authToken'),
  login: (token, user) => {
    localStorage.setItem('authToken', token);
    set({ isAuthenticated: true, user, token });
  },
  logout: () => {
    localStorage.removeItem('authToken');
    set({ isAuthenticated: false, user: null, token: null });
  },
  checkAuth: () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // In a real app, you'd verify the token with a backend
      // For mock purposes, if token exists, consider authenticated
      set({ isAuthenticated: true, user: MOCK_USER, token });
    } else {
      set({ isAuthenticated: false, user: null, token: null });
    }
  }
}));

// Initialize auth check when store is created (app loads)
useAuthStore.getState().checkAuth();
