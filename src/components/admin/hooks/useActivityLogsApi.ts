
import { supabase } from '@/integrations/supabase/client';
import { ActivityLogsCountParams, ActivityLogsQueryParams, DatabaseLogActionType } from './useActivityLogsTypes';
import { LogActionType } from '../types';
import { networkDelay } from './useLogsUtils';

// Helper function to check if a LogActionType is a valid database enum value
export const isValidDatabaseActionType = (actionType: LogActionType): boolean => {
  const validTypes: DatabaseLogActionType[] = [
    'login', 'logout', 'create_user', 'update_user', 
    'delete_user', 'session_start', 'session_end', 'feature_access'
  ];
  return validTypes.includes(actionType as DatabaseLogActionType);
};

// Get the count of activity logs with filters
export const getActivityLogsCount = async (params: ActivityLogsCountParams): Promise<number> => {
  await networkDelay();
  
  let countQuery = supabase
    .from('user_activity_logs')
    .select('id', { count: 'exact', head: true });
  
  // Apply filters for count query
  if (params.userId && params.userId.trim() !== '') {
    countQuery = countQuery.eq('user_id', params.userId);
  }

  if (params.actionType) {
    // Only apply the filter if the action type is a valid database enum value
    const isValidDbEnum = isValidDatabaseActionType(params.actionType);
    if (isValidDbEnum) {
      countQuery = countQuery.eq('action_type', params.actionType as DatabaseLogActionType);
    } else {
      console.log(`Action type "${params.actionType}" is not a valid database enum value, skipping filter`);
    }
  }

  if (params.startDate && params.startDate.trim() !== '') {
    countQuery = countQuery.gte('created_at', params.startDate);
  }

  if (params.endDate && params.endDate.trim() !== '') {
    countQuery = countQuery.lte('created_at', params.endDate);
  }
  
  const { count, error } = await countQuery;
  
  if (error) {
    console.error('Supabase error fetching activity logs count:', error);
    throw error;
  }
  
  return count || 0;
};

// Fetch activity logs with pagination and filters
export const fetchActivityLogs = async (params: ActivityLogsQueryParams): Promise<any[]> => {
  await networkDelay();
  
  // Calculate range for pagination
  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;
  
  let query = supabase
    .from('user_activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to);

  // Apply filters - only if they have values
  if (params.userId && params.userId.trim() !== '') {
    query = query.eq('user_id', params.userId);
  }

  if (params.actionType) {
    // Only apply the filter if the action type is a valid database enum value
    const isValidDbEnum = isValidDatabaseActionType(params.actionType);
    if (isValidDbEnum) {
      query = query.eq('action_type', params.actionType as DatabaseLogActionType);
    } else {
      console.log(`Action type "${params.actionType}" is not a valid database enum value, skipping filter`);
    }
  }

  if (params.startDate && params.startDate.trim() !== '') {
    query = query.gte('created_at', params.startDate);
  }

  if (params.endDate && params.endDate.trim() !== '') {
    query = query.lte('created_at', params.endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Supabase error fetching activity logs:', error);
    throw error;
  }

  return data || [];
};
