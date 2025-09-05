'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';
import { config } from '@/lib/config';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  errorInfo?: React.ErrorInfo;
}

// 默认错误回退组件
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetError, 
  errorInfo 
}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const handleReportError = () => {
    // TODO: 集成错误报告服务
    console.error('Error reported:', error, errorInfo);
    alert('错误报告已发送，感谢您的反馈！');
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* 错误图标和标题 */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              哎呀！出现了错误
            </h1>
            <p className="text-muted-foreground">
              应用程序遇到了意外错误，我们正在努力解决这个问题。
            </p>
          </div>
        </div>

        {/* 错误信息 */}
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>错误详情</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p><strong>错误消息:</strong> {error.message}</p>
            {isDevelopment && (
              <details className="mt-4">
                <summary className="cursor-pointer font-medium">
                  开发者信息 (仅开发环境显示)
                </summary>
                <div className="mt-2 p-4 bg-muted rounded-lg text-sm font-mono">
                  <div className="mb-2">
                    <strong>错误堆栈:</strong>
                    <pre className="mt-1 whitespace-pre-wrap text-xs">
                      {error.stack}
                    </pre>
                  </div>
                  {errorInfo && (
                    <div>
                      <strong>组件堆栈:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-xs">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </AlertDescription>
        </Alert>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={resetError} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            重试
          </Button>
          
          <Button variant="outline" onClick={handleGoHome} className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            回到首页
          </Button>
          
          {config.features.errorReporting && (
            <Button variant="secondary" onClick={handleReportError} className="flex items-center gap-2">
              <Bug className="w-4 h-4" />
              报告错误
            </Button>
          )}
        </div>

        {/* 联系信息 */}
        <div className="text-center text-sm text-muted-foreground">
          <p>如果问题持续出现，请联系技术支持</p>
          <p className="mt-1">错误ID: {Date.now()}</p>
        </div>
      </div>
    </div>
  );
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // 调用错误回调
    this.props.onError?.(error, errorInfo);

    // 在生产环境中，可以在这里发送错误报告到监控服务
    if (config.features.errorReporting && process.env.NODE_ENV === 'production') {
      // TODO: 集成错误监控服务（如 Sentry）
      console.error('Error reported to monitoring service:', error);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const ErrorFallback = this.props.fallback || DefaultErrorFallback;
      
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={this.resetError}
          errorInfo={this.state.errorInfo || undefined}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
export { type ErrorFallbackProps };