
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserActivityLog, UserSession, LogActionType } from '../types';

interface LogsFilters {
  userId?: string;
  actionType?: LogActionType;
  startDate?: string;
  endDate?: string;
}

export const useFetchLogs = (filters: LogsFilters = {}) => {
  const [activityLogs, setActivityLogs] = useState<UserActivityLog[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState<boolean>(true);
  const [isLoadingSessions, setIsLoadingSessions] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const refetchActivityLogs = useCallback(async () => {
    setIsLoadingActivity(true);
    setError(null);

    try {
      let query = supabase
        .from('user_activity_logs')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.actionType) {
        query = query.eq('action_type', filters.actionType);
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Convert JSON to proper type
      const typedLogs: UserActivityLog[] = data?.map(log => ({
        ...log,
        details: log.details as Record<string, any> | null
      })) || [];

      setActivityLogs(typedLogs);
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch activity logs'));
    } finally {
      setIsLoadingActivity(false);
    }
  }, [filters]);

  const refetchSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    setError(null);

    try {
      let query = supabase
        .from('user_sessions')
        .select('*')
        .order('login_time', { ascending: false });

      // Apply filters
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.startDate) {
        query = query.gte('login_time', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('login_time', filters.endDate);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Convert JSON to proper type
      const typedSessions: UserSession[] = data?.map(session => ({
        ...session,
        metadata: session.metadata as Record<string, any> | null,
        device_info: session.device_info as Record<string, any> | null,
        location: session.location as Record<string, any> | null
      })) || [];

      setSessions(typedSessions);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch sessions'));
    } finally {
      setIsLoadingSessions(false);
    }
  }, [filters]);

  // Initial fetch
  useEffect(() => {
    refetchActivityLogs();
    refetchSessions();
  }, [refetchActivityLogs, refetchSessions]);

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
