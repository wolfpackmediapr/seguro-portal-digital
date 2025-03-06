
import { LogActionType } from '../types';

export interface UserSessionsQueryParams {
  page: number;
  pageSize: number;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface UserSessionsCountParams {
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface UserSessionsHookState {
  sessions: Array<any>;
  isLoading: boolean;
  error: Error | null;
  isFetching: boolean;
}
