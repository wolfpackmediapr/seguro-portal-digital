
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Users, Clock, Activity } from "lucide-react";

interface ProfileStatsProps {
  userRole: string | null;
}

const ProfileStats = ({ userRole }: ProfileStatsProps) => {
  // Display different stats based on user role
  const isAdminOrSuperAdmin = userRole === "admin" || userRole === "super_admin";
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isAdminOrSuperAdmin ? "Admin Statistics" : "User Statistics"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Show role badge with description */}
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 p-2 rounded-full">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Role</h3>
              <p className="text-sm text-muted-foreground">
                {userRole === "super_admin" ? "Super Administrator" : 
                 userRole === "admin" ? "Administrator" : "Standard User"}
              </p>
            </div>
          </div>
          
          {/* Show different stats based on role */}
          {isAdminOrSuperAdmin ? (
            <>
              <div className="flex items-start space-x-4">
                <div className="bg-amber-100 p-2 rounded-full">
                  <Users className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium">User Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Access to user management features
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">System Logs</h3>
                  <p className="text-sm text-muted-foreground">
                    Access to view and manage system logs
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-start space-x-4">
              <div className="bg-green-100 p-2 rounded-full">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">User Access</h3>
                <p className="text-sm text-muted-foreground">
                  Standard access to application features
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileStats;
