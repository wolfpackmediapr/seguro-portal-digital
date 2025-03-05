
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logActivity, startUserSession, pingUserSession, endUserSession } from '@/utils/activityLogger';
import { LogActionType } from '@/components/admin/types';

// Ping interval in milliseconds (default: 5 minutes)
const PING_INTERVAL = 5 * 60 * 1000;

export const useUserActivity = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const pingIntervalRef = useRef<number | null>(null);

  // Start tracking user activity
  const startTracking = async (metadata?: Record<string, any>) => {
    if (isTracking) return;
    
    try {
      const session = await startUserSession(metadata);
      if (session) {
        setSessionId(session.id);
        setIsTracking(true);
        
        // Set up ping interval
        if (pingIntervalRef.current) {
          window.clearInterval(pingIntervalRef.current);
        }
        
        pingIntervalRef.current = window.setInterval(() => {
          pingUserSession(session.id);
        }, PING_INTERVAL);
      }
    } catch (error) {
      console.error('Error starting activity tracking:', error);
    }
  };

  // Stop tracking user activity
  const stopTracking = async () => {
    if (!isTracking || !sessionId) return;
    
    try {
      await endUserSession(sessionId);
      setIsTracking(false);
      setSessionId(null);
      
      if (pingIntervalRef.current) {
        window.clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
    } catch (error) {
      console.error('Error stopping activity tracking:', error);
    }
  };

  // Log a specific activity
  const logUserActivity = async (action: LogActionType, details?: Record<string, any>) => {
    try {
      await logActivity({
        action,
        sessionId,
        details
      });
    } catch (error) {
      console.error('Error logging user activity:', error);
    }
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (pingIntervalRef.current) {
        window.clearInterval(pingIntervalRef.current);
      }
    };
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Auto-start tracking for logged-in users
        await startTracking({
          auth_event: 'sign_in',
          provider: session.user.app_metadata.provider || 'email'
        });
      } else if (event === 'SIGNED_OUT') {
        // Auto-stop tracking when user signs out
        await stopTracking();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    sessionId,
    isTracking,
    startTracking,
    stopTracking,
    logActivity: logUserActivity
  };
};
