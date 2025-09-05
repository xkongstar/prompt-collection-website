import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 主题类型
export type Theme = 'light' | 'dark' | 'system';

// 侧边栏状态
export type SidebarState = 'open' | 'closed' | 'collapsed';

// 视图模式
export type ViewMode = 'grid' | 'list';

// 语言类型
export type Language = 'zh-CN' | 'en-US';

// 通知类型
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  timestamp: number;
}

// 搜索历史
export interface SearchHistory {
  query: string;
  timestamp: number;
  type: 'prompt' | 'category' | 'tag';
}

// 导出配置
export interface ExportConfig {
  format: 'json' | 'csv' | 'markdown';
  includeMetadata: boolean;
  includeVariables: boolean;
  includeStats: boolean;
}

interface UIState {
  // 主题设置
  theme: Theme;
  
  // 布局设置
  sidebarState: SidebarState;
  viewMode: ViewMode;
  
  // 国际化
  language: Language;
  
  // 通知系统
  notifications: Notification[];
  
  // 搜索历史
  searchHistory: SearchHistory[];
  maxSearchHistory: number;
  
  // 导出配置
  exportConfig: ExportConfig;
  
  // 用户偏好
  preferences: {
    autoSave: boolean;
    showTips: boolean;
    compactMode: boolean;
    enableAnimations: boolean;
    defaultPageSize: number;
    defaultSortBy: 'createdAt' | 'updatedAt' | 'usageCount' | 'name';
    defaultSortOrder: 'asc' | 'desc';
  };
  
  // 临时状态
  isLoading: boolean;
  loadingMessage?: string;
}

interface UIActions {
  // 主题相关
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  
  // 布局相关
  setSidebarState: (state: SidebarState) => void;
  toggleSidebar: () => void;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  
  // 语言相关
  setLanguage: (language: Language) => void;
  
  // 通知相关
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // 搜索历史相关
  addSearchHistory: (item: Omit<SearchHistory, 'timestamp'>) => void;
  removeSearchHistory: (index: number) => void;
  clearSearchHistory: () => void;
  
  // 导出配置相关
  updateExportConfig: (config: Partial<ExportConfig>) => void;
  
  // 用户偏好相关
  updatePreferences: (preferences: Partial<UIState['preferences']>) => void;
  resetPreferences: () => void;
  
  // 临时状态相关
  setLoading: (loading: boolean, message?: string) => void;
  
  // 工具函数
  getNotificationsByType: (type: Notification['type']) => Notification[];
  getRecentSearchHistory: (limit?: number) => SearchHistory[];
  reset: () => void;
}

type UIStore = UIState & UIActions;

const initialState: UIState = {
  theme: 'system',
  sidebarState: 'open',
  viewMode: 'grid',
  language: 'zh-CN',
  notifications: [],
  searchHistory: [],
  maxSearchHistory: 50,
  exportConfig: {
    format: 'json',
    includeMetadata: true,
    includeVariables: true,
    includeStats: false
  },
  preferences: {
    autoSave: true,
    showTips: true,
    compactMode: false,
    enableAnimations: true,
    defaultPageSize: 20,
    defaultSortBy: 'createdAt',
    defaultSortOrder: 'desc'
  },
  isLoading: false,
  loadingMessage: undefined
};

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // 主题相关
      setTheme: (theme) => set({ theme }),
      
      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
      },
      
      // 布局相关
      setSidebarState: (sidebarState) => set({ sidebarState }),
      
      toggleSidebar: () => {
        const currentState = get().sidebarState;
        const newState: SidebarState = 
          currentState === 'open' ? 'collapsed' : 
          currentState === 'collapsed' ? 'closed' : 'open';
        set({ sidebarState: newState });
      },
      
      setViewMode: (viewMode) => set({ viewMode }),
      
      toggleViewMode: () => {
        const currentMode = get().viewMode;
        set({ viewMode: currentMode === 'grid' ? 'list' : 'grid' });
      },
      
      // 语言相关
      setLanguage: (language) => set({ language }),
      
      // 通知相关
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now()
        };
        
        set(state => ({
          notifications: [...state.notifications, newNotification]
        }));
        
        // 自动移除通知（如果设置了duration）
        if (notification.duration && notification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(newNotification.id);
          }, notification.duration);
        }
      },
      
      removeNotification: (id) => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }));
      },
      
      clearNotifications: () => set({ notifications: [] }),
      
      // 搜索历史相关
      addSearchHistory: (item) => {
        const state = get();
        const newItem: SearchHistory = {
          ...item,
          timestamp: Date.now()
        };
        
        // 避免重复添加相同的搜索
        const existingIndex = state.searchHistory.findIndex(
          h => h.query === item.query && h.type === item.type
        );
        
        let newHistory = [...state.searchHistory];
        
        if (existingIndex >= 0) {
          // 移除旧的记录
          newHistory.splice(existingIndex, 1);
        }
        
        // 添加到开头
        newHistory.unshift(newItem);
        
        // 限制历史记录数量
        if (newHistory.length > state.maxSearchHistory) {
          newHistory = newHistory.slice(0, state.maxSearchHistory);
        }
        
        set({ searchHistory: newHistory });
      },
      
      removeSearchHistory: (index) => {
        set(state => ({
          searchHistory: state.searchHistory.filter((_, i) => i !== index)
        }));
      },
      
      clearSearchHistory: () => set({ searchHistory: [] }),
      
      // 导出配置相关
      updateExportConfig: (config) => {
        set(state => ({
          exportConfig: { ...state.exportConfig, ...config }
        }));
      },
      
      // 用户偏好相关
      updatePreferences: (preferences) => {
        set(state => ({
          preferences: { ...state.preferences, ...preferences }
        }));
      },
      
      resetPreferences: () => set({ preferences: initialState.preferences }),
      
      // 临时状态相关
      setLoading: (isLoading, loadingMessage) => set({ isLoading, loadingMessage }),
      
      // 工具函数
      getNotificationsByType: (type) => {
        return get().notifications.filter(n => n.type === type);
      },
      
      getRecentSearchHistory: (limit = 10) => {
        return get().searchHistory
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit);
      },
      
      reset: () => set(initialState),
    }),
    {
      name: 'ui-store',
      // 只持久化需要保存的状态，排除临时状态
      partialize: (state) => ({
        theme: state.theme,
        sidebarState: state.sidebarState,
        viewMode: state.viewMode,
        language: state.language,
        searchHistory: state.searchHistory,
        exportConfig: state.exportConfig,
        preferences: state.preferences
      })
    }
  )
);