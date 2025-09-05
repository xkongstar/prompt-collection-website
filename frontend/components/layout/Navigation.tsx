'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface NavigationProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const Navigation: React.FC<NavigationProps> = ({ items, className }) => {
  const pathname = usePathname();

  // 根据当前路径自动生成面包屑
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split('/').filter(Boolean);
    
    const breadcrumbs: BreadcrumbItem[] = [
      { label: '首页', href: '/' }
    ];

    // 路径映射
    const pathMap: Record<string, string> = {
      'prompts': '提示词',
      'categories': '分类管理', 
      'tags': '标签管理',
      'settings': '设置',
      'create': '创建',
      'edit': '编辑',
      'profile': '个人资料'
    };

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // 跳过最后一个segment（当前页面）
      const isLast = index === pathSegments.length - 1;
      
      if (pathMap[segment]) {
        breadcrumbs.push({
          label: pathMap[segment],
          href: isLast ? undefined : currentPath
        });
      } else if (segment.match(/^\d+$/)) {
        // 数字ID，跳过或显示为"详情"
        breadcrumbs.push({
          label: '详情',
          href: isLast ? undefined : currentPath
        });
      } else {
        // 其他segment，首字母大写
        breadcrumbs.push({
          label: segment.charAt(0).toUpperCase() + segment.slice(1),
          href: isLast ? undefined : currentPath
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = items || generateBreadcrumbs();

  // 如果在登录页面或只有首页，不显示面包屑
  if (pathname === '/login' || pathname === '/register' || breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className={cn("flex items-center space-x-1 text-sm", className)} aria-label="面包屑导航">
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />
              )}
              
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={cn(
                  isLast 
                    ? "text-foreground font-medium" 
                    : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Navigation;