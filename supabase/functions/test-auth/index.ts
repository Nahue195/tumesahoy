import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    console.log('📋 Test Auth Function')
    console.log('Has Auth Header:', !!authHeader)
    console.log('Supabase URL:', supabaseUrl)
    console.log('Has Anon Key:', !!supabaseAnonKey)

    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No auth header provided',
          url: supabaseUrl
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Crear cliente con auth
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Intentar obtener usuario
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    console.log('User result:', { hasUser: !!user, error: userError?.message })

    return new Response(
      JSON.stringify({
        success: !userError,
        user: user ? { id: user.id, email: user.email } : null,
        error: userError?.message || null,
        url: supabaseUrl,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  }
})
