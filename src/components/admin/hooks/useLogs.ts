
import { useState, useEffect } from 'react';
import { useActivityLogs } from './useActivityLogs';
import { useUserSessions } from './useUserSessions';
import { useLogsRealtime } from './useLogsRealtime';
import { LogsFilters } from './useLogsTypes';
import { mapActionType } from '../utils/actionTypeUtils';

export const useLogs = (filters: LogsFilters = {}) => {
  // Map action type if present
  const mappedFilters = { ...filters };
  if (filters.actionType) {
    // The actionType should be a valid LogActionType at this point
    const mappedActionType = mapActionType(filters.actionType);
    mappedFilters.actionType = mappedActionType || undefined;
  }

  const {
    activityLogs,
    isLoading: isLoadingActivity,
    fetch: fetchActivityLogs,
    error: activityError,
    pagination: activityPagination
  } = useActivityLogs(mappedFilters);

  const {
    sessions,
    isLoading: isLoadingSessions,
    fetch: fetchSessions,
    error: sessionsError,
    pagination: sessionsPagination
  } = useUserSessions(mappedFilters);

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
