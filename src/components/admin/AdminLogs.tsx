
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLogs } from './hooks/useLogs';
import { useLogFilters } from './hooks/useLogFilters';
import { ActivityLogsTable } from './logs/ActivityLogsTable';
import { SessionsTable } from './logs/SessionsTable';
import { LogFilters } from './logs/LogFilters';
import { LogsLoadingState } from './logs/LogsLoadingState';
import { LogsHeader } from './logs/LogsHeader';
import { LogsPaginationWrapper } from './logs/LogsPaginationWrapper';

export const AdminLogs = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('activity');
  
  // Use the custom hook for filter state
  const { filters, setters, resetFilters } = useLogFilters();
  
  // Fetch logs with the useLogs custom hook
  const {
    activityLogs,
    sessions,
    isLoadingActivity,
    isLoadingSessions,
    fetchActivityLogs,
    fetchSessions,
    error,
    activityPagination,
    sessionsPagination
  } = useLogs({
    userId: filters.userId,
    actionType: filters.actionType,
    startDate: filters.startDate,
    endDate: filters.endDate
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
    console.log('Applying filters:', filters);
    // Reset to first page when applying filters
    activityPagination.setPage(1);
    sessionsPagination.setPage(1); 
    fetchActivityLogs(1);
    fetchSessions(1);
  };

  // Reset filters
  const handleResetFilters = () => {
    resetFilters();
    
    // Wait for state to update before refetching
    setTimeout(() => {
      console.log('Filters reset, refetching...');
      activityPagination.setPage(1);
      sessionsPagination.setPage(1);
      fetchActivityLogs(1);
      fetchSessions(1);
    }, 0);
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Add the missing handlers for pagination
  const handlePageChange = (newPage: number) => {
    if (activeTab === 'activity') {
      activityPagination.setPage(newPage);
    } else {
      sessionsPagination.setPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    if (activeTab === 'activity') {
      activityPagination.setPageSize(newSize);
    } else {
      sessionsPagination.setPageSize(newSize);
    }
  };

  // Current pagination based on active tab
  const currentPagination = activeTab === 'activity' 
    ? activityPagination 
    : sessionsPagination;
  
  if (isLoadingActivity && isLoadingSessions) {
    return <LogsLoadingState />;
  }

  const currentData = activeTab === 'activity' ? activityLogs : sessions;
  const currentLoading = activeTab === 'activity' ? isLoadingActivity : isLoadingSessions;
  const filename = activeTab === 'activity' ? 'activity-logs' : 'user-sessions';

  return (
    <Card className="border shadow-sm rounded-lg">
      <LogsHeader 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        data={currentData}
        isLoading={currentLoading}
        filename={filename}
      />
      
      <CardContent className="pt-4">
        <LogFilters
          userId={filters.userId}
          setUserId={setters.setUserId}
          actionType={filters.actionType}
          setActionType={setters.setActionType}
          startDate={filters.startDate}
          setStartDate={setters.setStartDate}
          endDate={filters.endDate}
          setEndDate={setters.setEndDate}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
        />
        
        {activeTab === 'activity' && (
          <ActivityLogsTable logs={activityLogs} isLoading={isLoadingActivity} />
        )}
        
        {activeTab === 'sessions' && (
          <SessionsTable sessions={sessions} isLoading={isLoadingSessions} />
        )}
        
        <LogsPaginationWrapper
          currentPage={currentPagination.page}
          totalPages={Math.ceil(currentPagination.total / currentPagination.pageSize)}
          pageSize={currentPagination.pageSize}
          totalItems={currentPagination.total}
          isLoading={currentLoading}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          itemsName={activeTab === 'activity' ? 'logs' : 'sessions'}
        />
      </CardContent>
    </Card>
  );
};
