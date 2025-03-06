
import { supabase } from '@/integrations/supabase/client';
import { UserSessionsCountParams, UserSessionsQueryParams } from './useUserSessionsTypes';
import { networkDelay } from './useLogsUtils';

// Get the count of user sessions with filters
export const getUserSessionsCount = async (params: UserSessionsCountParams): Promise<number> => {
  await networkDelay();
  
  let countQuery = supabase
    .from('user_sessions')
    .select('id', { count: 'exact', head: true });
  
  // Apply filters for count query
  if (params.userId && params.userId.trim() !== '') {
    countQuery = countQuery.eq('user_id', params.userId);
  }

  if (params.startDate && params.startDate.trim() !== '') {
    countQuery = countQuery.gte('login_time', params.startDate);
  }

  if (params.endDate && params.endDate.trim() !== '') {
    countQuery = countQuery.lte('login_time', params.endDate);
  }
  
  const { count, error } = await countQuery;
  
  if (error) {
    console.error('Supabase error fetching sessions count:', error);
    throw error;
  }
  
  return count || 0;
};

// Fetch user sessions with pagination and filters
export const fetchUserSessions = async (params: UserSessionsQueryParams): Promise<any[]> => {
  await networkDelay();
  
  // Calculate range for pagination
  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;
  
  let query = supabase
    .from('user_sessions')
    .select('*')
    .order('login_time', { ascending: false })
    .range(from, to);

  // Apply filters - only if they have values
  if (params.userId && params.userId.trim() !== '') {
    query = query.eq('user_id', params.userId);
  }

  if (params.startDate && params.startDate.trim() !== '') {
    query = query.gte('login_time', params.startDate);
  }

  if (params.endDate && params.endDate.trim() !== '') {
    query = query.lte('login_time', params.endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Supabase error fetching sessions:', error);
    throw error;
  }

  return data || [];
};
