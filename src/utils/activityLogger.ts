
import { supabase } from '@/integrations/supabase/client';
import { LogActionType } from '@/components/admin/types';

/**
 * Logs user activity in the database
 */
export async function logUserActivity(
  userId: string,
  actionType: LogActionType,
  sessionId: string | null = null,
  details: Record<string, any> | null = null
): Promise<void> {
  try {
    const { error } = await supabase.from('user_activity_logs').insert({
      user_id: userId,
      action_type: actionType,
      session_id: sessionId,
      details
    });

    if (error) {
      console.error('Error logging user activity:', error);
    }
  } catch (error) {
    console.error('Failed to log user activity:', error);
  }
}

/**
 * Creates a user session in the database
 */
export async function createUserSession(
  userId: string,
  metadata: Record<string, any> | null = null
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        login_time: new Date().toISOString(),
        active: true,
        last_ping: new Date().toISOString(),
        metadata
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating user session:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Failed to create user session:', error);
    return null;
  }
}

/**
 * Ends a user session in the database
 */
export async function endUserSession(sessionId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .update({
        logout_time: new Date().toISOString(),
        active: false
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Error ending user session:', error);
    }
  } catch (error) {
    console.error('Failed to end user session:', error);
  }
}

/**
 * Updates the last ping time for an active session
 */
export async function updateSessionPing(sessionId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .update({
        last_ping: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('active', true);

    if (error) {
      console.error('Error updating session ping:', error);
    }
  } catch (error) {
    console.error('Failed to update session ping:', error);
  }
}
