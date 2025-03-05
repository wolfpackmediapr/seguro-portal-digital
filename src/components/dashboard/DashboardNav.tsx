
import { LogOut, User, UserRound } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DashboardNav = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get user name from session
  useEffect(() => {
    const getUserInfo = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const email = data.session.user.email;
        if (email) {
          // Display first part of email as username
          setUserName(email.split('@')[0]);
        }
      }
    };

    getUserInfo();
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
    // Close dropdown after selection
    setIsDropdownOpen(false);
    // For now just show a toast as the profile page doesn't exist yet
    toast({
      title: "Profile",
      description: "Profile feature coming soon",
    });
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
      <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
        <div className="flex items-center">
          {userName && <span className="mr-2 text-sm text-gray-600">{userName}</span>}
          <div 
            className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors flex items-center"
            onClick={toggleDropdown}
          >
            <UserRound className="w-6 h-6 text-gray-600" />
          </div>
        </div>
        
        {isDropdownOpen && (
          <div className="absolute right-0 top-12 w-56 bg-white rounded-md shadow-lg py-1 z-10 border">
            <div className="px-4 py-3 border-b">
              <p className="text-sm font-medium text-gray-900">User Menu</p>
              <p className="text-xs text-gray-500 truncate">{userName || 'User'}</p>
            </div>
            
            <Button
              variant="ghost"
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={handleViewProfile}
            >
              <User className="mr-2 h-4 w-4" />
              <span>View Profile</span>
            </Button>
            
            <Button
              variant="ghost"
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default DashboardNav;
