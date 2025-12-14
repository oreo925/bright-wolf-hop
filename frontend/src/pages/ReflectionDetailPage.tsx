"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircleMore } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { showSuccess, showError } from "@/utils/toast";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

interface Reflection {
  id: string;
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
  userId: string;
  reactionType: string;
}

const ReflectionDetailPage = () => {
  const { reflectionId } = useParams<{ reflectionId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [reflection, setReflection] = useState<Reflection | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allHerds, setAllHerds] = useState<Herd[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (reflectionId && token && reflectionId !== "undefined") {
        try {
          const [reflectionRes, usersRes, herdsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/reflections/${reflectionId}`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${API_BASE_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${API_BASE_URL}/herds`, { headers: { Authorization: `Bearer ${token}` } }),
          ]);

          if (reflectionRes.ok) {
            setReflection(await reflectionRes.json());
          } else {
            showError("Reflection not found.");
            navigate("/history");
          }
          if (usersRes.ok) setAllUsers(await usersRes.json());
          if (herdsRes.ok) setAllHerds(await herdsRes.json());
        } catch (error) {
          console.error("Failed to fetch reflection details:", error);
          showError("Failed to fetch reflection details.");
          navigate("/history");
        }
      }
    };
    fetchData();
  }, [reflectionId, token, navigate]);

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

  const handleReact = async (reflectionId: string) => {
    if (!user || !token) {
      showError("You must be logged in to react.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/reflections/${reflectionId}/react`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reactionType: "tell_me_more" }),
      });
      if (response.ok) {
        const newReaction = await response.json();
        setReflection(prev => prev ? { ...prev, reactions: [...prev.reactions, newReaction] } : null);
        showSuccess("Reaction added!");
      } else {
        showError("You have already reacted to this reflection.");
      }
    } catch (error) {
      showError("Failed to add reaction.");
    }
  };

  if (!reflection) {
    return <div className="p-6 text-center">Loading reflection details...</div>;
  }

  const isAuthor = user?.id === reflection.userId;
  const reactionsForThisReflection = reflection.reactions.filter(r => r.reactionType === "tell_me_more");
  const hasUserReacted = reactionsForThisReflection.some((r: Reaction) => r.userId === user?.id);

  return (
    <div className="p-6">
      <Button variant="outline" onClick={() => navigate("/history")} className="mb-4">
        &larr; Back to History
      </Button>

      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <CardTitle className="text-2xl">Reflection by {getAuthorDisplayName(reflection.userId)}</CardTitle>
            <Badge variant="secondary">{getSharedWithInfo(reflection)}</Badge>
          </div>
          <CardDescription className="text-sm text-gray-500">
            {new Date(reflection.createdAt).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-xl text-green-600 dark:text-green-400">High:</h3>
            <p className="text-gray-700 dark:text-gray-300">{reflection.highText}</p>
          </div>
          <div>
            <h3 className="font-semibold text-xl text-red-600 dark:text-red-400">Low:</h3>
            <p className="text-gray-700 dark:text-gray-300">{reflection.lowText}</p>
          </div>
          <div>
            <h3 className="font-semibold text-xl text-blue-600 dark:text-blue-400">Buffalo:</h3>
            <p className="text-gray-700 dark:text-gray-300">{reflection.buffaloText}</p>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-lg mb-3">Reactions ({reactionsForThisReflection.length})</h3>
            {reactionsForThisReflection.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reactions yet.</p>
            ) : (
              <div className="space-y-2">
                {reactionsForThisReflection.map((reaction: Reaction) => (
                  <div key={reaction.id} className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <MessageCircleMore className="h-4 w-4 mr-2 text-blue-500" />
                    <span>
                      <span className="font-medium">{getAuthorDisplayName(reaction.userId)}</span> wants to hear more!
                    </span>
                  </div>
                ))}
              </div>
            )}

            {!isAuthor && !hasUserReacted && (
              <Button
                className="mt-4"
                onClick={() => handleReact(reflection.id)}
              >
                <MessageCircleMore className="h-4 w-4 mr-2" />
                Tell me more
              </Button>
            )}
            {!isAuthor && hasUserReacted && (
              <Button variant="ghost" disabled className="mt-4 text-gray-500 dark:text-gray-600 cursor-not-allowed">
                <MessageCircleMore className="h-4 w-4 mr-2" />
                You've reacted
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReflectionDetailPage;