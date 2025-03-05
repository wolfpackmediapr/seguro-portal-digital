
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const useAuthRole = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUserRole = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // If no session, redirect to login
          navigate("/");
          return;
        }
        
        // Check if user is super_admin or admin
        const { data: adminRole, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .in('role', ['super_admin', 'admin'])
          .single();
        
        if (roleError && !roleError.message.includes('No rows found')) {
          console.error("Error checking admin role:", roleError);
          toast({
            title: "Error",
            description: "Error checking user permissions",
            variant: "destructive",
          });
        }
        
        setIsAdmin(!!adminRole);
        
        // Get user's role for additional permissions if needed
        const { data: roleData, error: userRoleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        if (userRoleError) {
          console.error("Error checking user role:", userRoleError);
        }
        
        setUserRole(roleData?.role || null);
      } catch (error) {
        console.error("Error checking user role:", error);
        toast({
          title: "Error",
          description: "An error occurred while loading your dashboard",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, [navigate, toast]);

  return { isAdmin, userRole, isLoading };
};
