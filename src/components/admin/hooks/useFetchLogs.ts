
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserActivityLog, UserSession, LogActionType } from '../types';
import { isValidActionType } from '../utils/logUtils';
import { useToast } from '@/hooks/use-toast';

interface UserWithEmail {
  email: string;
}

export function useFetchLogs(dateRange: { from: Date; to: Date }) {
  const { toast } = useToast();
  
  // Activity Logs query
  const { 
    data: activityLogs, 
    isLoading: logsLoading, 
    error: logsError,
    refetch: refetchLogs 
  } = useQuery({
    queryKey: ['admin-activity-logs', dateRange],
    queryFn: async () => {
      try {
        console.log('Fetching activity logs...');
        // First, get the activity logs with date filter
        const query = supabase
          .from('user_activity_logs')
          .select('*')
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString())
          .order('created_at', { ascending: false })
          .limit(100);
        
        const { data: logsData, error: logsError } = await query;

        if (logsError) {
          console.error('Supabase error fetching logs:', logsError);
          throw logsError;
        }
        
        console.log('Logs data received:', logsData?.length || 0, 'records');
        
        // Then, for each log, get the user email from auth.users
        const logsWithUsers = await Promise.all((logsData || []).map(async (log) => {
          try {
            // Fetch user data only if we have a user_id
            if (log.user_id) {
              const { data: userData, error: userError } = await supabase
                .auth.admin.getUserById(log.user_id);
              
              if (userError) {
                console.warn('Error fetching user data:', userError);
                return {
                  ...log,
                  user: { email: 'Unknown' }
                };
              }
              
              return {
                ...log,
                user: { email: userData?.user?.email || 'Unknown' }
              };
            } else {
              return {
                ...log,
                user: { email: 'System' }
              };
            }
          } catch (error) {
            console.error('Error in user lookup:', error);
            return {
              ...log,
              user: { email: 'Error' }
            };
          }
        }));

        console.log('Processed logs with users:', logsWithUsers.length);
        return logsWithUsers as (UserActivityLog & { user: UserWithEmail })[];
      } catch (error) {
        console.error('Error fetching activity logs:', error);
        toast({
          title: "Error",
          description: "Failed to load activity logs",
          variant: "destructive"
        });
        return [];
      }
    },
  });

  // Sessions query
  const { 
    data: sessions, 
    isLoading: sessionsLoading, 
    error: sessionsError,
    refetch: refetchSessions
  } = useQuery({
    queryKey: ['admin-sessions', dateRange],
    queryFn: async () => {
      try {
        console.log('Fetching sessions...');
        // First, get the sessions with date filter
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('user_sessions')
          .select('*')
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString())
          .order('created_at', { ascending: false })
          .limit(100);

        if (sessionsError) {
          console.error('Supabase error fetching sessions:', sessionsError);
          throw sessionsError;
        }
        
        console.log('Sessions data received:', sessionsData?.length || 0, 'records');
        
        // Then, for each session, get the user email from auth.users
        const sessionsWithUsers = await Promise.all((sessionsData || []).map(async (session) => {
          try {
            if (session.user_id) {
              const { data: userData, error: userError } = await supabase
                .auth.admin.getUserById(session.user_id);
              
              if (userError) {
                console.warn('Error fetching user data for session:', userError);
                return {
                  ...session,
                  user: { email: 'Unknown' }
                };
              }
              
              return {
                ...session,
                user: { email: userData?.user?.email || 'Unknown' }
              };
            } else {
              return {
                ...session,
                user: { email: 'System' }
              };
            }
          } catch (error) {
            console.error('Error in session user lookup:', error);
            return {
              ...session,
              user: { email: 'Error' }
            };
          }
        }));

        console.log('Processed sessions with users:', sessionsWithUsers.length);
        return sessionsWithUsers as (UserSession & { user: UserWithEmail })[];
      } catch (error) {
        console.error('Error fetching sessions:', error);
        toast({
          title: "Error",
          description: "Failed to load user sessions",
          variant: "destructive"
        });
        return [];
      }
    },
  });

  return {
    activityLogs,
    logsLoading,
    logsError,
    refetchLogs,
    sessions,
    sessionsLoading,
    sessionsError,
    refetchSessions
  };
}
