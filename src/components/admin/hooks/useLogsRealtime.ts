
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { debounce } from './useLogsUtils';

interface UseLogsRealtimeProps {
  refetchActivityLogs: () => void;
  refetchSessions: () => void;
}

export const useLogsRealtime = ({ 
  refetchActivityLogs, 
  refetchSessions 
}: UseLogsRealtimeProps) => {
  const { toast } = useToast();
  const debouncedRefetchActivityLogs = useRef(debounce(refetchActivityLogs, 1000));
  const debouncedRefetchSessions = useRef(debounce(refetchSessions, 1000));

  useEffect(() => {
    // Update the debounced functions when the props change
    debouncedRefetchActivityLogs.current = debounce(refetchActivityLogs, 1000);
    debouncedRefetchSessions.current = debounce(refetchSessions, 1000);
  }, [refetchActivityLogs, refetchSessions]);

  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("Error checking auth session:", sessionError);
          toast({
            title: 'Authentication error',
            description: 'Could not verify your session',
            variant: 'destructive',
          });
          return;
        }
        
        if (!sessionData.session) {
          console.log("No active session for realtime updates");
          return;
        }
        
        console.log("Setting up realtime channel for logs updates");
        const channel = supabase
          .channel('admin-logs-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'user_activity_logs'
            },
            () => {
              console.log('Activity logs changed, debounced refetching...');
              debouncedRefetchActivityLogs.current();
            }
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'user_sessions'
            },
            () => {
              console.log('Sessions changed, debounced refetching...');
              debouncedRefetchSessions.current();
            }
          )
          .subscribe(status => {
            console.log('Realtime subscription status:', status);
          });

        return () => {
          console.log('Removing realtime channel');
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Error setting up realtime subscription:', error);
        toast({
          title: 'Realtime subscription error',
          description: 'Could not listen for data changes',
          variant: 'destructive',
        });
      }
    };
    
    setupRealtimeSubscription();
  }, [toast]);
};
