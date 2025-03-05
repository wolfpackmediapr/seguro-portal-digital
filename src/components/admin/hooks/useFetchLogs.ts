
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserActivityLog, UserSession, LogActionType } from '../types';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  
  // Pagination state
  const [activityPage, setActivityPage] = useState<number>(1);
  const [sessionsPage, setSessionsPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalActivityLogs, setTotalActivityLogs] = useState<number>(0);
  const [totalSessions, setTotalSessions] = useState<number>(0);

  const refetchActivityLogs = useCallback(async (page: number = 1) => {
    setIsLoadingActivity(true);
    setError(null);
    setActivityPage(page);

    try {
      // Add a small delay to help with connection issues
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('Fetching activity logs with filters:', filters, 'page:', page, 'pageSize:', pageSize);
      
      // Calculate range for pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // First, get the count for pagination
      const countQuery = supabase
        .from('user_activity_logs')
        .select('id', { count: 'exact', head: true });
      
      // Apply filters for count query
      if (filters.userId && filters.userId.trim() !== '') {
        countQuery.eq('user_id', filters.userId);
      }

      if (filters.actionType) {
        countQuery.eq('action_type', filters.actionType);
      }

      if (filters.startDate && filters.startDate.trim() !== '') {
        countQuery.gte('created_at', filters.startDate);
      }

      if (filters.endDate && filters.endDate.trim() !== '') {
        countQuery.lte('created_at', filters.endDate);
      }
      
      const { count: totalCount, error: countError } = await countQuery;
      
      if (countError) {
        console.error('Supabase error fetching activity logs count:', countError);
        throw countError;
      }
      
      setTotalActivityLogs(totalCount || 0);
      
      // Now fetch the actual data with pagination
      let query = supabase
        .from('user_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      // Apply filters - only if they have values
      if (filters.userId && filters.userId.trim() !== '') {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.actionType) {
        query = query.eq('action_type', filters.actionType);
      }

      if (filters.startDate && filters.startDate.trim() !== '') {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters.endDate && filters.endDate.trim() !== '') {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Supabase error fetching activity logs:', fetchError);
        throw fetchError;
      }

      console.log('Activity logs fetched successfully:', data?.length || 0, 'records out of', totalCount);

      // Convert JSON to proper type
      const typedLogs: UserActivityLog[] = data?.map(log => ({
        ...log,
        details: log.details as Record<string, any> | null
      })) || [];

      setActivityLogs(typedLogs);
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      // Return empty data instead of failing
      setActivityLogs([]);
      
      toast({
        title: 'Could not load activity logs',
        description: 'Please try again later',
        variant: 'destructive',
      });
      
      setError(err instanceof Error ? err : new Error('Failed to fetch activity logs'));
    } finally {
      setIsLoadingActivity(false);
    }
  }, [filters, toast, pageSize]);

  const refetchSessions = useCallback(async (page: number = 1) => {
    setIsLoadingSessions(true);
    setError(null);
    setSessionsPage(page);

    try {
      // Add a small delay to help with connection issues
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('Fetching sessions with filters:', filters, 'page:', page, 'pageSize:', pageSize);
      
      // Calculate range for pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // First, get the count for pagination
      const countQuery = supabase
        .from('user_sessions')
        .select('id', { count: 'exact', head: true });
      
      // Apply filters for count query
      if (filters.userId && filters.userId.trim() !== '') {
        countQuery.eq('user_id', filters.userId);
      }

      if (filters.startDate && filters.startDate.trim() !== '') {
        countQuery.gte('login_time', filters.startDate);
      }

      if (filters.endDate && filters.endDate.trim() !== '') {
        countQuery.lte('login_time', filters.endDate);
      }
      
      const { count: totalCount, error: countError } = await countQuery;
      
      if (countError) {
        console.error('Supabase error fetching sessions count:', countError);
        throw countError;
      }
      
      setTotalSessions(totalCount || 0);
      
      // Now fetch the actual data with pagination
      let query = supabase
        .from('user_sessions')
        .select('*')
        .order('login_time', { ascending: false })
        .range(from, to);

      // Apply filters - only if they have values
      if (filters.userId && filters.userId.trim() !== '') {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.startDate && filters.startDate.trim() !== '') {
        query = query.gte('login_time', filters.startDate);
      }

      if (filters.endDate && filters.endDate.trim() !== '') {
        query = query.lte('login_time', filters.endDate);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Supabase error fetching sessions:', fetchError);
        throw fetchError;
      }

      console.log('Sessions fetched successfully:', data?.length || 0, 'records out of', totalCount);

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
      // Return empty data instead of failing
      setSessions([]);
      
      toast({
        title: 'Could not load user sessions',
        description: 'Please try again later',
        variant: 'destructive',
      });
      
      setError(err instanceof Error ? err : new Error('Failed to fetch sessions'));
    } finally {
      setIsLoadingSessions(false);
    }
  }, [filters, toast, pageSize]);

  // Initial fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if we have a session first
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error checking auth session:", sessionError);
          throw sessionError;
        }
        
        if (!sessionData.session) {
          console.log("No active session found, skipping data fetch");
          setIsLoadingActivity(false);
          setIsLoadingSessions(false);
          return;
        }
        
        console.log("Active session found, fetching logs data");
        
        // Fetch both types of data in parallel to improve performance
        await Promise.allSettled([refetchActivityLogs(1), refetchSessions(1)]);
      } catch (error) {
        console.error("Error in initial fetch:", error);
        setIsLoadingActivity(false);
        setIsLoadingSessions(false);
        
        toast({
          title: 'Connection error',
          description: 'Could not connect to the database',
          variant: 'destructive',
        });
      }
    };
    
    fetchData();
  }, [refetchActivityLogs, refetchSessions, toast]);

  return {
    activityLogs,
    sessions,
    isLoadingActivity,
    isLoadingSessions,
    refetchActivityLogs,
    refetchSessions,
    error,
    // Return pagination-related states and functions
    activityPage,
    sessionsPage,
    pageSize,
    totalActivityLogs,
    totalSessions,
    setActivityPage,
    setSessionsPage,
    setPageSize
  };
};
