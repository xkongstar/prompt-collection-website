import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateTagDto {
  name: string;
  color: string;
}

interface UpdateTagDto extends Partial<CreateTagDto> {}

export class TagController {
  // 获取用户的标签列表
  async getTags(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { search } = req.query;
      
      const where: any = { userId };
      
      // 搜索条件
      if (search) {
        where.name = {
          contains: search as string
        };
      }

      const tags = await prisma.tag.findMany({
        where,
        include: {
          _count: {
            select: { 
              promptTags: true
            }
          }
        },
        orderBy: [
          { name: 'asc' }
        ]
      });

      const formattedTags = tags.map(tag => ({
        ...tag,
        promptCount: tag._count.promptTags
      }));

      res.json({
        success: true,
        data: formattedTags
      });
    } catch (error) {
      console.error('Get tags error:', error);
      next(error);
    }
  }

  // 获取单个标签详情
  async getTagById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ID',
            message: '无效的标签ID'
          }
        });
      }

      const tag = await prisma.tag.findFirst({
        where: {
          id: parseInt(id),
          userId
        },
        include: {
          promptTags: {
            include: {
              prompt: {
                select: { 
                  id: true, 
                  title: true, 
                  description: true,
                  createdAt: true,
                  usageCount: true,
                  isFavorite: true,
                  deletedAt: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 20
          },
          _count: {
            select: { 
              promptTags: true
            }
          }
        }
      });

      if (!tag) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'TAG_NOT_FOUND',
            message: '标签不存在'
          }
        });
      }

      const formattedTag = {
        ...tag,
        promptCount: tag._count.promptTags,
        prompts: tag.promptTags
          .filter((pt: any) => pt.prompt && !pt.prompt.deletedAt)
          .map((pt: any) => pt.prompt)
      };

      res.json({
        success: true,
        data: formattedTag
      });
    } catch (error) {
      console.error('Get tag by ID error:', error);
      next(error);
    }
  }

  // 创建新标签
  async createTag(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const {
        name,
        color = '#6B7280'
      }: CreateTagDto = req.body;

      // 验证必填字段
      if (!name) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_NAME',
            message: '标签名称是必填项'
          }
        });
      }

      // 检查标签名称是否已存在
      const existingTag = await prisma.tag.findFirst({
        where: {
          userId,
          name: name.trim()
        }
      });

      if (existingTag) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NAME_EXISTS',
            message: '该标签名称已存在'
          }
        });
      }

      // 创建标签
      const tag = await prisma.tag.create({
        data: {
          userId,
          name: name.trim(),
          color
        }
      });

      res.status(201).json({
        success: true,
        data: tag,
        message: '标签创建成功'
      });
    } catch (error) {
      console.error('Create tag error:', error);
      next(error);
    }
  }

  // 更新标签
  async updateTag(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const {
        name,
        color
      }: UpdateTagDto = req.body;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ID',
            message: '无效的标签ID'
          }
        });
      }

      // 检查标签是否存在且属于当前用户
      const existingTag = await prisma.tag.findFirst({
        where: {
          id: parseInt(id),
          userId
        }
      });

      if (!existingTag) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'TAG_NOT_FOUND',
            message: '标签不存在'
          }
        });
      }

      // 检查名称冲突（如果修改了名称）
      if (name && name !== existingTag.name) {
        const conflictTag = await prisma.tag.findFirst({
          where: {
            userId,
            name: name.trim(),
            id: { not: parseInt(id) }
          }
        });

        if (conflictTag) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'NAME_EXISTS',
              message: '该标签名称已存在'
            }
          });
        }
      }

      // 构建更新数据
      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (color !== undefined) updateData.color = color;

      // 更新标签
      const updatedTag = await prisma.tag.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      res.json({
        success: true,
        data: updatedTag,
        message: '标签更新成功'
      });
    } catch (error) {
      console.error('Update tag error:', error);
      next(error);
    }
  }

  // 删除标签
  async deleteTag(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ID',
            message: '无效的标签ID'
          }
        });
      }

      // 检查标签是否存在且属于当前用户
      const tag = await prisma.tag.findFirst({
        where: {
          id: parseInt(id),
          userId
        },
        include: {
          _count: {
            select: { 
              promptTags: {
                where: {
                  prompt: {
                    deletedAt: null
                  }
                }
              }
            }
          }
        }
      });

      if (!tag) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'TAG_NOT_FOUND',
            message: '标签不存在'
          }
        });
      }

      // 删除标签（关联的PromptTag会通过级联删除自动清理）
      await prisma.tag.delete({
        where: { id: parseInt(id) }
      });

      res.json({
        success: true,
        message: '标签删除成功'
      });
    } catch (error) {
      console.error('Delete tag error:', error);
      next(error);
    }
  }

  // 批量创建标签
  async createBatchTags(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { 
        tags 
      }: { 
        tags: Array<{ name: string; color?: string }> 
      } = req.body;

      if (!tags || !Array.isArray(tags) || tags.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DATA',
            message: '无效的标签数据'
          }
        });
      }

      // 检查重复名称
      const tagNames = tags.map(t => t.name.trim()).filter(name => name);
      const uniqueNames = [...new Set(tagNames)];
      
      if (uniqueNames.length !== tagNames.length) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'DUPLICATE_NAMES',
            message: '标签名称不能重复'
          }
        });
      }

      // 检查已存在的标签
      const existingTags = await prisma.tag.findMany({
        where: {
          userId,
          name: { in: uniqueNames }
        }
      });

      const existingNames = existingTags.map(t => t.name);
      const newTags = tags.filter(t => !existingNames.includes(t.name.trim()));

      if (newTags.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ALL_EXISTS',
            message: '所有标签都已存在'
          }
        });
      }

      // 创建新标签
      const createData = newTags.map(tag => ({
        userId,
        name: tag.name.trim(),
        color: tag.color || '#6B7280'
      }));

      const createdTags = await prisma.tag.createMany({
        data: createData
      });

      res.status(201).json({
        success: true,
        data: {
          created: createdTags.count,
          existing: existingNames
        },
        message: `成功创建 ${createdTags.count} 个标签`
      });
    } catch (error) {
      console.error('Create batch tags error:', error);
      next(error);
    }
  }

  // 获取标签使用统计
  async getTagStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      
      const stats = await prisma.tag.findMany({
        where: { userId },
        include: {
          _count: {
            select: { 
              promptTags: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        },
        take: 20
      });

      const formattedStats = stats.map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        promptCount: tag._count.promptTags,
        createdAt: tag.createdAt
      }));

      res.json({
        success: true,
        data: formattedStats
      });
    } catch (error) {
      console.error('Get tag stats error:', error);
      next(error);
    }
  }
}
