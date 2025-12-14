"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { PlusCircle, History, Users, MessageCircleMore } from "lucide-react";
import { MadeWithDyad } from "@/components/made-with-dyad"; // Import MadeWithDyad

interface Reflection {
  id: string;
  highText: string;
  lowText: string;
  buffaloText: string;
  createdAt: string;
}

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const HomePage = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [latestReflection, setLatestReflection] = useState<Reflection | null>(null);

  useEffect(() => {
    const fetchLatestReflection = async () => {
      if (user && token) {
        try {
          const response = await fetch(`${API_BASE_URL}/reflections`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const reflections = await response.json();
            if (reflections.length > 0) {
              setLatestReflection(reflections[0]);
            }
          }
        } catch (error) {
          console.error("Failed to fetch reflections:", error);
        }
      }
    };

    fetchLatestReflection();
  }, [user, token]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50">Welcome, {user?.displayName || "Guest"}!</h1>
        <Button onClick={handleLogout} variant="destructive">
          Logout
        </Button>
      </div>

      <p className="text-lg text-gray-700 dark:text-gray-300">
        Your personal space to reflect, connect, and grow.
      </p>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">New Reflection</CardTitle>
            <PlusCircle className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">Share your High, Low, and Buffalo moments.</CardDescription>
            <Link to="/create-reflection">
              <Button className="w-full">Create Now</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">View History</CardTitle>
            <History className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">Review your past reflections and reactions.</CardDescription>
            <Link to="/history">
              <Button variant="outline" className="w-full">Go to History</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Manage Herds</CardTitle>
            <Users className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">Connect with friends and manage your groups.</CardDescription>
            <Link to="/herds">
              <Button variant="outline" className="w-full">View Herds</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Latest Reflection Summary */}
      {latestReflection ? (
        <Card className="border-l-4 border-blue-500">
          <CardHeader>
            <CardTitle className="text-2xl">Your Latest Reflection</CardTitle>
            <CardDescription>{new Date(latestReflection.createdAt).toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg text-green-600 dark:text-green-400">High:</h3>
              <p className="text-gray-700 dark:text-gray-300 line-clamp-2">{latestReflection.highText}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-red-600 dark:text-red-400">Low:</h3>
              <p className="text-gray-700 dark:text-gray-300 line-clamp-2">{latestReflection.lowText}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-blue-600 dark:text-blue-400">Buffalo:</h3>
              <p className="text-gray-700 dark:text-gray-300 line-clamp-2">{latestReflection.buffaloText}</p>
            </div>
            <Link to={`/reflections/${latestReflection.id}`}>
              <Button variant="link" className="p-0 h-auto">
                Read Full Reflection <MessageCircleMore className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center p-8">
          <CardTitle className="mb-2">No Reflections Yet!</CardTitle>
          <CardDescription className="mb-4">
            Start by creating your first High, Low, Buffalo reflection.
          </CardDescription>
          <Link to="/create-reflection">
            <Button>Create First Reflection</Button>
          </Link>
        </Card>
      )}

      <MadeWithDyad />
    </div>
  );
};

export default HomePage;