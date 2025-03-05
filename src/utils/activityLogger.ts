import { supabase } from '@/integrations/supabase/client';
import { LogActionType } from '@/components/admin/types';

interface LogActivityParams {
  action: LogActionType;
  sessionId?: string;
  details?: Record<string, any>;
}

// Track activity via edge function (secure method)
export const logActivity = async ({ action, sessionId, details }: LogActivityParams) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) return;

    const { error } = await supabase.functions.invoke('track-activity', {
      body: {
        action,
        sessionId,
        details
      }
    });

    if (error) {
      console.error('Error logging activity:', error.message);
    }
  } catch (error) {
    console.error('Error in activity logger:', error);
  }
};

// Initialize a new session
export const startUserSession = async (metadata?: Record<string, any>) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) return null;
    
    // Get IP and location information
    let ipInfo = {};
    try {
      const ipResponse = await fetch('https://ipapi.co/json/');
      if (ipResponse.ok) {
        ipInfo = await ipResponse.json();
      }
    } catch (e) {
      console.error('Error fetching IP info:', e);
    }
    
    // Get device info
    const deviceInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenSize: `${window.screen.width}x${window.screen.height}`
    };
    
    // Create new session
    const { data: sessionData, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: session.session.user.id,
        active: true,
        login_time: new Date().toISOString(),
        metadata: {
          ...metadata,
          device: deviceInfo
        },
        device_info: deviceInfo,
        ip_address: ipInfo?.ip,
        location: {
          city: ipInfo?.city,
          country: ipInfo?.country_name,
          region: ipInfo?.region
        }
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating session:', error);
      return null;
    }
    
    // Log the session start event
    await logActivity({
      action: 'session_start',
      sessionId: sessionData.id,
      details: { method: 'explicit' }
    });
    
    return sessionData;
  } catch (error) {
    console.error('Error starting session:', error);
    return null;
  }
};

// End a user session
export const endUserSession = async (sessionId: string) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) return false;
    
    // Update session
    const { error } = await supabase
      .from('user_sessions')
      .update({
        active: false,
        logout_time: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('user_id', session.session.user.id);
      
    if (error) {
      console.error('Error ending session:', error);
      return false;
    }
    
    // Log the session end event
    await logActivity({
      action: 'session_end',
      sessionId,
      details: { method: 'explicit' }
    });
    
    return true;
  } catch (error) {
    console.error('Error ending session:', error);
    return false;
  }
};

// Function to ping existing session to keep it active
export const pingUserSession = async (sessionId: string) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) return false;
    
    const { error } = await supabase
      .from('user_sessions')
      .update({
        last_ping: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('user_id', session.session.user.id);
      
    return !error;
  } catch (error) {
    console.error('Error pinging session:', error);
    return false;
  }
};
