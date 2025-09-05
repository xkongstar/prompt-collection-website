"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tag_controller_1 = require("../controllers/tag.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const tagController = new tag_controller_1.TagController();
// 所有路由都需要认证
router.use(auth_middleware_1.authenticateToken);
// 标签管理路由
router.get('/', tagController.getTags.bind(tagController));
router.get('/stats', tagController.getTagStats.bind(tagController));
router.get('/:id', tagController.getTagById.bind(tagController));
router.post('/', tagController.createTag.bind(tagController));
router.post('/batch', tagController.createBatchTags.bind(tagController));
router.put('/:id', tagController.updateTag.bind(tagController));
router.delete('/:id', tagController.deleteTag.bind(tagController));
exports.default = router;
//# sourceMappingURL=tag.routes.js.map