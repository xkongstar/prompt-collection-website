'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { useAuthStore } from '@/lib/stores/authStore';
import { RegisterDto } from '@/types';
import { Eye, EyeOff, Check, X } from 'lucide-react';

interface RegisterFormData extends RegisterDto {
  confirmPassword: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const { register, isLoading, error, clearError, isAuthenticated, isInitialized, setError } = useAuthStore();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 密码强度要求
  const passwordRequirements: PasswordRequirement[] = [
    {
      label: '至少6个字符',
      test: (password: string) => password.length >= 6,
      met: formData.password.length >= 6
    },
    {
      label: '包含字母',
      test: (password: string) => /[a-zA-Z]/.test(password),
      met: /[a-zA-Z]/.test(formData.password)
    },
    {
      label: '包含数字',
      test: (password: string) => /\d/.test(password),
      met: /\d/.test(formData.password)
    }
  ];

  const isPasswordValid = passwordRequirements.every(req => req.met);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

  // 如果已登录，重定向到提示词页面
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.push('/prompts');
    }
  }, [isInitialized, isAuthenticated, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除错误信息
    if (error) clearError();
  };

  const validateForm = (): boolean => {
    if (!formData.username.trim()) {
      setError('用户名不能为空');
      return false;
    }
    
    if (formData.username.length < 2) {
      setError('用户名至少需要2个字符');
      return false;
    }

    if (!formData.email.trim()) {
      setError('邮箱不能为空');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('请输入有效的邮箱地址');
      return false;
    }

    if (!isPasswordValid) {
      setError('密码不满足安全要求');
      return false;
    }

    if (!passwordsMatch) {
      setError('两次输入的密码不一致');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const { confirmPassword, ...registerData } = formData;
    const success = await register(registerData);
    if (success) {
      router.push('/prompts');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 头部 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            创建账户
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            加入提示词管理平台，开启高效工作
          </p>
        </div>

        {/* 注册表单 */}
        <Card>
          <CardHeader>
            <CardTitle>注册新账户</CardTitle>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <Input
                label="用户名"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="请输入用户名 (2-20个字符)"
                required
              />

              <Input
                label="邮箱地址"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="请输入您的邮箱地址"
                required
              />

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    label="密码"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="请输入密码"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* 密码强度指示器 */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <div className="text-xs text-gray-600 dark:text-gray-400">密码强度要求：</div>
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center text-xs">
                        {req.met ? (
                          <Check className="w-3 h-3 text-green-500 mr-2" />
                        ) : (
                          <X className="w-3 h-3 text-gray-400 mr-2" />
                        )}
                        <span className={req.met ? 'text-green-600' : 'text-gray-500'}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <Input
                  label="确认密码"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="请再次输入密码"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                
                {formData.confirmPassword && (
                  <div className="mt-1 flex items-center text-xs">
                    {passwordsMatch ? (
                      <>
                        <Check className="w-3 h-3 text-green-500 mr-1" />
                        <span className="text-green-600">密码匹配</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3 text-red-500 mr-1" />
                        <span className="text-red-600">密码不匹配</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                loading={isLoading}
                disabled={!isPasswordValid || !passwordsMatch || isLoading}
              >
                {isLoading ? '注册中...' : '创建账户'}
              </Button>

              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                已有账户？
                <Link 
                  href="/login" 
                  className="font-medium text-primary-600 hover:text-primary-500 ml-1"
                >
                  立即登录
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* 服务条款提示 */}
        <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="pt-6">
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center leading-relaxed">
              点击"创建账户"即表示您同意我们的
              <Link href="/terms" className="text-primary-600 hover:text-primary-500 underline mx-1">
                服务条款
              </Link>
              和
              <Link href="/privacy" className="text-primary-600 hover:text-primary-500 underline mx-1">
                隐私政策
              </Link>
            </p>
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

export default RegisterPage;