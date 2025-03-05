
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserActivityLog, UserSession, LogActionType } from './types';
import { format, subDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ReloadIcon, SearchIcon, DownloadIcon, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserWithEmail {
  email: string;
}

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

  const formatDate = (date: string) => {
    return format(new Date(date), 'yyyy-MM-dd HH:mm:ss');
  };

  const getSessionDuration = (session: UserSession) => {
    const start = new Date(session.login_time);
    const end = session.logout_time ? new Date(session.logout_time) : new Date();
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const formatActionType = (actionType: string) => {
    return actionType.replace(/_/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const exportToCsv = () => {
    const data = activeTab === 'activity' 
      ? activityLogs?.map(log => ({
          date: formatDate(log.created_at),
          user: log.user?.email,
          action: formatActionType(log.action_type),
          details: JSON.stringify(log.details)
        }))
      : sessions?.map(session => ({
          user: session.user?.email,
          login_time: formatDate(session.login_time),
          logout_time: session.logout_time ? formatDate(session.logout_time) : 'Active',
          duration: getSessionDuration(session),
          status: session.active ? 'Active' : 'Ended'
        }));

    if (!data || data.length === 0) {
      toast({
        title: "No data to export",
        description: "There is no data available to export.",
        variant: "destructive"
      });
      return;
    }

    // Convert to CSV
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => 
          JSON.stringify(row[header as keyof typeof row] || '')
        ).join(',')
      )
    ];
    const csvContent = csvRows.join('\n');

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
                <ReloadIcon className="mr-2 h-4 w-4" />
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
              <ReloadIcon className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportToCsv}>
              <DownloadIcon className="mr-2 h-4 w-4" />
              Export
            </Button>
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
            
            <div className="flex-1 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              {activeTab === 'activity' && (
                <Select 
                  value={actionTypeFilter}
                  onValueChange={(value) => setActionTypeFilter(value as LogActionType | 'all')}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="logout">Logout</SelectItem>
                    <SelectItem value="create_user">Create User</SelectItem>
                    <SelectItem value="update_user">Update User</SelectItem>
                    <SelectItem value="delete_user">Delete User</SelectItem>
                    <SelectItem value="session_start">Session Start</SelectItem>
                    <SelectItem value="session_end">Session End</SelectItem>
                    <SelectItem value="feature_access">Feature Access</SelectItem>
                  </SelectContent>
                </Select>
              )}
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px] justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>
                      {format(dateRange.from, 'PPP')} - {format(dateRange.to, 'PPP')}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{
                      from: dateRange.from,
                      to: dateRange.to,
                    }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to });
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <TabsContent value="activity">
            {logsLoading ? (
              <div className="p-4 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
                <p>Loading activity logs...</p>
              </div>
            ) : filteredActivityLogs && filteredActivityLogs.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActivityLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(log.created_at)}
                        </TableCell>
                        <TableCell>{log.user?.email}</TableCell>
                        <TableCell>
                          {formatActionType(log.action_type)}
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {log.details ? JSON.stringify(log.details) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-4 text-center">
                <p>No activity logs found{searchTerm ? ' matching your search criteria' : ''}.</p>
                <Button 
                  variant="outline" 
                  onClick={handleRefresh} 
                  className="mt-2"
                >
                  <ReloadIcon className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sessions">
            {sessionsLoading ? (
              <div className="p-4 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
                <p>Loading user sessions...</p>
              </div>
            ) : filteredSessions && filteredSessions.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Login Time</TableHead>
                      <TableHead>Logout Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>{session.user?.email}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(session.login_time)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {session.logout_time ? formatDate(session.logout_time) : '-'}
                        </TableCell>
                        <TableCell>{getSessionDuration(session)}</TableCell>
                        <TableCell>
                          <span 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              session.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {session.active ? 'Active' : 'Ended'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-4 text-center">
                <p>No user sessions found{searchTerm ? ' matching your search criteria' : ''}.</p>
                <Button 
                  variant="outline" 
                  onClick={handleRefresh} 
                  className="mt-2"
                >
                  <ReloadIcon className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
