"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { showSuccess, showError } from "@/utils/toast";
import { X } from "lucide-react";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/v1/`;

interface User {
  _id: string;
  displayName: string;
  email: string;
}

const FriendsPage = () => {
  const { user, token } = useAuth();
  const [friends, setFriends] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [friendEmail, setFriendEmail] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (user && token) {
        try {
          const [friendsRes, usersRes] = await Promise.all([
            fetch(`${API_BASE_URL}friends`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${API_BASE_URL}users`, { headers: { Authorization: `Bearer ${token}` } }),
          ]);
          const friendsData = await friendsRes.json();
          const usersData = await usersRes.json();
          if (friendsRes.ok) {
            setFriends(friendsData);
          }
          if (usersRes.ok) {
            setAllUsers(usersData);
          }
        } catch (error) {
          console.error("Failed to fetch data:", error);
        }
      }
    };
    fetchData();
  }, [user, token]);

  const handleAddFriend = async () => {
    if (!friendEmail) {
      showError("Please enter an email address.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}users/email/${friendEmail}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const friendToAdd = await response.json();
        if (friendToAdd && friendToAdd._id) {
          const addFriendResponse = await fetch(`${API_BASE_URL}friends/add/${friendToAdd._id}`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (addFriendResponse.ok) {
            showSuccess("Friend request sent successfully.");
            // Refresh friends list
            const friendsRes = await fetch(`${API_BASE_URL}friends`, { headers: { Authorization: `Bearer ${token}` } });
            if (friendsRes.ok) {
              setFriends(await friendsRes.json());
            }
          } else {
            const errorData = await addFriendResponse.json();
            showError(errorData.detail || "Failed to send friend request.");
          }
        } else {
          showError("Could not find user to add.");
        }
      } else {
        showError("User not found or not registered.");
      }
    } catch (error) {
      showError("Failed to add friend.");
    }
    setFriendEmail("");
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}friends/remove/${friendId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const friendsRes = await fetch(`${API_BASE_URL}friends`, { headers: { Authorization: `Bearer ${token}` } });
        if (friendsRes.ok) {
          setFriends(await friendsRes.json());
        }
        showSuccess("Friend removed.");
      }
    } catch (error) {
      showError("Failed to remove friend.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Your Friends</h1>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add a Friend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              type="email"
              placeholder="friend@example.com"
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
            />
            <Button onClick={handleAddFriend}>Add Friend</Button>
          </div>
        </CardContent>
      </Card>
      <Card className="w-full max-w-2xl mx-auto mt-6">
        <CardHeader>
          <CardTitle>Your Friends</CardTitle>
        </CardHeader>
        <CardContent>
          {friends.length === 0 ? (
            <p>You haven't added any friends yet.</p>
          ) : (
            <div className="grid gap-4">
              {friends.map((friend) => (
                <div key={friend._id} className="flex items-center justify-between">
                  <span>{friend.displayName}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFriend(friend._id)}
                    className="text-red-500 hover:bg-red-500/10"
                  >
                    <X className="h-4 w-4" /> Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FriendsPage;