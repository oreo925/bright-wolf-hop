import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // Import AuthProvider
import Layout from "./components/Layout"; // Import Layout component
import Index from "./pages/Index"; // This will now be our entry point
import HomePage from "./pages/HomePage"; // Authenticated home page
import AuthPage from "./pages/AuthPage"; // Login/Register page
import NotFound from "./pages/NotFound";


// Placeholder pages for now, will be created in subsequent steps
import CreateReflectionPage from "./pages/CreateReflectionPage";
import HistoryPage from "./pages/HistoryPage";
import HerdsPage from "./pages/HerdsPage";
import HerdDetailPage from "./pages/HerdDetailPage";
import ProfilePage from "./pages/ProfilePage";
import CreateHerdPage from "./pages/CreateHerdPage"; // Import CreateHerdPage
import ReflectionDetailPage from "./pages/ReflectionDetailPage"; // Import ReflectionDetailPage
import FriendsPage from "./pages/FriendsPage"; // Import FriendsPage
import NotificationsPage from "./pages/NotificationsPage"; // Import NotificationsPage
import SettingsPage from "./pages/SettingsPage"; // Import SettingsPage


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider> {/* Wrap the entire app with AuthProvider */}
          <Layout> {/* Wrap routes with Layout */}
            <Routes>
              <Route path="/" element={<Index />} /> {/* Index will handle auth redirection */}
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<AuthPage />} />
              {/* Authenticated Routes */}
              <Route path="/home" element={<HomePage />} />
              <Route path="/create-reflection" element={<CreateReflectionPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/reflections/:reflectionId" element={<ReflectionDetailPage />} /> {/* New route */}
              <Route path="/herds" element={<HerdsPage />} />
              <Route path="/herds/:herdId" element={<HerdDetailPage />} />
              <Route path="/create-herd" element={<CreateHerdPage />} /> {/* New route for creating herds */}
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/friends" element={<FriendsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;