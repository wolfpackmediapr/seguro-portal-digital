
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserActivityLog, LogActionType } from '../types';
import { useToast } from '@/hooks/use-toast';
import { LogsFilters, PaginationControls } from './useLogsTypes';
import { checkAuthSession, networkDelay, debounce } from './useLogsUtils';

export const useActivityLogs = (filters: LogsFilters = {}) => {
  const [activityLogs, setActivityLogs] = useState<UserActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  
  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  
  // Track if a fetch is in progress to avoid duplicates
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const fetchLogs = useCallback(async (currentPage: number = 1) => {
    // Prevent concurrent fetches
    if (isFetching) return;
    
    setIsFetching(true);
    setIsLoading(true);
    setError(null);
    setPage(currentPage);

    try {
      await networkDelay();
      
      console.log('Fetching activity logs with filters:', filters, 'page:', currentPage, 'pageSize:', pageSize);
      
      // Calculate range for pagination
      const from = (currentPage - 1) * pageSize;
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
        // Use the action type directly since our LogActionType now matches the database
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
      
      setTotal(totalCount || 0);
      
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
        // Use the action type directly since our LogActionType now matches the database
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
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [filters, toast, pageSize, isFetching]);

  // Create a debounced version of the fetch function
  const debouncedFetch = useCallback(
    debounce((page: number) => fetchLogs(page), 500),
    [fetchLogs]
  );

  // Initial fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if we have a session first
        const hasSession = await checkAuthSession();
        
        if (!hasSession) {
          console.log("No active session found, skipping activity logs fetch");
          setIsLoading(false);
          return;
        }
        
        console.log("Active session found, fetching activity logs data");
        await fetchLogs(1);
      } catch (error) {
        console.error("Error in initial activity logs fetch:", error);
        setIsLoading(false);
        
        toast({
          title: 'Connection error',
          description: 'Could not connect to the database',
          variant: 'destructive',
        });
      }
    };
    
    fetchData();
  }, []);

  const pagination: PaginationControls = {
    page,
    pageSize,
    total,
    setPage: (newPage: number) => {
      setPage(newPage);
      debouncedFetch(newPage);
    },
    setPageSize: (newSize: number) => {
      setPageSize(newSize);
      setPage(1);
      debouncedFetch(1);
    }
  };

  return {
    activityLogs,
    isLoading,
    fetch: fetchLogs,
    error,
    pagination
  };
};
