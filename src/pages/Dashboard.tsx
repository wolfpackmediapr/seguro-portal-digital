
import { useEffect, useState } from "react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import TypeformEmbed from "@/components/dashboard/TypeformEmbed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "@/components/admin/UserManagement";
import { AdminLogs } from "@/components/admin/AdminLogs";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/components/admin/types";
import { Settings, Home, List } from "lucide-react";

const Dashboard = () => {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardNav />

      <div className="flex flex-1">
        <aside className="w-64 bg-white border-r p-4">
          <nav className="space-y-2">
            <a href="#" className="flex items-center px-4 py-2 rounded hover:bg-gray-100">
              <Home className="w-4 h-4 mr-2" />
              Inicio
            </a>
            <a href="#" className="flex items-center px-4 py-2 rounded hover:bg-gray-100">
              <List className="w-4 h-4 mr-2" />
              Logs
            </a>
            {isSuperAdmin && (
              <a href="#" className="flex items-center px-4 py-2 rounded hover:bg-gray-100 text-gray-600">
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </a>
            )}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <Tabs defaultValue="inicio" className="w-full">
            <TabsList className="hidden">
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
