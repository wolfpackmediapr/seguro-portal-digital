
export interface UserManagementLog {
  id: string;
  action_type: string;
  performed_by: string;
  target_user: string | null;
  details: Record<string, any>;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'super_admin' | 'admin' | 'user';
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role?: string;
}
