
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export type UserRoleData = {
  isAdmin: boolean;
  userRole: string | null;
  isLoading: boolean;
};

export const useUserRoleQuery = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  return useQuery({
    queryKey: ["userRole"],
    queryFn: async (): Promise<UserRoleData> => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          return { isAdmin: false, userRole: null, isLoading: false };
        }
        
        // Check if user is super_admin or admin
        const { data: adminRole, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .in('role', ['super_admin', 'admin'])
          .maybeSingle();
        
        if (roleError && !roleError.message.includes('No rows found')) {
          console.error("Error checking admin role:", roleError);
          throw new Error("Error checking user permissions");
        }
        
        // Get user's role for additional permissions if needed
        const { data: roleData, error: userRoleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        if (userRoleError) {
          console.error("Error checking user role:", userRoleError);
          throw new Error("Error checking user role");
        }
        
        return { 
          isAdmin: !!adminRole, 
          userRole: roleData?.role || null,
          isLoading: false
        };
      } catch (error) {
        console.error("Error checking user role:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
