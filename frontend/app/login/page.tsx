'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { api } from '@/lib/api';
import { AuthResponse } from '@/types';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除错误信息
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('请填写所有字段');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.post<AuthResponse>('/auth/login', formData);
      
      if (response.data.success && response.data.data) {
        const { user, token } = response.data.data;
        
        // 保存token到localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // 跳转到提示词页面
        router.push('/prompts');
      } else {
        setError(response.data.error?.message || '登录失败');
      }
    } catch (err: unknown) {
      console.error('登录失败:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
        setError(
          axiosError.response?.data?.error?.message || 
          axiosError.message || 
          '登录失败，请重试'
        );
      } else {
        setError('登录失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 头部 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            登录账户
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            登录到您的提示词管理平台
          </p>
        </div>

        {/* 登录表单 */}
        <Card>
          <CardHeader>
            <CardTitle>欢迎回来</CardTitle>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <Input
                label="邮箱地址"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="请输入您的邮箱"
                required
              />

              <Input
                label="密码"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="请输入您的密码"
                required
              />
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                loading={loading}
              >
                {loading ? '登录中...' : '登录'}
              </Button>

              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                还没有账户？
                <Link 
                  href="/register" 
                  className="font-medium text-primary-600 hover:text-primary-500 ml-1"
                >
                  立即注册
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* 演示账户提示 */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              演示账户
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-200 mb-3">
              您可以使用以下账户进行体验：
            </p>
            <div className="text-xs font-mono space-y-1 text-blue-800 dark:text-blue-100">
              <div>邮箱：test@example.com</div>
              <div>密码：password123</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 text-blue-700 border-blue-300 hover:bg-blue-100 dark:text-blue-200 dark:border-blue-600 dark:hover:bg-blue-800"
              onClick={() => {
                setFormData({
                  email: 'test@example.com',
                  password: 'password123'
                });
              }}
            >
              使用演示账户
            </Button>
          </CardContent>
        </Card>

        {/* 返回首页 */}
        <div className="text-center">
          <Link 
            href="/" 
            className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
