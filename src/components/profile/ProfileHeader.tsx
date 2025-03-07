
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ProfileHeaderProps {
  userRole: string | null;
  profile: any;
}

const ProfileHeader = ({ userRole, profile }: ProfileHeaderProps) => {
  // Function to get the first letter of name or email for avatar fallback
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Function to get role badge color
  const getRoleBadgeColor = () => {
    switch (userRole) {
      case "super_admin":
        return "bg-red-500 hover:bg-red-600";
      case "admin":
        return "bg-amber-500 hover:bg-amber-600";
      default:
        return "bg-blue-500 hover:bg-blue-600";
    }
  };

  return (
    <Card>
      <CardContent className="flex flex-col sm:flex-row items-center p-6 gap-4">
        <Avatar className="h-24 w-24 border-2 border-primary">
          <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || "User"} />
          <AvatarFallback className="text-lg font-semibold">{getInitials()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center sm:items-start">
          <h1 className="text-2xl font-bold mt-2">{profile?.full_name || "User Profile"}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={getRoleBadgeColor()}>
              {userRole === "super_admin" ? "Super Admin" : 
               userRole === "admin" ? "Admin" : "User"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
