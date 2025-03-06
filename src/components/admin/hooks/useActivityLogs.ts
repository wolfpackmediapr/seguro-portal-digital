
import { useState, useCallback, useEffect } from 'react';
import { UserActivityLog, LogActionType } from '../types';
import { useToast } from '@/hooks/use-toast';
import { LogsFilters, PaginationControls } from './useLogsTypes';
import { checkAuthSession, debounce } from './useLogsUtils';
import { fetchActivityLogs, getActivityLogsCount } from './useActivityLogsApi';
import { ActivityLogsHookState } from './useActivityLogsTypes';

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
      console.log('Fetching activity logs with filters:', filters, 'page:', currentPage, 'pageSize:', pageSize);
      
      // First, get the count for pagination
      const totalCount = await getActivityLogsCount({
        userId: filters.userId,
        actionType: filters.actionType,
        startDate: filters.startDate,
        endDate: filters.endDate
      });
      
      setTotal(totalCount);
      
      // Now fetch the actual data with pagination
      const data = await fetchActivityLogs({
        page: currentPage,
        pageSize,
        userId: filters.userId,
        actionType: filters.actionType,
        startDate: filters.startDate,
        endDate: filters.endDate
      });

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
