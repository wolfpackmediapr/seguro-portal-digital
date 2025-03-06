
import { LogActionType } from '../types';

export interface LogsFilters {
  userId?: string;
  actionType?: LogActionType;
  startDate?: string;
  endDate?: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginationControls {
  page: number;
  pageSize: number;
  total: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}
