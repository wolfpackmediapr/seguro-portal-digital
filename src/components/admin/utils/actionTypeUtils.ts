
import { LogActionType } from '../types';

// Valid action types from the database enum
const validActionTypes: LogActionType[] = [
  'login',
  'logout',
  'create_user',
  'update_user',
  'delete_user',
  'session_start',
  'session_end',
  'feature_access',
  'profile_update',
  'password_reset',
  'settings_change',
  'alert_create',
  'alert_update',
  'alert_delete'
];

// Map from client-side action types to database action types
const actionTypeMap: Record<string, LogActionType> = {
  'user_created': 'create_user',
  'user_updated': 'update_user',
  'user_deleted': 'delete_user',
  'password_recovery': 'password_reset',
  'token_refresh': 'login',
  // Add any other mappings as needed
};

/**
 * Validates if an action type is valid according to the database enum
 */
export const isValidActionType = (actionType: string): boolean => {
  return validActionTypes.includes(actionType as LogActionType);
};

/**
 * Maps a client-side action type to a database action type
 * Returns the original action type if no mapping exists and it's already valid
 * Returns null if the action type is invalid and has no mapping
 */
export const mapActionType = (actionType: string): LogActionType | null => {
  // If it's already a valid database action type, return it
  if (isValidActionType(actionType)) {
    return actionType as LogActionType;
  }
  
  // If there's a mapping for this action type, return the mapped value
  if (actionTypeMap[actionType]) {
    return actionTypeMap[actionType];
  }
  
  // Otherwise, return null to indicate an invalid action type
  return null;
};

/**
 * Gets all valid action types for UI display
 */
export const getValidActionTypes = (): LogActionType[] => {
  return [...validActionTypes];
};
