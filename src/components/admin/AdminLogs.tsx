
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFetchLogs } from './hooks/useFetchLogs';
import { ActivityLogsTable } from './logs/ActivityLogsTable';
import { SessionsTable } from './logs/SessionsTable';
import { LogFilters } from './logs/LogFilters';
import { ExportButton } from './logs/ExportButton';
import { LogActionType } from './types';
import { Loader2 } from 'lucide-react';
import { PaginationControls } from './logs/PaginationControls';
import { LogsTabs } from './logs/LogsTabs';
import { useLogsRealtime } from './hooks/useLogsRealtime';

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
    error,
    // Pagination states
    activityPage,
    sessionsPage,
    totalActivityLogs,
    totalSessions,
    pageSize,
    setActivityPage,
    setSessionsPage,
    setPageSize
  } = useFetchLogs({
    userId,
    actionType: actionType as LogActionType | undefined,
    startDate,
    endDate
  });

  // Setup realtime subscription for live updates using the custom hook
  useLogsRealtime({
    refetchActivityLogs,
    refetchSessions
  });

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
    // Reset to first page when applying filters
    setActivityPage(1);
    setSessionsPage(1); 
    refetchActivityLogs(1);
    refetchSessions(1);
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
      setActivityPage(1);
      setSessionsPage(1);
      refetchActivityLogs(1);
      refetchSessions(1);
    }, 0);
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    if (activeTab === 'activity') {
      setActivityPage(newPage);
      refetchActivityLogs(newPage);
    } else {
      setSessionsPage(newPage);
      refetchSessions(newPage);
    }
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Calculate total pages
  const totalPages = activeTab === 'activity' 
    ? Math.ceil(totalActivityLogs / pageSize) 
    : Math.ceil(totalSessions / pageSize);
  
  // Current page based on active tab
  const currentPage = activeTab === 'activity' ? activityPage : sessionsPage;

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
        
        <LogsTabs activeTab={activeTab} onTabChange={handleTabChange} />
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
        
        {/* Pagination Controls Component */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={activeTab === 'activity' ? totalActivityLogs : totalSessions}
          isLoading={activeTab === 'activity' ? isLoadingActivity : isLoadingSessions}
          onPageChange={handlePageChange}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setActivityPage(1);
            setSessionsPage(1);
            if (activeTab === 'activity') {
              refetchActivityLogs(1);
            } else {
              refetchSessions(1);
            }
          }}
          itemsName={activeTab === 'activity' ? 'logs' : 'sessions'}
        />
      </CardContent>
    </Card>
  );
};
