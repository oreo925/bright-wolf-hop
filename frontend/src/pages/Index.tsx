"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AuthPage from "./AuthPage";
import HomePage from "./HomePage";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to /home if authenticated, otherwise stay on AuthPage (which is rendered below)
    if (isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // If not authenticated, render the AuthPage directly.
  // If authenticated, the useEffect will redirect to /home, which will then render HomePage.
  // This ensures the root path always leads to the correct initial experience.
  return isAuthenticated ? <HomePage /> : <AuthPage />;
};

export default Index;