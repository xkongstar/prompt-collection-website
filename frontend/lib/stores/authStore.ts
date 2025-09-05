import { create } from 'zustand';
import { api } from '@/lib/api';
import { User, LoginDto, RegisterDto, AuthResponse } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

interface AuthActions {
  login: (credentials: LoginDto) => Promise<boolean>;
  register: (userData: RegisterDto) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => Promise<boolean>;
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: User) => void;
}

type AuthStore = AuthState & AuthActions;

const getErrorMessage = (err: unknown): string => {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosError = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
    return axiosError.response?.data?.error?.message || 
           axiosError.message || 
           '操作失败，请重试';
  }
  return '操作失败，请重试';
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  // 初始状态
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,

  // 检查认证状态
  checkAuth: async (): Promise<boolean> => {
    try {
      set({ isLoading: true });
      
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      
      if (!token || !userStr) {
        set({ isLoading: false, isInitialized: true });
        return false;
      }

      // 验证token是否有效
      const response = await api.get('/auth/profile');
      
      if (response.data.success && response.data.data) {
        const user = response.data.data as User;
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          isInitialized: true
        });
        return true;
      } else {
        // Token无效，清除本地存储
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true
        });
        return false;
      }
    } catch (error) {
      // Token可能已过期或无效
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true
      });
      return false;
    }
  },

  // 登录
  login: async (credentials: LoginDto): Promise<boolean> => {
    try {
      set({ isLoading: true, error: null });

      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
      if (response.data.success && response.data.data) {
        const { user, token } = response.data.data;
        
        // 保存到localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        
        return true;
      } else {
        set({
          isLoading: false,
          error: response.data.error?.message || '登录失败'
        });
        return false;
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      set({
        isLoading: false,
        error: errorMessage
      });
      return false;
    }
  },

  // 注册
  register: async (userData: RegisterDto): Promise<boolean> => {
    try {
      set({ isLoading: true, error: null });

      const response = await api.post<AuthResponse>('/auth/register', userData);
      
      if (response.data.success && response.data.data) {
        const { user, token } = response.data.data;
        
        // 保存到localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        
        return true;
      } else {
        set({
          isLoading: false,
          error: response.data.error?.message || '注册失败'
        });
        return false;
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      set({
        isLoading: false,
        error: errorMessage
      });
      return false;
    }
  },

  // 登出
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  },

  // 清除错误
  clearError: () => {
    set({ error: null });
  },

  // 设置错误
  setError: (error: string) => {
    set({ error });
  },

  // 设置loading状态
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  // 更新用户信息
  updateUser: (user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ user });
  }
}));