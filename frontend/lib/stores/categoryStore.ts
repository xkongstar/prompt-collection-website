import { create } from 'zustand';
import { api } from '@/lib/api';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types';

interface CategoryStore {
  // 状态
  categories: Category[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setCategories: (categories: Category[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // API Actions
  fetchCategories: () => Promise<void>;
  createCategory: (categoryData: CreateCategoryDto) => Promise<Category>;
  updateCategory: (id: number, categoryData: UpdateCategoryDto) => Promise<Category>;
  deleteCategory: (id: number) => Promise<void>;
  
  // 工具函数
  getCategoryById: (id: number) => Category | undefined;
  getCategoriesByParentId: (parentId?: number) => Category[];
  getCategoryTree: () => Category[];
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  categories: [],
  loading: false,
  error: null,
};

export const useCategoryStore = create<CategoryStore>()((set, get) => ({
  ...initialState,
  
  // Setters
  setCategories: (categories) => set({ categories }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  // API Actions
  fetchCategories: async () => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.get<Category[]>('/categories');
      
      if (response.data.success && response.data.data) {
        set({ 
          categories: response.data.data,
          loading: false 
        });
      } else {
        throw new Error(response.data.error?.message || '获取分类失败');
      }
    } catch (error) {
      console.error('获取分类失败:', error);
      set({ 
        error: error instanceof Error ? error.message : '获取分类失败',
        loading: false 
      });
      throw error;
    }
  },
  
  createCategory: async (categoryData) => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.post<Category>('/categories', categoryData);
      
      if (response.data.success && response.data.data) {
        const newCategory = response.data.data;
        set(state => ({
          categories: [...state.categories, newCategory],
          loading: false
        }));
        return newCategory;
      } else {
        throw new Error(response.data.error?.message || '创建分类失败');
      }
    } catch (error) {
      console.error('创建分类失败:', error);
      set({ 
        error: error instanceof Error ? error.message : '创建分类失败',
        loading: false 
      });
      throw error;
    }
  },
  
  updateCategory: async (id, categoryData) => {
    try {
      set({ error: null });
      
      const response = await api.put<Category>(`/categories/${id}`, categoryData);
      
      if (response.data.success && response.data.data) {
        const updatedCategory = response.data.data;
        set(state => ({
          categories: state.categories.map(c => c.id === id ? updatedCategory : c)
        }));
        return updatedCategory;
      } else {
        throw new Error(response.data.error?.message || '更新分类失败');
      }
    } catch (error) {
      console.error('更新分类失败:', error);
      set({ error: error instanceof Error ? error.message : '更新分类失败' });
      throw error;
    }
  },
  
  deleteCategory: async (id) => {
    try {
      set({ error: null });
      
      const response = await api.delete(`/categories/${id}`);
      
      if (response.data.success) {
        set(state => ({
          categories: state.categories.filter(c => c.id !== id)
        }));
      } else {
        throw new Error(response.data.error?.message || '删除分类失败');
      }
    } catch (error) {
      console.error('删除分类失败:', error);
      set({ error: error instanceof Error ? error.message : '删除分类失败' });
      throw error;
    }
  },
  
  // 工具函数
  getCategoryById: (id) => {
    return get().categories.find(c => c.id === id);
  },
  
  getCategoriesByParentId: (parentId) => {
    return get().categories.filter(c => c.parentId === parentId);
  },
  
  getCategoryTree: () => {
    const categories = get().categories;
    
    // 构建分类树
    const buildTree = (parentId?: number): Category[] => {
      return categories
        .filter(cat => cat.parentId === parentId)
        .map(cat => ({
          ...cat,
          children: buildTree(cat.id)
        }));
    };
    
    return buildTree();
  },
  
  clearError: () => set({ error: null }),
  
  reset: () => set(initialState),
}));