// 环境配置管理
export const config = {
  // API 配置
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    version: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
    timeout: 10000, // 10 seconds
  },

  // 应用配置
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || '提示词收集网站',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || '现代化的AI提示词管理平台',
  },

  // 功能开关
  features: {
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    errorReporting: process.env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING === 'true',
    debug: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
    themeSwitch: process.env.NEXT_PUBLIC_ENABLE_THEME_SWITCH !== 'false', // 默认启用
    devTools: process.env.NEXT_PUBLIC_SHOW_DEV_TOOLS === 'true',
  },

  // 分页配置
  pagination: {
    defaultPageSize: parseInt(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE || '20', 10),
    maxPageSize: parseInt(process.env.NEXT_PUBLIC_MAX_PAGE_SIZE || '100', 10),
  },

  // 文件上传配置
  upload: {
    maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760', 10), // 10MB
    allowedTypes: process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES?.split(',') || ['.txt', '.md', '.json'],
  },

  // 主题配置
  theme: {
    default: (process.env.NEXT_PUBLIC_DEFAULT_THEME as 'light' | 'dark' | 'system') || 'system',
  },

  // 搜索配置
  search: {
    debounceMs: parseInt(process.env.NEXT_PUBLIC_SEARCH_DEBOUNCE_MS || '300', 10),
    maxHistory: parseInt(process.env.NEXT_PUBLIC_MAX_SEARCH_HISTORY || '50', 10),
  },

  // 缓存配置
  cache: {
    duration: parseInt(process.env.NEXT_PUBLIC_CACHE_DURATION || '300000', 10), // 5 minutes
  },

  // 日志配置
  logging: {
    level: (process.env.NEXT_PUBLIC_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
  },
} as const;

// 类型推导
export type Config = typeof config;

// 验证配置
export const validateConfig = (): boolean => {
  const errors: string[] = [];

  // 验证 API URL
  if (!config.api.baseUrl.startsWith('http')) {
    errors.push('NEXT_PUBLIC_API_URL must be a valid HTTP/HTTPS URL');
  }

  // 验证分页配置
  if (config.pagination.defaultPageSize <= 0 || config.pagination.defaultPageSize > config.pagination.maxPageSize) {
    errors.push('Invalid pagination configuration');
  }

  // 验证文件大小
  if (config.upload.maxFileSize <= 0) {
    errors.push('NEXT_PUBLIC_MAX_FILE_SIZE must be greater than 0');
  }

  // 验证搜索配置
  if (config.search.debounceMs < 0) {
    errors.push('NEXT_PUBLIC_SEARCH_DEBOUNCE_MS must be non-negative');
  }

  if (errors.length > 0) {
    console.error('Configuration validation errors:', errors);
    if (config.features.debug) {
      throw new Error(`Configuration errors: ${errors.join(', ')}`);
    }
    return false;
  }

  return true;
};

// 在开发模式下验证配置
if (process.env.NODE_ENV === 'development') {
  validateConfig();
}

// 导出常用的配置值
export const {
  api: apiConfig,
  app: appConfig,
  features,
  pagination: paginationConfig,
  upload: uploadConfig,
  theme: themeConfig,
  search: searchConfig,
  cache: cacheConfig,
} = config;