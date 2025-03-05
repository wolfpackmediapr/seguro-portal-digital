
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify the user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Parse request body
    const { action, sessionId, details } = await req.json()

    if (!action) {
      throw new Error('Missing required fields')
    }

    // Try to get the client IP address
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    // Enrich the details with IP info if not already present
    const enrichedDetails = {
      ...details,
      ip_address: details.ip_address || clientIp,
      timestamp: new Date().toISOString()
    };

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

    if (error) throw error

    // Update the session's last_ping if a sessionId is provided
    if (sessionId) {
      await supabase
        .from('user_sessions')
        .update({ 
          last_ping: new Date().toISOString(),
          ip_address: clientIp
        })
        .eq('id', sessionId)
    }

    console.log(`Activity logged: ${action} for user ${user.id}`);

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
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
