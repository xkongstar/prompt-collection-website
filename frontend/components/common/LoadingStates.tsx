'use client';

import React from 'react';
import { Loader2, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { cn } from '@/lib/utils';

// 全屏加载组件
interface FullScreenLoadingProps {
  message?: string;
  showSpinner?: boolean;
}

export const FullScreenLoading: React.FC<FullScreenLoadingProps> = ({
  message = '正在加载...',
  showSpinner = true
}) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center space-y-4">
        {showSpinner && <Spinner size="lg" />}
        <p className="text-lg font-medium text-foreground">{message}</p>
      </div>
    </div>
  );
};

// 页面级加载组件
interface PageLoadingProps {
  message?: string;
  className?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  message = '页面加载中...',
  className
}) => {
  return (
    <div className={cn(
      "min-h-[400px] flex items-center justify-center",
      className
    )}>
      <div className="text-center space-y-4">
        <Spinner size="lg" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

// 内容加载占位符
interface LoadingSkeletonProps {
  lines?: number;
  showAvatar?: boolean;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  lines = 3,
  showAvatar = false,
  className
}) => {
  return (
    <div className={cn("animate-pulse space-y-3", className)}>
      {showAvatar && (
        <div className="flex items-center space-x-3">
          <div className="rounded-full bg-muted h-10 w-10"></div>
          <div className="h-4 bg-muted rounded w-24"></div>
        </div>
      )}
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-4 bg-muted rounded",
            index === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
};

// 列表加载占位符
interface ListLoadingProps {
  itemCount?: number;
  showAvatar?: boolean;
  className?: string;
}

export const ListLoading: React.FC<ListLoadingProps> = ({
  itemCount = 5,
  showAvatar = true,
  className
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <LoadingSkeleton lines={2} showAvatar={showAvatar} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// 按钮加载状态
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingText,
  children,
  disabled,
  className,
  ...props
}) => {
  return (
    <Button
      disabled={disabled || loading}
      className={cn("relative", className)}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      {loading && loadingText ? loadingText : children}
    </Button>
  );
};

// 重试组件
interface RetryComponentProps {
  onRetry: () => void;
  error?: string;
  retryText?: string;
  className?: string;
}

export const RetryComponent: React.FC<RetryComponentProps> = ({
  onRetry,
  error = '加载失败',
  retryText = '重试',
  className
}) => {
  return (
    <div className={cn("text-center space-y-4 py-8", className)}>
      <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">加载失败</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={onRetry} variant="outline">
          {retryText}
        </Button>
      </div>
    </div>
  );
};

// 空状态组件
interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ElementType;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = '暂无数据',
  description = '这里还没有任何内容',
  icon: Icon,
  action,
  className
}) => {
  return (
    <div className={cn("text-center space-y-4 py-12", className)}>
      {Icon && (
        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
      <div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
        {action && (
          <div className="mt-6">
            <Button onClick={action.onClick}>
              {action.label}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// 网络状态组件
interface NetworkStatusProps {
  isOnline: boolean;
  onRetry?: () => void;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({
  isOnline,
  onRetry
}) => {
  if (isOnline) return null;

  return (
    <Alert variant="warning" className="mb-4">
      <WifiOff className="h-4 w-4" />
      <div className="flex items-center justify-between flex-1">
        <div>
          <strong>网络连接中断</strong>
          <p className="text-sm mt-1">请检查您的网络连接</p>
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <Wifi className="w-4 h-4 mr-2" />
            重新连接
          </Button>
        )}
      </div>
    </Alert>
  );
};

// 进度指示器
interface ProgressIndicatorProps {
  value: number; // 0-100
  showLabel?: boolean;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  value,
  showLabel = true,
  className
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-sm text-muted-foreground text-center">
          {Math.round(value)}% 完成
        </p>
      )}
    </div>
  );
};