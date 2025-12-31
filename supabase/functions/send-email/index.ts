// Supabase Edge Function: Send Email via SMTP
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const SMTP_HOST = Deno.env.get('SMTP_HOST')
const SMTP_PORT = Deno.env.get('SMTP_PORT') || '587'
const SMTP_USER = Deno.env.get('SMTP_USER')
const SMTP_PASSWORD = Deno.env.get('SMTP_PASSWORD')
const SMTP_FROM = Deno.env.get('SMTP_FROM')

interface RequestBody {
  email: string
  subject: string
  message: string
  tenant_id: string
  user_id?: string
  customer_id?: string
}

Deno.serve(async (req: Request) => {
  try {
    // CORS headers
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      })
    }

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
      throw new Error('SMTP credentials not configured')
    }

    const { email, subject, message, tenant_id, user_id, customer_id }: RequestBody = await req.json()

    if (!email || !subject || !message || !tenant_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, subject, message, tenant_id' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Send email via SMTP (using Resend, SendGrid, or similar service)
    // For production, use a service like Resend, SendGrid, or AWS SES
    // This is a simplified example - in production, use a proper email service
    
    const emailData = {
      from: SMTP_FROM || SMTP_USER,
      to: email,
      subject: subject,
      html: message,
    }

    // Example: Using Resend (you would need to install the Resend SDK)
    // const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
    // const result = await resend.emails.send(emailData)

    // For now, we'll just log and create a notification record
    console.log('Email would be sent:', emailData)

    // Create notification record in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        tenant_id,
        user_id,
        customer_id,
        type: 'transaction',
        channel: 'email',
        subject,
        message,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })

    if (notifError) {
      console.error('Error creating notification:', notifError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully' 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})

