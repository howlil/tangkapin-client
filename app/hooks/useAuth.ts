import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, User } from '@/app/services/auth';
import { useToast } from '@/components/ui/use-toast';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await AuthService.login(email, password);
      setUser(response.user);
      router.push('/dashboard');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Login failed',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await AuthService.logout();
      setUser(null);
      router.push('/login');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Logout failed',
      });
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  const isAuthenticated = useCallback(() => {
    return AuthService.isAuthenticated();
  }, []);

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: isAuthenticated(),
  };
} 