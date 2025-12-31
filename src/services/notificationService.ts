import { supabase } from '@/lib/supabase'
import type { Notification } from '@/types'

export const notificationService = {
  async sendSMS(phone: string, message: string, tenantId: string, userId?: string, customerId?: string) {
    const twilioAccountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID
    const twilioAuthToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN
    const twilioPhoneNumber = import.meta.env.VITE_TWILIO_PHONE_NUMBER

    if (!twilioAccountSid || !twilioAuthToken) {
      console.warn('Twilio credentials not configured')
      return null
    }

    try {
      // In production, this should call your backend API or Supabase Edge Function
      // For now, we'll create a notification record
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          tenant_id: tenantId,
          user_id: userId,
          customer_id: customerId,
          type: 'transaction',
          channel: 'sms',
          message,
          status: 'pending',
        })
        .select()
        .single()

      if (error) throw error

      // TODO: Call Twilio API via Edge Function
      // For production, create a Supabase Edge Function to handle SMS
      
      return data as Notification
    } catch (error) {
      console.error('Error sending SMS:', error)
      throw error
    }
  },

  async sendEmail(email: string, subject: string, message: string, tenantId: string, userId?: string, customerId?: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          tenant_id: tenantId,
          user_id: userId,
          customer_id: customerId,
          type: 'transaction',
          channel: 'email',
          subject,
          message,
          status: 'pending',
        })
        .select()
        .single()

      if (error) throw error

      // TODO: Send email via Supabase Edge Function or external service
      
      return data as Notification
    } catch (error) {
      console.error('Error sending email:', error)
      throw error
    }
  },

  async getNotifications(userId: string, filters?: { type?: string; status?: string; read?: boolean }) {
    const query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (filters?.type) {
      query.eq('type', filters.type)
    }
    if (filters?.status) {
      query.eq('status', filters.status)
    }
    if (filters?.read === false) {
      query.is('read_at', null)
    }

    const { data, error } = await query
    if (error) throw error
    return data as Notification[]
  },

  async markAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .select()
      .single()

    if (error) throw error
    return data as Notification
  },

  async createNotification(notification: Omit<Notification, 'id' | 'status' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single()

    if (error) throw error
    return data as Notification
  },
}

