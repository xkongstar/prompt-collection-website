import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthController } from '../controllers/auth.controller';

const prisma = new PrismaClient();

// 扩展Request类型以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
        avatarUrl?: string;
      };
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
      const decoded = AuthController.verifyToken(token) as { userId: number };
      
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
    } catch (tokenError) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: '访问令牌无效或已过期'
        }
      });
      return;
    }
  } catch (error) {
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

// 可选的认证中间件（用户登录状态是可选的）
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (token) {
      try {
        const decoded = AuthController.verifyToken(token) as { userId: number };
        
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
      } catch (tokenError) {
        // 可选认证失败时不阻止请求继续
        console.log('Optional auth token invalid:', tokenError instanceof Error ? tokenError.message : 'Unknown error');
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // 可选认证错误时不阻止请求
  }
};
