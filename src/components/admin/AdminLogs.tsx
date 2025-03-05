
import { useState } from 'react';
import { format, subDays } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Import our new components
import { LogsHeader } from './logs/LogsHeader';
import { SearchBar } from './logs/SearchBar';
import { ActionTypeFilter } from './logs/ActionTypeFilter';
import { LogsDateRangeSelector } from './logs/LogsDateRangeSelector';
import { ActivityLogsTable } from './logs/ActivityLogsTable';
import { UserSessionsTable } from './logs/UserSessionsTable';
import { useFetchLogs } from './logs/hooks/useFetchLogs';
import { formatDate, formatActionType, getSessionDuration, prepareExportData, createCsvContent } from './logs/utils';

export function AdminLogs() {
  const [activeTab, setActiveTab] = useState<'activity' | 'sessions'>('activity');
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  const {
    activityLogs,
    sessions,
    logsLoading,
    sessionsLoading,
    logsError,
    sessionsError,
    refetchLogs,
    refetchSessions,
    searchTerm,
    setSearchTerm,
    actionTypeFilter,
    setActionTypeFilter
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

  const exportToCsv = () => {
    const data = prepareExportData(
      activeTab, 
      activityLogs, 
      sessions, 
      formatDate, 
      formatActionType, 
      getSessionDuration
    );

    if (!data || data.length === 0) {
      toast({
        title: "No data to export",
        description: "There is no data available to export.",
        variant: "destructive"
      });
      return;
    }

    // Create CSV content
    const csvContent = createCsvContent(data);
    if (!csvContent) return;

    // Download the CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeTab}_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        <LogsHeader 
          activeTab={activeTab} 
          handleRefresh={handleRefresh} 
          exportToCsv={exportToCsv} 
        />
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={(v: 'activity' | 'sessions') => setActiveTab(v)}>
          <div className="mb-4 flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
            <TabsList>
              <TabsTrigger value="activity">Activity Logs</TabsTrigger>
              <TabsTrigger value="sessions">User Sessions</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
              
              {activeTab === 'activity' && (
                <ActionTypeFilter 
                  actionTypeFilter={actionTypeFilter} 
                  setActionTypeFilter={setActionTypeFilter} 
                />
              )}
              
              <LogsDateRangeSelector dateRange={dateRange} setDateRange={setDateRange} />
            </div>
          </div>

          <TabsContent value="activity">
            <ActivityLogsTable 
              logs={activityLogs}
              isLoading={logsLoading}
              searchTerm={searchTerm}
              handleRefresh={handleRefresh}
              formatDate={formatDate}
              formatActionType={formatActionType}
            />
          </TabsContent>

          <TabsContent value="sessions">
            <UserSessionsTable 
              sessions={sessions}
              isLoading={sessionsLoading}
              searchTerm={searchTerm}
              handleRefresh={handleRefresh}
              formatDate={formatDate}
              getSessionDuration={getSessionDuration}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
