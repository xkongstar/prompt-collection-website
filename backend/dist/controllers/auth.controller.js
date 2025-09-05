"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AuthController {
    // 用户注册
    async register(req, res, next) {
        try {
            const { username, email, password } = req.body;
            // 验证必填字段
            if (!username || !email || !password) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'MISSING_FIELDS',
                        message: '用户名、邮箱和密码都是必填项'
                    }
                });
            }
            // 验证密码长度
            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'WEAK_PASSWORD',
                        message: '密码长度至少6位'
                    }
                });
            }
            // 检查用户是否已存在
            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email: email.toLowerCase() },
                        { username }
                    ]
                }
            });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    error: {
                        code: 'USER_EXISTS',
                        message: existingUser.email === email.toLowerCase() ? '邮箱已被注册' : '用户名已被占用'
                    }
                });
            }
            // 加密密码
            const passwordHash = await bcryptjs_1.default.hash(password, 12);
            // 创建用户
            const user = await prisma.user.create({
                data: {
                    username,
                    email: email.toLowerCase(),
                    passwordHash,
                    settings: '{}'
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    avatarUrl: true,
                    settings: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            // 生成JWT
            const token = this.generateToken(user.id);
            res.status(201).json({
                success: true,
                data: {
                    user: {
                        ...user,
                        settings: JSON.parse(user.settings)
                    },
                    token
                },
                message: '注册成功'
            });
        }
        catch (error) {
            console.error('Register error:', error);
            next(error);
        }
    }
    // 用户登录
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            // 验证必填字段
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'MISSING_FIELDS',
                        message: '邮箱和密码都是必填项'
                    }
                });
            }
            // 查找用户
            const user = await prisma.user.findUnique({
                where: {
                    email: email.toLowerCase()
                }
            });
            if (!user || user.deletedAt) {
                return res.status(401).json({
                    success: false,
                    error: {
                        code: 'INVALID_CREDENTIALS',
                        message: '邮箱或密码错误'
                    }
                });
            }
            // 验证密码
            const isPasswordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    error: {
                        code: 'INVALID_CREDENTIALS',
                        message: '邮箱或密码错误'
                    }
                });
            }
            // 生成JWT
            const token = this.generateToken(user.id);
            // 返回用户信息（不包含密码）
            const { passwordHash, deletedAt, ...safeUser } = user;
            res.json({
                success: true,
                data: {
                    user: {
                        ...safeUser,
                        settings: JSON.parse(user.settings)
                    },
                    token
                },
                message: '登录成功'
            });
        }
        catch (error) {
            console.error('Login error:', error);
            next(error);
        }
    }
    // 获取用户信息
    async getProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    avatarUrl: true,
                    settings: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: '用户不存在'
                    }
                });
            }
            res.json({
                success: true,
                data: {
                    ...user,
                    settings: JSON.parse(user.settings)
                }
            });
        }
        catch (error) {
            console.error('Get profile error:', error);
            next(error);
        }
    }
    // 更新用户信息
    async updateProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const { username, avatarUrl, settings } = req.body;
            // 检查用户名是否重复
            if (username) {
                const existingUser = await prisma.user.findFirst({
                    where: {
                        username,
                        id: { not: userId }
                    }
                });
                if (existingUser) {
                    return res.status(409).json({
                        success: false,
                        error: {
                            code: 'USERNAME_TAKEN',
                            message: '用户名已被占用'
                        }
                    });
                }
            }
            const updateData = {};
            if (username !== undefined)
                updateData.username = username;
            if (avatarUrl !== undefined)
                updateData.avatarUrl = avatarUrl;
            if (settings !== undefined)
                updateData.settings = JSON.stringify(settings);
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: updateData,
                select: {
                    id: true,
                    username: true,
                    email: true,
                    avatarUrl: true,
                    settings: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            res.json({
                success: true,
                data: {
                    ...updatedUser,
                    settings: JSON.parse(updatedUser.settings)
                },
                message: '更新成功'
            });
        }
        catch (error) {
            console.error('Update profile error:', error);
            next(error);
        }
    }
    // 生成JWT Token
    generateToken(userId) {
        const payload = { userId };
        const secret = process.env.JWT_SECRET || 'fallback-secret-key';
        return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: '7d' });
    }
    // 验证Token
    static verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
        }
        catch (error) {
            throw new Error('Invalid token');
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map