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
    endpoints: {
      auth: '/auth',
      prompts: '/prompts',
      categories: '/categories',
      tags: '/tags'
    },
    docs: 'https://github.com/your-repo/docs'
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

// 健康检查路由（放在这里是为了统一管理）
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API服务运行正常',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;
