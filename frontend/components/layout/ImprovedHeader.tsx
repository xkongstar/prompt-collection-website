'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  FileText, 
  Folder, 
  Tag, 
  Home, 
  LogOut,
  Menu,
  User,
  Settings,
  Bell,
  Search,
  Plus,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore, useUIStore } from '@/lib/stores';
import ThemeToggle from './ThemeToggle';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { notifications, sidebarState, toggleSidebar } = useUIStore();
  
  const [showSearch, setShowSearch] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/prompts?search=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  // 如果在登录或注册页面，不显示导航
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  // 如果未认证，不显示header
  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    {
      href: '/',
      label: '概览',
      icon: Home,
      isActive: pathname === '/'
    },
    {
      href: '/prompts',
      label: '提示词',
      icon: FileText,
      isActive: pathname.startsWith('/prompts')
    },
    {
      href: '/categories',
      label: '分类',
      icon: Folder,
      isActive: pathname === '/categories'
    },
    {
      href: '/tags',
      label: '标签',
      icon: Tag,
      isActive: pathname === '/tags'
    }
  ];

  const unreadNotifications = notifications.filter(n => n.type === 'info').length;

  return (
    <>
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 左侧：Logo + 侧边栏切换 + 导航 */}
            <div className="flex items-center gap-4">
              {/* 侧边栏切换按钮 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>

              {/* Logo */}
              <div 
                className="flex items-center gap-3 cursor-pointer" 
                onClick={() => router.push('/')}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:inline">
                  提示词管理
                </span>
              </div>

              {/* 主导航 */}
              <nav className="hidden md:flex items-center space-x-1 ml-8">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.href}
                      variant={item.isActive ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => router.push(item.href)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2",
                        item.isActive && "text-primary"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  );
                })}
              </nav>
            </div>

            {/* 右侧：操作按钮 */}
            <div className="flex items-center gap-3">
              {/* 搜索按钮 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSearch(true)}
                className="hidden sm:flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span className="text-muted-foreground">搜索...</span>
              </Button>

              {/* 移动端搜索按钮 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearch(true)}
                className="sm:hidden"
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* 创建按钮 */}
              <Button
                size="sm"
                onClick={() => router.push('/prompts/create')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">创建</span>
              </Button>

              {/* 主题切换 */}
              <ThemeToggle />

              {/* 通知按钮 */}
              <Button
                variant="ghost"
                size="sm"
                className="relative"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center text-xs p-0"
                    variant="destructive"
                  >
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </Badge>
                )}
              </Button>

              {/* 用户菜单 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">{user?.username || '用户'}</span>
              </Button>

              {/* 用户下拉菜单 (简单版本) */}
              {showUserMenu && (
                <div className="absolute top-16 right-4 bg-background border border-border rounded-lg shadow-lg p-2 z-50 min-w-48">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="font-medium">{user?.username}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  <div className="py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        router.push('/settings');
                        setShowUserMenu(false);
                      }}
                      className="w-full justify-start"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      设置
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full justify-start text-destructive hover:text-destructive"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      退出登录
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 移动端导航 */}
          <div className="md:hidden border-t border-border py-3">
            <nav className="flex items-center space-x-1 overflow-x-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.href}
                    variant={item.isActive ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => router.push(item.href)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 whitespace-nowrap",
                      item.isActive && "text-primary"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* 搜索模态框 */}
      <Modal
        open={showSearch}
        onClose={() => setShowSearch(false)}
        title="搜索提示词"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="输入关键词搜索提示词..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
              autoFocus
            />
            <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
              <Search className="w-4 h-4" />
            </Button>
          </div>
          
          {/* TODO: 添加搜索历史和建议 */}
          <div className="text-sm text-muted-foreground">
            <p>提示：</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>输入关键词搜索标题和内容</li>
              <li>使用标签名搜索相关提示词</li>
              <li>支持模糊匹配</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* 点击外部关闭用户菜单 */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
};

export default Header;