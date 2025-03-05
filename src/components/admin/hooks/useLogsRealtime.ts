
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseLogsRealtimeProps {
  refetchActivityLogs: () => void;
  refetchSessions: () => void;
}

export const useLogsRealtime = ({ 
  refetchActivityLogs, 
  refetchSessions 
}: UseLogsRealtimeProps) => {
  const { toast } = useToast();

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
              console.log('Activity logs changed, refetching...');
              refetchActivityLogs();
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
              console.log('Sessions changed, refetching...');
              refetchSessions();
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
  }, [refetchActivityLogs, refetchSessions, toast]);
};
