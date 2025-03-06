import { Database } from '@/integrations/supabase/types';

export type Json = Database['public']['Enums']['log_action_type'] | 
  string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Extend the Database LogActionType with additional values
export type LogActionType = 
  | 'login' 
  | 'logout' 
  | 'create_user' 
  | 'update_user' 
  | 'delete_user' 
  | 'session_start' 
  | 'session_end'
  | 'feature_access'
  | 'password_recovery'
  | 'token_refresh'
  | 'user_created'
  | 'user_deleted'
  | 'user_updated';

export interface UserManagementLog {
  id: string;
  action_type: string;
  performed_by: string;
  target_user: string | null;
  details: Record<string, any> | null;
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
  disabled?: boolean;
  created_at: string;
  last_sign_in_at?: string;
  phone?: string;
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
}

export interface UserSession {
  id: string;
  user_id: string;
  login_time: string;
  logout_time: string | null;
  last_ping: string;
  active: boolean;
  metadata: Record<string, any> | null;
  device_info: {
    userAgent?: string;
    platform?: string;
    language?: string;
    screenSize?: string;
  } | null;
  location: Record<string, any> | null;
  ip_address?: string;
  created_at: string;
}

export interface UserActivityLog {
  id: string;
  user_id: string;
  action_type: LogActionType;
  session_id?: string;
  details?: Record<string, any> | null;
  created_at: string;
}
