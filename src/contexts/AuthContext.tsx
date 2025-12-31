import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authService } from '@/services/authService'
import type { AuthUser } from '@/types'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData?: any) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    authService.getCurrentUser().then(setUser).finally(() => setLoading(false))

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    await authService.signIn(email, password)
    const currentUser = await authService.getCurrentUser()
    setUser(currentUser)
  }

  const signUp = async (email: string, password: string, userData?: any) => {
    await authService.signUp(email, password, userData)
    // Note: User won't be immediately available if email confirmation is required
  }

  const signOut = async () => {
    await authService.signOut()
    setUser(null)
  }

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

