import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreatePromptDto {
  title: string;
  content: string;
  description?: string;
  categoryId?: number;
  variables?: any[];
  metadata?: any;
  tags?: number[];
}

interface UpdatePromptDto extends Partial<CreatePromptDto> {
  isFavorite?: boolean;
  isPublic?: boolean;
}

interface PromptFilters {
  search?: string;
  categoryId?: string;
  tags?: string;
  isFavorite?: string;
  sortBy?: string;
  sortOrder?: string;
}

export class PromptController {
  // 获取用户的提示词列表
  async getPrompts(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const {
        page = '1',
        pageSize = '20',
        search,
        categoryId,
        tags,
        isFavorite,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      }: PromptFilters & { page?: string; pageSize?: string } = req.query;

      const pageNum = parseInt(page);
      const pageSizeNum = parseInt(pageSize);
      const skip = (pageNum - 1) * pageSizeNum;

      // 构建查询条件
      const where: any = {
        userId,
        deletedAt: null
      };

      // 搜索条件
      if (search) {
        where.OR = [
          { title: { contains: search } },
          { content: { contains: search } },
          { description: { contains: search } }
        ];
      }

      // 分类筛选
      if (categoryId && categoryId !== 'all') {
        where.categoryId = parseInt(categoryId);
      }

      // 收藏筛选
      if (isFavorite === 'true') {
        where.isFavorite = true;
      }

      // 标签筛选
      if (tags) {
        const tagArray = tags.split(',').filter(tag => tag.trim());
        if (tagArray.length > 0) {
          where.tags = {
            some: {
              tag: {
                name: { in: tagArray }
              }
            }
          };
        }
      }

      // 排序配置
      const orderBy: any = {};
      if (sortBy === 'title') {
        orderBy.title = sortOrder;
      } else if (sortBy === 'usageCount') {
        orderBy.usageCount = sortOrder;
      } else if (sortBy === 'lastUsedAt') {
        orderBy.lastUsedAt = sortOrder;
      } else {
        orderBy.createdAt = sortOrder;
      }

      // 执行查询
      const [prompts, total] = await Promise.all([
        prisma.prompt.findMany({
          where,
          include: {
            category: {
              select: { id: true, name: true, color: true }
            },
            tags: {
              include: {
                tag: {
                  select: { id: true, name: true, color: true }
                }
              }
            }
          },
          orderBy,
          skip,
          take: pageSizeNum
        }),
        prisma.prompt.count({ where })
      ]);

      // 处理数据格式
      const formattedPrompts = prompts.map(prompt => ({
        ...prompt,
        variables: prompt.variables ? JSON.parse(prompt.variables) : [],
        metadata: prompt.metadata ? JSON.parse(prompt.metadata) : {}
      }));

      res.json({
        success: true,
        data: formattedPrompts,
        meta: {
          pagination: {
            page: pageNum,
            pageSize: pageSizeNum,
            total,
            totalPages: Math.ceil(total / pageSizeNum)
          }
        }
      });
    } catch (error) {
      console.error('Get prompts error:', error);
      next(error);
    }
  }

  // 获取单个提示词详情
  async getPromptById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ID',
            message: '无效的提示词ID'
          }
        });
      }

      const prompt = await prisma.prompt.findFirst({
        where: {
          id: parseInt(id),
          userId,
          deletedAt: null
        },
        include: {
          category: {
            select: { id: true, name: true, color: true }
          },
          tags: {
            include: {
              tag: {
                select: { id: true, name: true, color: true }
              }
            }
          },
          versions: {
            select: {
              id: true,
              versionNumber: true,
              title: true,
              changeLog: true,
              createdAt: true
            },
            orderBy: { versionNumber: 'desc' },
            take: 10
          }
        }
      });

      if (!prompt) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PROMPT_NOT_FOUND',
            message: '提示词不存在'
          }
        });
      }

      const formattedPrompt = {
        ...prompt,
        variables: prompt.variables ? JSON.parse(prompt.variables) : [],
        metadata: prompt.metadata ? JSON.parse(prompt.metadata) : {}
      };

      res.json({
        success: true,
        data: formattedPrompt
      });
    } catch (error) {
      console.error('Get prompt by ID error:', error);
      next(error);
    }
  }

  // 创建新提示词
  async createPrompt(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const {
        title,
        content,
        description,
        categoryId,
        variables = [],
        metadata = {},
        tags = []
      }: CreatePromptDto = req.body;

      // 验证必填字段
      if (!title || !content) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: '标题和内容是必填项'
          }
        });
      }

      // 验证分类是否存在
      if (categoryId) {
        const category = await prisma.category.findFirst({
          where: { id: categoryId, userId }
        });
        if (!category) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'CATEGORY_NOT_FOUND',
              message: '分类不存在'
            }
          });
        }
      }

      // 创建提示词
      const prompt = await prisma.prompt.create({
        data: {
          userId,
          title: title.trim(),
          content: content.trim(),
          description: description?.trim(),
          categoryId,
          variables: JSON.stringify(variables),
          metadata: JSON.stringify(metadata)
        },
        include: {
          category: {
            select: { id: true, name: true, color: true }
          }
        }
      });

      // 如果有标签，创建关联
      if (tags.length > 0) {
        const tagRelations = tags.map(tagId => ({
          promptId: prompt.id,
          tagId
        }));
        
        await prisma.promptTag.createMany({
          data: tagRelations
        });
      }

      // 创建初始版本
      await prisma.promptVersion.create({
        data: {
          promptId: prompt.id,
          versionNumber: 1,
          title: prompt.title,
          content: prompt.content,
          description: prompt.description,
          variables: JSON.stringify(variables),
          changeLog: '初始版本',
          createdBy: userId
        }
      });

      // 返回完整信息
      const fullPrompt = await prisma.prompt.findUnique({
        where: { id: prompt.id },
        include: {
          category: {
            select: { id: true, name: true, color: true }
          },
          tags: {
            include: {
              tag: {
                select: { id: true, name: true, color: true }
              }
            }
          }
        }
      });

      const formattedPrompt = {
        ...fullPrompt,
        variables: fullPrompt?.variables ? JSON.parse(fullPrompt.variables) : [],
        metadata: fullPrompt?.metadata ? JSON.parse(fullPrompt.metadata) : {}
      };

      res.status(201).json({
        success: true,
        data: formattedPrompt,
        message: '提示词创建成功'
      });
    } catch (error) {
      console.error('Create prompt error:', error);
      next(error);
    }
  }

  // 更新提示词
  async updatePrompt(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const {
        title,
        content,
        description,
        categoryId,
        variables,
        metadata,
        isFavorite,
        isPublic,
        tags
      }: UpdatePromptDto = req.body;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ID',
            message: '无效的提示词ID'
          }
        });
      }

      // 检查提示词是否存在且属于当前用户
      const existingPrompt = await prisma.prompt.findFirst({
        where: {
          id: parseInt(id),
          userId,
          deletedAt: null
        }
      });

      if (!existingPrompt) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PROMPT_NOT_FOUND',
            message: '提示词不存在'
          }
        });
      }

      // 构建更新数据
      const updateData: any = {};
      if (title !== undefined) updateData.title = title.trim();
      if (content !== undefined) updateData.content = content.trim();
      if (description !== undefined) updateData.description = description?.trim();
      if (categoryId !== undefined) updateData.categoryId = categoryId;
      if (variables !== undefined) updateData.variables = JSON.stringify(variables);
      if (metadata !== undefined) updateData.metadata = JSON.stringify(metadata);
      if (isFavorite !== undefined) updateData.isFavorite = isFavorite;
      if (isPublic !== undefined) updateData.isPublic = isPublic;

      // 更新提示词
      const updatedPrompt = await prisma.prompt.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          category: {
            select: { id: true, name: true, color: true }
          },
          tags: {
            include: {
              tag: {
                select: { id: true, name: true, color: true }
              }
            }
          }
        }
      });

      // 更新标签关联
      if (tags !== undefined) {
        // 删除现有关联
        await prisma.promptTag.deleteMany({
          where: { promptId: parseInt(id) }
        });

        // 创建新关联
        if (tags.length > 0) {
          const tagRelations = tags.map((tagId: number) => ({
            promptId: parseInt(id),
            tagId
          }));
          
          await prisma.promptTag.createMany({
            data: tagRelations
          });
        }
      }

      // 如果内容有重大变更，创建新版本
      if (title || content) {
        const latestVersion = await prisma.promptVersion.findFirst({
          where: { promptId: parseInt(id) },
          orderBy: { versionNumber: 'desc' }
        });

        const nextVersion = (latestVersion?.versionNumber || 0) + 1;
        
        await prisma.promptVersion.create({
          data: {
            promptId: parseInt(id),
            versionNumber: nextVersion,
            title: updatedPrompt.title,
            content: updatedPrompt.content,
            description: updatedPrompt.description,
            variables: updatedPrompt.variables,
            changeLog: '内容更新',
            createdBy: userId
          }
        });
      }

      const formattedPrompt = {
        ...updatedPrompt,
        variables: updatedPrompt.variables ? JSON.parse(updatedPrompt.variables) : [],
        metadata: updatedPrompt.metadata ? JSON.parse(updatedPrompt.metadata) : {}
      };

      res.json({
        success: true,
        data: formattedPrompt,
        message: '提示词更新成功'
      });
    } catch (error) {
      console.error('Update prompt error:', error);
      next(error);
    }
  }

  // 删除提示词
  async deletePrompt(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ID',
            message: '无效的提示词ID'
          }
        });
      }

      // 检查提示词是否存在且属于当前用户
      const prompt = await prisma.prompt.findFirst({
        where: {
          id: parseInt(id),
          userId,
          deletedAt: null
        }
      });

      if (!prompt) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PROMPT_NOT_FOUND',
            message: '提示词不存在'
          }
        });
      }

      // 软删除（设置删除时间戳）
      await prisma.prompt.update({
        where: { id: parseInt(id) },
        data: { deletedAt: new Date() }
      });

      res.json({
        success: true,
        message: '提示词删除成功'
      });
    } catch (error) {
      console.error('Delete prompt error:', error);
      next(error);
    }
  }

  // 增加使用次数
  async incrementUsage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ID',
            message: '无效的提示词ID'
          }
        });
      }

      // 更新使用次数和最后使用时间
      const updatedPrompt = await prisma.prompt.updateMany({
        where: {
          id: parseInt(id),
          userId,
          deletedAt: null
        },
        data: {
          usageCount: { increment: 1 },
          lastUsedAt: new Date()
        }
      });

      if (updatedPrompt.count === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PROMPT_NOT_FOUND',
            message: '提示词不存在'
          }
        });
      }

      res.json({
        success: true,
        message: '使用次数已更新'
      });
    } catch (error) {
      console.error('Increment usage error:', error);
      next(error);
    }
  }

  // 复制提示词
  async copyPrompt(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ID',
            message: '无效的提示词ID'
          }
        });
      }

      // 查找原提示词
      const originalPrompt = await prisma.prompt.findFirst({
        where: {
          id: parseInt(id),
          userId,
          deletedAt: null
        },
        include: {
          tags: {
            include: {
              tag: true
            }
          }
        }
      });

      if (!originalPrompt) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PROMPT_NOT_FOUND',
            message: '提示词不存在'
          }
        });
      }

      // 创建复制版本
      const copiedPrompt = await prisma.prompt.create({
        data: {
          userId,
          title: `${originalPrompt.title} (副本)`,
          content: originalPrompt.content,
          description: originalPrompt.description,
          categoryId: originalPrompt.categoryId,
          variables: originalPrompt.variables,
          metadata: originalPrompt.metadata
        },
        include: {
          category: {
            select: { id: true, name: true, color: true }
          }
        }
      });

      // 复制标签关联
      if (originalPrompt.tags.length > 0) {
        const tagRelations = originalPrompt.tags.map(tagRelation => ({
          promptId: copiedPrompt.id,
          tagId: tagRelation.tagId
        }));
        
        await prisma.promptTag.createMany({
          data: tagRelations
        });
      }

      const formattedPrompt = {
        ...copiedPrompt,
        variables: copiedPrompt.variables ? JSON.parse(copiedPrompt.variables) : [],
        metadata: copiedPrompt.metadata ? JSON.parse(copiedPrompt.metadata) : {}
      };

      res.status(201).json({
        success: true,
        data: formattedPrompt,
        message: '提示词复制成功'
      });
    } catch (error) {
      console.error('Copy prompt error:', error);
      next(error);
    }
  }
}
