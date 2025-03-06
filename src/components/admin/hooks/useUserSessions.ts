
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserSession } from '../types';
import { useToast } from '@/hooks/use-toast';
import { LogsFilters, PaginationControls } from './useLogsTypes';
import { checkAuthSession, networkDelay, debounce } from './useLogsUtils';

export const useUserSessions = (filters: LogsFilters = {}) => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  
  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  
  // Track if a fetch is in progress to avoid duplicates
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const fetch = useCallback(async (currentPage: number = 1) => {
    // Prevent concurrent fetches
    if (isFetching) return;
    
    setIsFetching(true);
    setIsLoading(true);
    setError(null);
    setPage(currentPage);

    try {
      await networkDelay();
      
      console.log('Fetching sessions with filters:', filters, 'page:', currentPage, 'pageSize:', pageSize);
      
      // Calculate range for pagination
      const from = (currentPage - 1) * pageSize;
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
      
      setTotal(totalCount || 0);
      
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
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [filters, toast, pageSize, isFetching]);

  // Create a debounced version of the fetch function
  const debouncedFetch = useCallback(
    debounce((page: number) => fetch(page), 500),
    [fetch]
  );

  // Initial fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if we have a session first
        const hasSession = await checkAuthSession();
        
        if (!hasSession) {
          console.log("No active session found, skipping sessions fetch");
          setIsLoading(false);
          return;
        }
        
        console.log("Active session found, fetching sessions data");
        await fetch(1);
      } catch (error) {
        console.error("Error in initial sessions fetch:", error);
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
    sessions,
    isLoading,
    fetch,
    error,
    pagination
  };
};
