
import { useProfileQuery } from "@/hooks/useProfileQuery";
import { useAuthRole } from "@/hooks/useAuthRole";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileForm from "@/components/profile/ProfileForm";
import ProfileStats from "@/components/profile/ProfileStats";

const ProfileTab = () => {
  const { userRole, isLoading: isRoleLoading } = useAuthRole();
  const { 
    data: profileData, 
    isLoading: isProfileLoading,
    error
  } = useProfileQuery();

  if (isRoleLoading || isProfileLoading || !profileData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfileHeader userRole={userRole} profile={profileData} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <ProfileForm profile={profileData} userRole={userRole} />
        </div>
        <div>
          <ProfileStats userRole={userRole} />
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
