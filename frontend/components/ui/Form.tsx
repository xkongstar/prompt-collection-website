import React from 'react';
import { cn } from '@/lib/utils';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg';
}

export interface FormFieldProps {
  children: React.ReactNode;
  className?: string;
  error?: boolean;
}

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  error?: boolean;
}

export interface FormErrorProps {
  children: React.ReactNode;
  className?: string;
}

export interface FormHelpProps {
  children: React.ReactNode;
  className?: string;
}

export interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
  horizontal?: boolean;
}

const spacingClasses = {
  sm: 'space-y-3',
  md: 'space-y-4',
  lg: 'space-y-6'
};

// 表单容器
const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ children, spacing = 'md', className, ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={cn(spacingClasses[spacing], className)}
        {...props}
      >
        {children}
      </form>
    );
  }
);

Form.displayName = 'Form';

// 表单字段容器
const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ children, className, error, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'space-y-2',
          error && 'space-y-1',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

// 表单标签
const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ children, required, error, className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          error && 'text-destructive',
          className
        )}
        {...props}
      >
        {children}
        {required && (
          <span className="text-destructive ml-1" aria-label="必填">
            *
          </span>
        )}
      </label>
    );
  }
);

FormLabel.displayName = 'FormLabel';

// 表单错误信息
const FormError = React.forwardRef<HTMLParagraphElement, FormErrorProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-destructive', className)}
        role="alert"
        {...props}
      >
        {children}
      </p>
    );
  }
);

FormError.displayName = 'FormError';

// 表单帮助信息
const FormHelp = React.forwardRef<HTMLParagraphElement, FormHelpProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-muted-foreground', className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);

FormHelp.displayName = 'FormHelp';

// 表单分组
const FormGroup = React.forwardRef<HTMLDivElement, FormGroupProps>(
  ({ children, horizontal, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          horizontal 
            ? 'flex items-start gap-4' 
            : 'space-y-4',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FormGroup.displayName = 'FormGroup';

// 表单分隔线
const FormDivider = React.forwardRef<HTMLHRElement, React.HTMLAttributes<HTMLHRElement>>(
  ({ className, ...props }, ref) => {
    return (
      <hr
        ref={ref}
        className={cn('border-border', className)}
        {...props}
      />
    );
  }
);

FormDivider.displayName = 'FormDivider';

// 表单部分标题
const FormSection = React.forwardRef<HTMLDivElement, {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}>(
  ({ title, description, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('space-y-4', className)}
        {...props}
      >
        <div className="space-y-1">
          <h3 className="text-lg font-medium leading-none">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        <div className="space-y-4">
          {children}
        </div>
      </div>
    );
  }
);

FormSection.displayName = 'FormSection';

export { 
  Form, 
  FormField, 
  FormLabel, 
  FormError, 
  FormHelp, 
  FormGroup, 
  FormDivider,
  FormSection 
};