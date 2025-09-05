import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { User, LoginDto, RegisterDto, AuthResponse } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginDto) => Promise<boolean>;
  register: (userData: RegisterDto) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => Promise<boolean>;
}

export function useAuth(): AuthState & AuthActions {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // 检查认证状态
  const checkAuth = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (!token || !userStr) {
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      // 验证token是否有效
      const response = await api.get('/auth/profile');
      
      if (response.data.success && response.data.data) {
        const user = response.data.data as User;
        setState(prev => ({
          ...prev,
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        }));
        return true;
      } else {
        // Token无效，清除本地存储
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false
        }));
        return false;
      }
    } catch (error) {
      // Token可能已过期或无效
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false
      }));
      return false;
    }
  };

  // 登录
  const login = async (credentials: LoginDto): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
      if (response.data.success && response.data.data) {
        const { user, token } = response.data.data;
        
        // 保存到localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setState(prev => ({
          ...prev,
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        }));
        
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.data.error?.message || '登录失败'
        }));
        return false;
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return false;
    }
  };

  // 注册
  const register = async (userData: RegisterDto): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await api.post<AuthResponse>('/auth/register', userData);
      
      if (response.data.success && response.data.data) {
        const { user, token } = response.data.data;
        
        // 保存到localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setState(prev => ({
          ...prev,
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        }));
        
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.data.error?.message || '注册失败'
        }));
        return false;
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return false;
    }
  };

  // 登出
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
    
    router.push('/login');
  };

  // 清除错误
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // 获取错误信息的辅助函数
  const getErrorMessage = (err: unknown): string => {
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
      return axiosError.response?.data?.error?.message || 
             axiosError.message || 
             '操作失败，请重试';
    }
    return '操作失败，请重试';
  };

  // 初始化时检查认证状态
  useEffect(() => {
    checkAuth();
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    clearError,
    checkAuth
  };
}

// 认证守护Hook - 用于需要登录的页面
export function useAuthGuard(redirectTo: string = '/login') {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
}

// 访客守护Hook - 用于登录/注册页面（已登录用户访问时重定向）
export function useGuestGuard(redirectTo: string = '/prompts') {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
}