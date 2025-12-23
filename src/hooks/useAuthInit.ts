import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/services/api';

/**
 * Hook to initialize authentication state from Supabase session
 * Call this once at the app root level
 */
export const useAuthInit = () => {
  const { setUser, setIsLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await authApi.getCurrentUser();
        if (user) {
          // User is already logged in, update store
          const { mapUserToAuthUser } = await import('@/store/authStore');
          // Since we can't export the helper function, we'll just set it directly
          setUser({
            id: user.id,
            tenant_id: user.tenant_id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            avatar_url: user.avatar_url || undefined,
            phone: user.phone || undefined,
            is_active: user.is_active,
            last_login: user.last_login || undefined,
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = authApi.onAuthStateChange(async (authUser) => {
      if (authUser) {
        const profile = await authApi.getCurrentUser();
        if (profile) {
          setUser({
            id: profile.id,
            tenant_id: profile.tenant_id,
            email: profile.email,
            first_name: profile.first_name,
            last_name: profile.last_name,
            role: profile.role,
            avatar_url: profile.avatar_url || undefined,
            phone: profile.phone || undefined,
            is_active: profile.is_active,
            last_login: profile.last_login || undefined,
          });
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser]);
};

