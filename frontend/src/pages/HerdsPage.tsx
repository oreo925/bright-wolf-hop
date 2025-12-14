"use client";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { PlusCircle } from "lucide-react";

// Assuming User and Herd types are defined in a types file, e.g., @/types.ts
// For now, let's define them here for simplicity.
interface User {
  id: string;
  displayName: string;
  email: string;
}

interface Herd {
  _id: string;
  name: string;
  ownerId: string;
  memberIds: string[];
  members?: User[];
}

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

const HerdsPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [herds, setHerds] = useState<Herd[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]); // To store user details for member names

  useEffect(() => {
    const fetchHerdsAndUsers = async () => {
      if (user && token) {
        try {
          // Fetch all users to resolve member names
          const usersResponse = await fetch(`${API_BASE_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            console.log("Fetched all users:", usersData);
            setAllUsers(usersData);
          }

          // Fetch herds for the current user
          const herdsResponse = await fetch(`${API_BASE_URL}/herds`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (herdsResponse.ok) {
            const herdsData = await herdsResponse.json();
            console.log("Fetched herds:", herdsData);
            setHerds(herdsData);
          }
        } catch (error) {
          console.error("Failed to fetch data:", error);
        }
      }
    };

    fetchHerdsAndUsers();
  }, [user, token]);

  const getMemberDisplayNames = (members: User[] | undefined) => {
    if (!members) {
      return "";
    }
    return members.map(m => m.displayName).join(", ");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Herds</h1>
        <Button onClick={() => navigate("/create-herd")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Herd
        </Button>
      </div>

      {herds.length === 0 ? (
        <Card className="text-center p-8">
          <CardTitle className="mb-2">No Herds Yet!</CardTitle>
          <CardDescription className="mb-4">
            It looks like you haven't created or joined any herds. Start by creating one!
          </CardDescription>
          <Button onClick={() => navigate("/create-herd")}>
            Create Your First Herd
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {herds.map((herd) => (
            <Card key={herd._id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{herd.name}</CardTitle>
                <CardDescription>
                  {herd.ownerId === user?.id ? "You are the owner" : "Member"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Members: {getMemberDisplayNames(herd.members)}
                </p>
                <Link to={`/herds/${herd._id}`}>
                  <Button variant="outline" className="w-full">
                    View Herd
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HerdsPage;