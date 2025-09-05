import React, { useState } from 'react';
import { Copy, Edit, Trash2, Tag, MoreHorizontal, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Button } from './Button';
import { Card, CardContent, CardFooter, CardHeader } from './Card';
import { cn } from '@/lib/utils';

interface PromptCardProps {
  prompt: {
    id: number;
    title: string;
    content: string;
    description?: string;
    category?: {
      id: number;
      name: string;
      color: string;
    };
    tags: Array<{
      id: number;
      tag: {
        id: number;
        name: string;
        color: string;
      };
    }>;
    isFavorite: boolean;
    usageCount: number;
    lastUsedAt?: string;
    createdAt: string;
    updatedAt: string;
  };
  onCopy?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
  className?: string;
}

export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  onCopy,
  onEdit,
  onDelete,
  onToggleFavorite,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      onCopy?.();
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getTimeText = () => {
    if (prompt.lastUsedAt) {
      return `最后使用 ${formatDistanceToNow(new Date(prompt.lastUsedAt), { 
        addSuffix: true, 
        locale: zhCN 
      })}`;
    }
    return `创建于 ${formatDistanceToNow(new Date(prompt.createdAt), { 
      addSuffix: true, 
      locale: zhCN 
    })}`;
  };

  return (
    <Card 
      className={cn(
        "relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
        "transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1", 
        "hover:border-blue-300 dark:hover:border-blue-600 group cursor-pointer",
        "overflow-hidden",
        className
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 truncate">
              {prompt.title}
            </h3>
            {prompt.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {prompt.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-3">
            {/* 收藏按钮 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFavorite}
              className={cn(
                "h-8 w-8 transition-colors",
                prompt.isFavorite 
                  ? "text-yellow-500 hover:text-yellow-600" 
                  : "text-gray-400 hover:text-yellow-500"
              )}
            >
              <Star className={cn(
                "h-4 w-4",
                prompt.isFavorite && "fill-current"
              )} />
            </Button>
            
            {/* 更多操作按钮 */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 transition-opacity",
                showActions ? "opacity-100" : "opacity-0"
              )}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 分类标签 */}
        {prompt.category && (
          <div className="mt-2">
            <span
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${prompt.category.color}20`,
                color: prompt.category.color
              }}
            >
              {prompt.category.name}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="py-3">
        {/* 内容预览 */}
        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {isExpanded ? (
            <div className="whitespace-pre-wrap">{prompt.content}</div>
          ) : (
            <div>
              {truncateText(prompt.content, 150)}
              {prompt.content.length > 150 && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-primary-600 hover:text-primary-700 font-medium ml-1"
                >
                  展开
                </button>
              )}
            </div>
          )}
          {isExpanded && prompt.content.length > 150 && (
            <button
              onClick={() => setIsExpanded(false)}
              className="text-primary-600 hover:text-primary-700 font-medium mt-2"
            >
              收起
            </button>
          )}
        </div>

        {/* 标签 */}
        {prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {prompt.tags.map((tagRelation) => (
              <span
                key={tagRelation.id}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                style={{
                  backgroundColor: `${tagRelation.tag.color}15`,
                  color: tagRelation.tag.color
                }}
              >
                <Tag className="w-3 h-3 mr-1" />
                {tagRelation.tag.name}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 pb-4">
        {/* 统计信息 */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 w-full">
          <div className="flex items-center gap-4">
            <span>使用 {prompt.usageCount} 次</span>
            <span>{getTimeText()}</span>
          </div>
          
          {/* 操作按钮 */}
          <div className={cn(
            "flex items-center gap-1 transition-opacity",
            showActions ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="复制内容"
            >
              <Copy className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="编辑"
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-8 w-8 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
              title="删除"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
