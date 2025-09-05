'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Grid, List, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PromptCard } from '@/components/ui/PromptCard';
import { usePromptStore } from '@/lib/stores/promptStore';
import { cn } from '@/lib/utils';
import { Prompt } from '@/types';

const PromptsPage: React.FC = () => {
  const router = useRouter();
  const {
    prompts,
    loading,
    error,
    filters,
    pagination,
    fetchPrompts,
    toggleFavorite,
    incrementUsage,
    deletePrompt,
    setFilters
  } = usePromptStore();

  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterFavorites, setFilterFavorites] = useState(filters.isFavorite || false);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  // 检查认证状态
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
  }, [router]);

  // 初始加载
  useEffect(() => {
    const loadPrompts = async () => {
      try {
        await fetchPrompts();
      } catch (error) {
        console.error('加载提示词失败:', error);
      }
    };
    loadPrompts();
  }, [fetchPrompts]);

  // 显示提示消息
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 搜索处理
  const handleSearch = async () => {
    try {
      await fetchPrompts({
        search: searchQuery,
        isFavorite: filterFavorites
      });
      setFilters({ search: searchQuery, isFavorite: filterFavorites });
    } catch (error) {
      console.error('搜索失败:', error);
    }
  };

  // 切换收藏筛选
  const handleToggleFavorites = async () => {
    const newFilter = !filterFavorites;
    setFilterFavorites(newFilter);
    try {
      await fetchPrompts({
        search: searchQuery,
        isFavorite: newFilter
      });
      setFilters({ search: searchQuery, isFavorite: newFilter });
    } catch (error) {
      console.error('筛选失败:', error);
    }
  };

  // 处理提示词操作
  const handleCopy = async (prompt: Prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      await incrementUsage(prompt.id);
      showToast('内容已复制到剪贴板');
    } catch {
      showToast('复制失败', 'error');
    }
  };

  const handleEdit = (prompt: Prompt) => {
    router.push(`/prompts/${prompt.id}/edit`);
  };

  const handleDelete = async (prompt: Prompt) => {
    if (!window.confirm(`确定要删除提示词"${prompt.title}"吗？`)) {
      return;
    }
    
    try {
      await deletePrompt(prompt.id);
      showToast('提示词已删除');
    } catch {
      showToast('删除失败', 'error');
    }
  };

  const handleToggleFavorite = async (prompt: Prompt) => {
    try {
      await toggleFavorite(prompt.id);
      showToast(prompt.isFavorite ? '取消收藏' : '已收藏');
    } catch {
      showToast('操作失败', 'error');
    }
  };



  // 渲染错误状态
  const renderErrorState = () => (
    <div className="text-center py-12">
      <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
        <Search className="w-12 h-12 text-red-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
      <p className="text-gray-600 mb-6">{error}</p>
      <Button onClick={() => fetchPrompts()} variant="outline">
        重试
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950">
      {/* 头部区域 */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                ✨ 提示词管理
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                管理您的AI提示词模板，提升工作效率
              </p>
            </div>
            
            <Button 
              onClick={() => router.push('/prompts/create')}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              新建提示词
            </Button>
          </div>
        </div>
      </div>

      {/* 工具栏 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
          {/* 搜索和筛选 */}
          <div className="flex flex-1 max-w-2xl gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="搜索提示词..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-11 pr-4 py-3 text-base border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <Button 
              onClick={handleSearch} 
              variant="outline"
              className="px-6 py-3 border-gray-200 dark:border-gray-700 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950 shadow-sm"
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>

          {/* 右侧工具 */}
          <div className="flex items-center gap-3">
            {/* 收藏筛选 */}
            <Button
              variant={filterFavorites ? "default" : "outline"}
              size="sm"
              onClick={handleToggleFavorites}
              className={cn(
                "px-4 py-2.5 shadow-sm transition-all duration-200",
                filterFavorites 
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white shadow-yellow-500/25" 
                  : "border-gray-200 dark:border-gray-700 hover:bg-yellow-50 hover:border-yellow-300 dark:hover:bg-yellow-950"
              )}
            >
              <Star className={`w-4 h-4 mr-2 ${filterFavorites ? 'fill-current' : ''}`} />
              收藏
            </Button>

            {/* 视图切换 */}
            <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
              <Button
                variant={viewMode === 'grid' ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode('grid')}
                className={cn(
                  "h-9 w-9 rounded-none",
                  viewMode === 'grid' 
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" 
                    : "hover:bg-blue-50 dark:hover:bg-blue-950"
                )}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode('list')}
                className={cn(
                  "h-9 w-9 rounded-none",
                  viewMode === 'list' 
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" 
                    : "hover:bg-blue-50 dark:hover:bg-blue-950"
                )}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* 筛选器 */}
            <Button 
              variant="outline" 
              size="sm"
              className="px-4 py-2.5 border-gray-200 dark:border-gray-700 hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-950 shadow-sm"
            >
              <Filter className="w-4 h-4 mr-2" />
              筛选器
            </Button>
          </div>
        </div>

        {/* 统计信息 */}
        {!loading && !error && (
          <div className="mt-6 flex items-center gap-3">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg px-4 py-2.5 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                共找到 
                <span className="text-blue-600 dark:text-blue-400 font-bold mx-1">
                  {pagination.total}
                </span>
                个提示词
              </span>
            </div>
            {filterFavorites && (
              <div className="bg-yellow-50 dark:bg-yellow-950/50 rounded-lg px-3 py-1.5 border border-yellow-200 dark:border-yellow-800">
                <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                  已收藏
                </span>
              </div>
            )}
            {(searchQuery || filterFavorites) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setFilterFavorites(false);
                  fetchPrompts();
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                清除筛选
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 主内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          // 加载状态
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-gray-700"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
            </div>
            <span className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
              正在加载提示词...
            </span>
          </div>
        ) : error ? (
          // 错误状态
          renderErrorState()
        ) : prompts.length === 0 ? (
          // 空状态
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center shadow-lg">
              <Search className="w-16 h-16 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              {searchQuery || filterFavorites ? '未找到匹配的提示词' : '还没有提示词'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
              {searchQuery || filterFavorites 
                ? '尝试调整搜索条件或清除筛选' 
                : '创建您的第一个提示词，开始管理AI对话模板'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Button 
                size="lg"
                onClick={() => router.push('/prompts/create')}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                创建提示词
              </Button>
              {(searchQuery || filterFavorites) && (
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterFavorites(false);
                    fetchPrompts();
                  }}
                  className="px-6 py-3 border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  清除筛选
                </Button>
              )}
            </div>
          </div>
        ) : (
          // 提示词列表
          <div className="space-y-6">
            <div className={
              viewMode === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in"
                : "space-y-4 animate-fade-in"
            }>
              {prompts.map((prompt, index) => (
                <div 
                  key={prompt.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <PromptCard
                    prompt={prompt}
                    onCopy={() => handleCopy(prompt)}
                    onEdit={() => handleEdit(prompt)}
                    onDelete={() => handleDelete(prompt)}
                    onToggleFavorite={() => handleToggleFavorite(prompt)}
                    className={viewMode === 'list' ? "w-full" : ""}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 分页器 */}
        {!loading && !error && prompts.length > 0 && pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-12 pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg px-4 py-2.5 shadow-sm border border-gray-200/50 dark:border-gray-700/50 mb-4 sm:mb-0">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                显示第 
                <span className="font-medium text-gray-900 dark:text-gray-100 mx-1">
                  {(pagination.page - 1) * pagination.pageSize + 1}
                </span>
                - 
                <span className="font-medium text-gray-900 dark:text-gray-100 mx-1">
                  {Math.min(pagination.page * pagination.pageSize, pagination.total)}
                </span>
                项，共 
                <span className="font-medium text-blue-600 dark:text-blue-400 mx-1">
                  {pagination.total}
                </span>
                项
              </span>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchPrompts({ 
                  search: searchQuery, 
                  isFavorite: filterFavorites,
                  page: pagination.page - 1 
                })}
                className="px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border-gray-200 dark:border-gray-700 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950"
              >
                上一页
              </Button>
              <div className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg shadow-sm font-medium">
                {pagination.page} / {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchPrompts({ 
                  search: searchQuery, 
                  isFavorite: filterFavorites,
                  page: pagination.page + 1 
                })}
                className="px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border-gray-200 dark:border-gray-700 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950"
              >
                下一页
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Toast通知 */}
      {toast && (
        <div className={cn(
          "fixed top-6 right-6 z-50 p-4 rounded-lg shadow-2xl backdrop-blur-sm border transition-all duration-300 transform animate-slide-in",
          toast.type === 'success' 
            ? 'bg-green-50/90 dark:bg-green-900/90 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700' 
            : 'bg-red-50/90 dark:bg-red-900/90 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700'
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center",
              toast.type === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            )}>
              {toast.type === 'success' ? '✓' : '✕'}
            </div>
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptsPage;
