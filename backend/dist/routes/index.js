"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const prompt_routes_1 = __importDefault(require("./prompt.routes"));
const category_routes_1 = __importDefault(require("./category.routes"));
const tag_routes_1 = __importDefault(require("./tag.routes"));
const router = (0, express_1.Router)();
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
router.use('/auth', auth_routes_1.default);
// 提示词路由
router.use('/prompts', prompt_routes_1.default);
// 分类路由
router.use('/categories', category_routes_1.default);
// 标签路由
router.use('/tags', tag_routes_1.default);
// 健康检查路由（放在这里是为了统一管理）
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API服务运行正常',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map