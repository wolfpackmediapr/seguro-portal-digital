
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFetchLogs } from './hooks/useFetchLogs';
import { ActivityLogsTable } from './logs/ActivityLogsTable';
import { SessionsTable } from './logs/SessionsTable';
import { LogFilters } from './logs/LogFilters';
import { ExportButton } from './logs/ExportButton';
import { LogActionType } from './types';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export const AdminLogs = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('activity');
  
  // Filters
  const [userId, setUserId] = useState('');
  const [actionType, setActionType] = useState<LogActionType | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Fetch logs with the useFetchLogs custom hook
  const {
    activityLogs,
    sessions,
    isLoadingActivity,
    isLoadingSessions,
    refetchActivityLogs,
    refetchSessions,
    error
  } = useFetchLogs({
    userId,
    actionType: actionType as LogActionType | undefined,
    startDate,
    endDate
  });

  // Setup realtime subscription for live updates
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
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
      }
    };
    
    setupRealtimeSubscription();
  }, [refetchActivityLogs, refetchSessions]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error('Error in AdminLogs:', error);
      toast({
        title: 'Error loading logs',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  // Apply filters
  const handleApplyFilters = () => {
    console.log('Applying filters:', { userId, actionType, startDate, endDate });
    refetchActivityLogs();
    refetchSessions();
  };

  // Reset filters
  const handleResetFilters = () => {
    setUserId('');
    setActionType(null);
    setStartDate('');
    setEndDate('');
    
    // Wait for state to update before refetching
    setTimeout(() => {
      console.log('Filters reset, refetching...');
      refetchActivityLogs();
      refetchSessions();
    }, 0);
  };

  if (isLoadingActivity && isLoadingSessions) {
    return (
      <Card className="border shadow-sm rounded-lg">
        <CardHeader className="bg-white rounded-t-lg pb-0">
          <CardTitle>System Logs</CardTitle>
          <CardDescription className="text-gray-500 mt-1">
            Loading system logs...
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 flex justify-center items-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm rounded-lg">
      <CardHeader className="bg-white rounded-t-lg pb-0">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>System Logs</CardTitle>
            <CardDescription className="text-gray-500 mt-1">
              View and monitor user activity and sessions across the application.
            </CardDescription>
          </div>
          {activeTab === 'activity' && (
            <ExportButton 
              data={activityLogs} 
              filename="activity-logs" 
              isDisabled={isLoadingActivity || activityLogs.length === 0}
            />
          )}
          {activeTab === 'sessions' && (
            <ExportButton 
              data={sessions} 
              filename="user-sessions" 
              isDisabled={isLoadingSessions || sessions.length === 0}
            />
          )}
        </div>
        
        <div className="flex border-b mt-6">
          <Button
            variant="ghost"
            className={`rounded-none border-b-2 px-4 py-2 ${
              activeTab === 'activity'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-gray-500'
            }`}
            onClick={() => setActiveTab('activity')}
          >
            Activity Logs
          </Button>
          <Button
            variant="ghost"
            className={`rounded-none border-b-2 px-4 py-2 ${
              activeTab === 'sessions'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-gray-500'
            }`}
            onClick={() => setActiveTab('sessions')}
          >
            User Sessions
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <LogFilters
          userId={userId}
          setUserId={setUserId}
          actionType={actionType}
          setActionType={setActionType}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
        />
        
        {activeTab === 'activity' && (
          <ActivityLogsTable logs={activityLogs} isLoading={isLoadingActivity} />
        )}
        
        {activeTab === 'sessions' && (
          <SessionsTable sessions={sessions} isLoading={isLoadingSessions} />
        )}
      </CardContent>
    </Card>
  );
};
