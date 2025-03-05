
import { useEffect, useState } from "react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import TypeformEmbed from "@/components/dashboard/TypeformEmbed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "@/components/admin/UserManagement";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/components/admin/types";
import { Home, List, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("inicio");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Check if user is super_admin or admin
          const { data: adminRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .in('role', ['super_admin', 'admin'])
            .single();
          
          setIsAdmin(!!adminRole);
          
          // Get user's role for additional permissions if needed
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();
            
          setUserRole(roleData?.role || null);
        }
      } catch (error) {
        console.error("Error checking user role:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, []);

  const handleTabChange = (value: string) => {
    // If user is not admin and tries to access restricted tabs, redirect to inicio
    if ((value === "settings") && !isAdmin) {
      setActiveTab("inicio");
      return;
    }
    
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
            
            {/* Show settings tab to admins and super admins */}
            {isAdmin && (
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
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="inicio">Inicio</TabsTrigger>
                {/* Show settings tab to admins and super admins */}
                {isAdmin && (
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

              {/* Render settings tab content for admins and super admins */}
              {isAdmin && (
                <TabsContent value="settings">
                  <Tabs defaultValue="users" className="w-full">
                    <TabsList>
                      <TabsTrigger value="users">Users</TabsTrigger>
                    </TabsList>

                    <TabsContent value="users" className="mt-6">
                      <UserManagement />
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              )}
            </Tabs>
          )}
        </main>
      </div>

      <DashboardFooter />
    </div>
  );
};

export default Dashboard;
