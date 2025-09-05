'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Github, Heart, Coffee, Code } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  const pathname = usePathname();
  
  // 在登录页面不显示footer
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const currentYear = new Date().getFullYear();

  const links = [
    {
      label: '使用指南',
      href: '/help',
    },
    {
      label: '隐私政策',
      href: '/privacy',
    },
    {
      label: '服务条款',
      href: '/terms',
    },
    {
      label: '联系我们',
      href: '/contact',
    }
  ];

  const socialLinks = [
    {
      label: 'GitHub',
      href: 'https://github.com',
      icon: Github,
    },
    {
      label: '赞助',
      href: '#',
      icon: Coffee,
    }
  ];

  return (
    <footer className={cn(
      "bg-muted/50 border-t border-border mt-auto",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 主要内容区 */}
        <div className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 品牌信息 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  提示词管理
                </span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                一个现代化的AI提示词管理平台，帮助您高效地组织、管理和使用各种AI提示词模板。
              </p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>Made with</span>
                <Heart className="w-4 h-4 text-red-500 fill-current" />
                <span>by the community</span>
              </div>
            </div>

            {/* 快速链接 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">快速链接</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 社交链接和统计 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">社区</h3>
              <div className="flex items-center gap-2">
                {socialLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Button
                      key={link.href}
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href={link.href} target="_blank" rel="noopener noreferrer">
                        <Icon className="w-4 h-4" />
                        <span className="ml-2">{link.label}</span>
                      </Link>
                    </Button>
                  );
                })}
              </div>
              
              {/* 项目统计 */}
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>技术栈:</span>
                  <span>Next.js 15 + TypeScript</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>版本:</span>
                  <span>v1.0.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部版权信息 */}
        <div className="border-t border-border py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              © {currentYear} 提示词管理平台. All rights reserved.
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Built with Next.js</span>
              <span>•</span>
              <span>Powered by TypeScript</span>
              <span>•</span>
              <span>Styled with Tailwind CSS</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;