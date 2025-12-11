"use client";

import { useAuth } from "@/context/AuthContext";

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Profile & Settings</h1>
      {user && (
        <div className="space-y-2 text-gray-700 dark:text-gray-300">
          <p><strong>Display Name:</strong> {user.displayName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p className="text-gray-600 dark:text-gray-400">
            Here you can update your profile information and notification preferences. (Coming soon!)
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;