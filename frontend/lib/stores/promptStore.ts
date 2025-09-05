import { create } from 'zustand';
import { api } from '../api';
import { 
  Prompt, 
  PromptFilters, 
  CreatePromptDto, 
  UpdatePromptDto
} from '@/types';

// Prompt interface is imported from types

// PromptFilters interface is imported from types

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface PromptStore {
  // 状态
  prompts: Prompt[];
  loading: boolean;
  error: string | null;
  filters: PromptFilters;
  pagination: PaginationMeta;
  
  // Actions
  setPrompts: (prompts: Prompt[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: PromptFilters) => void;
  setPagination: (pagination: PaginationMeta) => void;
  
  // API Actions
  fetchPrompts: (params?: PromptFilters & { page?: number }) => Promise<void>;
  createPrompt: (promptData: CreatePromptDto) => Promise<Prompt>;
  updatePrompt: (id: number, promptData: UpdatePromptDto) => Promise<Prompt>;
  deletePrompt: (id: number) => Promise<void>;
  toggleFavorite: (id: number) => Promise<void>;
  incrementUsage: (id: number) => Promise<void>;
  copyPrompt: (id: number) => Promise<Prompt>;
  
  // 工具函数
  getPromptById: (id: number) => Prompt | undefined;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  prompts: [],
  loading: false,
  error: null,
  filters: {
    search: '',
    sortBy: 'createdAt' as const,
    sortOrder: 'desc' as const,
  },
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  },
};

export const usePromptStore = create<PromptStore>()((set, get) => ({
  ...initialState,
  
  // Setters
  setPrompts: (prompts) => set({ prompts }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  setPagination: (pagination) => set({ pagination }),
  
  // API Actions
  fetchPrompts: async (params) => {
    const state = get();
    const finalParams = { ...state.filters, ...params };
    
    try {
      set({ loading: true, error: null });
      
      const queryParams = new URLSearchParams();
      if (finalParams.search) queryParams.append('search', finalParams.search);
      if (finalParams.categoryId) queryParams.append('categoryId', finalParams.categoryId.toString());
      if (finalParams.tags && finalParams.tags.length > 0) queryParams.append('tags', finalParams.tags.join(','));
      if (finalParams.isFavorite) queryParams.append('isFavorite', 'true');
      if (finalParams.sortBy) queryParams.append('sortBy', finalParams.sortBy);
      if (finalParams.sortOrder) queryParams.append('sortOrder', finalParams.sortOrder);
      if (params?.page) queryParams.append('page', params.page.toString());
      
      const response = await api.get<{ data: Prompt[]; meta: { pagination: PaginationMeta } }>(`/prompts?${queryParams}`);
      
      if (response.data.success && response.data.data) {
        set({ 
          prompts: response.data.data.data || [],
          pagination: response.data.data.meta?.pagination || state.pagination,
          loading: false 
        });
      } else {
        throw new Error(response.data.error?.message || '获取失败');
      }
    } catch (error) {
      console.error('获取提示词失败:', error);
      set({ 
        error: error instanceof Error ? error.message : '获取失败',
        loading: false 
      });
      throw error;
    }
  },
  
  createPrompt: async (promptData) => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.post<Prompt>('/prompts', promptData);
      
      if (response.data.success && response.data.data) {
        const newPrompt = response.data.data;
        set(state => ({
          prompts: [newPrompt, ...state.prompts],
          pagination: {
            ...state.pagination,
            total: state.pagination.total + 1
          },
          loading: false
        }));
        return newPrompt;
      } else {
        throw new Error(response.data.error?.message || '创建失败');
      }
    } catch (error) {
      console.error('创建提示词失败:', error);
      set({ 
        error: error instanceof Error ? error.message : '创建失败',
        loading: false 
      });
      throw error;
    }
  },
  
  updatePrompt: async (id, promptData) => {
    try {
      set({ error: null });
      
      const response = await api.put<Prompt>(`/prompts/${id}`, promptData);
      
      if (response.data.success && response.data.data) {
        const updatedPrompt = response.data.data;
        set(state => ({
          prompts: state.prompts.map(p => p.id === id ? updatedPrompt : p)
        }));
        return updatedPrompt;
      } else {
        throw new Error(response.data.error?.message || '更新失败');
      }
    } catch (error) {
      console.error('更新提示词失败:', error);
      set({ error: error instanceof Error ? error.message : '更新失败' });
      throw error;
    }
  },
  
  deletePrompt: async (id) => {
    try {
      set({ error: null });
      
      const response = await api.delete(`/prompts/${id}`);
      
      if (response.data.success) {
        set(state => ({
          prompts: state.prompts.filter(p => p.id !== id),
          pagination: {
            ...state.pagination,
            total: Math.max(0, state.pagination.total - 1)
          }
        }));
      } else {
        throw new Error(response.data.error?.message || '删除失败');
      }
    } catch (error) {
      console.error('删除提示词失败:', error);
      set({ error: error instanceof Error ? error.message : '删除失败' });
      throw error;
    }
  },
  
  toggleFavorite: async (id) => {
    const state = get();
    const prompt = state.prompts.find(p => p.id === id);
    if (!prompt) return;
    
    try {
      const response = await api.put<Prompt>(`/prompts/${id}`, {
        isFavorite: !prompt.isFavorite
      });
      
      if (response.data.success && response.data.data) {
        const updatedPrompt = response.data.data;
        set(state => ({
          prompts: state.prompts.map(p => p.id === id ? updatedPrompt : p)
        }));
      } else {
        throw new Error(response.data.error?.message || '操作失败');
      }
    } catch (error) {
      console.error('切换收藏失败:', error);
      set({ error: error instanceof Error ? error.message : '操作失败' });
      throw error;
    }
  },
  
  incrementUsage: async (id) => {
    try {
      const response = await api.post<void>(`/prompts/${id}/use`);
      
      if (response.data.success) {
        // 更新本地状态中的使用次数
        set(state => ({
          prompts: state.prompts.map(p => 
            p.id === id 
              ? { ...p, usageCount: p.usageCount + 1, lastUsedAt: new Date().toISOString() }
              : p
          )
        }));
      }
    } catch (error) {
      console.error('更新使用次数失败:', error);
    }
  },
  
  copyPrompt: async (id) => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.post<Prompt>(`/prompts/${id}/copy`);
      
      if (response.data.success && response.data.data) {
        const newPrompt = response.data.data;
        set(state => ({
          prompts: [newPrompt, ...state.prompts],
          pagination: {
            ...state.pagination,
            total: state.pagination.total + 1
          },
          loading: false
        }));
        return newPrompt;
      } else {
        throw new Error(response.data.error?.message || '复制失败');
      }
    } catch (error) {
      console.error('复制提示词失败:', error);
      set({ 
        error: error instanceof Error ? error.message : '复制失败',
        loading: false 
      });
      throw error;
    }
  },
  
  // 工具函数
  getPromptById: (id) => {
    return get().prompts.find(p => p.id === id);
  },
  
  clearError: () => set({ error: null }),
  
  reset: () => set(initialState),
}));
