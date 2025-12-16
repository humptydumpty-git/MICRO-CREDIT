import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  logout: () => void;
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

// Mock users for demo (in production, this would come from the database)
const mockUsers: Record<string, { user: AuthUser; password: string }> = {
  'admin@microfinance.com': {
    password: 'admin123',
    user: {
      id: 'usr-001',
      tenant_id: 'tenant-001',
      email: 'admin@microfinance.com',
      first_name: 'Sarah',
      last_name: 'Johnson',
      role: 'admin',
      avatar_url: 'https://d64gsuwffb70l.cloudfront.net/69409a65531b674cdffc8cad_1765841662700_8f571b2d.jpg',
      phone: '+234 801 234 5678',
      is_active: true,
    },
  },
  'manager@microfinance.com': {
    password: 'manager123',
    user: {
      id: 'usr-002',
      tenant_id: 'tenant-001',
      email: 'manager@microfinance.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'manager',
      avatar_url: 'https://d64gsuwffb70l.cloudfront.net/69409a65531b674cdffc8cad_1765841751587_834a194d.jpg',
      phone: '+234 802 345 6789',
      is_active: true,
    },
  },
  'staff@microfinance.com': {
    password: 'staff123',
    user: {
      id: 'usr-003',
      tenant_id: 'tenant-001',
      email: 'staff@microfinance.com',
      first_name: 'Jane',
      last_name: 'Smith',
      role: 'staff',
      avatar_url: 'https://d64gsuwffb70l.cloudfront.net/69409a65531b674cdffc8cad_1765841669991_c1b0a5f7.png',
      phone: '+234 803 456 7890',
      is_active: true,
    },
  },
  'agent@microfinance.com': {
    password: 'agent123',
    user: {
      id: 'usr-004',
      tenant_id: 'tenant-001',
      email: 'agent@microfinance.com',
      first_name: 'Michael',
      last_name: 'Brown',
      role: 'agent',
      avatar_url: 'https://d64gsuwffb70l.cloudfront.net/69409a65531b674cdffc8cad_1765841752935_6ab6cf78.jpg',
      phone: '+234 804 567 8901',
      is_active: true,
    },
  },
};

// Generate a simple JWT-like token (in production, use proper JWT)
const generateToken = (userId: string): string => {
  const payload = {
    sub: userId,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  return btoa(JSON.stringify(payload));
};

const generateRefreshToken = (userId: string): string => {
  const payload = {
    sub: userId,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  return btoa(JSON.stringify(payload));
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call delay
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          const mockUser = mockUsers[email.toLowerCase()];
          
          if (!mockUser || mockUser.password !== password) {
            set({ isLoading: false, error: 'Invalid email or password' });
            return false;
          }
          
          if (!mockUser.user.is_active) {
            set({ isLoading: false, error: 'Account is deactivated. Please contact support.' });
            return false;
          }
          
          const token = generateToken(mockUser.user.id);
          const refreshToken = generateRefreshToken(mockUser.user.id);
          
          set({
            user: { ...mockUser.user, last_login: new Date().toISOString() },
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          return true;
        } catch (error) {
          set({ isLoading: false, error: 'An error occurred during login' });
          return false;
        }
      },

      signup: async (data: SignupData) => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          // Check if email already exists
          if (mockUsers[data.email.toLowerCase()]) {
            set({ isLoading: false, error: 'Email already registered' });
            return false;
          }
          
          // Create new user (in production, this would be an API call)
          const newUser: AuthUser = {
            id: `usr-${Date.now()}`,
            tenant_id: data.tenant_id || 'tenant-001',
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
            role: 'staff', // Default role for new signups
            phone: data.phone,
            is_active: true,
          };
          
          // Add to mock users
          mockUsers[data.email.toLowerCase()] = {
            password: data.password,
            user: newUser,
          };
          
          const token = generateToken(newUser.id);
          const refreshToken = generateRefreshToken(newUser.id);
          
          set({
            user: newUser,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          return true;
        } catch (error) {
          set({ isLoading: false, error: 'An error occurred during signup' });
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      refreshSession: async () => {
        const { refreshToken, user } = get();
        
        if (!refreshToken || !user) {
          return false;
        }
        
        try {
          // Validate refresh token
          const payload = JSON.parse(atob(refreshToken));
          if (payload.exp < Date.now()) {
            get().logout();
            return false;
          }
          
          // Generate new tokens
          const newToken = generateToken(user.id);
          const newRefreshToken = generateRefreshToken(user.id);
          
          set({
            token: newToken,
            refreshToken: newRefreshToken,
          });
          
          return true;
        } catch (error) {
          get().logout();
          return false;
        }
      },

      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          // In production, this would send an email with reset link
          const mockUser = mockUsers[email.toLowerCase()];
          if (!mockUser) {
            // Don't reveal if email exists for security
            set({ isLoading: false });
            return true;
          }
          
          // Simulate sending email
          console.log(`Password reset email sent to ${email}`);
          
          set({ isLoading: false });
          return true;
        } catch (error) {
          set({ isLoading: false, error: 'Failed to send reset email' });
          return false;
        }
      },

      updatePassword: async (token: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          // In production, validate token and update password in database
          // For demo, we'll just return success
          
          set({ isLoading: false });
          return true;
        } catch (error) {
          set({ isLoading: false, error: 'Failed to update password' });
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
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Export role permissions for use in components
export { rolePermissions };
