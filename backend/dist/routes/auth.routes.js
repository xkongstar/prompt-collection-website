"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
// 公开路由（不需要认证）
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
// 受保护路由（需要认证）
router.get('/profile', auth_middleware_1.authenticateToken, authController.getProfile.bind(authController));
router.put('/profile', auth_middleware_1.authenticateToken, authController.updateProfile.bind(authController));
// 验证token路由（用于前端检查token有效性）
router.get('/verify', auth_middleware_1.authenticateToken, (req, res) => {
    res.json({
        success: true,
        data: {
            user: req.user
        },
        message: 'Token验证成功'
    });
});
// 登出路由（前端处理token删除）
router.post('/logout', auth_middleware_1.authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: '登出成功'
    });
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map