'use client';

import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  onChange?: (value: string | number) => void;
  className?: string;
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ 
    options, 
    value, 
    defaultValue, 
    placeholder = "请选择...",
    disabled = false,
    error,
    label,
    onChange,
    className,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value ?? defaultValue ?? '');

    const selectedOption = options.find(option => option.value === selectedValue);

    const handleSelect = (optionValue: string | number) => {
      setSelectedValue(optionValue);
      setIsOpen(false);
      onChange?.(optionValue);
    };

    const toggleOpen = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
      }
    };

    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }
    }, [value]);

    return (
      <div className={cn("space-y-2", className)} ref={ref} {...props}>
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
        
        <div className="relative">
          <button
            type="button"
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive focus:ring-destructive",
              disabled && "bg-muted cursor-not-allowed opacity-50"
            )}
            onClick={toggleOpen}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <span className={cn(!selectedOption && "text-muted-foreground")}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown 
              className={cn(
                "h-4 w-4 opacity-50 transition-transform duration-200",
                isOpen && "rotate-180"
              )} 
            />
          </button>

          {isOpen && (
            <>
              {/* 遮罩层 */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsOpen(false)}
              />
              
              {/* 下拉选项 */}
              <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
                <div className="p-1">
                  {options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={cn(
                        "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        option.disabled && "pointer-events-none opacity-50",
                        selectedValue === option.value && "bg-accent text-accent-foreground"
                      )}
                      onClick={() => !option.disabled && handleSelect(option.value)}
                      disabled={option.disabled}
                    >
                      <Check 
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedValue === option.value ? "opacity-100" : "opacity-0"
                        )} 
                      />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };