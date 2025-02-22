
import { useEffect, useState } from "react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import TypeformEmbed from "@/components/dashboard/TypeformEmbed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "@/components/admin/UserManagement";
import { AdminLogs } from "@/components/admin/AdminLogs";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const checkSuperAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'super_admin')
          .single();
        
        setIsSuperAdmin(!!roles);
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
            <a href="#" className="block px-4 py-2 rounded hover:bg-gray-100">
              Inicio
            </a>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <Tabs defaultValue="radio" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="radio">Alerta Radio</TabsTrigger>
              <TabsTrigger value="tv">Alerta TV</TabsTrigger>
              {isSuperAdmin && (
                <>
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="logs">Logs</TabsTrigger>
                </>
              )}
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

            {isSuperAdmin && (
              <>
                <TabsContent value="users" className="mt-6">
                  <UserManagement />
                </TabsContent>
                
                <TabsContent value="logs" className="mt-6">
                  <AdminLogs />
                </TabsContent>
              </>
            )}
          </Tabs>
        </main>
      </div>

      <DashboardFooter />
    </div>
  );
};

export default Dashboard;
