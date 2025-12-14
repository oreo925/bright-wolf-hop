"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { showSuccess, showError } from "@/utils/toast";

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface User {
  id: string;
  email: string;
  displayName: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (email: string, displayName: string, password?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("jwt_token");
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
    }
  }, []);

  const fetchUserProfile = async (jwt: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        logout();
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      logout();
    }
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const { token: jwt } = await response.json();
        setToken(jwt);
        localStorage.setItem("jwt_token", jwt);
        await fetchUserProfile(jwt);
        return true;
      } else {
        const errorData = await response.json();
        showError(errorData.detail || "Invalid email or password.");
        return false;
      }
    } catch (error) {
      showError("Login failed.");
      return false;
    }
  };

  const register = async (email: string, displayName: string, password?: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, displayName, password }),
      });
      if (response.ok) {
        const { token: jwt } = await response.json();
        setToken(jwt);
        localStorage.setItem("jwt_token", jwt);
        await fetchUserProfile(jwt);
        return true;
      } else {
        const errorData = await response.json();
        showError(errorData.detail || "Registration failed.");
        return false;
      }
    } catch (error) {
      showError("Registration failed.");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("jwt_token");
    showSuccess("Logged out successfully!");
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};