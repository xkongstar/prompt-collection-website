import { create } from 'zustand';
import { api } from '@/lib/api';
import { Tag, CreateTagDto, UpdateTagDto } from '@/types';

interface TagStore {
  // 状态
  tags: Tag[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  
  // Actions
  setTags: (tags: Tag[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  
  // API Actions
  fetchTags: (search?: string) => Promise<void>;
  createTag: (tagData: CreateTagDto) => Promise<Tag>;
  updateTag: (id: number, tagData: UpdateTagDto) => Promise<Tag>;
  deleteTag: (id: number) => Promise<void>;
  batchCreateTags: (tagData: CreateTagDto[]) => Promise<Tag[]>;
  
  // 工具函数
  getTagById: (id: number) => Tag | undefined;
  getTagByName: (name: string) => Tag | undefined;
  getFilteredTags: () => Tag[];
  getTagStatistics: () => {
    total: number;
    used: number;
    unused: number;
  };
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  tags: [],
  loading: false,
  error: null,
  searchQuery: '',
};

export const useTagStore = create<TagStore>()((set, get) => ({
  ...initialState,
  
  // Setters
  setTags: (tags) => set({ tags }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  
  // API Actions
  fetchTags: async (search) => {
    try {
      set({ loading: true, error: null });
      
      const params = search ? { search } : {};
      const response = await api.get<Tag[]>('/tags', { params });
      
      if (response.data.success && response.data.data) {
        set({ 
          tags: response.data.data,
          loading: false 
        });
      } else {
        throw new Error(response.data.error?.message || '获取标签失败');
      }
    } catch (error) {
      console.error('获取标签失败:', error);
      set({ 
        error: error instanceof Error ? error.message : '获取标签失败',
        loading: false 
      });
      throw error;
    }
  },
  
  createTag: async (tagData) => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.post<Tag>('/tags', tagData);
      
      if (response.data.success && response.data.data) {
        const newTag = response.data.data;
        set(state => ({
          tags: [...state.tags, newTag],
          loading: false
        }));
        return newTag;
      } else {
        throw new Error(response.data.error?.message || '创建标签失败');
      }
    } catch (error) {
      console.error('创建标签失败:', error);
      set({ 
        error: error instanceof Error ? error.message : '创建标签失败',
        loading: false 
      });
      throw error;
    }
  },
  
  updateTag: async (id, tagData) => {
    try {
      set({ error: null });
      
      const response = await api.put<Tag>(`/tags/${id}`, tagData);
      
      if (response.data.success && response.data.data) {
        const updatedTag = response.data.data;
        set(state => ({
          tags: state.tags.map(t => t.id === id ? updatedTag : t)
        }));
        return updatedTag;
      } else {
        throw new Error(response.data.error?.message || '更新标签失败');
      }
    } catch (error) {
      console.error('更新标签失败:', error);
      set({ error: error instanceof Error ? error.message : '更新标签失败' });
      throw error;
    }
  },
  
  deleteTag: async (id) => {
    try {
      set({ error: null });
      
      const response = await api.delete(`/tags/${id}`);
      
      if (response.data.success) {
        set(state => ({
          tags: state.tags.filter(t => t.id !== id)
        }));
      } else {
        throw new Error(response.data.error?.message || '删除标签失败');
      }
    } catch (error) {
      console.error('删除标签失败:', error);
      set({ error: error instanceof Error ? error.message : '删除标签失败' });
      throw error;
    }
  },
  
  batchCreateTags: async (tagData) => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.post<Tag[]>('/tags/batch', { tags: tagData });
      
      if (response.data.success && response.data.data) {
        const newTags = response.data.data;
        set(state => ({
          tags: [...state.tags, ...newTags],
          loading: false
        }));
        return newTags;
      } else {
        throw new Error(response.data.error?.message || '批量创建标签失败');
      }
    } catch (error) {
      console.error('批量创建标签失败:', error);
      set({ 
        error: error instanceof Error ? error.message : '批量创建标签失败',
        loading: false 
      });
      throw error;
    }
  },
  
  // 工具函数
  getTagById: (id) => {
    return get().tags.find(t => t.id === id);
  },
  
  getTagByName: (name) => {
    return get().tags.find(t => t.name.toLowerCase() === name.toLowerCase());
  },
  
  getFilteredTags: () => {
    const { tags, searchQuery } = get();
    if (!searchQuery) return tags;
    
    return tags.filter(tag => 
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  },
  
  getTagStatistics: () => {
    const tags = get().tags;
    const used = tags.filter(tag => 
      (tag as Tag & { promptCount?: number }).promptCount && 
      (tag as Tag & { promptCount?: number }).promptCount! > 0
    ).length;
    
    return {
      total: tags.length,
      used,
      unused: tags.length - used
    };
  },
  
  clearError: () => set({ error: null }),
  
  reset: () => set(initialState),
}));