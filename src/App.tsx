
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/utils/activityLogger";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

const ActivityTracker = () => {
  useEffect(() => {
    const trackAuthState = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Log application start
        logActivity({
          action: 'login',
          details: { method: 'auto', app_start: true }
        });
      }
    };

    trackAuthState();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          logActivity({
            action: 'login',
            details: { 
              method: 'explicit',
              provider: session.user.app_metadata.provider || 'email'
            }
          });
        } else if (event === 'SIGNED_OUT') {
          logActivity({
            action: 'logout',
            details: { method: 'explicit' }
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ActivityTracker />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
