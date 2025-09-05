'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  Calendar,
  Star,
  Hash,
  Folder,
  SlidersHorizontal,
  Clock,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { useUIStore } from '@/lib/stores';
import { cn } from '@/lib/utils';

interface SearchFilters {
  search?: string;
  categoryId?: number;
  tags?: string[];
  isFavorite?: boolean;
  dateRange?: 'today' | 'week' | 'month' | 'year';
  sortBy?: 'createdAt' | 'updatedAt' | 'usageCount' | 'name';
  sortOrder?: 'asc' | 'desc';
}

interface SearchAndFilterProps {
  onSearch: (filters: SearchFilters) => void;
  onClearFilters: () => void;
  currentFilters: SearchFilters;
  categories?: Array<{ id: number; name: string; color: string }>;
  tags?: Array<{ id: number; name: string; color: string }>;
  loading?: boolean;
  placeholder?: string;
  showAdvancedFilters?: boolean;
  className?: string;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  onSearch,
  onClearFilters,
  currentFilters,
  categories = [],
  tags = [],
  loading = false,
  placeholder = '搜索...',
  showAdvancedFilters = true,
  className
}) => {
  const { addSearchHistory, getRecentSearchHistory } = useUIStore();
  
  const [searchQuery, setSearchQuery] = useState(currentFilters.search || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  
  const [filters, setFilters] = useState<SearchFilters>(currentFilters);

  const searchHistory = getRecentSearchHistory(10);
  
  // 同步外部filters到内部状态
  useEffect(() => {
    setFilters(currentFilters);
    setSearchQuery(currentFilters.search || '');
  }, [currentFilters]);

  // 处理搜索
  const handleSearch = () => {
    const newFilters = { ...filters, search: searchQuery.trim() || undefined };
    
    // 添加到搜索历史
    if (searchQuery.trim()) {
      addSearchHistory({
        query: searchQuery.trim(),
        type: 'prompt'
      });
    }
    
    setFilters(newFilters);
    onSearch(newFilters);
    setShowSearchHistory(false);
  };

  // 处理快速筛选
  const handleQuickFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  // 处理高级筛选
  const handleAdvancedFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // 应用高级筛选
  const applyAdvancedFilters = () => {
    onSearch(filters);
    setShowAdvanced(false);
  };

  // 清除所有筛选
  const handleClearAll = () => {
    setSearchQuery('');
    setFilters({});
    onClearFilters();
    setShowAdvanced(false);
  };

  // 从搜索历史选择
  const handleSelectFromHistory = (query: string) => {
    setSearchQuery(query);
    setShowSearchHistory(false);
    const newFilters = { ...filters, search: query };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  // 计算活跃的筛选器数量
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.categoryId) count++;
    if (filters.tags && filters.tags.length > 0) count++;
    if (filters.isFavorite) count++;
    if (filters.dateRange) count++;
    return count;
  }, [filters]);

  const sortOptions = [
    { value: 'createdAt', label: '创建时间' },
    { value: 'updatedAt', label: '更新时间' },
    { value: 'usageCount', label: '使用次数' },
    { value: 'name', label: '名称' },
  ];

  const dateRangeOptions = [
    { value: 'today', label: '今天' },
    { value: 'week', label: '本周' },
    { value: 'month', label: '本月' },
    { value: 'year', label: '今年' },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* 主搜索栏 */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            onFocus={() => setShowSearchHistory(searchHistory.length > 0)}
            onBlur={() => setTimeout(() => setShowSearchHistory(false), 200)}
            className="pl-10"
            disabled={loading}
          />
          
          {/* 搜索历史下拉 */}
          {showSearchHistory && searchHistory.length > 0 && (
            <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">最近搜索</CardTitle>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  {searchHistory.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectFromHistory(item.query)}
                      className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.query}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <Button onClick={handleSearch} disabled={loading}>
          <Search className="w-4 h-4" />
        </Button>
        
        {showAdvancedFilters && (
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={cn(activeFiltersCount > 0 && "border-primary")}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            筛选
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 px-1 py-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        )}
      </div>

      {/* 快速筛选按钮 */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filters.isFavorite ? "default" : "outline"}
          size="sm"
          onClick={() => handleQuickFilter('isFavorite', !filters.isFavorite)}
        >
          <Star className={cn("w-4 h-4 mr-2", filters.isFavorite && "fill-current")} />
          收藏
        </Button>
        
        <Button
          variant={filters.sortBy === 'usageCount' ? "default" : "outline"}
          size="sm"
          onClick={() => handleQuickFilter('sortBy', 'usageCount')}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          热门
        </Button>
        
        <Button
          variant={filters.dateRange === 'week' ? "default" : "outline"}
          size="sm"
          onClick={() => handleQuickFilter('dateRange', filters.dateRange === 'week' ? undefined : 'week')}
        >
          <Calendar className="w-4 h-4 mr-2" />
          本周
        </Button>

        {/* 清除所有筛选 */}
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClearAll}>
            <X className="w-4 h-4 mr-2" />
            清除
          </Button>
        )}
      </div>

      {/* 当前筛选器显示 */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="px-2 py-1">
              搜索: "{filters.search}"
              <X 
                className="w-3 h-3 ml-1 cursor-pointer hover:text-destructive" 
                onClick={() => {
                  setSearchQuery('');
                  handleQuickFilter('search', undefined);
                }}
              />
            </Badge>
          )}
          
          {filters.categoryId && (
            <Badge variant="secondary" className="px-2 py-1">
              <Folder className="w-3 h-3 mr-1" />
              分类: {categories.find(c => c.id === filters.categoryId)?.name}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer hover:text-destructive" 
                onClick={() => handleQuickFilter('categoryId', undefined)}
              />
            </Badge>
          )}
          
          {filters.tags && filters.tags.length > 0 && (
            <Badge variant="secondary" className="px-2 py-1">
              <Hash className="w-3 h-3 mr-1" />
              标签: {filters.tags.length}个
              <X 
                className="w-3 h-3 ml-1 cursor-pointer hover:text-destructive" 
                onClick={() => handleQuickFilter('tags', undefined)}
              />
            </Badge>
          )}
          
          {filters.isFavorite && (
            <Badge variant="secondary" className="px-2 py-1">
              <Star className="w-3 h-3 mr-1 fill-current" />
              已收藏
              <X 
                className="w-3 h-3 ml-1 cursor-pointer hover:text-destructive" 
                onClick={() => handleQuickFilter('isFavorite', false)}
              />
            </Badge>
          )}
          
          {filters.dateRange && (
            <Badge variant="secondary" className="px-2 py-1">
              <Calendar className="w-3 h-3 mr-1" />
              时间: {dateRangeOptions.find(d => d.value === filters.dateRange)?.label}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer hover:text-destructive" 
                onClick={() => handleQuickFilter('dateRange', undefined)}
              />
            </Badge>
          )}
        </div>
      )}

      {/* 高级筛选面板 */}
      {showAdvanced && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-lg">高级筛选</span>
              <Button variant="ghost" size="sm" onClick={() => setShowAdvanced(false)}>
                <ChevronUp className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 分类筛选 */}
              <div>
                <label className="block text-sm font-medium mb-2">分类</label>
                <Select
                  value={filters.categoryId?.toString()}
                  onValueChange={(value) => handleAdvancedFilter('categoryId', value ? parseInt(value) : undefined)}
                  options={[
                    { value: '', label: '所有分类' },
                    ...categories.map(cat => ({
                      value: cat.id.toString(),
                      label: cat.name
                    }))
                  ]}
                  placeholder="选择分类"
                />
              </div>

              {/* 时间范围 */}
              <div>
                <label className="block text-sm font-medium mb-2">时间范围</label>
                <Select
                  value={filters.dateRange || ''}
                  onValueChange={(value) => handleAdvancedFilter('dateRange', value || undefined)}
                  options={[
                    { value: '', label: '全部时间' },
                    ...dateRangeOptions
                  ]}
                  placeholder="选择时间范围"
                />
              </div>

              {/* 排序方式 */}
              <div>
                <label className="block text-sm font-medium mb-2">排序方式</label>
                <div className="flex gap-2">
                  <Select
                    value={filters.sortBy || 'createdAt'}
                    onValueChange={(value) => handleAdvancedFilter('sortBy', value)}
                    options={sortOptions}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAdvancedFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {filters.sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                  </Button>
                </div>
              </div>
            </div>

            {/* 标签筛选 */}
            {tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">标签</label>
                <MultiSelect
                  options={tags.map(tag => ({
                    value: tag.name,
                    label: tag.name,
                    color: tag.color
                  }))}
                  value={filters.tags || []}
                  onChange={(selectedTags) => handleAdvancedFilter('tags', selectedTags)}
                  placeholder="选择标签"
                  maxItems={5}
                />
              </div>
            )}

            {/* 应用按钮 */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowAdvanced(false)}>
                取消
              </Button>
              <Button onClick={applyAdvancedFilters}>
                应用筛选
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchAndFilter;