
import { supabase } from "@/integrations/supabase/client";
import { LogActionType } from "@/components/admin/types";

interface LogActivityParams {
  action: LogActionType;
  sessionId?: string | null;
  details?: Record<string, any>;
}

// Track user activity
export const logActivity = async ({ action, sessionId, details }: LogActivityParams): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    // Call the edge function to log the activity
    await supabase.functions.invoke('track-activity', {
      body: {
        action,
        sessionId,
        details: details || {}
      }
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};

// Start a new user session
export const startUserSession = async (metadata?: Record<string, any>): Promise<{ id: string } | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const deviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenSize: `${window.screen.width}x${window.screen.height}`
    };

    // Create a new session record in the database
    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: session.user.id,
        login_time: new Date().toISOString(),
        active: true,
        metadata: metadata || null,
        device_info: deviceInfo
      })
      .select()
      .single();

    if (error) throw error;

    // Log session start activity
    await logActivity({
      action: 'session_start',
      sessionId: data.id,
      details: {
        device: deviceInfo.platform,
        browser: deviceInfo.userAgent
      }
    });

    return { id: data.id };
  } catch (error) {
    console.error("Error starting user session:", error);
    return null;
  }
};

// Update session last ping time
export const pingUserSession = async (sessionId: string): Promise<void> => {
  try {
    await supabase
      .from('user_sessions')
      .update({ last_ping: new Date().toISOString() })
      .eq('id', sessionId);
  } catch (error) {
    console.error("Error pinging user session:", error);
  }
};

// End an active user session
export const endUserSession = async (sessionId: string): Promise<void> => {
  try {
    // Update the session to inactive and set the logout time
    await supabase
      .from('user_sessions')
      .update({
        active: false,
        logout_time: new Date().toISOString()
      })
      .eq('id', sessionId);

    // Log session end
    await logActivity({
      action: 'session_end',
      sessionId,
      details: { method: 'explicit' }
    });
  } catch (error) {
    console.error("Error ending user session:", error);
  }
};

// Get user location info
export const getUserLocation = async (): Promise<Record<string, any>> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const locationData = await response.json();
    
    return {
      ip: locationData.ip || '',
      city: locationData.city || '',
      country: locationData.country_name || '',
      region: locationData.region || '',
      latitude: locationData.latitude,
      longitude: locationData.longitude
    };
  } catch (error) {
    console.error("Error getting user location:", error);
    return {};
  }
};
