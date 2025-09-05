'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, X, Save, Loader } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { usePromptStore } from '@/lib/stores/promptStore';
import { api } from '@/lib/api';
import { Prompt, UpdatePromptDto } from '@/types';

interface Variable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'text';
  defaultValue?: string | number | boolean;
  description?: string;
  required: boolean;
}

const EditPromptPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const promptId = parseInt(params?.id as string);
  const { updatePrompt } = usePromptStore();
  
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    description: string;
    variables: Variable[];
    tags: string[];
  }>({
    title: '',
    content: '',
    description: '',
    variables: [],
    tags: []
  });
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [newVariable, setNewVariable] = useState<Variable>({
    name: '',
    type: 'string',
    defaultValue: '',
    description: '',
    required: false
  });

  // 获取提示词详情
  useEffect(() => {
    const fetchPrompt = async () => {
      if (!promptId || isNaN(promptId)) {
        setError('无效的提示词ID');
        setFetchLoading(false);
        return;
      }

      try {
        setFetchLoading(true);
        const response = await api.get<Prompt>(`/prompts/${promptId}`);
        
        if (response.data.success && response.data.data) {
          const promptData = response.data.data;
          setPrompt(promptData);
          setFormData({
            title: promptData.title,
            content: promptData.content,
            description: promptData.description || '',
            variables: promptData.variables.map(v => ({
              name: v.name,
              type: v.type,
              defaultValue: v.defaultValue,
              description: v.description,
              required: v.required || false
            })),
            tags: promptData.tags.map(tag => tag.tag.name)
          });
        } else {
          setError('提示词不存在');
        }
      } catch (err) {
        console.error('获取提示词失败:', err);
        setError('获取提示词失败');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchPrompt();
  }, [promptId]);

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('标题和内容不能为空');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const promptData: UpdatePromptDto = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        description: formData.description.trim() || undefined,
        variables: formData.variables.map(v => ({
          name: v.name,
          type: v.type,
          defaultValue: v.defaultValue,
          description: v.description,
          required: v.required
        })),
        metadata: {
          ...prompt?.metadata,
          updatedBy: 'user',
          version: '1.1'
        }
      };

      await updatePrompt(promptId, promptData);
      router.push('/prompts');
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败');
    } finally {
      setLoading(false);
    }
  };

  // 添加变量
  const addVariable = () => {
    if (!newVariable.name.trim()) {
      setError('变量名称不能为空');
      return;
    }

    if (formData.variables.some(v => v.name === newVariable.name)) {
      setError('变量名称已存在');
      return;
    }

    setFormData(prev => ({
      ...prev,
      variables: [...prev.variables, { ...newVariable }]
    }));

    setNewVariable({
      name: '',
      type: 'string',
      defaultValue: '',
      description: '',
      required: false
    });
    setError(null);
  };

  // 删除变量
  const removeVariable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
  };

  // 添加标签
  const addTag = () => {
    const tag = newTag.trim();
    if (!tag) return;
    
    if (formData.tags.includes(tag)) {
      setError('标签已存在');
      return;
    }

    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, tag]
    }));
    setNewTag('');
    setError(null);
  };

  // 删除标签
  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error && !prompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <X className="w-12 h-12 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 页面头部 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                编辑提示词
              </h1>
              <p className="text-gray-600 mt-1">
                修改提示词内容和配置
              </p>
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标题 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="为您的提示词起一个清晰的标题"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述
                </label>
                <Input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="简要描述这个提示词的用途"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="输入提示词内容，可以使用变量如 {{variable_name}}"
                  className="w-full min-h-[200px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  使用 <code className="bg-gray-100 px-1 rounded">{"{{变量名}}"}</code> 格式定义变量
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 变量定义 */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">变量定义</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 现有变量列表 */}
              {formData.variables.length > 0 && (
                <div className="space-y-3">
                  {formData.variables.map((variable, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 grid grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">{variable.name}</span>
                        </div>
                        <div className="text-gray-600">{variable.type}</div>
                        <div className="text-gray-600">
                          {variable.required ? '必填' : '可选'}
                        </div>
                        <div className="text-gray-600 truncate">
                          {variable.description || '无描述'}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeVariable(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* 添加新变量 */}
              <div className="border border-dashed border-gray-300 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-gray-700 mb-3">添加新变量</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      变量名
                    </label>
                    <Input
                      type="text"
                      value={newVariable.name}
                      onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="变量名称"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      类型
                    </label>
                    <select
                      value={newVariable.type}
                      onChange={(e) => setNewVariable(prev => ({ ...prev, type: e.target.value as Variable['type'] }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="string">文本</option>
                      <option value="text">长文本</option>
                      <option value="number">数字</option>
                      <option value="boolean">布尔值</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      默认值
                    </label>
                    <Input
                      type="text"
                      value={newVariable.defaultValue?.toString() || ''}
                      onChange={(e) => setNewVariable(prev => ({ ...prev, defaultValue: e.target.value }))}
                      placeholder="默认值（可选）"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      描述
                    </label>
                    <Input
                      type="text"
                      value={newVariable.description || ''}
                      onChange={(e) => setNewVariable(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="变量描述（可选）"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={newVariable.required}
                      onChange={(e) => setNewVariable(prev => ({ ...prev, required: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    必填变量
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addVariable}
                    disabled={!newVariable.name.trim()}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    添加变量
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 标签 */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">标签</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 现有标签 */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* 添加新标签 */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="输入标签名称"
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTag}
                  disabled={!newTag.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 提交按钮 */}
          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.content.trim()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  保存更改
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPromptPage;

