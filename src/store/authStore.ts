import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/services/api';
import type { User as AuthUserType } from '@/types';

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'staff' | 'agent';

export interface AuthUser {
  id: string;
  tenant_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  is_active: boolean;
  last_login?: string;
}

// Map database User to AuthUser
const mapUserToAuthUser = (user: AuthUserType): AuthUser => ({
  id: user.id,
  tenant_id: user.tenant_id,
  email: user.email,
  first_name: user.first_name,
  last_name: user.last_name,
  role: user.role,
  avatar_url: user.avatar_url,
  phone: user.phone,
  is_active: user.is_active,
  last_login: user.last_login || undefined,
});

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (token: string, newPassword: string) => Promise<boolean>;
  
  // State setters
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Permission checks
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: UserRole[]) => boolean;
}

export interface SignupData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  tenant_id?: string;
}

// Role-based permissions
const rolePermissions: Record<UserRole, string[]> = {
  super_admin: [
    'all',
    'manage_tenants',
    'manage_users',
    'manage_roles',
    'view_all_reports',
    'manage_settings',
    'manage_customers',
    'manage_loans',
    'approve_loans',
    'disburse_loans',
    'manage_accounts',
    'manage_transactions',
    'view_audit_logs',
  ],
  admin: [
    'manage_users',
    'view_all_reports',
    'manage_settings',
    'manage_customers',
    'manage_loans',
    'approve_loans',
    'disburse_loans',
    'manage_accounts',
    'manage_transactions',
    'view_audit_logs',
  ],
  manager: [
    'view_reports',
    'manage_customers',
    'manage_loans',
    'approve_loans',
    'manage_accounts',
    'view_transactions',
    'view_audit_logs',
  ],
  staff: [
    'view_customers',
    'create_customers',
    'view_loans',
    'create_loan_applications',
    'view_accounts',
    'view_transactions',
    'create_transactions',
  ],
  agent: [
    'view_customers',
    'create_customers',
    'view_loans',
    'create_loan_applications',
    'view_accounts',
    'create_transactions',
  ],
};


export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true, // Start as loading to check session
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await authApi.signIn(email, password);
          
          if (!result.profile) {
            set({ isLoading: false, error: 'User profile not found' });
            return false;
          }
          
          if (!result.profile.is_active) {
            set({ isLoading: false, error: 'Account is deactivated. Please contact support.' });
            return false;
          }
          
          const authUser = mapUserToAuthUser(result.profile);
          
          set({
            user: authUser,
            token: result.session?.access_token || null,
            refreshToken: result.session?.refresh_token || null,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          return true;
        } catch (error: any) {
          const errorMessage = error?.message || 'An error occurred during login';
          set({ isLoading: false, error: errorMessage });
          return false;
        }
      },

      signup: async (data: SignupData) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await authApi.signUp(data.email, data.password, {
            first_name: data.first_name,
            last_name: data.last_name,
            phone: data.phone,
            tenant_id: data.tenant_id,
          });
          
          if (!result.profile) {
            set({ isLoading: false, error: 'Failed to create user profile' });
            return false;
          }
          
          const authUser = mapUserToAuthUser(result.profile);
          
          // Note: User may need to verify email before being fully authenticated
          // For now, we'll set them as authenticated
          set({
            user: authUser,
            token: null, // Will be set after email verification
            refreshToken: null,
            isAuthenticated: false, // Require email verification
            isLoading: false,
            error: null,
          });
          
          return true;
        } catch (error: any) {
          const errorMessage = error?.message || 'An error occurred during signup';
          set({ isLoading: false, error: errorMessage });
          return false;
        }
      },

      logout: async () => {
        try {
          await authApi.signOut();
        } catch (error) {
          console.error('Error during logout:', error);
        } finally {
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      refreshSession: async () => {
        try {
          // Supabase handles token refresh automatically
          // We just need to check if user is still authenticated
          const currentUser = await authApi.getCurrentUser();
          
          if (!currentUser) {
            get().logout();
            return false;
          }
          
          const authUser = mapUserToAuthUser(currentUser);
          set({ user: authUser, isAuthenticated: true });
          
          return true;
        } catch (error) {
          get().logout();
          return false;
        }
      },

      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await authApi.resetPassword(email);
          set({ isLoading: false });
          return true;
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to send reset email';
          set({ isLoading: false, error: errorMessage });
          return false;
        }
      },

      updatePassword: async (token: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Note: Supabase handles password reset via email link
          // This method is for updating password when already authenticated
          await authApi.updatePassword(newPassword);
          set({ isLoading: false });
          return true;
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to update password';
          set({ isLoading: false, error: errorMessage });
          return false;
        }
      },

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user) return false;
        
        const permissions = rolePermissions[user.role] || [];
        return permissions.includes('all') || permissions.includes(permission);
      },

      hasRole: (roles: UserRole[]) => {
        const { user } = get();
        if (!user) return false;
        return roles.includes(user.role);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        // Don't persist tokens - Supabase handles session persistence
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Export role permissions for use in components
export { rolePermissions };
