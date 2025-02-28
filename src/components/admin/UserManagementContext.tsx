
import { createContext, useState, useContext, ReactNode } from 'react';
import { AdminUser } from './types';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserManagementContextProps {
  users: AdminUser[] | undefined;
  refetchUsers: () => Promise<void>;
  isLoading: boolean;
  selectedUser: AdminUser | null;
  setSelectedUser: (user: AdminUser | null) => void;
  isConfirmDeleteOpen: boolean;
  setIsConfirmDeleteOpen: (open: boolean) => void;
  isUserDetailsOpen: boolean;
  setIsUserDetailsOpen: (open: boolean) => void;
  isPasswordResetOpen: boolean;
  setIsPasswordResetOpen: (open: boolean) => void;
  newPassword: string;
  setNewPassword: (password: string) => void;
  generatedPassword: string;
  setGeneratedPassword: (password: string) => void;
  handleDeleteUser: () => Promise<void>;
  handleToggleUserStatus: (user: AdminUser) => Promise<void>;
  generateRandomPassword: () => string;
}

const UserManagementContext = createContext<UserManagementContextProps | undefined>(undefined);

export const UserManagementProvider = ({ children }: { children: ReactNode }) => {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');

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

  const refetchUsers = async () => {
    await refetch();
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

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const value = {
    users,
    refetchUsers,
    isLoading,
    selectedUser,
    setSelectedUser,
    isConfirmDeleteOpen,
    setIsConfirmDeleteOpen,
    isUserDetailsOpen,
    setIsUserDetailsOpen,
    isPasswordResetOpen,
    setIsPasswordResetOpen,
    newPassword,
    setNewPassword,
    generatedPassword,
    setGeneratedPassword,
    handleDeleteUser,
    handleToggleUserStatus,
    generateRandomPassword,
  };

  return (
    <UserManagementContext.Provider value={value}>
      {children}
    </UserManagementContext.Provider>
  );
};

export const useUserManagement = () => {
  const context = useContext(UserManagementContext);
  if (context === undefined) {
    throw new Error('useUserManagement must be used within a UserManagementProvider');
  }
  return context;
};
