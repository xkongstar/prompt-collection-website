export interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
  settings: Record<string, string | number | boolean>;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  userId: number;
  name: string;
  description?: string;
  color: string;
  parentId?: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  parent?: Category;
  children?: Category[];
}

export interface Tag {
  id: number;
  userId: number;
  name: string;
  color: string;
  createdAt: string;
}

export interface Prompt {
  id: number;
  userId: number;
  title: string;
  content: string;
  description?: string;
  categoryId?: number;
  variables: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'text';
    defaultValue?: string | number | boolean;
    description?: string;
    required?: boolean;
  }>;
  metadata: Record<string, string | number | boolean>;
  isFavorite: boolean;
  isPublic: boolean;
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  
  // Relations
  category?: Category;
  tags: Array<{
    id: number;
    tag: Tag;
  }>;
  versions?: PromptVersion[];
}

export interface PromptVersion {
  id: number;
  promptId: number;
  versionNumber: number;
  title: string;
  content: string;
  description?: string;
  variables: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'text';
    defaultValue?: string | number | boolean;
    description?: string;
    required?: boolean;
  }>;
  changeLog?: string;
  createdAt: string;
  createdBy: number;
}

export interface CreatePromptDto {
  title: string;
  content: string;
  description?: string;
  categoryId?: number;
  variables?: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'text';
    defaultValue?: string | number | boolean;
    description?: string;
    required?: boolean;
  }>;
  metadata?: Record<string, string | number | boolean>;
  tags?: number[];
}

export interface UpdatePromptDto extends Partial<CreatePromptDto> {
  isFavorite?: boolean;
  isPublic?: boolean;
}

export interface PromptFilters {
  search?: string;
  categoryId?: number;
  tags?: string[];
  isFavorite?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'usageCount';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// API响应类型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}
