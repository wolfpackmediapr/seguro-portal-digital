
import { Database } from '@/integrations/supabase/types';

export type Json = Database['public']['Enums']['log_action_type'] | 
  string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type LogActionType = Database['public']['Enums']['log_action_type'];

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
  created_at: string;
  device_info?: Record<string, any> | null;
  ip_address?: string | null;
  location?: Record<string, any> | null;
}

export interface UserActivityLog {
  id: string;
  session_id: string | null;
  user_id: string;
  action_type: LogActionType;
  details: Record<string, any> | null;
  created_at: string;
}
