
import { format } from 'date-fns';
import { UserSession, LogActionType } from '../types';

export const formatDate = (date: string) => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm:ss');
};

export const getSessionDuration = (session: UserSession) => {
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

export const formatActionType = (actionType: string) => {
  return actionType.replace(/_/g, ' ').split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

export const isValidActionType = (type: string): type is LogActionType => {
  const validTypes: LogActionType[] = [
    'login', 'logout', 'create_user', 'update_user', 
    'delete_user', 'session_start', 'session_end', 'feature_access'
  ];
  return validTypes.includes(type as LogActionType);
};
