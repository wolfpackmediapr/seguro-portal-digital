
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileForm from "@/components/profile/ProfileForm";
import ProfileStats from "@/components/profile/ProfileStats";
import { useAuthRole } from "@/hooks/useAuthRole";
import { Skeleton } from "@/components/ui/skeleton";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("inicio");
  const { isAdmin, userRole, isLoading } = useAuthRole();
  const [profileData, setProfileData] = useState<any>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/");
          return;
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
          
        if (error) throw error;
        
        setProfileData(data || { id: session.user.id });
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Could not load profile data",
          variant: "destructive",
        });
      } finally {
        setIsProfileLoading(false);
      }
    };
    
    fetchProfileData();
  }, [navigate, toast]);

  const handleTabChange = (value: string) => {
    // If user is not admin and tries to access restricted tabs, redirect to inicio
    if ((value === "settings" || value === "logs") && !isAdmin) {
      setActiveTab("inicio");
      return;
    }
    
    setActiveTab(value);
  };

  if (isLoading || isProfileLoading) {
    return (
      <DashboardLayout 
        isAdmin={false} 
        userRole={null} 
        activeTab={activeTab} 
        handleTabChange={handleTabChange}
      >
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      isAdmin={isAdmin} 
      userRole={userRole} 
      activeTab={activeTab} 
      handleTabChange={handleTabChange}
    >
      <div className="space-y-6">
        <ProfileHeader userRole={userRole} profile={profileData} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <ProfileForm profile={profileData} userRole={userRole} />
          </div>
          <div>
            <ProfileStats userRole={userRole} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
