
import { useState } from "react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import SidebarNav from "@/components/dashboard/SidebarNav";
import DashboardContent from "@/components/dashboard/DashboardContent";
import { useUserRole } from "@/components/dashboard/hooks/useUserRole";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("inicio");
  const { isAdmin, userRole, isLoading } = useUserRole();

  const handleTabChange = (value: string) => {
    // If user is not admin and tries to access restricted tabs, redirect to inicio
    if ((value === "settings" || value === "logs") && !isAdmin) {
      setActiveTab("inicio");
      return;
    }
    
    setActiveTab(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardNav />

      <div className="flex flex-1">
        <SidebarNav 
          isAdmin={isAdmin} 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
        />

        <main className="flex-1 p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <DashboardContent 
              activeTab={activeTab} 
              isAdmin={isAdmin} 
              onTabChange={handleTabChange} 
            />
          )}
        </main>
      </div>

      <DashboardFooter />
    </div>
  );
};

export default Dashboard;
