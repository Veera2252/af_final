/*
  # Get Student Certificates Edge Function

  1. Purpose
    - Retrieves certificates for a specific student
    - Joins with courses table to get course details
    - Returns formatted certificate data

  2. Security
    - Validates student_id parameter
    - Uses service role key for database access
    - Handles errors gracefully

  3. Response Format
    - Returns array of certificate objects with course details
    - Includes certificate metadata and download URLs
*/

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface RequestBody {
  student_id: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    // Parse request body
    const { student_id }: RequestBody = await req.json()

    if (!student_id) {
      return new Response(
        JSON.stringify({ error: 'student_id is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch certificates with course details
    const { data: certificates, error } = await supabase
      .from('student_certificates')
      .select(`
        id,
        course_id,
        file_url,
        issued_at,
        courses (
          title,
          description
        )
      `)
      .eq('student_id', student_id)
      .order('issued_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch certificates' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify(certificates || []),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})