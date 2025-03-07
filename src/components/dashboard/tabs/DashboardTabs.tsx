
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InicioTab from "./InicioTab";
import SettingsTab from "./SettingsTab";
import LogsTab from "./LogsTab";
import ProfileTab from "./ProfileTab";

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
        <TabsTrigger value="inicio">Inicio</TabsTrigger>
        {/* Show profile tab to all users */}
        <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
        {/* Show logs tab to admins and super admins */}
        {isAdmin && (
          <TabsTrigger value="logs">Logs</TabsTrigger>
        )}
        {/* Show settings tab to admins and super admins */}
        {isAdmin && (
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        )}
      </TabsList>
      
      <TabsContent value="inicio">
        <InicioTab />
      </TabsContent>

      <TabsContent value="profile">
        <ProfileTab />
      </TabsContent>

      {/* Render logs tab content for admins and super admins */}
      {isAdmin && (
        <TabsContent value="logs">
          <LogsTab />
        </TabsContent>
      )}

      {/* Render settings tab content for admins and super admins */}
      {isAdmin && (
        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      )}
    </Tabs>
  );
};

export default DashboardTabs;
