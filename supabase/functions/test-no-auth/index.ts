import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Function works! No auth required.',
      timestamp: new Date().toISOString(),
      env: {
        hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
        hasAnonKey: !!Deno.env.get('SUPABASE_ANON_KEY'),
        url: Deno.env.get('SUPABASE_URL')
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    }
  )
})
