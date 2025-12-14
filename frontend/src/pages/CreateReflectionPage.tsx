"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { showSuccess, showError } from "@/utils/toast";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/v1/`;

interface User {
  id: string;
  displayName: string;
  email: string;
}

interface Herd {
  id: string;
  name: string;
}

const CreateReflectionPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [highText, setHighText] = useState("");
  const [lowText, setLowText] = useState("");
  const [buffaloText, setBuffaloText] = useState("");
  const [sharedWithType, setSharedWithType] = useState<"self" | "friend" | "herd">("self");
  const [sharedWithId, setSharedWithId] = useState<string | undefined>(undefined);

  const [friends, setFriends] = useState<User[]>([]);
  const [userHerds, setUserHerds] = useState<Herd[]>([]);
  const [selectedHerds, setSelectedHerds] = useState<string[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (user && token) {
        try {
          const [friendsRes, herdsRes] = await Promise.all([
            fetch(`${API_BASE_URL}friends/`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${API_BASE_URL}herds`, { headers: { Authorization: `Bearer ${token}` } }),
          ]);
          if (friendsRes.ok) {
            setFriends(await friendsRes.json());
          }
          if (herdsRes.ok) {
            setUserHerds(await herdsRes.json());
          }
        } catch (error) {
          console.error("Failed to fetch users and herds:", error);
        }
      }
    };
    fetchData();
  }, [user, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !token) {
      showError("You must be logged in to create a reflection.");
      return;
    }

    if (!highText.trim() || !lowText.trim() || !buffaloText.trim()) {
      showError("All High, Low, and Buffalo fields are required.");
      return;
    }

    let finalSharedWithIds: string[] = [];
    if (sharedWithType === "friend") {
      if (selectedFriends.length === 0) {
        showError(`Please select at least one friend to share with.`);
        return;
      }
      finalSharedWithIds = selectedFriends;
    } else if (sharedWithType === "herd") {
      if (selectedHerds.length === 0) {
        showError(`Please select at least one herd to share with.`);
        return;
      }
      finalSharedWithIds = selectedHerds;
    }

    const reflectionData = {
      highText: highText.trim(),
      lowText: lowText.trim(),
      buffaloText: buffaloText.trim(),
      sharedWithType,
      sharedWithIds: finalSharedWithIds,
    };

    try {
      const response = await fetch(`${API_BASE_URL}reflections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reflectionData),
      });

      if (response.ok) {
        showSuccess("Reflection created successfully!");
        navigate("/history");
      } else {
        showError("Failed to create reflection.");
      }
    } catch (error) {
      showError("Failed to create reflection.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">New Reflection</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="high">High (What went well?)</Label>
              <Textarea
                id="high"
                placeholder="Describe your high moment..."
                value={highText}
                onChange={(e) => setHighText(e.target.value)}
                required
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="low">Low (What was challenging?)</Label>
              <Textarea
                id="low"
                placeholder="Describe your low moment..."
                value={lowText}
                onChange={(e) => setLowText(e.target.value)}
                required
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="buffalo">Buffalo (What are you looking forward to?)</Label>
              <Textarea
                id="buffalo"
                placeholder="Describe your buffalo moment..."
                value={buffaloText}
                onChange={(e) => setBuffaloText(e.target.value)}
                required
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="shareWith">Share With</Label>
              <Select value={sharedWithType} onValueChange={(value: "self" | "friend" | "herd") => {
                setSharedWithType(value);
                setSharedWithId(undefined); // Reset sharedWithId when type changes
              }}>
                <SelectTrigger id="shareWith">
                  <SelectValue placeholder="Select sharing option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="self">Only Me</SelectItem>
                  <SelectItem value="friend">A Friend</SelectItem>
                  <SelectItem value="herd">A Herd</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(sharedWithType === "friend" && friends.length > 0) && (
              <div className="grid gap-2">
                <Label>Select Friends</Label>
                <div className="grid gap-2">
                  {friends.map(f => (
                    <div key={f.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={f.id}
                        checked={selectedFriends.includes(f.id)}
                        onChange={() => {
                          setSelectedFriends(prev =>
                            prev.includes(f.id)
                              ? prev.filter(id => id !== f.id)
                              : [...prev, f.id]
                          );
                        }}
                      />
                      <Label htmlFor={f.id}>{f.displayName} ({f.email})</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(sharedWithType === "herd" && userHerds.length > 0) && (
              <div className="grid gap-2">
                <Label>Select Herds</Label>
                <div className="grid gap-2">
                  {userHerds.map(h => (
                    <div key={h.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={h.id}
                        checked={selectedHerds.includes(h.id)}
                        onChange={() => {
                          setSelectedHerds(prev =>
                            prev.includes(h.id)
                              ? prev.filter(id => id !== h.id)
                              : [...prev, h.id]
                          );
                        }}
                      />
                      <Label htmlFor={h.id}>{h.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(sharedWithType === "friend" && friends.length === 0) && (
              <p className="text-sm text-muted-foreground">You haven't added any friends yet.</p>
            )}
            {(sharedWithType === "herd" && userHerds.length === 0) && (
              <p className="text-sm text-muted-foreground">You are not part of any herds. Create one first!</p>
            )}

            <Button type="submit" className="w-full">
              Share Reflection
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/home")} className="w-full">
              Cancel
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateReflectionPage;