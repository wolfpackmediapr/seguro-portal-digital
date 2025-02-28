
import { useEffect, useState, useCallback } from "react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import TypeformEmbed from "@/components/dashboard/TypeformEmbed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "@/components/admin/UserManagement";
import { AdminLogs } from "@/components/admin/AdminLogs";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/components/admin/types";
import { Home, List, Settings, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("inicio");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [formLoadingStates, setFormLoadingStates] = useState({
    radio: false,
    tv: false
  });
  const { toast } = useToast();

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user is super_admin
        const { data: superAdminRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'super_admin')
          .single();
        
        setIsSuperAdmin(!!superAdminRole);
        
        // Get user's role for additional permissions if needed
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
          
        setUserRole(roleData?.role || null);
      }
    };

    checkUserRole();
  }, []);

  const handleTabChange = (value: string) => {
    // If user is not super admin and tries to access restricted tabs, redirect to inicio
    if ((value === "settings" || value === "logs") && !isSuperAdmin) {
      setActiveTab("inicio");
      return;
    }
    
    setActiveTab(value);
  };

  const handleFormLoadingChange = useCallback((formType: 'radio' | 'tv', isLoading: boolean) => {
    setFormLoadingStates(prev => ({
      ...prev,
      [formType]: isLoading
    }));
  }, []);

  const refreshForms = useCallback(() => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    setRefreshTrigger(prev => prev + 1);
    
    // Since the loading state will be managed by the TypeformEmbed components,
    // we don't need to set isRefreshing to false here.
    // It will be updated based on the loading states of both forms.

    toast({
      description: "Actualizando formularios...",
      duration: 2000,
    });
  }, [isRefreshing, toast]);

  // Update the overall refreshing state when individual form loading states change
  useEffect(() => {
    const anyFormLoading = formLoadingStates.radio || formLoadingStates.tv;
    
    if (!anyFormLoading && isRefreshing) {
      setIsRefreshing(false);
      toast({
        description: "Formularios actualizados correctamente",
        duration: 2000,
      });
    }
  }, [formLoadingStates, isRefreshing, toast]);

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
            
            {/* Only show logs tab to super admins */}
            {isSuperAdmin && (
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
            )}
            
            {/* Only show configuration tab to super admins */}
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
              {/* Only show logs tab to super admins */}
              {isSuperAdmin && (
                <TabsTrigger value="logs">Logs</TabsTrigger>
              )}
              {/* Only show settings tab to super admins */}
              {isSuperAdmin && (
                <TabsTrigger value="settings">Configuración</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="inicio">
              {/* Global refresh button for forms */}
              <div className="mb-4 flex justify-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={refreshForms}
                      disabled={isRefreshing}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <RotateCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      {isRefreshing ? 'Actualizando...' : 'Actualizar formularios'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Recargar los formularios de Typeform</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <Tabs defaultValue="radio" className="w-full">
                <TabsList>
                  <TabsTrigger value="radio">Alerta Radio</TabsTrigger>
                  <TabsTrigger value="tv">Alerta TV</TabsTrigger>
                </TabsList>
                
                <TabsContent value="radio" className="mt-6">
                  <TypeformEmbed 
                    title="Alerta Radio"
                    formId="01JEWES3GA7PPQN2SPRNHSVHPG"
                    refreshTrigger={refreshTrigger}
                    onLoadStateChange={(isLoading) => handleFormLoadingChange('radio', isLoading)}
                  />
                </TabsContent>
                
                <TabsContent value="tv" className="mt-6">
                  <TypeformEmbed 
                    title="Alerta TV"
                    formId="01JEWEP95CN5YH8JCET8GEXRSK"
                    refreshTrigger={refreshTrigger}
                    onLoadStateChange={(isLoading) => handleFormLoadingChange('tv', isLoading)}
                  />
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* Only render logs tab content for super admins */}
            {isSuperAdmin && (
              <TabsContent value="logs">
                <AdminLogs />
              </TabsContent>
            )}

            {/* Only render settings tab content for super admins */}
            {isSuperAdmin && (
              <TabsContent value="settings">
                <Tabs defaultValue="users" className="w-full">
                  <TabsList>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="logs">Auth Logs</TabsTrigger>
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
