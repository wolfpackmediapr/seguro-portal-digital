
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InicioTab from "./InicioTab";
import SettingsTab from "./SettingsTab";
import LogsTab from "./LogsTab";
import { TabOption } from "@/hooks/useTabs";

type DashboardTabsProps = {
  activeTab: string;
  handleTabChange: (value: string) => void;
  isAdmin: boolean;
  isLoading: boolean;
};

const DashboardTabs = ({ 
  activeTab, 
  handleTabChange, 
  isAdmin, 
  isLoading 
}: DashboardTabsProps) => {
  // Define available tabs based on user role
  const getAvailableTabs = (): TabOption[] => {
    const tabs: TabOption[] = [
      { value: "inicio", label: "Inicio" }
    ];
    
    if (isAdmin) {
      tabs.push(
        { value: "logs", label: "Logs" },
        { value: "settings", label: "Configuración" }
      );
    }
    
    return tabs;
  };
  
  const availableTabs = getAvailableTabs();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="mb-6">
        {availableTabs.map(tab => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      
      <TabsContent value="inicio">
        <InicioTab />
      </TabsContent>

      {/* Render logs tab content for admins */}
      {isAdmin && (
        <TabsContent value="logs">
          <LogsTab />
        </TabsContent>
      )}

      {/* Render settings tab content for admins */}
      {isAdmin && (
        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      )}
    </Tabs>
  );
};

export default DashboardTabs;
