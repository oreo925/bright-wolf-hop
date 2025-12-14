"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircleMore } from "lucide-react";
import { Link } from "react-router-dom";

// Assuming types are defined in a central types file
interface Reflection {
  _id: string;
  userId: string;
  highText: string;
  lowText: string;
  buffaloText: string;
  createdAt: string;
  sharedWithType: string;
  sharedWithId?: string;
  reactions: Reaction[];
}
interface User {
  _id: string;
  displayName: string;
}
interface Herd {
  id: string;
  name: string;
}
interface Reaction {
  id: string;
  reflectionId: string;
  userId: string;
  reactionType: string;
}

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const HistoryPage = () => {
  const { user, token } = useAuth();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allHerds, setAllHerds] = useState<Herd[]>([]);
  const [allReactions, setAllReactions] = useState<Reaction[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (user && token) {
        try {
          const [reflectionsRes, usersRes, herdsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/reflections`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${API_BASE_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }), // Assuming endpoint for all users
            fetch(`${API_BASE_URL}/herds`, { headers: { Authorization: `Bearer ${token}` } }),
          ]);

          if (reflectionsRes.ok) {
            const reflectionsData = await reflectionsRes.json();
            console.log("Fetched reflections for History Page:", reflectionsData);
            setReflections(reflectionsData);
          }
          if (usersRes.ok) setAllUsers(await usersRes.json());
          if (herdsRes.ok) setAllHerds(await herdsRes.json());

        } catch (error) {
          console.error("Failed to fetch history data:", error);
        }
      }
    };

    fetchData();
  }, [user, token]);

  const getSharedWithInfo = (reflection: Reflection) => {
    if (reflection.sharedWithType === "self") {
      return "Only Me";
    } else if (reflection.sharedWithType === "friend" && reflection.sharedWithId) {
      const friend = allUsers.find(u => u._id === reflection.sharedWithId);
      return `Friend: ${friend?.displayName || "Unknown User"}`;
    } else if (reflection.sharedWithType === "herd" && reflection.sharedWithId) {
      const herd = allHerds.find(h => h.id === reflection.sharedWithId);
      return `Herd: ${herd?.name || "Unknown Herd"}`;
    }
    return "Unknown";
  };

  const getAuthorDisplayName = (userId: string) => {
    const author = allUsers.find(u => u._id === userId);
    return author?.displayName || "Unknown User";
  };

  const getReactionCount = (reflection: Reflection) => {
    return reflection.reactions.filter(reaction => reaction.reactionType === "tell_me_more").length;
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Reflection History</h1>

      {reflections.length === 0 ? (
        <Card className="text-center p-8">
          <CardTitle className="mb-2">No Reflections Yet!</CardTitle>
          <CardDescription className="mb-4">
            It looks like you haven't created or received any reflections. Start by creating a new one!
          </CardDescription>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reflections
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((reflection) => {
              const reactionCount = getReactionCount(reflection);

              return (
                <Card key={reflection._id} className="flex flex-col">
                  <Link to={`/reflections/${reflection._id}`} className="block h-full"> {/* Make card clickable */}
                    <CardHeader>
                      <div className="flex justify-between items-center mb-2">
                        <CardTitle className="text-xl">Reflection by {getAuthorDisplayName(reflection.userId)}</CardTitle>
                        <Badge variant="secondary">{getSharedWithInfo(reflection)}</Badge>
                      </div>
                      <CardDescription className="text-sm text-gray-500">
                        {new Date(reflection.createdAt).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg text-green-600 dark:text-green-400">High:</h3>
                        <p className="text-gray-700 dark:text-gray-300 line-clamp-2">{reflection.highText}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-red-600 dark:text-red-400">Low:</h3>
                        <p className="text-gray-700 dark:text-gray-300 line-clamp-2">{reflection.lowText}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-blue-600 dark:text-blue-400">Buffalo:</h3>
                        <p className="text-gray-700 dark:text-gray-300 line-clamp-2">{reflection.buffaloText}</p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <MessageCircleMore className="h-4 w-4 mr-1" />
                          {reactionCount} {reactionCount === 1 ? "reaction" : "reactions"}
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;