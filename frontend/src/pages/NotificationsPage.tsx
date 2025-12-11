"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { showError, showSuccess } from "@/utils/toast";
import { Button } from "@/components/ui/button";

const API_BASE_URL = "http://localhost:8000/api/v1";

interface Notification {
  _id: string;
  senderId: string;
  recipientId: string;
  type: string;
  read: boolean;
  message: string;
}

const NotificationsPage = () => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [actionedNotifications, setActionedNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user && token) {
        try {
          const response = await fetch(`${API_BASE_URL}/notifications`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            setNotifications(await response.json());
          } else {
            showError("Failed to fetch notifications.");
          }
        } catch (error) {
          showError("Failed to fetch notifications.");
        }
      }
    };
    fetchNotifications();
  }, [user, token]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification._id}
            className={`p-4 rounded-lg ${
              notification.read ? "bg-gray-100 dark:bg-gray-800" : "bg-blue-100 dark:bg-blue-900"
            }`}
          >
            <p>{notification.message}</p>
            {notification.type === "friend_request" && !actionedNotifications.has(notification._id) && (
              <div className="mt-2 space-x-2">
                <Button
                  onClick={async () => {
                    const response = await fetch(
                      `${API_BASE_URL}/friends/add/${notification.senderId}`,
                      {
                        method: "POST",
                        headers: { Authorization: `Bearer ${token}` },
                      }
                    );
                    if (response.ok) {
                      showSuccess("Friend request accepted.");
                      setActionedNotifications(prev => new Set(prev).add(notification._id));
                    } else {
                      showError("Failed to accept friend request.");
                    }
                  }}
                >
                  Accept
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    const response = await fetch(
                      `${API_BASE_URL}/notifications/${notification._id}`,
                      {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` },
                      }
                    );
                    if (response.ok) {
                      showSuccess("Friend request rejected.");
                      setActionedNotifications(prev => new Set(prev).add(notification._id));
                    } else {
                      showError("Failed to reject friend request.");
                    }
                  }}
                >
                  Reject
                </Button>
              </div>
            )}
            {notification.type === "reflection_shared" && (
              <div className="mt-2">
                <Button
                  onClick={async () => {
                    const response = await fetch(
                      `${API_BASE_URL}/notifications/${notification._id}/read`,
                      {
                        method: "PUT",
                        headers: { Authorization: `Bearer ${token}` },
                      }
                    );
                    if (response.ok) {
                      showSuccess("Notification marked as read.");
                    } else {
                      showError("Failed to mark notification as read.");
                    }
                  }}
                >
                  Mark as Read
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;