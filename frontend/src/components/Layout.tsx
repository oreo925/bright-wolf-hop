"use client";

import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Import useLocation and useNavigate
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Home, PlusCircle, History, Users, Settings, LogOut, Bell, Heart } from "lucide-react";
import { MadeWithDyad } from "./made-with-dyad";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isAuthenticated, logout, user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (isAuthenticated && user && token) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const notifications = await response.json();
            const unreadCount = notifications.filter((n: any) => !n.read).length;
            setUnreadNotifications(unreadCount);
          }
        } catch (error) {
          console.error("Failed to fetch notifications:", error);
        }
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every 60 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, user, token]);

  // Effect to handle redirection for unauthenticated users trying to access protected routes
  useEffect(() => {
    const publicPaths = ["/", "/login", "/register"]; // Paths accessible without authentication
    const isPublicPath = publicPaths.includes(location.pathname);

    if (!isAuthenticated && !isPublicPath) {
      // If not authenticated and trying to access a protected path, redirect to login
      navigate("/login", { replace: true });
    } else if (isAuthenticated && (location.pathname === "/login" || location.pathname === "/register")) {
      // If authenticated and trying to access login/register, redirect to home
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true }); // Redirect to login page and replace history entry
  };

  // If not authenticated and on a public path, render children directly (e.g., AuthPage)
  // The useEffect above handles redirection for protected paths.
  if (!isAuthenticated && (location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/")) {
    return <>{children}</>;
  }

  // If authenticated, or if on a protected path but isAuthenticated is still being checked (briefly),
  // render the full layout. The useEffect will handle any necessary redirection.
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-sidebar dark:bg-sidebar-background text-sidebar-foreground dark:text-sidebar-foreground p-4 flex flex-col border-r border-sidebar-border dark:border-sidebar-border">
        <div className="flex items-center justify-center h-16 border-b border-sidebar-border dark:border-sidebar-border mb-6">
          <h2 className="text-2xl font-bold text-sidebar-primary dark:text-sidebar-primary-foreground">HLB</h2>
        </div>
        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <Link to="/home" className="flex items-center p-2 rounded-md hover:bg-sidebar-accent dark:hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:hover:text-sidebar-accent-foreground transition-colors">
                <Home className="mr-3 h-5 w-5" />
                Home
              </Link>
            </li>
            <li>
              <Link to="/create-reflection" className="flex items-center p-2 rounded-md hover:bg-sidebar-accent dark:hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:hover:text-sidebar-accent-foreground transition-colors">
                <PlusCircle className="mr-3 h-5 w-5" />
                New Reflection
              </Link>
            </li>
            <li>
              <Link to="/history" className="flex items-center p-2 rounded-md hover:bg-sidebar-accent dark:hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:hover:text-sidebar-accent-foreground transition-colors">
                <History className="mr-3 h-5 w-5" />
                History
              </Link>
            </li>
            <li>
              <Link to="/herds" className="flex items-center p-2 rounded-md hover:bg-sidebar-accent dark:hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:hover:text-sidebar-accent-foreground transition-colors">
                <Users className="mr-3 h-5 w-5" />
                Herds
              </Link>
            </li>
            <li>
              <Link to="/settings" className="flex items-center p-2 rounded-md hover:bg-sidebar-accent dark:hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:hover:text-sidebar-accent-foreground transition-colors">
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </Link>
            </li>
            <li>
              <Link to="/friends" className="flex items-center p-2 rounded-md hover:bg-sidebar-accent dark:hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:hover:text-sidebar-accent-foreground transition-colors">
                <Heart className="mr-3 h-5 w-5" />
                Friends
              </Link>
            </li>
            <li>
              <Link to="/notifications" className="flex items-center p-2 rounded-md hover:bg-sidebar-accent dark:hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:hover:text-sidebar-accent-foreground transition-colors">
                <Bell className="mr-3 h-5 w-5" />
                Notifications
                {unreadNotifications > 0 && (
                  <span className="ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                    {unreadNotifications}
                  </span>
                )}
              </Link>
            </li>
          </ul>
        </nav>
        <div className="mt-auto pt-4 border-t border-sidebar-border dark:border-sidebar-border">
          {user && (
            <div className="text-sm text-center mb-2">
              Logged in as: <span className="font-medium">{user.displayName}</span>
            </div>
          )}
          <Button onClick={handleLogout} className="w-full justify-start text-sidebar-foreground dark:text-sidebar-foreground hover:bg-red-500/20 hover:text-red-500" variant="ghost">
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 p-6">
          {children}
        </div>
        <MadeWithDyad />
      </main>
    </div>
  );
};

export default Layout;