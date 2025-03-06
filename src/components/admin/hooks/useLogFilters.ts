
import { useState } from 'react';
import { LogActionType } from '../types';

export const useLogFilters = () => {
  // Filters state
  const [userId, setUserId] = useState('');
  const [actionType, setActionType] = useState<LogActionType | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Handle action type change
  const handleActionTypeChange = (value: string) => {
    if (value === 'clear') {
      setActionType(null);
    } else {
      // Only set valid action types from the enum
      setActionType(value as LogActionType);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setUserId('');
    setActionType(null);
    setStartDate('');
    setEndDate('');
  };

  return {
    filters: {
      userId,
      actionType,
      startDate, 
      endDate
    },
    setters: {
      setUserId,
      setActionType: handleActionTypeChange,
      setStartDate,
      setEndDate
    },
    resetFilters
  };
};
