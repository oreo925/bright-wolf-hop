"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { showSuccess, showError } from "@/utils/toast";
import { X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

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
  memberEmails?: string[];
}

const HerdDetailPage = () => {
  const { herdId } = useParams<{ herdId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [herd, setHerd] = useState<Herd | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newHerdName, setNewHerdName] = useState("");
  const [invitedMemberEmail, setInvitedMemberEmail] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (herdId && token && herdId !== "undefined") {
        try {
          const [herdRes, usersRes] = await Promise.all([
            fetch(`${API_BASE_URL}/herds/${herdId}`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${API_BASE_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
          ]);

          if (herdRes.ok) {
            const herdData = await herdRes.json();
            setHerd(herdData);
            setNewHerdName(herdData.name);
          } else {
            showError("Herd not found.");
            navigate("/herds");
          }

          if (usersRes.ok) {
            setAllUsers(await usersRes.json());
          }
        } catch (error) {
          console.error("Failed to fetch herd details:", error);
          showError("Failed to fetch herd details.");
          navigate("/herds");
        }
      }
    };
    fetchData();
  }, [herdId, token, navigate]);

  const isOwner = user?.id === herd?.ownerId;

  const handleUpdateHerd = async (updatedFields: Partial<Herd> & { memberEmails?: string[] }) => {
    if (!herd || !token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/herds/${herd._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFields),
      });
      if (response.ok) {
        const updatedHerd = await response.json();
        setHerd(updatedHerd);
        showSuccess("Herd updated successfully!");
      } else {
        showError("Failed to update herd.");
      }
    } catch (error) {
      showError("Failed to update herd.");
    }
  };

  const handleRenameHerd = () => {
    if (!newHerdName.trim()) {
      showError("Herd name cannot be empty.");
      return;
    }
    handleUpdateHerd({ name: newHerdName.trim() });
    setIsEditingName(false);
  };

  const handleAddMember = async () => {
    if (!invitedMemberEmail) {
      showError("Please enter an email address.");
      return;
    }
    if (invitedMemberEmail === user?.email) {
      showError("You cannot add yourself to a herd.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/users/email/${invitedMemberEmail}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const userToAdd = await response.json();
        if (herd && herd.memberIds.includes(userToAdd.id)) {
          showError("User is already a member of this herd.");
          return;
        }
        const updatedMemberIds = herd ? [...herd.memberIds, userToAdd.id] : [userToAdd.id];
        const updatedMemberEmails = updatedMemberIds.map(id => {
          const user = allUsers.find(u => u.id === id);
          return user ? user.email : null;
        }).filter(Boolean) as string[];
        handleUpdateHerd({ memberEmails: updatedMemberEmails });
        setInvitedMemberEmail("");
      } else {
        showError("User not found or not registered.");
      }
    } catch (error) {
      showError("Failed to add user.");
    }
  };

  const handleRemoveMember = (memberIdToRemove: string) => {
    if (!herd) return;
    const updatedMemberIds = herd.memberIds.filter(id => id !== memberIdToRemove);
    const updatedMemberEmails = updatedMemberIds.map(id => allUsers.find(u => u.id === id)?.email).filter(Boolean) as string[];
    handleUpdateHerd({ memberEmails: updatedMemberEmails });
  };

  const handleLeaveHerd = async () => {
    if (!herd || !token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/herds/${herd._id}/leave`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        showSuccess("You have left the herd.");
        navigate("/herds");
      } else {
        showError("Failed to leave herd.");
      }
    } catch (error) {
      showError("Failed to leave herd.");
    }
  };

  const handleDeleteHerd = async () => {
    if (!herd || !token) return;
    try {
      await fetch(`${API_BASE_URL}/herds/${herd._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      showSuccess(`Herd "${herd.name}" deleted.`);
      navigate("/herds");
    } catch (error) {
      showError("Failed to delete herd.");
    }
  };

  if (!herd) {
    return <div className="p-6 text-center">Loading herd details...</div>;
  }

  const getMemberUser = (memberId: string): User | undefined => {
    return allUsers.find(u => u.id === memberId);
  };

  return (
    <div className="p-6">
      <Button variant="outline" onClick={() => navigate("/herds")} className="mb-4">
        &larr; Back to Herds
      </Button>

      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          {isEditingName ? (
            <div className="flex items-center space-x-2">
              <Input
                value={newHerdName}
                onChange={(e) => setNewHerdName(e.target.value)}
                className="text-2xl font-bold"
              />
              <Button onClick={handleRenameHerd} size="sm">Save</Button>
              <Button variant="outline" onClick={() => setIsEditingName(false)} size="sm">Cancel</Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl">{herd.name}</CardTitle>
              {isOwner && (
                <Button variant="ghost" onClick={() => setIsEditingName(true)} size="sm">
                  Edit Name
                </Button>
              )}
            </div>
          )}
          <CardDescription>
            {isOwner ? "You are the owner of this herd." : `Owned by ${getMemberUser(herd.ownerId)?.displayName || "Unknown"}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">Members</h3>
            <div className="grid gap-2">
              {herd.memberIds.map((memberId) => {
                const memberUser = getMemberUser(memberId);
                return memberUser ? (
                  <div key={memberId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <span>{memberUser.displayName} {memberUser.id === herd.ownerId && "(Owner)"}</span>
                    {isOwner && memberUser.id !== herd.ownerId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(memberId)}
                        className="text-red-500 hover:bg-red-500/10"
                      >
                        <X className="h-4 w-4" /> Remove
                      </Button>
                    )}
                  </div>
                ) : null;
              })}
            </div>
          </div>

          {isOwner && (
            <div className="grid gap-2">
              <Label htmlFor="inviteMember">Add New Member (by email)</Label>
              <div className="flex space-x-2">
                <Input
                  id="inviteMember"
                  type="email"
                  placeholder="friend@example.com"
                  value={invitedMemberEmail}
                  onChange={(e) => setInvitedMemberEmail(e.target.value)}
                />
                <Button type="button" onClick={handleAddMember}>
                  Add Member
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 mt-4">
            {!isOwner && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-500 border-red-500 hover:bg-red-500/10">
                    Leave Herd
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. You will no longer be a member of "{herd.name}" and will not receive new reflections from this herd.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLeaveHerd} className="bg-red-600 hover:bg-red-700">
                      Leave Herd
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {isOwner && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    Delete Herd
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the "{herd.name}" herd and all its associated data for all members.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteHerd} className="bg-red-600 hover:bg-red-700">
                      Delete Herd
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HerdDetailPage;