import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success:
          'border-transparent bg-green-500 text-white hover:bg-green-600',
        warning:
          'border-transparent bg-yellow-500 text-white hover:bg-yellow-600',
        info:
          'border-transparent bg-blue-500 text-white hover:bg-blue-600',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  color?: string;
  closable?: boolean;
  onClose?: () => void;
  dot?: boolean;
  count?: number;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ 
    className, 
    variant, 
    size,
    color,
    closable = false,
    onClose,
    dot = false,
    count,
    children,
    style,
    ...props 
  }, ref) => {
    const customStyle = color ? {
      backgroundColor: color,
      color: '#fff',
      borderColor: color,
      ...style
    } : style;

    // 数字徽章
    if (count !== undefined) {
      const displayCount = count > 99 ? '99+' : count;
      
      return (
        <span className="relative inline-block">
          {children}
          {count > 0 && (
            <span
              className={cn(
                'absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white',
                dot && 'h-2 w-2 min-w-0'
              )}
            >
              {!dot && displayCount}
            </span>
          )}
        </span>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant: color ? 'outline' : variant, size }), className)}
        style={customStyle}
        {...props}
      >
        {dot && (
          <span 
            className="mr-1 h-1.5 w-1.5 rounded-full bg-current"
            style={color ? { backgroundColor: color } : {}}
          />
        )}
        {children}
        {closable && onClose && (
          <button
            onClick={onClose}
            className="ml-1 rounded-full p-0.5 hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">删除</span>
          </button>
        )}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };