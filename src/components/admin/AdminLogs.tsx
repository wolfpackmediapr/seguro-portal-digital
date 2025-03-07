
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLogs } from './hooks/useLogs';
import { useLogFilters } from './hooks/useLogFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

// Loading state component
const LogsLoadingState = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-[250px]" />
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  </div>
);

// LogFilters component
const LogFilters = ({ 
  userId, setUserId, 
  actionType, setActionType, 
  startDate, setStartDate, 
  endDate, setEndDate, 
  onApplyFilters, 
  onResetFilters 
}) => (
  <div className="space-y-4 mb-6 p-4 border rounded-md bg-muted/20">
    <div className="text-sm font-medium">Filter Logs</div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="space-y-2">
        <label className="text-sm">User ID</label>
        <input 
          type="text" 
          value={userId} 
          onChange={(e) => setUserId(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-sm" 
          placeholder="Filter by user ID" 
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm">Action Type</label>
        <select 
          value={actionType} 
          onChange={(e) => setActionType(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-sm"
        >
          <option value="">All Actions</option>
          <option value="login">Login</option>
          <option value="logout">Logout</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm">Start Date</label>
        <input 
          type="date" 
          value={startDate} 
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-sm" 
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm">End Date</label>
        <input 
          type="date" 
          value={endDate} 
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-sm" 
        />
      </div>
    </div>
    <div className="flex space-x-2">
      <button 
        onClick={onApplyFilters}
        className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-md"
      >
        Apply Filters
      </button>
      <button 
        onClick={onResetFilters}
        className="px-4 py-2 bg-secondary text-secondary-foreground text-sm rounded-md"
      >
        Reset
      </button>
    </div>
  </div>
);

// LogsHeader component
const LogsHeader = ({ activeTab, onTabChange, data, isLoading, filename }) => (
  <CardHeader className="border-b px-6 py-4">
    <div className="flex items-center justify-between">
      <CardTitle className="text-xl">System Logs</CardTitle>
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-auto">
        <TabsList>
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
          <TabsTrigger value="sessions">User Sessions</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  </CardHeader>
);

// ActivityLogsTable component
const ActivityLogsTable = ({ logs, isLoading }) => (
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Resource</TableHead>
          <TableHead>Timestamp</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
            </TableRow>
          ))
        ) : logs.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">No logs found</TableCell>
          </TableRow>
        ) : (
          logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-medium">{log.id}</TableCell>
              <TableCell>{log.user_id}</TableCell>
              <TableCell>{log.action}</TableCell>
              <TableCell>{log.resource}</TableCell>
              <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </div>
);

// SessionsTable component
const SessionsTable = ({ sessions, isLoading }) => (
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Session ID</TableHead>
          <TableHead>User</TableHead>
          <TableHead>IP Address</TableHead>
          <TableHead>Login Time</TableHead>
          <TableHead>Last Activity</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
            </TableRow>
          ))
        ) : sessions.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center">No sessions found</TableCell>
          </TableRow>
        ) : (
          sessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell className="font-medium">{session.id}</TableCell>
              <TableCell>{session.user_id}</TableCell>
              <TableCell>{session.ip_address}</TableCell>
              <TableCell>{new Date(session.created_at).toLocaleString()}</TableCell>
              <TableCell>{new Date(session.last_activity).toLocaleString()}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  session.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {session.active ? 'Active' : 'Ended'}
                </span>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </div>
);

// LogsPaginationWrapper component
const LogsPaginationWrapper = ({ 
  currentPage, 
  totalPages, 
  pageSize, 
  totalItems, 
  isLoading, 
  onPageChange, 
  onPageSizeChange, 
  itemsName 
}) => (
  <div className="flex items-center justify-between mt-4">
    <div className="text-sm text-muted-foreground">
      {isLoading ? (
        <Skeleton className="h-4 w-[200px]" />
      ) : (
        `Showing ${Math.min((currentPage - 1) * pageSize + 1, totalItems)} to ${Math.min(currentPage * pageSize, totalItems)} of ${totalItems} ${itemsName}`
      )}
    </div>
    <div className="flex items-center space-x-2">
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="h-8 w-[70px] rounded-md border border-input bg-background px-2 text-xs"
        disabled={isLoading}
      >
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
      </select>
      <nav className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          className="h-8 w-8 rounded-md border flex items-center justify-center text-sm disabled:opacity-50"
        >
          ←
        </button>
        <span className="text-sm">
          Page {currentPage} of {totalPages || 1}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          className="h-8 w-8 rounded-md border flex items-center justify-center text-sm disabled:opacity-50"
        >
          →
        </button>
      </nav>
    </div>
  </div>
);

// Main AdminLogs component
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
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handlers for pagination
  const handlePageChange = (newPage) => {
    if (activeTab === 'activity') {
      activityPagination.setPage(newPage);
    } else {
      sessionsPagination.setPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize) => {
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
