
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export type UserProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  updated_at: string | null;
};

export const useProfileQuery = () => {
  const navigate = useNavigate();

  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async (): Promise<UserProfile | null> => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/");
        return null;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
        
      if (error) throw error;
      
      // If no profile exists, return a default profile with the user ID
      return data || { id: session.user.id, full_name: null, avatar_url: null, updated_at: null };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
