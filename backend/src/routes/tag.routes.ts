import { Router } from 'express';
import { TagController } from '../controllers/tag.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const tagController = new TagController();

// 所有路由都需要认证
router.use(authenticateToken);

// 标签管理路由
router.get('/', tagController.getTags.bind(tagController));
router.get('/stats', tagController.getTagStats.bind(tagController));
router.get('/:id', tagController.getTagById.bind(tagController));
router.post('/', tagController.createTag.bind(tagController));
router.post('/batch', tagController.createBatchTags.bind(tagController));
router.put('/:id', tagController.updateTag.bind(tagController));
router.delete('/:id', tagController.deleteTag.bind(tagController));

export default router;
