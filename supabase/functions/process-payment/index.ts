// Supabase Edge Function: Process Payment (Stripe Integration)
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')

interface RequestBody {
  amount: number
  currency: string
  account_id: string
  tenant_id: string
  description?: string
  payment_method_id?: string
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

    if (!STRIPE_SECRET_KEY) {
      throw new Error('Stripe credentials not configured')
    }

    const { amount, currency, account_id, tenant_id, description, payment_method_id, customer_id }: RequestBody = await req.json()

    if (!amount || !currency || !account_id || !tenant_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: amount, currency, account_id, tenant_id' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get account details
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', account_id)
      .single()

    if (accountError || !account) {
      throw new Error('Account not found')
    }

    // Process payment with Stripe
    // Note: This is a simplified example - implement full Stripe integration based on your needs
    const stripeUrl = payment_method_id 
      ? 'https://api.stripe.com/v1/payment_intents'
      : 'https://api.stripe.com/v1/charges'

    const stripeData = payment_method_id
      ? {
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          payment_method: payment_method_id,
          confirm: true,
          description: description || `Payment for account ${account.account_number}`,
        }
      : {
          amount: Math.round(amount * 100),
          currency: currency.toLowerCase(),
          description: description || `Payment for account ${account.account_number}`,
        }

    const stripeResponse = await fetch(stripeUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(stripeData as any).toString(),
    })

    const stripeResult = await stripeResponse.json()

    if (!stripeResponse.ok) {
      throw new Error(stripeResult.error?.message || 'Payment processing failed')
    }

    // Create transaction record
    // This would typically be done by the transaction service
    // For now, we'll just return success

    return new Response(
      JSON.stringify({ 
        success: true, 
        payment_intent_id: stripeResult.id,
        status: stripeResult.status,
        amount: amount,
        currency: currency,
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

