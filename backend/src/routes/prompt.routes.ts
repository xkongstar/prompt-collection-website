import { Router } from 'express';
import { PromptController } from '../controllers/prompt.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const promptController = new PromptController();

// 所有提示词路由都需要认证
router.use(authenticateToken);

// 获取提示词列表 (支持分页、搜索、筛选)
// GET /api/prompts?page=1&pageSize=20&search=xxx&categoryId=1&tags=tag1,tag2&isFavorite=true&sortBy=createdAt&sortOrder=desc
router.get('/', promptController.getPrompts.bind(promptController));

// 获取单个提示词详情
router.get('/:id', promptController.getPromptById.bind(promptController));

// 创建新提示词
router.post('/', promptController.createPrompt.bind(promptController));

// 更新提示词
router.put('/:id', promptController.updatePrompt.bind(promptController));

// 删除提示词 (软删除)
router.delete('/:id', promptController.deletePrompt.bind(promptController));

// 复制提示词
router.post('/:id/copy', promptController.copyPrompt.bind(promptController));

// 增加使用次数
router.post('/:id/use', promptController.incrementUsage.bind(promptController));

export default router;
