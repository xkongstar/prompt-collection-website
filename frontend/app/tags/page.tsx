'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tag as TagIcon, 
  ArrowLeft,
  Save,
  X,
  Search,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { api } from '@/lib/api';
import { Tag } from '@/types';

interface TagFormData {
  name: string;
  color: string;
}

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

const TagsPage: React.FC = () => {
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<TagFormData>({
    name: '',
    color: COLORS[0]
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 获取标签列表
  const fetchTags = async (search?: string) => {
    try {
      setLoading(true);
      const params = search ? { search } : {};
      const response = await api.get<Tag[]>('/tags', { params });
      
      if (response.data.success && response.data.data) {
        setTags(response.data.data);
      }
    } catch (err) {
      console.error('获取标签失败:', err);
      setError('获取标签失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  // 搜索处理
  const handleSearch = () => {
    fetchTags(searchQuery);
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      color: COLORS[0]
    });
    setEditingTag(null);
    setShowCreateForm(false);
    setError(null);
  };

  // 开始编辑
  const startEdit = (tag: Tag) => {
    setFormData({
      name: tag.name,
      color: tag.color
    });
    setEditingTag(tag);
    setShowCreateForm(true);
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('标签名称不能为空');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (editingTag) {
        // 更新标签
        const response = await api.put<Tag>(`/tags/${editingTag.id}`, {
          name: formData.name.trim(),
          color: formData.color
        });
        
        if (response.data.success && response.data.data) {
          setTags(prev => 
            prev.map(tag => 
              tag.id === editingTag.id ? response.data.data! : tag
            )
          );
        }
      } else {
        // 创建标签
        const response = await api.post<Tag>('/tags', {
          name: formData.name.trim(),
          color: formData.color
        });
        
        if (response.data.success && response.data.data) {
          setTags(prev => [...prev, response.data.data!]);
        }
      }
      
      resetForm();
      
    } catch (err) {
      console.error('保存标签失败:', err);
      setError(editingTag ? '更新标签失败' : '创建标签失败');
    } finally {
      setSubmitting(false);
    }
  };

  // 删除标签
  const handleDelete = async (tag: Tag) => {
    if (!window.confirm(`确定要删除标签"${tag.name}"吗？`)) {
      return;
    }

    try {
      await api.delete(`/tags/${tag.id}`);
      setTags(prev => prev.filter(t => t.id !== tag.id));
    } catch (err) {
      console.error('删除标签失败:', err);
      setError('删除标签失败');
    }
  };

  // 批量创建标签
  const handleBatchCreate = async () => {
    const tagNames = prompt('请输入标签名称，用逗号分隔:');
    if (!tagNames) return;

    const names = tagNames.split(',').map(name => name.trim()).filter(name => name);
    if (names.length === 0) return;

    try {
      const tagData = names.map((name, index) => ({
        name,
        color: COLORS[index % COLORS.length]
      }));

      const response = await api.post('/tags/batch', { tags: tagData });
      
      if (response.data.success) {
        fetchTags(); // 重新获取标签列表
      }
    } catch (err) {
      console.error('批量创建标签失败:', err);
      setError('批量创建标签失败');
    }
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
                标签管理
              </h1>
              <p className="text-gray-600 mt-1">
                管理提示词标签，快速分类和查找
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleBatchCreate}
              variant="outline"
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              批量创建
            </Button>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              新建标签
            </Button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 标签列表 */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TagIcon className="w-5 h-5" />
                    标签列表
                  </CardTitle>
                  
                  {/* 搜索框 */}
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="搜索标签..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="pl-10 w-48"
                      />
                    </div>
                    <Button
                      onClick={handleSearch}
                      variant="outline"
                      size="sm"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">加载中...</p>
                  </div>
                ) : tags.length === 0 ? (
                  <div className="text-center py-8">
                    <TagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchQuery ? '未找到匹配的标签' : '暂无标签'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {searchQuery ? '尝试修改搜索条件' : '创建您的第一个标签来组织提示词'}
                    </p>
                    {!searchQuery && (
                      <Button
                        onClick={() => setShowCreateForm(true)}
                        variant="outline"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        创建标签
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {tags.map(tag => (
                      <div
                        key={tag.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: tag.color }}
                          />
                          <div>
                            <h3 className="font-medium text-gray-900">{tag.name}</h3>
                            <p className="text-sm text-gray-600">
                              {(tag as Tag & { promptCount?: number }).promptCount || 0} 个提示词
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(tag)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(tag)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
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
                    <span>{editingTag ? '编辑标签' : '创建标签'}</span>
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
                        标签名称 <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="输入标签名称"
                        className="w-full"
                        required
                      />
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
                            {editingTag ? '更新' : '创建'}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* 标签统计 */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    标签统计
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">总标签数</span>
                      <span className="font-medium">{tags.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">使用中标签</span>
                      <span className="font-medium">
                        {tags.filter(tag => (tag as Tag & { promptCount?: number }).promptCount && (tag as Tag & { promptCount?: number }).promptCount! > 0).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">未使用标签</span>
                      <span className="font-medium">
                        {tags.filter(tag => !(tag as Tag & { promptCount?: number }).promptCount || (tag as Tag & { promptCount?: number }).promptCount === 0).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TagsPage;
