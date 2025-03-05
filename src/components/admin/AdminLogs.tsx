
import { useState } from 'react';
import { subDays } from 'date-fns';
import { RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserActivityLog, UserSession, LogActionType } from './types';
import { useToast } from '@/hooks/use-toast';
import { useFetchLogs } from './hooks/useFetchLogs';
import { ActivityLogsTable } from './logs/ActivityLogsTable';
import { SessionsTable } from './logs/SessionsTable';
import { LogFilters } from './logs/LogFilters';
import { ExportButton } from './logs/ExportButton';

export function AdminLogs() {
  const [activeTab, setActiveTab] = useState<'activity' | 'sessions'>('activity');
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState<LogActionType | 'all'>('all');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  const {
    activityLogs,
    logsLoading,
    logsError,
    refetchLogs,
    sessions,
    sessionsLoading,
    sessionsError,
    refetchSessions
  } = useFetchLogs(dateRange);

  const handleRefresh = () => {
    if (activeTab === 'activity') {
      refetchLogs();
    } else {
      refetchSessions();
    }
    toast({
      title: "Refreshing data",
      description: "Updating the logs data...",
    });
  };

  const filteredActivityLogs = activityLogs?.filter(log => {
    const matchesSearch = 
      log.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesActionType = actionTypeFilter === 'all' || log.action_type === actionTypeFilter;
    
    return matchesSearch && matchesActionType;
  });

  const filteredSessions = sessions?.filter(session => 
    session.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (session.metadata && JSON.stringify(session.metadata).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (logsError || sessionsError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-600">
            Error loading logs. Please try again later.
            <div className="mt-4">
              <Button onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{activeTab === 'activity' ? 'Activity Logs' : 'User Sessions'}</span>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <ExportButton 
              activeTab={activeTab} 
              activityLogs={filteredActivityLogs} 
              sessions={filteredSessions} 
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={(v: 'activity' | 'sessions') => setActiveTab(v)}>
          <div className="mb-4 flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
            <TabsList>
              <TabsTrigger value="activity">Activity Logs</TabsTrigger>
              <TabsTrigger value="sessions">User Sessions</TabsTrigger>
            </TabsList>
            
            <LogFilters 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              actionTypeFilter={actionTypeFilter}
              onActionTypeFilterChange={setActionTypeFilter}
              showActionTypeFilter={activeTab === 'activity'}
            />
          </div>

          <TabsContent value="activity">
            <ActivityLogsTable 
              logs={filteredActivityLogs} 
              isLoading={logsLoading}
              searchTerm={searchTerm}
              onRefresh={handleRefresh}
            />
          </TabsContent>

          <TabsContent value="sessions">
            <SessionsTable 
              sessions={filteredSessions}
              isLoading={sessionsLoading}
              searchTerm={searchTerm}
              onRefresh={handleRefresh}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
