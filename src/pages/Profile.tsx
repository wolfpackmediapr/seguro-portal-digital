
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileForm from "@/components/profile/ProfileForm";
import ProfileStats from "@/components/profile/ProfileStats";
import { useAuthRole } from "@/hooks/useAuthRole";
import { useProfileQuery } from "@/hooks/useProfileQuery";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardTabs from "@/components/dashboard/tabs/DashboardTabs";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("inicio");
  const { isAdmin, userRole, isLoading: isRoleLoading } = useAuthRole();
  const { 
    data: profileData, 
    isLoading: isProfileLoading 
  } = useProfileQuery();
  const navigate = useNavigate();

  const handleTabChange = (value: string) => {
    // If user is not admin and tries to access restricted tabs, redirect to inicio
    if ((value === "settings" || value === "logs") && !isAdmin) {
      setActiveTab("inicio");
      return;
    }
    
    // Set the tab state
    setActiveTab(value);
    
    // Navigate to the appropriate page based on tab selection
    if (value !== "inicio") {
      navigate("/dashboard");
    }
  };

  if (isRoleLoading || isProfileLoading || !profileData) {
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
        <DashboardTabs
          activeTab={activeTab}
          handleTabChange={handleTabChange}
          isAdmin={isAdmin}
          isLoading={isRoleLoading}
        />
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
