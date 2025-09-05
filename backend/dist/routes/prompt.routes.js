"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prompt_controller_1 = require("../controllers/prompt.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const promptController = new prompt_controller_1.PromptController();
// 所有提示词路由都需要认证
router.use(auth_middleware_1.authenticateToken);
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
exports.default = router;
//# sourceMappingURL=prompt.routes.js.map