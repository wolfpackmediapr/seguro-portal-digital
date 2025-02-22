
import { useEffect, useState } from "react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import TypeformEmbed from "@/components/dashboard/TypeformEmbed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "@/components/admin/UserManagement";
import { AdminLogs } from "@/components/admin/AdminLogs";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/components/admin/types";
import { Home, List, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("inicio");

  useEffect(() => {
    const checkSuperAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: role } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'super_admin')
          .single();
        
        setIsSuperAdmin(!!role);
      }
    };

    checkSuperAdmin();
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardNav />

      <div className="flex flex-1">
        <aside className="w-64 bg-white border-r">
          <nav className="py-4">
            <a 
              href="#" 
              onClick={() => handleTabChange("inicio")}
              className={cn(
                "flex items-center px-6 py-3 text-sm transition-colors hover:bg-gray-100",
                activeTab === "inicio" ? "bg-gray-100 text-gray-900" : "text-gray-600"
              )}
            >
              <Home className="w-4 h-4 mr-3" />
              Inicio
            </a>
            <a 
              href="#" 
              onClick={() => handleTabChange("logs")}
              className={cn(
                "flex items-center px-6 py-3 text-sm transition-colors hover:bg-gray-100",
                activeTab === "logs" ? "bg-gray-100 text-gray-900" : "text-gray-600"
              )}
            >
              <List className="w-4 h-4 mr-3" />
              Logs
            </a>
            {isSuperAdmin && (
              <a 
                href="#" 
                onClick={() => handleTabChange("settings")}
                className={cn(
                  "flex items-center px-6 py-3 text-sm transition-colors hover:bg-gray-100",
                  activeTab === "settings" ? "bg-gray-100 text-gray-900" : "text-gray-600"
                )}
              >
                <Settings className="w-4 h-4 mr-3" />
                Configuración
              </a>
            )}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="inicio">Inicio</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              {isSuperAdmin && (
                <TabsTrigger value="settings">Configuración</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="inicio">
              <Tabs defaultValue="radio" className="w-full">
                <TabsList>
                  <TabsTrigger value="radio">Alerta Radio</TabsTrigger>
                  <TabsTrigger value="tv">Alerta TV</TabsTrigger>
                </TabsList>
                
                <TabsContent value="radio" className="mt-6">
                  <TypeformEmbed 
                    title="Alerta Radio"
                    formId="01JEWES3GA7PPQN2SPRNHSVHPG"
                  />
                </TabsContent>
                
                <TabsContent value="tv" className="mt-6">
                  <TypeformEmbed 
                    title="Alerta TV"
                    formId="01JEWEP95CN5YH8JCET8GEXRSK"
                  />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="logs">
              <AdminLogs />
            </TabsContent>

            {isSuperAdmin && (
              <TabsContent value="settings">
                <Tabs defaultValue="users" className="w-full">
                  <TabsList>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="logs">Logs</TabsTrigger>
                  </TabsList>

                  <TabsContent value="users" className="mt-6">
                    <UserManagement />
                  </TabsContent>
                  
                  <TabsContent value="logs" className="mt-6">
                    <AdminLogs />
                  </TabsContent>
                </Tabs>
              </TabsContent>
            )}
          </Tabs>
        </main>
      </div>

      <DashboardFooter />
    </div>
  );
};

export default Dashboard;
