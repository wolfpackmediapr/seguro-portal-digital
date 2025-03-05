
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useFetchLogs } from './hooks/useFetchLogs';
import { ActivityLogsTable } from './logs/ActivityLogsTable';
import { SessionsTable } from './logs/SessionsTable';
import { LogFilters } from './logs/LogFilters';
import { ExportButton } from './logs/ExportButton';
import { LogActionType } from './types';
import { supabase } from '@/integrations/supabase/client';

export const AdminLogs = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('activity');
  
  // Filters
  const [userId, setUserId] = useState('');
  const [actionType, setActionType] = useState<LogActionType | ''>('');
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
    actionType: actionType as LogActionType,
    startDate,
    endDate
  });

  // Setup realtime subscription for live updates
  useEffect(() => {
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
    setActionType('');
    setStartDate('');
    setEndDate('');
    
    // Wait for state to update before refetching
    setTimeout(() => {
      console.log('Filters reset, refetching...');
      refetchActivityLogs();
      refetchSessions();
    }, 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Logs</CardTitle>
        <CardDescription>
          View and monitor user activity and sessions across the application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="activity">Activity Logs</TabsTrigger>
              <TabsTrigger value="sessions">User Sessions</TabsTrigger>
            </TabsList>
            
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
          
          <TabsContent value="activity" className="mt-0">
            <ActivityLogsTable logs={activityLogs} isLoading={isLoadingActivity} />
          </TabsContent>
          
          <TabsContent value="sessions" className="mt-0">
            <SessionsTable sessions={sessions} isLoading={isLoadingSessions} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
