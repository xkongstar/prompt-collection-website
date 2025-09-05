'use client';

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUIStore, Theme } from '@/lib/stores';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'button' | 'dropdown';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className,
  showLabel = false,
  variant = 'button'
}) => {
  const { theme, setTheme } = useUIStore();
  
  const themes: { key: Theme; label: string; icon: React.ElementType }[] = [
    { key: 'light', label: '浅色', icon: Sun },
    { key: 'dark', label: '深色', icon: Moon },
    { key: 'system', label: '跟随系统', icon: Monitor }
  ];

  const currentTheme = themes.find(t => t.key === theme) || themes[0];
  const CurrentIcon = currentTheme.icon;

  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const currentIndex = themes.findIndex(t => t.key === theme);
          const nextIndex = (currentIndex + 1) % themes.length;
          setTheme(themes[nextIndex].key);
        }}
        className={cn("flex items-center gap-2", className)}
        title={`当前: ${currentTheme.label}`}
      >
        <CurrentIcon className="w-4 h-4" />
        {showLabel && <span>{currentTheme.label}</span>}
      </Button>
    );
  }

  // Dropdown variant - 返回按钮组
  return (
    <div className={cn("flex items-center gap-1 p-1 bg-muted rounded-lg", className)}>
      {themes.map((themeOption) => {
        const Icon = themeOption.icon;
        const isActive = theme === themeOption.key;
        
        return (
          <Button
            key={themeOption.key}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            onClick={() => setTheme(themeOption.key)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 h-8",
              isActive && "shadow-sm"
            )}
            title={themeOption.label}
          >
            <Icon className="w-3 h-3" />
            {showLabel && <span className="text-xs">{themeOption.label}</span>}
          </Button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;