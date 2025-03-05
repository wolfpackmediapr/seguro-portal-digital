
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUserRole = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Check if user is super_admin or admin
          const { data: adminRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .in('role', ['super_admin', 'admin'])
            .single();
          
          setIsAdmin(!!adminRole);
          
          // Get user's role for additional permissions if needed
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();
            
          setUserRole(roleData?.role || null);
        }
      } catch (error) {
        console.error("Error checking user role:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, []);

  return { isAdmin, userRole, isLoading };
};
