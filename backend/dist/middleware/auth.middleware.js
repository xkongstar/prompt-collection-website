"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticateToken = void 0;
const client_1 = require("@prisma/client");
const auth_controller_1 = require("../controllers/auth.controller");
const prisma = new client_1.PrismaClient();
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : null;
        if (!token) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'NO_TOKEN',
                    message: '访问令牌缺失'
                }
            });
            return;
        }
        try {
            const decoded = auth_controller_1.AuthController.verifyToken(token);
            // 从数据库获取最新用户信息
            const user = await prisma.user.findUnique({
                where: {
                    id: decoded.userId
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    avatarUrl: true,
                    deletedAt: true
                }
            });
            if (!user || user.deletedAt) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: '用户不存在或已被删除'
                    }
                });
                return;
            }
            // 将用户信息附加到请求对象
            req.user = {
                id: user.id,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl || undefined
            };
            next();
        }
        catch (tokenError) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_TOKEN',
                    message: '访问令牌无效或已过期'
                }
            });
            return;
        }
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '服务器内部错误'
            }
        });
    }
};
exports.authenticateToken = authenticateToken;
// 可选的认证中间件（用户登录状态是可选的）
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : null;
        if (token) {
            try {
                const decoded = auth_controller_1.AuthController.verifyToken(token);
                const user = await prisma.user.findUnique({
                    where: {
                        id: decoded.userId
                    },
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        avatarUrl: true,
                        deletedAt: true
                    }
                });
                if (user && !user.deletedAt) {
                    req.user = {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        avatarUrl: user.avatarUrl || undefined
                    };
                }
            }
            catch (tokenError) {
                // 可选认证失败时不阻止请求继续
                console.log('Optional auth token invalid:', tokenError instanceof Error ? tokenError.message : 'Unknown error');
            }
        }
        next();
    }
    catch (error) {
        console.error('Optional auth middleware error:', error);
        next(); // 可选认证错误时不阻止请求
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.middleware.js.map