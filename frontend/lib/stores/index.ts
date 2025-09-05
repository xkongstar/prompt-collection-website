// 导出所有的 store
export { useAuthStore } from './authStore';
export { usePromptStore } from './promptStore';
export { useCategoryStore } from './categoryStore';
export { useTagStore } from './tagStore';
export { useUIStore } from './uiStore';

// 导出类型
export type { Theme, SidebarState, ViewMode, Language, Notification, SearchHistory, ExportConfig } from './uiStore';

// 工具函数：重置所有store
export const resetAllStores = () => {
  const { useAuthStore } = require('./authStore');
  const { usePromptStore } = require('./promptStore');
  const { useCategoryStore } = require('./categoryStore');
  const { useTagStore } = require('./tagStore');
  const { useUIStore } = require('./uiStore');
  
  useAuthStore.getState().logout();
  usePromptStore.getState().reset();
  useCategoryStore.getState().reset();
  useTagStore.getState().reset();
  useUIStore.getState().reset();
};

// 工具函数：清除所有错误
export const clearAllErrors = () => {
  const { usePromptStore } = require('./promptStore');
  const { useCategoryStore } = require('./categoryStore');
  const { useTagStore } = require('./tagStore');
  const { useAuthStore } = require('./authStore');
  
  usePromptStore.getState().clearError();
  useCategoryStore.getState().clearError();
  useTagStore.getState().clearError();
  useAuthStore.getState().clearError();
};