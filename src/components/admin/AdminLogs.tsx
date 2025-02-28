
import { useState } from 'react';
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
import { Card, CardContent } from '@/components/ui/card';
import { UserActivityLog, UserSession } from './types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface UserWithEmail {
  email: string;
}

export function AdminLogs() {
  const [activeTab, setActiveTab] = useState<'activity' | 'sessions'>('activity');
  const { toast } = useToast();

  const { data: activityLogs, isLoading: logsLoading, error: logsError } = useQuery({
    queryKey: ['admin-activity-logs'],
    queryFn: async () => {
      try {
        // First, get the activity logs
        const { data: logsData, error: logsError } = await supabase
          .from('user_activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (logsError) throw logsError;
        
        // Then, for each log, get the user email from auth.users
        const logsWithUsers = await Promise.all((logsData || []).map(async (log) => {
          try {
            const { data: userData } = await supabase
              .auth.admin.getUserById(log.user_id);
            
            return {
              ...log,
              user: { email: userData?.user?.email || 'Unknown' }
            };
          } catch (error) {
            console.error('Error fetching user data:', error);
            return {
              ...log,
              user: { email: 'Unknown' }
            };
          }
        }));

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

  const { data: sessions, isLoading: sessionsLoading, error: sessionsError } = useQuery({
    queryKey: ['admin-sessions'],
    queryFn: async () => {
      try {
        // First, get the sessions
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('user_sessions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (sessionsError) throw sessionsError;
        
        // Then, for each session, get the user email from auth.users
        const sessionsWithUsers = await Promise.all((sessionsData || []).map(async (session) => {
          try {
            const { data: userData } = await supabase
              .auth.admin.getUserById(session.user_id);
            
            return {
              ...session,
              user: { email: userData?.user?.email || 'Unknown' }
            };
          } catch (error) {
            console.error('Error fetching user data:', error);
            return {
              ...session,
              user: { email: 'Unknown' }
            };
          }
        }));

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

  if (logsError || sessionsError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-600">
            Error loading logs. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={(v: 'activity' | 'sessions') => setActiveTab(v)}>
          <TabsList className="mb-4">
            <TabsTrigger value="activity">Activity Logs</TabsTrigger>
            <TabsTrigger value="sessions">User Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="activity">
            {logsLoading ? (
              <div className="p-4 text-center">Loading activity logs...</div>
            ) : activityLogs && activityLogs.length > 0 ? (
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
                    {activityLogs.map((log) => (
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
              <div className="p-4 text-center">No activity logs found.</div>
            )}
          </TabsContent>

          <TabsContent value="sessions">
            {sessionsLoading ? (
              <div className="p-4 text-center">Loading user sessions...</div>
            ) : sessions && sessions.length > 0 ? (
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
                    {sessions.map((session) => (
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
              <div className="p-4 text-center">No user sessions found.</div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
