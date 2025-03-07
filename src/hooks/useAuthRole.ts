
import { useUserRoleQuery } from "@/hooks/useUserRoleQuery";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export const useAuthRole = () => {
  const { 
    data: userRoleData, 
    isLoading, 
    error 
  } = useUserRoleQuery();
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      console.error("Error fetching role:", error);
      toast({
        title: "Error",
        description: "An error occurred while loading your dashboard",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return { 
    isAdmin: userRoleData?.isAdmin || false, 
    userRole: userRoleData?.userRole || null, 
    isLoading 
  };
};
