
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify the user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      throw new Error('Unauthorized: ' + (userError?.message || 'Invalid user'))
    }

    // Parse request body
    let body;
    try {
      body = await req.json()
    } catch (e) {
      throw new Error('Invalid JSON in request body')
    }
    
    const { action, sessionId, details } = body;

    if (!action) {
      throw new Error('Missing required field: action')
    }

    // Try to get the client IP address
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    // Enrich the details with IP info if not already present
    const enrichedDetails = {
      ...details,
      ip_address: details?.ip_address || clientIp,
      timestamp: new Date().toISOString()
    };

    console.log(`Logging activity: ${action} for user ${user.id}`);

    // Log the activity
    const { data, error } = await supabase
      .from('user_activity_logs')
      .insert({
        user_id: user.id,
        action_type: action,
        session_id: sessionId,
        details: enrichedDetails
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting log:', error);
      throw new Error('Error inserting activity log: ' + error.message);
    }

    // Update the session's last_ping if a sessionId is provided
    if (sessionId) {
      const { error: sessionError } = await supabase
        .from('user_sessions')
        .update({ 
          last_ping: new Date().toISOString(),
          ip_address: clientIp
        })
        .eq('id', sessionId);
      
      if (sessionError) {
        console.error('Error updating session:', sessionError);
        // We don't throw here to avoid failing the whole request
      }
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error tracking activity:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error in track-activity function',
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
