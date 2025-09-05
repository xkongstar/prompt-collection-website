import { Router } from 'express';
import authRoutes from './auth.routes';
import promptRoutes from './prompt.routes';
import categoryRoutes from './category.routes';
import tagRoutes from './tag.routes';

const router = Router();

// API版本信息
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Prompt Collection API v1.0.0',
    version: '1.0.0',
    description: '现代化的AI提示词管理API服务',
    endpoints: {
      auth: '/auth',
      prompts: '/prompts',
      categories: '/categories',
      tags: '/tags',
      health: '/health',
      stats: '/stats'
    },
    features: [
      '用户认证和授权',
      '提示词CRUD操作',
      '分类层级管理',
      '标签系统',
      '搜索和过滤',
      '批量操作',
      '数据统计'
    ],
    docs: 'https://github.com/your-repo/docs',
    support: 'https://github.com/your-repo/issues'
  });
});

// 认证路由
router.use('/auth', authRoutes);

// 提示词路由
router.use('/prompts', promptRoutes);

// 分类路由
router.use('/categories', categoryRoutes);

// 标签路由
router.use('/tags', tagRoutes);

// 健康检查路由
router.get('/health', (req, res) => {
  const uptime = process.uptime();
  res.json({
    success: true,
    message: 'API服务运行正常',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.floor(uptime),
      human: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`
    },
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    memoryUsage: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
    }
  });
});

// 统计信息路由
router.get('/stats', (req, res) => {
  // TODO: 实现统计信息获取
  res.json({
    success: true,
    message: '统计信息',
    data: {
      totalPrompts: 0,
      totalCategories: 0,
      totalTags: 0,
      totalUsers: 0,
      // TODO: 从数据库获取实际统计数据
    },
    lastUpdated: new Date().toISOString()
  });
});

export default router;
