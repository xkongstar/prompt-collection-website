'use client';

import React, { useState } from 'react';
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Lock, 
  Palette, 
  Download, 
  Upload, 
  Trash2, 
  Save, 
  Eye, 
  EyeOff,
  Key,
  Globe,
  Monitor,
  Sun,
  Moon,
  Check,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { useUIStore } from '@/lib/stores';
import { cn } from '@/lib/utils';

interface UserSettings {
  profile: {
    username: string;
    email: string;
    displayName: string;
    avatar?: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    itemsPerPage: number;
    defaultSortBy: 'createdAt' | 'updatedAt' | 'usageCount' | 'name';
    showPreviewOnHover: boolean;
    enableKeyboardShortcuts: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    systemNotifications: boolean;
    newPromptAlerts: boolean;
    weeklyDigest: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    shareUsageStats: boolean;
    allowDataExport: boolean;
  };
}

const SettingsPage: React.FC = () => {
  const { theme, setTheme, notifications, addNotification } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      username: 'user123',
      email: 'user@example.com',
      displayName: '用户',
      avatar: undefined
    },
    preferences: {
      theme: theme as 'light' | 'dark' | 'system',
      language: 'zh-CN',
      itemsPerPage: 20,
      defaultSortBy: 'createdAt',
      showPreviewOnHover: true,
      enableKeyboardShortcuts: true
    },
    notifications: {
      emailNotifications: true,
      systemNotifications: true,
      newPromptAlerts: false,
      weeklyDigest: true
    },
    privacy: {
      profileVisibility: 'public',
      shareUsageStats: true,
      allowDataExport: true
    }
  });

  const tabs = [
    { id: 'profile', label: '个人资料', icon: User },
    { id: 'preferences', label: '偏好设置', icon: SettingsIcon },
    { id: 'notifications', label: '通知设置', icon: Bell },
    { id: 'privacy', label: '隐私设置', icon: Lock },
    { id: 'data', label: '数据管理', icon: Download }
  ];

  const updateSettings = <K extends keyof UserSettings>(
    section: K,
    updates: Partial<UserSettings[K]>
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 应用主题设置
      if (settings.preferences.theme !== theme) {
        setTheme(settings.preferences.theme);
      }

      addNotification({
        type: 'success',
        title: '设置保存成功',
        message: '您的设置已成功保存',
        duration: 3000
      });

      setHasChanges(false);
    } catch (error) {
      addNotification({
        type: 'error',
        title: '保存失败',
        message: '设置保存时出现错误，请重试',
        duration: 5000
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 创建模拟数据
      const exportData = {
        settings,
        prompts: [],
        categories: [],
        tags: [],
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prompt-collection-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addNotification({
        type: 'success',
        title: '导出完成',
        message: '数据已成功导出到文件',
        duration: 3000
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: '导出失败',
        message: '数据导出时出现错误',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const themeOptions = [
    { value: 'light', label: '浅色主题', icon: Sun },
    { value: 'dark', label: '深色主题', icon: Moon },
    { value: 'system', label: '跟随系统', icon: Monitor }
  ];

  const languageOptions = [
    { value: 'zh-CN', label: '简体中文' },
    { value: 'en-US', label: 'English' },
    { value: 'ja-JP', label: '日本語' },
    { value: 'ko-KR', label: '한국어' }
  ];

  const itemsPerPageOptions = [
    { value: '10', label: '10 个/页' },
    { value: '20', label: '20 个/页' },
    { value: '50', label: '50 个/页' },
    { value: '100', label: '100 个/页' }
  ];

  const sortByOptions = [
    { value: 'createdAt', label: '创建时间' },
    { value: 'updatedAt', label: '更新时间' },
    { value: 'usageCount', label: '使用次数' },
    { value: 'name', label: '名称' }
  ];

  const privacyOptions = [
    { value: 'public', label: '公开' },
    { value: 'private', label: '私有' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {settings.profile.displayName.charAt(0)}
              </div>
              <div>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  上传头像
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">用户名</label>
                <Input
                  value={settings.profile.username}
                  onChange={(e) => updateSettings('profile', { username: e.target.value })}
                  placeholder="输入用户名"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">显示名称</label>
                <Input
                  value={settings.profile.displayName}
                  onChange={(e) => updateSettings('profile', { displayName: e.target.value })}
                  placeholder="输入显示名称"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">邮箱地址</label>
                <Input
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) => updateSettings('profile', { email: e.target.value })}
                  placeholder="输入邮箱地址"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Key className="w-5 h-5 mr-2" />
                密码管理
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">当前密码</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="输入当前密码"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">新密码</label>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="输入新密码"
                  />
                </div>
              </div>
              <Button variant="outline" className="mt-4">
                更新密码
              </Button>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                外观设置
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">主题</label>
                  <div className="grid grid-cols-3 gap-2">
                    {themeOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => updateSettings('preferences', { theme: option.value as any })}
                        className={cn(
                          "flex flex-col items-center p-3 rounded-lg border transition-colors",
                          settings.preferences.theme === option.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:bg-muted"
                        )}
                      >
                        <option.icon className="w-6 h-6 mb-1" />
                        <span className="text-xs">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">语言</label>
                  <Select
                    value={settings.preferences.language}
                    onChange={(value) => updateSettings('preferences', { language: value as string })}
                    options={languageOptions}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                显示设置
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">每页显示项目数</label>
                  <Select
                    value={settings.preferences.itemsPerPage.toString()}
                    onChange={(value) => updateSettings('preferences', { itemsPerPage: parseInt(value as string) })}
                    options={itemsPerPageOptions}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">默认排序方式</label>
                  <Select
                    value={settings.preferences.defaultSortBy}
                    onChange={(value) => updateSettings('preferences', { defaultSortBy: value as 'createdAt' | 'updatedAt' | 'usageCount' | 'name' })}
                    options={sortByOptions}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">交互设置</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.preferences.showPreviewOnHover}
                    onChange={(e) => updateSettings('preferences', { showPreviewOnHover: e.target.checked })}
                    className="rounded"
                  />
                  <span>鼠标悬停时显示预览</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.preferences.enableKeyboardShortcuts}
                    onChange={(e) => updateSettings('preferences', { enableKeyboardShortcuts: e.target.checked })}
                    className="rounded"
                  />
                  <span>启用键盘快捷键</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <Alert>
              <Info className="w-4 h-4" />
              <div>
                <div className="font-medium">通知设置</div>
                <div className="text-sm text-muted-foreground mt-1">
                  管理您希望接收的通知类型。您可以随时更改这些设置。
                </div>
              </div>
            </Alert>

            <div>
              <h3 className="text-lg font-medium mb-4">邮件通知</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-medium">启用邮件通知</span>
                    <p className="text-sm text-muted-foreground">接收重要更新和通知邮件</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.emailNotifications}
                    onChange={(e) => updateSettings('notifications', { emailNotifications: e.target.checked })}
                    className="rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-medium">周报摘要</span>
                    <p className="text-sm text-muted-foreground">每周接收使用情况摘要</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.weeklyDigest}
                    onChange={(e) => updateSettings('notifications', { weeklyDigest: e.target.checked })}
                    className="rounded"
                  />
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">系统通知</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-medium">桌面通知</span>
                    <p className="text-sm text-muted-foreground">在浏览器中显示通知</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.systemNotifications}
                    onChange={(e) => updateSettings('notifications', { systemNotifications: e.target.checked })}
                    className="rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-medium">新提示词提醒</span>
                    <p className="text-sm text-muted-foreground">有新的公共提示词时通知我</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.newPromptAlerts}
                    onChange={(e) => updateSettings('notifications', { newPromptAlerts: e.target.checked })}
                    className="rounded"
                  />
                </label>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <Alert variant="warning">
              <AlertTriangle className="w-4 h-4" />
              <div>
                <div className="font-medium">隐私提醒</div>
                <div className="text-sm text-muted-foreground mt-1">
                  这些设置会影响其他用户如何查看和访问您的内容。请仔细考虑您的隐私偏好。
                </div>
              </div>
            </Alert>

            <div>
              <h3 className="text-lg font-medium mb-4">个人资料可见性</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">个人资料可见性</label>
                  <Select
                    value={settings.privacy.profileVisibility}
                    onChange={(value) => updateSettings('privacy', { profileVisibility: value as 'public' | 'private' })}
                    options={privacyOptions}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {settings.privacy.profileVisibility === 'public' 
                      ? '其他用户可以查看您的个人资料和公开内容'
                      : '您的个人资料仅对您自己可见'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">数据共享</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-medium">共享使用统计</span>
                    <p className="text-sm text-muted-foreground">帮助改进产品，匿名分享使用数据</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.privacy.shareUsageStats}
                    onChange={(e) => updateSettings('privacy', { shareUsageStats: e.target.checked })}
                    className="rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-medium">允许数据导出</span>
                    <p className="text-sm text-muted-foreground">允许下载您的所有数据</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.privacy.allowDataExport}
                    onChange={(e) => updateSettings('privacy', { allowDataExport: e.target.checked })}
                    className="rounded"
                  />
                </label>
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <Alert>
              <Info className="w-4 h-4" />
              <div>
                <div className="font-medium">数据管理</div>
                <div className="text-sm text-muted-foreground mt-1">
                  导出、导入或删除您的数据。这些操作不可撤销，请谨慎操作。
                </div>
              </div>
            </Alert>

            <div>
              <h3 className="text-lg font-medium mb-4">数据导出</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <span className="font-medium">导出所有数据</span>
                    <p className="text-sm text-muted-foreground">下载包含您所有提示词、设置和历史记录的文件</p>
                  </div>
                  <Button 
                    onClick={handleExportData}
                    disabled={loading}
                    className="ml-4"
                  >
                    {loading ? (
                      <Spinner className="w-4 h-4 mr-2" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    导出
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <span className="font-medium">导入数据</span>
                    <p className="text-sm text-muted-foreground">从备份文件中恢复您的数据</p>
                  </div>
                  <Button variant="outline" className="ml-4">
                    <Upload className="w-4 h-4 mr-2" />
                    导入
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4 text-destructive">危险区域</h3>
              <div className="space-y-3">
                <Alert variant="destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <div>
                    <div className="font-medium">删除账户</div>
                    <div className="text-sm mt-1">
                      这将永久删除您的账户和所有相关数据。此操作无法撤销。
                    </div>
                  </div>
                </Alert>

                <Button variant="destructive" className="mt-4">
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除账户
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">设置</h1>
        <p className="text-muted-foreground">管理您的账户设置和偏好</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* 侧边栏导航 */}
        <div className="lg:w-64">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors",
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区域 */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {(() => {
                  const activeTabData = tabs.find(tab => tab.id === activeTab);
                  if (!activeTabData) return null;
                  const IconComponent = activeTabData.icon;
                  return (
                    <>
                      <IconComponent className="w-5 h-5 mr-2" />
                      {activeTabData.label}
                    </>
                  );
                })()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderTabContent()}
            </CardContent>
          </Card>

          {/* 保存按钮 */}
          {hasChanges && (
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleSave}
                disabled={saving}
                size="lg"
              >
                {saving ? (
                  <Spinner className="w-4 h-4 mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                保存更改
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;