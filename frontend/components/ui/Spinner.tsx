import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]',
  {
    variants: {
      size: {
        xs: 'h-3 w-3 border',
        sm: 'h-4 w-4 border',
        default: 'h-6 w-6 border-2',
        lg: 'h-8 w-8 border-2',
        xl: 'h-12 w-12 border-2',
      },
      variant: {
        default: 'text-primary',
        secondary: 'text-secondary-foreground',
        white: 'text-white',
        muted: 'text-muted-foreground',
      }
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
  center?: boolean;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ 
    className, 
    size, 
    variant,
    label,
    center = false,
    ...props 
  }, ref) => {
    const spinnerElement = (
      <div
        ref={ref}
        className={cn(spinnerVariants({ size, variant }), className)}
        role="status"
        aria-label={label || '加载中'}
        {...props}
      >
        <span className="sr-only">{label || '加载中...'}</span>
      </div>
    );

    if (center) {
      return (
        <div className="flex items-center justify-center">
          {spinnerElement}
        </div>
      );
    }

    return spinnerElement;
  }
);

Spinner.displayName = 'Spinner';

// 带文本的加载组件
export interface LoadingProps {
  text?: string;
  size?: VariantProps<typeof spinnerVariants>['size'];
  variant?: VariantProps<typeof spinnerVariants>['variant'];
  className?: string;
  center?: boolean;
  overlay?: boolean;
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ 
    text = '加载中...',
    size = 'default',
    variant = 'default',
    className,
    center = true,
    overlay = false,
    ...props 
  }, ref) => {
    const content = (
      <div 
        ref={ref}
        className={cn(
          'flex flex-col items-center gap-3',
          center && 'justify-center min-h-[120px]',
          overlay && 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50',
          className
        )}
        {...props}
      >
        <Spinner size={size} variant={variant} />
        {text && (
          <p className="text-sm text-muted-foreground font-medium">
            {text}
          </p>
        )}
      </div>
    );

    return content;
  }
);

Loading.displayName = 'Loading';

// 页面级加载组件
const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loading text="页面加载中..." size="lg" />
  </div>
);

export { Spinner, Loading, PageLoading, spinnerVariants };