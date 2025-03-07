
import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardTabs from "@/components/dashboard/tabs/DashboardTabs";
import { useAuthRole } from "@/hooks/useAuthRole";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

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

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <DashboardLayout 
      isAdmin={isAdmin} 
      userRole={userRole} 
      activeTab={activeTab} 
      handleTabChange={handleTabChange}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>
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
