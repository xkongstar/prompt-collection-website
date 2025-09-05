'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './ImprovedHeader';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Navigation from './Navigation';
import { useUIStore, useAuthStore } from '@/lib/stores';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { sidebarState } = useUIStore();
  const { isAuthenticated, isInitialized } = useAuthStore();

  // 不需要布局的页面
  const excludedPages = ['/login', '/register'];
  const shouldShowLayout = !excludedPages.includes(pathname) && isAuthenticated;

  // 如果认证状态还未初始化，显示加载状态
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">正在加载...</p>
        </div>
      </div>
    );
  }

  // 对于不需要布局的页面，直接渲染children
  if (!shouldShowLayout) {
    return <>{children}</>;
  }

  const showSidebar = sidebarState !== 'closed';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 顶部导航栏 */}
      <Header />
      
      <div className="flex-1 flex">
        {/* 侧边栏 */}
        {showSidebar && (
          <Sidebar className="hidden lg:flex flex-col" />
        )}
        
        {/* 主要内容区域 */}
        <main className={cn(
          "flex-1 flex flex-col",
          showSidebar && "lg:ml-0" // 侧边栏显示时，main不需要额外margin
        )}>
          {/* 面包屑导航 */}
          <div className="border-b border-border bg-muted/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <Navigation />
            </div>
          </div>
          
          {/* 页面内容 */}
          <div className="flex-1">
            {children}
          </div>
        </main>
      </div>
      
      {/* 底部 */}
      <Footer />
    </div>
  );
};

export default AppLayout;