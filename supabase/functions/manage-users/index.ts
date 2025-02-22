
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  email: string;
  password: string;
  role: 'admin' | 'user';
}

interface UpdateUserRequest {
  userId: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'user';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the JWT from the request header
    const authHeader = req.headers.get('Authorization')!
    const jwt = authHeader.replace('Bearer ', '')

    // Verify the user is a super_admin
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt)
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'super_admin')

    if (rolesError || !roles.length) {
      throw new Error('Unauthorized - Super Admin access required')
    }

    const { action, ...data } = await req.json()

    switch (action) {
      case 'create': {
        const { email, password, role } = data as CreateUserRequest
        
        // Create the user
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true
        })

        if (createError) throw createError

        // Assign role
        if (newUser?.user) {
          await supabase.from('user_roles').insert({
            user_id: newUser.user.id,
            role
          })

          // Log the action
          await supabase.from('user_management_logs').insert({
            action_type: 'create_user',
            performed_by: user.id,
            target_user: newUser.user.id,
            details: { email, role }
          })
        }

        return new Response(JSON.stringify(newUser), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      case 'update': {
        const { userId, email, password, role } = data as UpdateUserRequest

        if (password) {
          await supabase.auth.admin.updateUserById(userId, { password })
        }

        if (email) {
          await supabase.auth.admin.updateUserById(userId, { email })
        }

        if (role) {
          await supabase
            .from('user_roles')
            .upsert({ user_id: userId, role }, { onConflict: 'user_id' })
        }

        // Log the action
        await supabase.from('user_management_logs').insert({
          action_type: 'update_user',
          performed_by: user.id,
          target_user: userId,
          details: { email, role }
        })

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
