// Supabase Edge Function: Send SMS via Twilio
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')

interface RequestBody {
  phone: string
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

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio credentials not configured')
    }

    const { phone, message, tenant_id, user_id, customer_id }: RequestBody = await req.json()

    if (!phone || !message || !tenant_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: phone, message, tenant_id' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Call Twilio API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`
    
    const formData = new URLSearchParams()
    formData.append('From', TWILIO_PHONE_NUMBER)
    formData.append('To', phone)
    formData.append('Body', message)

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    const twilioData = await twilioResponse.json()

    if (!twilioResponse.ok) {
      throw new Error(twilioData.message || 'Failed to send SMS')
    }

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
        channel: 'sms',
        message,
        status: 'sent',
        sent_at: new Date().toISOString(),
        metadata: { twilio_sid: twilioData.sid },
      })

    if (notifError) {
      console.error('Error creating notification:', notifError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message_sid: twilioData.sid,
        status: twilioData.status 
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

