
import { LogActionType } from '../types';
import { Database } from '@/integrations/supabase/types';

// Type for the database enum values only
export type DatabaseLogActionType = Database['public']['Enums']['log_action_type'];

export interface ActivityLogsQueryParams {
  page: number;
  pageSize: number;
  userId?: string;
  actionType?: LogActionType;
  startDate?: string;
  endDate?: string;
}

export interface ActivityLogsCountParams {
  userId?: string;
  actionType?: LogActionType;
  startDate?: string;
  endDate?: string;
}

export interface ActivityLogsHookState {
  activityLogs: Array<any>;
  isLoading: boolean;
  error: Error | null;
  isFetching: boolean;
}
