"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class CategoryController {
    // 获取用户的分类列表
    async getCategories(req, res, next) {
        try {
            const userId = req.user.id;
            const categories = await prisma.category.findMany({
                where: { userId },
                include: {
                    parent: {
                        select: { id: true, name: true, color: true }
                    },
                    children: {
                        select: { id: true, name: true, color: true, description: true },
                        orderBy: { sortOrder: 'asc' }
                    },
                    _count: {
                        select: { prompts: true }
                    }
                },
                orderBy: [
                    { parentId: 'asc' },
                    { sortOrder: 'asc' },
                    { name: 'asc' }
                ]
            });
            const formattedCategories = categories.map(category => ({
                ...category,
                promptCount: category._count.prompts
            }));
            res.json({
                success: true,
                data: formattedCategories
            });
        }
        catch (error) {
            console.error('Get categories error:', error);
            next(error);
        }
    }
    // 获取单个分类详情
    async getCategoryById(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_ID',
                        message: '无效的分类ID'
                    }
                });
            }
            const category = await prisma.category.findFirst({
                where: {
                    id: parseInt(id),
                    userId
                },
                include: {
                    parent: {
                        select: { id: true, name: true, color: true }
                    },
                    children: {
                        select: { id: true, name: true, color: true, description: true },
                        orderBy: { sortOrder: 'asc' }
                    },
                    prompts: {
                        select: { id: true, title: true, createdAt: true },
                        where: { deletedAt: null },
                        orderBy: { createdAt: 'desc' },
                        take: 10
                    },
                    _count: {
                        select: { prompts: true }
                    }
                }
            });
            if (!category) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'CATEGORY_NOT_FOUND',
                        message: '分类不存在'
                    }
                });
            }
            const formattedCategory = {
                ...category,
                promptCount: category._count.prompts
            };
            res.json({
                success: true,
                data: formattedCategory
            });
        }
        catch (error) {
            console.error('Get category by ID error:', error);
            next(error);
        }
    }
    // 创建新分类
    async createCategory(req, res, next) {
        try {
            const userId = req.user.id;
            const { name, description, color = '#6B7280', parentId, sortOrder = 0 } = req.body;
            // 验证必填字段
            if (!name) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'MISSING_NAME',
                        message: '分类名称是必填项'
                    }
                });
            }
            // 检查分类名称是否已存在（同一父分类下）
            const existingCategory = await prisma.category.findFirst({
                where: {
                    userId,
                    name: name.trim(),
                    parentId: parentId || null
                }
            });
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'NAME_EXISTS',
                        message: '该分类名称已存在'
                    }
                });
            }
            // 验证父分类是否存在
            if (parentId) {
                const parentCategory = await prisma.category.findFirst({
                    where: { id: parentId, userId }
                });
                if (!parentCategory) {
                    return res.status(400).json({
                        success: false,
                        error: {
                            code: 'PARENT_NOT_FOUND',
                            message: '父分类不存在'
                        }
                    });
                }
            }
            // 创建分类
            const category = await prisma.category.create({
                data: {
                    userId,
                    name: name.trim(),
                    description: description?.trim(),
                    color,
                    parentId,
                    sortOrder
                },
                include: {
                    parent: {
                        select: { id: true, name: true, color: true }
                    },
                    children: {
                        select: { id: true, name: true, color: true, description: true }
                    }
                }
            });
            res.status(201).json({
                success: true,
                data: category,
                message: '分类创建成功'
            });
        }
        catch (error) {
            console.error('Create category error:', error);
            next(error);
        }
    }
    // 更新分类
    async updateCategory(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const { name, description, color, parentId, sortOrder } = req.body;
            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_ID',
                        message: '无效的分类ID'
                    }
                });
            }
            // 检查分类是否存在且属于当前用户
            const existingCategory = await prisma.category.findFirst({
                where: {
                    id: parseInt(id),
                    userId
                }
            });
            if (!existingCategory) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'CATEGORY_NOT_FOUND',
                        message: '分类不存在'
                    }
                });
            }
            // 检查名称冲突（如果修改了名称）
            if (name && name !== existingCategory.name) {
                const conflictCategory = await prisma.category.findFirst({
                    where: {
                        userId,
                        name: name.trim(),
                        parentId: parentId !== undefined ? parentId : existingCategory.parentId,
                        id: { not: parseInt(id) }
                    }
                });
                if (conflictCategory) {
                    return res.status(400).json({
                        success: false,
                        error: {
                            code: 'NAME_EXISTS',
                            message: '该分类名称已存在'
                        }
                    });
                }
            }
            // 防止父分类循环引用
            if (parentId && parentId !== existingCategory.parentId) {
                let currentParentId = parentId;
                while (currentParentId) {
                    if (currentParentId === parseInt(id)) {
                        return res.status(400).json({
                            success: false,
                            error: {
                                code: 'CIRCULAR_REFERENCE',
                                message: '不能将分类设置为自己的子分类'
                            }
                        });
                    }
                    const parentCategory = await prisma.category.findFirst({
                        where: { id: currentParentId, userId },
                        select: { parentId: true }
                    });
                    if (!parentCategory)
                        break;
                    currentParentId = parentCategory.parentId;
                }
            }
            // 构建更新数据
            const updateData = {};
            if (name !== undefined)
                updateData.name = name.trim();
            if (description !== undefined)
                updateData.description = description?.trim();
            if (color !== undefined)
                updateData.color = color;
            if (parentId !== undefined)
                updateData.parentId = parentId;
            if (sortOrder !== undefined)
                updateData.sortOrder = sortOrder;
            // 更新分类
            const updatedCategory = await prisma.category.update({
                where: { id: parseInt(id) },
                data: updateData,
                include: {
                    parent: {
                        select: { id: true, name: true, color: true }
                    },
                    children: {
                        select: { id: true, name: true, color: true, description: true }
                    }
                }
            });
            res.json({
                success: true,
                data: updatedCategory,
                message: '分类更新成功'
            });
        }
        catch (error) {
            console.error('Update category error:', error);
            next(error);
        }
    }
    // 删除分类
    async deleteCategory(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_ID',
                        message: '无效的分类ID'
                    }
                });
            }
            // 检查分类是否存在且属于当前用户
            const category = await prisma.category.findFirst({
                where: {
                    id: parseInt(id),
                    userId
                },
                include: {
                    children: true,
                    prompts: {
                        where: { deletedAt: null }
                    }
                }
            });
            if (!category) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'CATEGORY_NOT_FOUND',
                        message: '分类不存在'
                    }
                });
            }
            // 检查是否有子分类
            if (category.children.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'HAS_CHILDREN',
                        message: '该分类包含子分类，请先删除子分类'
                    }
                });
            }
            // 检查是否有关联的提示词
            if (category.prompts.length > 0) {
                // 将关联的提示词移动到未分类
                await prisma.prompt.updateMany({
                    where: {
                        categoryId: parseInt(id),
                        deletedAt: null
                    },
                    data: {
                        categoryId: null
                    }
                });
            }
            // 删除分类
            await prisma.category.delete({
                where: { id: parseInt(id) }
            });
            res.json({
                success: true,
                message: '分类删除成功'
            });
        }
        catch (error) {
            console.error('Delete category error:', error);
            next(error);
        }
    }
    // 批量重排序
    async reorderCategories(req, res, next) {
        try {
            const userId = req.user.id;
            const { categories } = req.body;
            if (!categories || !Array.isArray(categories)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_DATA',
                        message: '无效的分类数据'
                    }
                });
            }
            // 批量更新排序
            const updatePromises = categories.map(({ id, sortOrder }) => prisma.category.updateMany({
                where: {
                    id,
                    userId
                },
                data: {
                    sortOrder
                }
            }));
            await Promise.all(updatePromises);
            res.json({
                success: true,
                message: '分类排序更新成功'
            });
        }
        catch (error) {
            console.error('Reorder categories error:', error);
            next(error);
        }
    }
}
exports.CategoryController = CategoryController;
//# sourceMappingURL=category.controller.js.map