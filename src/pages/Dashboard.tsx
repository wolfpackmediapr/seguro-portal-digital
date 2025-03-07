
import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardTabs from "@/components/dashboard/tabs/DashboardTabs";
import { useAuthRole } from "@/hooks/useAuthRole";
import { useTabs } from "@/hooks/useTabs";

const Dashboard = () => {
  const { isAdmin, userRole, isLoading } = useAuthRole();
  
  // Initialize tabs with default value and ensure users can only access tabs they have permission for
  const [activeTab, setActiveTab] = useState("inicio");

  const handleTabChange = (value: string) => {
    // If user is not admin and tries to access restricted tabs, redirect to inicio
    if ((value === "settings" || value === "logs") && !isAdmin) {
      setActiveTab("inicio");
      return;
    }
    
    setActiveTab(value);
  };

  return (
    <DashboardLayout 
      isAdmin={isAdmin} 
      userRole={userRole} 
      activeTab={activeTab} 
      handleTabChange={handleTabChange}
    >
      <DashboardTabs 
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        isAdmin={isAdmin}
        isLoading={isLoading}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
