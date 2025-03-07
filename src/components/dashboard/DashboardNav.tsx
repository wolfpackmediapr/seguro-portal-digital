
import { LogOut, UserRound } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const DashboardNav = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
          <UserRound className="w-6 h-6 text-gray-600" />
          <span className="ml-2 text-sm hidden sm:inline">Mi Cuenta</span>
        </div>
        
        {isDropdownOpen && (
          <div className="absolute right-0 top-12 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
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
