
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

interface UserWithEmail {
  email: string;
}

export function AdminLogs() {
  const [activeTab, setActiveTab] = useState<'activity' | 'sessions'>('activity');

  const { data: activityLogs } = useQuery({
    queryKey: ['admin-activity-logs'],
    queryFn: async () => {
      // First, get the activity logs
      const { data: logsData, error: logsError } = await supabase
        .from('user_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;
      
      // Then, for each log, get the user email from auth.users
      const logsWithUsers = await Promise.all((logsData || []).map(async (log) => {
        const { data: userData } = await supabase
          .auth.admin.getUserById(log.user_id);
        
        return {
          ...log,
          user: { email: userData?.user?.email || 'Unknown' }
        };
      }));

      return logsWithUsers as (UserActivityLog & { user: UserWithEmail })[];
    },
  });

  const { data: sessions } = useQuery({
    queryKey: ['admin-sessions'],
    queryFn: async () => {
      // First, get the sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('user_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (sessionsError) throw sessionsError;
      
      // Then, for each session, get the user email from auth.users
      const sessionsWithUsers = await Promise.all((sessionsData || []).map(async (session) => {
        const { data: userData } = await supabase
          .auth.admin.getUserById(session.user_id);
        
        return {
          ...session,
          user: { email: userData?.user?.email || 'Unknown' }
        };
      }));

      return sessionsWithUsers as (UserSession & { user: UserWithEmail })[];
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

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={(v: 'activity' | 'sessions') => setActiveTab(v)}>
          <TabsList className="mb-4">
            <TabsTrigger value="activity">Activity Logs</TabsTrigger>
            <TabsTrigger value="sessions">User Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="activity">
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
                  {activityLogs?.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </TableCell>
                      <TableCell>{log.user?.email}</TableCell>
                      <TableCell className="capitalize">
                        {log.action_type.replace(/_/g, ' ')}
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {log.details ? JSON.stringify(log.details) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="sessions">
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
                  {sessions?.map((session) => (
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
