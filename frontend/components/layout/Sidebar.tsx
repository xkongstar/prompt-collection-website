'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  FileText, 
  Folder, 
  Tag, 
  Home, 
  Settings,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  Star,
  Clock,
  Hash,
  BarChart3,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useUIStore } from '@/lib/stores';
import { cn } from '@/lib/utils';

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  count?: number;
  children?: SidebarItem[];
}

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarState, setSidebarState } = useUIStore();
  
  const [expandedSections, setExpandedSections] = React.useState<string[]>(['main']);

  // 如果在登录或注册页面，不显示侧边栏
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  // 如果侧边栏关闭，不显示
  if (sidebarState === 'closed') {
    return null;
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const isCollapsed = sidebarState === 'collapsed';

  const mainNavItems: SidebarItem[] = [
    {
      href: '/',
      label: '概览',
      icon: Home,
      isActive: pathname === '/'
    },
    {
      href: '/dashboard',
      label: '仪表板',
      icon: BarChart3,
      isActive: pathname === '/dashboard'
    },
    {
      href: '/prompts',
      label: '提示词',
      icon: FileText,
      isActive: pathname.startsWith('/prompts'),
      count: 0, // TODO: 从store获取实际数量
    },
    {
      href: '/categories',
      label: '分类管理',
      icon: Folder,
      isActive: pathname === '/categories'
    },
    {
      href: '/tags',
      label: '标签管理',
      icon: Tag,
      isActive: pathname === '/tags'
    }
  ];

  const quickAccessItems: SidebarItem[] = [
    {
      href: '/prompts?filter=favorites',
      label: '收藏夹',
      icon: Star,
      isActive: pathname.startsWith('/prompts') && pathname.includes('favorites')
    },
    {
      href: '/prompts?filter=recent',
      label: '最近使用',
      icon: Clock,
      isActive: pathname.startsWith('/prompts') && pathname.includes('recent')
    },
    {
      href: '/prompts?filter=popular',
      label: '热门提示词',
      icon: TrendingUp,
      isActive: pathname.startsWith('/prompts') && pathname.includes('popular')
    }
  ];

  const renderNavItem = (item: SidebarItem, depth = 0) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.includes(item.href);

    return (
      <div key={item.href}>
        <Button
          variant={item.isActive ? "secondary" : "ghost"}
          size="sm"
          onClick={() => {
            if (hasChildren) {
              toggleSection(item.href);
            } else {
              router.push(item.href);
            }
          }}
          className={cn(
            "w-full justify-start gap-3 px-3 py-2 h-auto",
            depth > 0 && "pl-8",
            item.isActive && "bg-primary/10 text-primary",
            isCollapsed && "justify-center px-2"
          )}
        >
          <Icon className={cn("flex-shrink-0", isCollapsed ? "w-5 h-5" : "w-4 h-4")} />
          
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left truncate">{item.label}</span>
              
              {item.count !== undefined && (
                <Badge variant="secondary" className="ml-auto">
                  {item.count}
                </Badge>
              )}
              
              {hasChildren && (
                <ChevronRight 
                  className={cn(
                    "w-4 h-4 transition-transform",
                    isExpanded && "rotate-90"
                  )} 
                />
              )}
            </>
          )}
        </Button>
        
        {/* 子项 */}
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="ml-4 space-y-1">
            {item.children?.map(child => renderNavItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderSection = (title: string, items: SidebarItem[], sectionKey: string) => {
    const isExpanded = expandedSections.includes(sectionKey);
    
    if (isCollapsed) {
      return (
        <div className="space-y-1">
          {items.map(item => renderNavItem(item))}
        </div>
      );
    }

    return (
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleSection(sectionKey)}
          className="w-full justify-start gap-2 px-3 py-2 h-auto text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronDown 
            className={cn(
              "w-3 h-3 transition-transform",
              !isExpanded && "-rotate-90"
            )} 
          />
          {title}
        </Button>
        
        {isExpanded && (
          <div className="space-y-1">
            {items.map(item => renderNavItem(item))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={cn(
      "bg-card border-r border-border transition-all duration-200 ease-in-out",
      isCollapsed ? "w-16" : "w-64",
      "flex flex-col h-full",
      className
    )}>
      {/* 侧边栏头部 */}
      <div className={cn(
        "p-4 border-b border-border",
        isCollapsed && "p-2"
      )}>
        {!isCollapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md flex items-center justify-center flex-shrink-0">
              <Hash className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold truncate">提示词管理</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md flex items-center justify-center">
              <Hash className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* 侧边栏内容 */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* 主导航 */}
        <div className="space-y-1">
          {mainNavItems.map(item => renderNavItem(item))}
        </div>

        {/* 快速访问 */}
        {renderSection("快速访问", quickAccessItems, "quick")}
      </div>

      {/* 侧边栏底部 */}
      <div className="p-2 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/settings')}
          className={cn(
            "w-full justify-start gap-3 px-3 py-2",
            pathname === '/settings' && "bg-primary/10 text-primary",
            isCollapsed && "justify-center px-2"
          )}
        >
          <Settings className={cn("flex-shrink-0", isCollapsed ? "w-5 h-5" : "w-4 h-4")} />
          {!isCollapsed && <span>设置</span>}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;