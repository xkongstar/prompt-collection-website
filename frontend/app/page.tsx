import Link from 'next/link';
import { Button } from "@/components/ui/Button";
import { Sparkles, Search, Star, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-blue-950 dark:via-purple-950 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          {/* 主标题 */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              ✨ 提示词收集
            </h1>
            <div className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-200">
              管理平台
            </div>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            现代化、美观的AI提示词管理平台
            <br className="hidden sm:block" />
            高效收集、组织、搜索和使用您的提示词模板
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link href="/prompts">
              <Button 
                size="lg" 
                className="px-10 py-4 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
              >
                <Sparkles className="w-6 h-6 mr-3" />
                立即开始
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-4 text-lg border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all duration-300"
              >
                登录账户
              </Button>
            </Link>
          </div>

          {/* 特性介绍 */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200/50 dark:border-gray-700/50">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
                🔍 智能搜索
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                全文搜索功能，支持关键词、标签筛选，快速定位需要的提示词模板
              </p>
            </div>
            
            <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200/50 dark:border-gray-700/50">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
                ⭐ 智能管理
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                分类整理、标签标记、收藏管理，让您的提示词井井有条，随时调用
              </p>
            </div>
            
            <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200/50 dark:border-gray-700/50">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
                ⚡ 使用统计
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                记录使用频率和时间，智能推荐最有价值的提示词，提升工作效率
              </p>
            </div>
          </div>

          {/* 快速导航 */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              🚀 快速开始
            </h2>
            <div className="grid md:grid-cols-4 gap-6 mb-16">
              <Link href="/prompts" className="group">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200/50">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center group-hover:text-blue-600 transition-colors">
                    提示词管理
                  </h3>
                  <p className="text-gray-600 text-center text-sm">
                    查看和管理您的提示词集合
                  </p>
                </div>
              </Link>

              <Link href="/categories" className="group">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200/50">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center group-hover:text-orange-600 transition-colors">
                    分类管理
                  </h3>
                  <p className="text-gray-600 text-center text-sm">
                    创建和管理分类系统
                  </p>
                </div>
              </Link>

              <Link href="/tags" className="group">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200/50">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center group-hover:text-purple-600 transition-colors">
                    标签管理
                  </h3>
                  <p className="text-gray-600 text-center text-sm">
                    创建和管理标签系统
                  </p>
                </div>
              </Link>

              <Link href="/prompts/create" className="group">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200/50">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center group-hover:text-green-600 transition-colors">
                    创建提示词
                  </h3>
                  <p className="text-gray-600 text-center text-sm">
                    立即创建新的提示词
                  </p>
                </div>
              </Link>
            </div>
          </div>

          <div className="p-8 bg-white rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              系统状态
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded">
                <span>后端API</span>
                <span className="text-green-600 font-medium">✅ 正常运行</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded">
                <span>前端服务</span>
                <span className="text-green-600 font-medium">✅ 正常运行</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
