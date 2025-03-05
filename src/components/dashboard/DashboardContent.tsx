
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardHome from "./tabs/DashboardHome";
import DashboardProfile from "./tabs/DashboardProfile";
import DashboardLogs from "./tabs/DashboardLogs";
import DashboardSettings from "./tabs/DashboardSettings";

interface DashboardContentProps {
  activeTab: string;
  isAdmin: boolean;
  onTabChange: (value: string) => void;
}

const DashboardContent = ({ activeTab, isAdmin, onTabChange }: DashboardContentProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="inicio">Inicio</TabsTrigger>
        <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
        {isAdmin && (
          <TabsTrigger value="logs">Logs</TabsTrigger>
        )}
        {isAdmin && (
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        )}
      </TabsList>
      
      <TabsContent value="inicio">
        <DashboardHome />
      </TabsContent>
      
      <TabsContent value="profile">
        <DashboardProfile />
      </TabsContent>

      {isAdmin && (
        <TabsContent value="logs">
          <DashboardLogs />
        </TabsContent>
      )}

      {isAdmin && (
        <TabsContent value="settings">
          <DashboardSettings />
        </TabsContent>
      )}
    </Tabs>
  );
};

export default DashboardContent;
