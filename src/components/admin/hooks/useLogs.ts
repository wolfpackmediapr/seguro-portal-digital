
import { useState, useEffect } from 'react';
import { useActivityLogs } from './useActivityLogs';
import { useUserSessions } from './useUserSessions';
import { useLogsRealtime } from './useLogsRealtime';
import { LogsFilters } from './useLogsTypes';

export const useLogs = (filters: LogsFilters = {}) => {
  const {
    activityLogs,
    isLoading: isLoadingActivity,
    fetch: fetchActivityLogs,
    error: activityError,
    pagination: activityPagination
  } = useActivityLogs(filters);

  const {
    sessions,
    isLoading: isLoadingSessions,
    fetch: fetchSessions,
    error: sessionsError,
    pagination: sessionsPagination
  } = useUserSessions(filters);

  // Combine errors
  const error = activityError || sessionsError;

  // Setup realtime subscription for both logs
  useLogsRealtime({
    refetchActivityLogs: () => fetchActivityLogs(activityPagination.page),
    refetchSessions: () => fetchSessions(sessionsPagination.page)
  });

  return {
    // Activity logs data and controls
    activityLogs,
    isLoadingActivity,
    fetchActivityLogs,
    activityPagination,
    
    // Sessions data and controls
    sessions,
    isLoadingSessions,
    fetchSessions,
    sessionsPagination,
    
    // Combined error if either has an error
    error
  };
};
