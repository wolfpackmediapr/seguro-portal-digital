
import { LogOut, User, UserRound } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type DashboardNavProps = {
  activeTab?: string;
  handleTabChange?: (value: string) => void;
};

const DashboardNav = ({ activeTab, handleTabChange }: DashboardNavProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setUserEmail(user.email);
        }
      } catch (error) {
        console.error("Error fetching user email:", error);
      }
    };

    getUserEmail();
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error",
        description: "There was an error logging out",
        variant: "destructive",
      });
    }
  };

  const handleViewProfile = () => {
    setIsDropdownOpen(false);
    if (handleTabChange) {
      handleTabChange("profile");
    } else {
      navigate("/profile");
    }
  };

  return (
    <nav className="bg-white border-b px-4 py-2 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <img 
          src="/lovable-uploads/783b3503-53aa-46a1-a06f-98a881be711f.png" 
          alt="Publimedia Logo" 
          className="h-8"
        />
        <h1 className="text-xl font-semibold">Alertas Radio y TV</h1>
      </div>
      <div className="flex items-center space-x-4 relative">
        <div 
          className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors flex items-center"
          onClick={toggleDropdown}
        >
          {userEmail && (
            <span className="mr-2 text-sm text-gray-600 hidden md:inline">{userEmail}</span>
          )}
          <UserRound className="w-6 h-6 text-gray-600" />
          <span className="ml-2 text-sm hidden sm:inline">Mi Cuenta</span>
        </div>
        
        {isDropdownOpen && (
          <div className="absolute right-0 top-12 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
            <Button
              variant="ghost"
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={handleViewProfile}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Ver Perfil</span>
            </Button>
            <Button
              variant="ghost"
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default DashboardNav;
