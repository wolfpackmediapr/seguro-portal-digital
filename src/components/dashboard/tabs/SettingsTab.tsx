
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "@/components/admin/UserManagement";
import { AdminLogs } from "@/components/admin/AdminLogs";

const SettingsTab = () => {
  return (
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
  );
};

export default SettingsTab;
