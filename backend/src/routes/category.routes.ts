import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const categoryController = new CategoryController();

// 所有路由都需要认证
router.use(authenticateToken);

// 分类管理路由
router.get('/', categoryController.getCategories.bind(categoryController));
router.get('/:id', categoryController.getCategoryById.bind(categoryController));
router.post('/', categoryController.createCategory.bind(categoryController));
router.put('/:id', categoryController.updateCategory.bind(categoryController));
router.delete('/:id', categoryController.deleteCategory.bind(categoryController));

// 批量操作
router.post('/reorder', categoryController.reorderCategories.bind(categoryController));

export default router;
