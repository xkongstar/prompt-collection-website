'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Folder, 
  ArrowLeft,
  Save,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { api } from '@/lib/api';
import { Category } from '@/types';

interface CategoryFormData {
  name: string;
  description: string;
  color: string;
  parentId?: number;
}

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

const CategoriesPage: React.FC = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    color: COLORS[0],
    parentId: undefined
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 获取分类列表
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get<Category[]>('/categories');
      
      if (response.data.success && response.data.data) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('获取分类失败:', err);
      setError('获取分类失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: COLORS[0],
      parentId: undefined
    });
    setEditingCategory(null);
    setShowCreateForm(false);
    setError(null);
  };

  // 开始编辑
  const startEdit = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color,
      parentId: category.parentId
    });
    setEditingCategory(category);
    setShowCreateForm(true);
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('分类名称不能为空');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (editingCategory) {
        // 更新分类
        const response = await api.put<Category>(`/categories/${editingCategory.id}`, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          color: formData.color,
          parentId: formData.parentId || undefined
        });
        
        if (response.data.success && response.data.data) {
          setCategories(prev => 
            prev.map(cat => 
              cat.id === editingCategory.id ? response.data.data! : cat
            )
          );
        }
      } else {
        // 创建分类
        const response = await api.post<Category>('/categories', {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          color: formData.color,
          parentId: formData.parentId || undefined,
          sortOrder: categories.length
        });
        
        if (response.data.success && response.data.data) {
          setCategories(prev => [...prev, response.data.data!]);
        }
      }
      
      resetForm();
      
    } catch (err) {
      console.error('保存分类失败:', err);
      setError(editingCategory ? '更新分类失败' : '创建分类失败');
    } finally {
      setSubmitting(false);
    }
  };

  // 删除分类
  const handleDelete = async (category: Category) => {
    if (!window.confirm(`确定要删除分类"${category.name}"吗？`)) {
      return;
    }

    try {
      await api.delete(`/categories/${category.id}`);
      setCategories(prev => prev.filter(cat => cat.id !== category.id));
    } catch (err) {
      console.error('删除分类失败:', err);
      setError('删除分类失败');
    }
  };

  // 渲染分类树
  const renderCategoryTree = (parentId?: number) => {
    const childCategories = categories.filter(cat => cat.parentId === parentId);
    
    return childCategories.map(category => (
      <div key={category.id} className="mb-2">
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: category.color }}
            />
            <Folder className="w-5 h-5 text-gray-500" />
            <div>
              <h3 className="font-medium text-gray-900">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-gray-600">{category.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => startEdit(category)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(category)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* 渲染子分类 */}
        <div className="ml-8 mt-2">
          {renderCategoryTree(category.id)}
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 页面头部 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
                          <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/prompts')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                返回提示词
              </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                分类管理
              </h1>
              <p className="text-gray-600 mt-1">
                管理提示词分类，让内容更有序
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            新建分类
          </Button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 分类列表 */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="w-5 h-5" />
                  分类列表
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">加载中...</p>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-8">
                    <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">暂无分类</h3>
                    <p className="text-gray-600 mb-4">创建您的第一个分类来组织提示词</p>
                    <Button
                      onClick={() => setShowCreateForm(true)}
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      创建分类
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {renderCategoryTree()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 创建/编辑表单 */}
          {showCreateForm && (
            <div className="lg:col-span-1">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{editingCategory ? '编辑分类' : '创建分类'}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetForm}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        分类名称 <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="输入分类名称"
                        className="w-full"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        描述
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="简要描述这个分类"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        父分类
                      </label>
                      <select
                        value={formData.parentId || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          parentId: e.target.value ? parseInt(e.target.value) : undefined 
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">无（顶级分类）</option>
                        {categories
                          .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                          .map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        颜色标识
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {COLORS.map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, color }))}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              formData.color === color 
                                ? 'border-gray-400 ring-2 ring-blue-500' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                        className="flex-1"
                      >
                        取消
                      </Button>
                      <Button
                        type="submit"
                        disabled={submitting || !formData.name.trim()}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {submitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            保存中...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            {editingCategory ? '更新' : '创建'}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
