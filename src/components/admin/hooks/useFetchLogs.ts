
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserActivityLog, UserSession, LogActionType } from '@/components/admin/types';

interface FetchLogsParams {
  userId?: string;
  actionType?: LogActionType;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export const useFetchLogs = ({
  userId = '',
  actionType,
  startDate = '',
  endDate = '',
  limit = 100
}: FetchLogsParams) => {
  const [activityLogs, setActivityLogs] = useState<UserActivityLog[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchActivityLogs = useCallback(async () => {
    setIsLoadingActivity(true);
    setError(null);
    
    try {
      let query = supabase
        .from('user_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      // Apply filters
      if (userId) {
        query = query.ilike('user_id', `%${userId}%`);
      }
      
      if (actionType) {
        query = query.eq('action_type', actionType);
      }
      
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      
      if (endDate) {
        query = query.lte('created_at', endDate);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) {
        throw new Error(fetchError.message);
      }
      
      setActivityLogs(data || []);
    } catch (err: any) {
      console.error('Error fetching activity logs:', err);
      setError(err);
    } finally {
      setIsLoadingActivity(false);
    }
  }, [userId, actionType, startDate, endDate, limit]);

  const fetchSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    setError(null);
    
    try {
      let query = supabase
        .from('user_sessions')
        .select('*')
        .order('login_time', { ascending: false })
        .limit(limit);
      
      // Apply user filter
      if (userId) {
        query = query.ilike('user_id', `%${userId}%`);
      }
      
      // Apply date filters
      if (startDate) {
        query = query.gte('login_time', startDate);
      }
      
      if (endDate) {
        query = query.lte('login_time', endDate);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) {
        throw new Error(fetchError.message);
      }
      
      setSessions(data || []);
    } catch (err: any) {
      console.error('Error fetching sessions:', err);
      setError(err);
    } finally {
      setIsLoadingSessions(false);
    }
  }, [userId, startDate, endDate, limit]);

  const refetchActivityLogs = useCallback(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  const refetchSessions = useCallback(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    fetchActivityLogs();
    fetchSessions();
  }, [fetchActivityLogs, fetchSessions]);

  return {
    activityLogs,
    sessions,
    isLoadingActivity,
    isLoadingSessions,
    refetchActivityLogs,
    refetchSessions,
    error
  };
};
