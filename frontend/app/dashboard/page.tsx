'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  Hash, 
  Folder, 
  Star, 
  Clock, 
  Calendar,
  Activity,
  Target,
  Zap,
  Eye,
  Download,
  Share2,
  Plus,
  ArrowUp,
  ArrowDown,
  Filter,
  RefreshCw,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { useUIStore } from '@/lib/stores';
import { cn } from '@/lib/utils';

interface DashboardStats {
  totalPrompts: number;
  totalCategories: number;
  totalTags: number;
  totalViews: number;
  promptsThisMonth: number;
  viewsThisMonth: number;
  favoritePrompts: number;
  sharedPrompts: number;
}

interface RecentActivity {
  id: string;
  type: 'create' | 'edit' | 'view' | 'favorite' | 'share';
  title: string;
  description: string;
  timestamp: Date;
  promptId?: string;
}

interface PopularPrompt {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  viewCount: number;
  favoriteCount: number;
  createdAt: Date;
}

const DashboardPage: React.FC = () => {
  const { addNotification } = useUIStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  
  const [stats, setStats] = useState<DashboardStats>({
    totalPrompts: 0,
    totalCategories: 0,
    totalTags: 0,
    totalViews: 0,
    promptsThisMonth: 0,
    viewsThisMonth: 0,
    favoritePrompts: 0,
    sharedPrompts: 0,
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [popularPrompts, setPopularPrompts] = useState<PopularPrompt[]>([]);

  // 模拟数据加载
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 模拟统计数据
        setStats({
          totalPrompts: 156,
          totalCategories: 12,
          totalTags: 45,
          totalViews: 2847,
          promptsThisMonth: 23,
          viewsThisMonth: 892,
          favoritePrompts: 34,
          sharedPrompts: 18,
        });

        // 模拟最近活动
        setRecentActivity([
          {
            id: '1',
            type: 'create',
            title: '创建新提示词',
            description: 'AI代码审查助手',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          },
          {
            id: '2',
            type: 'edit',
            title: '编辑提示词',
            description: '更新了文档写作模板',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          },
          {
            id: '3',
            type: 'favorite',
            title: '收藏提示词',
            description: '收藏了"数据分析报告"',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          },
          {
            id: '4',
            type: 'share',
            title: '分享提示词',
            description: '分享了"产品需求文档"',
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
          },
          {
            id: '5',
            type: 'view',
            title: '查看提示词',
            description: '查看了"营销文案生成器"',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          },
        ]);

        // 模拟热门提示词
        setPopularPrompts([
          {
            id: '1',
            title: 'AI代码审查助手',
            description: '帮助开发者进行代码质量检查和优化建议',
            category: '开发工具',
            tags: ['代码', '审查', 'AI', '开发'],
            viewCount: 245,
            favoriteCount: 32,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
          {
            id: '2',
            title: '营销文案生成器',
            description: '快速生成各种营销场景的文案内容',
            category: '营销推广',
            tags: ['营销', '文案', '创意', '推广'],
            viewCount: 189,
            favoriteCount: 28,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
          {
            id: '3',
            title: '数据分析报告',
            description: '结构化的数据分析报告生成模板',
            category: '数据分析',
            tags: ['数据', '分析', '报告', '模板'],
            viewCount: 167,
            favoriteCount: 25,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        ]);

      } catch (error) {
        addNotification({
          type: 'error',
          title: '加载失败',
          message: '仪表板数据加载失败，请重试',
          duration: 5000
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [timeRange, addNotification]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      addNotification({
        type: 'success',
        title: '刷新成功',
        message: '数据已更新到最新状态',
        duration: 3000
      });
    } finally {
      setRefreshing(false);
    }
  };

  const timeRangeOptions = [
    { value: '1d', label: '今天' },
    { value: '7d', label: '过去7天' },
    { value: '30d', label: '过去30天' },
    { value: '90d', label: '过去3个月' },
  ];

  const activityIcons = {
    create: Plus,
    edit: FileText,
    view: Eye,
    favorite: Star,
    share: Share2,
  };

  const activityColors = {
    create: 'text-green-600 dark:text-green-400',
    edit: 'text-blue-600 dark:text-blue-400',
    view: 'text-gray-600 dark:text-gray-400',
    favorite: 'text-yellow-600 dark:text-yellow-400',
    share: 'text-purple-600 dark:text-purple-400',
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}分钟前`;
    } else if (hours < 24) {
      return `${hours}小时前`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}天前`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Spinner className="w-8 h-8 mx-auto" />
          <p className="text-muted-foreground">正在加载仪表板数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">仪表板</h1>
          <p className="text-muted-foreground mt-1">查看您的提示词集合概览和统计信息</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
            options={timeRangeOptions}
            className="w-32"
          />
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            刷新
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">总提示词数</p>
                <p className="text-3xl font-bold">{stats.totalPrompts}</p>
                <div className="flex items-center mt-2 text-sm">
                  <ArrowUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-green-600">+{stats.promptsThisMonth}</span>
                  <span className="text-muted-foreground ml-1">本月</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">总分类数</p>
                <p className="text-3xl font-bold">{stats.totalCategories}</p>
                <div className="flex items-center mt-2 text-sm">
                  <Folder className="w-4 h-4 text-muted-foreground mr-1" />
                  <span className="text-muted-foreground">分类管理</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Folder className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">总标签数</p>
                <p className="text-3xl font-bold">{stats.totalTags}</p>
                <div className="flex items-center mt-2 text-sm">
                  <Hash className="w-4 h-4 text-muted-foreground mr-1" />
                  <span className="text-muted-foreground">标签系统</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Hash className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">总浏览量</p>
                <p className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</p>
                <div className="flex items-center mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-green-600">+{stats.viewsThisMonth}</span>
                  <span className="text-muted-foreground ml-1">本月</span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Eye className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                最近活动
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const Icon = activityIcons[activity.type];
                  return (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={cn("p-2 rounded-lg bg-muted", activityColors[activity.type])}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(activity.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                查看全部活动
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                快速统计
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm">收藏的提示词</span>
                </div>
                <Badge variant="secondary">{stats.favoritePrompts}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Share2 className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">已分享</span>
                </div>
                <Badge variant="secondary">{stats.sharedPrompts}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="text-sm">本月创建</span>
                </div>
                <Badge variant="secondary">{stats.promptsThisMonth}</Badge>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  创建新提示词
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Popular Prompts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              热门提示词
            </div>
            <Button variant="ghost" size="sm">
              查看全部
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularPrompts.map((prompt) => (
              <Card key={prompt.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium line-clamp-1">{prompt.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {prompt.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {prompt.category}
                      </Badge>
                      <span>{formatTimeAgo(prompt.createdAt)}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {prompt.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4 text-muted-foreground">
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {prompt.viewCount}
                        </span>
                        <span className="flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          {prompt.favoriteCount}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;