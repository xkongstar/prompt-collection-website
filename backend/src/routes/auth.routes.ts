import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

// 公开路由（不需要认证）
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));

// 受保护路由（需要认证）
router.get('/profile', authenticateToken, authController.getProfile.bind(authController));
router.put('/profile', authenticateToken, authController.updateProfile.bind(authController));

// 验证token路由（用于前端检查token有效性）
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    },
    message: 'Token验证成功'
  });
});

// 登出路由（前端处理token删除）
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: '登出成功'
  });
});

export default router;
