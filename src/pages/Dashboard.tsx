
import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardTabs from "@/components/dashboard/tabs/DashboardTabs";
import { useAuthRole } from "@/hooks/useAuthRole";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("inicio");
  const { isAdmin, userRole, isLoading } = useAuthRole();

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
