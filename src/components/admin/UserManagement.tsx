
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { AdminUser } from './types';
import { UserCreateForm } from './UserCreateForm';
import { UsersTable } from './UsersTable';
import { UserDetailsDialog } from './UserDetailsDialog';
import { UserDeleteDialog } from './UserDeleteDialog';

export function UserManagement() {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);

  const { data: users, refetch, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'list' }
      });

      if (error) throw error;
      return data as AdminUser[];
    }
  });

  const handleViewUserDetails = (user: AdminUser) => {
    setSelectedUser(user);
    setIsUserDetailsOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'delete',
          userId: selectedUser.id
        }
      });

      if (response.error) throw response.error;
      
      toast.success('User deleted successfully');
      setIsConfirmDeleteOpen(false);
      setSelectedUser(null);
      refetch();
    } catch (error: any) {
      toast.error('Error deleting user: ' + error.message);
    }
  };

  const handleToggleUserStatus = async (user: AdminUser) => {
    try {
      const newStatus = user.disabled ? 'active' : 'suspended';
      const response = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'updateStatus',
          userId: user.id,
          disabled: !user.disabled
        }
      });

      if (response.error) throw response.error;
      
      toast.success(`User ${newStatus} successfully`);
      refetch();
    } catch (error: any) {
      toast.error(`Error updating user status: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <UserCreateForm onUserCreated={refetch} />
      
      <UsersTable 
        users={users}
        isLoading={isLoading}
        onViewDetails={handleViewUserDetails}
        onToggleStatus={handleToggleUserStatus}
        onDelete={(user) => {
          setSelectedUser(user);
          setIsConfirmDeleteOpen(true);
        }}
      />

      <UserDetailsDialog 
        user={selectedUser}
        isOpen={isUserDetailsOpen}
        onOpenChange={setIsUserDetailsOpen}
        onToggleStatus={handleToggleUserStatus}
        onDelete={() => setIsConfirmDeleteOpen(true)}
      />

      <UserDeleteDialog 
        user={selectedUser}
        isOpen={isConfirmDeleteOpen}
        onOpenChange={setIsConfirmDeleteOpen}
        onConfirmDelete={handleDeleteUser}
      />
    </div>
  );
}
