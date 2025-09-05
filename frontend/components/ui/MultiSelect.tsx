'use client';

import React, { useState } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  color?: string;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value?: (string | number)[];
  defaultValue?: (string | number)[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  maxSelected?: number;
  onChange?: (values: (string | number)[]) => void;
  className?: string;
}

const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  ({ 
    options, 
    value, 
    defaultValue = [], 
    placeholder = "请选择...",
    disabled = false,
    error,
    label,
    maxSelected,
    onChange,
    className,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValues, setSelectedValues] = useState<(string | number)[]>(
      value ?? defaultValue
    );

    const selectedOptions = selectedValues.map(val => 
      options.find(option => option.value === val)
    ).filter(Boolean) as MultiSelectOption[];

    const handleToggleOption = (optionValue: string | number) => {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : maxSelected && selectedValues.length >= maxSelected
          ? selectedValues
          : [...selectedValues, optionValue];
      
      setSelectedValues(newValues);
      onChange?.(newValues);
    };

    const handleRemoveOption = (optionValue: string | number, event?: React.MouseEvent) => {
      event?.stopPropagation();
      const newValues = selectedValues.filter(v => v !== optionValue);
      setSelectedValues(newValues);
      onChange?.(newValues);
    };

    const toggleOpen = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
      }
    };

    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValues(value);
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
              "flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive focus:ring-destructive",
              disabled && "bg-muted cursor-not-allowed opacity-50"
            )}
            onClick={toggleOpen}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <div className="flex flex-wrap gap-1 flex-1">
              {selectedOptions.length > 0 ? (
                selectedOptions.map((option) => (
                  <span
                    key={option.value}
                    className={cn(
                      "inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium",
                      "bg-secondary text-secondary-foreground"
                    )}
                    style={option.color ? { backgroundColor: option.color + '20', color: option.color } : {}}
                  >
                    {option.label}
                    {!disabled && (
                      <button
                        type="button"
                        className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                        onClick={(e) => handleRemoveOption(option.value, e)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronDown 
              className={cn(
                "h-4 w-4 opacity-50 transition-transform duration-200 shrink-0",
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
                  {maxSelected && (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground border-b">
                      已选择 {selectedValues.length} / {maxSelected}
                    </div>
                  )}
                  {options.map((option) => {
                    const isSelected = selectedValues.includes(option.value);
                    const isMaxReached = maxSelected && selectedValues.length >= maxSelected && !isSelected;
                    
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={cn(
                          "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                          "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                          (option.disabled || isMaxReached) && "pointer-events-none opacity-50",
                          isSelected && "bg-accent text-accent-foreground"
                        )}
                        onClick={() => !option.disabled && !isMaxReached && handleToggleOption(option.value)}
                        disabled={option.disabled || isMaxReached}
                      >
                        <Check 
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )} 
                        />
                        <span className="flex-1 text-left">{option.label}</span>
                        {option.color && (
                          <div 
                            className="ml-2 h-3 w-3 rounded-full border"
                            style={{ backgroundColor: option.color }}
                          />
                        )}
                      </button>
                    );
                  })}
                  
                  {selectedValues.length > 0 && (
                    <div className="border-t mt-1">
                      <button
                        type="button"
                        className="flex w-full items-center px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        onClick={() => {
                          setSelectedValues([]);
                          onChange?.([]);
                        }}
                      >
                        <X className="mr-2 h-4 w-4" />
                        清除所有选择
                      </button>
                    </div>
                  )}
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

MultiSelect.displayName = 'MultiSelect';

export { MultiSelect };