"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { showSuccess, showError } from "@/utils/toast";
import { X } from "lucide-react";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/v1/`;

interface User {
  id: string;
  displayName: string;
  email: string;
}

const CreateHerdPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [herdName, setHerdName] = useState("");
  const [invitedMemberEmail, setInvitedMemberEmail] = useState("");
  const [members, setMembers] = useState<User[]>([]);

  const handleAddMember = async () => {
    if (!invitedMemberEmail) {
      showError("Please enter an email address.");
      return;
    }
    if (user?.email === invitedMemberEmail) {
      showError("You cannot invite yourself to a herd.");
      setInvitedMemberEmail("");
      return;
    }

    try {
      // Assuming an endpoint to find a user by email
      const response = await fetch(`${API_BASE_URL}users/email/${invitedMemberEmail}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const invitedUser = await response.json();
        if (members.find(m => m.id === invitedUser.id)) {
          showError(`${invitedUser.displayName} is already in the invite list.`);
        } else {
          setMembers([...members, invitedUser]);
          showSuccess(`${invitedUser.displayName} added to invite list.`);
        }
      } else {
        showError("No user found with that email. They need to register first.");
      }
    } catch (error) {
      showError("Failed to find user.");
    }
    setInvitedMemberEmail("");
  };

  const handleRemoveMember = (memberIdToRemove: string) => {
    setMembers(members.filter(m => m.id !== memberIdToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      showError("You must be logged in to create a herd.");
      return;
    }
    if (!herdName.trim()) {
      showError("Herd name cannot be empty.");
      return;
    }

    if (members.length === 0) {
      showError("You must add at least one member to the herd.");
      return;
    }
    const memberIds = members.map(m => m.id);

    try {
      const response = await fetch(`${API_BASE_URL}herds`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: herdName.trim(), memberIds: [user.id, ...memberIds] }),
      });
      if (response.ok) {
        showSuccess(`Herd "${herdName}" created successfully!`);
        navigate("/herds");
      } else {
        showError("Failed to create herd.");
      }
    } catch (error) {
      showError("Failed to create herd.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create New Herd</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="herdName">Herd Name</Label>
              <Input
                id="herdName"
                type="text"
                placeholder="My Family Herd"
                value={herdName}
                onChange={(e) => setHerdName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="inviteMember">Invite Members (by email)</Label>
              <div className="flex space-x-2">
                <Input
                  id="inviteMember"
                  type="email"
                  placeholder="friend@example.com"
                  value={invitedMemberEmail}
                  onChange={(e) => setInvitedMemberEmail(e.target.value)}
                />
                <Button type="button" onClick={handleAddMember}>
                  Add
                </Button>
              </div>
            </div>

            {members.length > 0 && (
              <div className="grid gap-2">
                <Label>Invited Members:</Label>
                <div className="flex flex-wrap gap-2">
                  {members.map((member) => (
                    <span key={member.id} className="flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm">
                      {member.displayName}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        className="ml-2 h-auto p-0 text-gray-500 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" className="w-full">
              Create Herd
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/herds")} className="w-full">
              Cancel
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateHerdPage;