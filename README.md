# 提示词收集网站 (Prompt Collection Website)

一个现代化、美观的提示词管理平台，帮助用户高效地收集、组织、搜索和使用各种AI提示词。

## 🚀 功能特性

- **📝 提示词管理**: 创建、编辑、删除和组织提示词
- **🏷️ 分类标签**: 灵活的分类和标签系统
- **🔍 智能搜索**: 全文搜索和高级筛选功能  
- **⭐ 收藏夹**: 标记重要提示词
- **📊 使用统计**: 跟踪提示词使用频率
- **🎨 现代化UI**: 美观的界面设计
- **📱 响应式**: 支持桌面和移动设备
- **🌙 主题切换**: 明亮/暗黑主题

## 🛠️ 技术栈

### 前端
- **Framework**: Next.js 14 + React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand + React Query
- **UI Components**: Radix UI + Lucide Icons

### 后端
- **Runtime**: Node.js 18+
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT
- **Caching**: Redis

### 部署
- **Containerization**: Docker + Docker Compose
- **Proxy**: Nginx
- **SSL**: Let's Encrypt

## 🏗️ 项目结构

```
prompt-collection-website/
├── backend/                 # 后端API服务
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── middleware/      # 中间件
│   │   ├── models/          # 数据模型
│   │   ├── routes/          # 路由配置
│   │   ├── services/        # 业务逻辑
│   │   └── utils/           # 工具函数
│   ├── prisma/              # 数据库配置
│   └── package.json
├── frontend/                # 前端应用
│   ├── app/                 # Next.js App Router
│   ├── components/          # React组件
│   │   ├── ui/              # 基础UI组件
│   │   ├── layout/          # 布局组件
│   │   └── forms/           # 表单组件
│   ├── lib/                 # 工具库
│   │   ├── api/             # API客户端
│   │   ├── hooks/           # 自定义Hook
│   │   ├── stores/          # 状态管理
│   │   └── utils/           # 工具函数
│   ├── types/               # TypeScript类型
│   └── package.json
├── docs/                    # 项目文档
├── docker-compose.dev.yml   # 开发环境配置
└── README.md
```

## 🚦 快速开始

### 环境要求

- Node.js 18+
- Docker & Docker Compose
- Git

### 1. 克隆项目

```bash
git clone <repository-url>
cd prompt-collection-website
```

### 2. 使用Docker开发（推荐）

```bash
# 启动所有服务
docker-compose -f docker-compose.dev.yml up --build

# 后台运行
docker-compose -f docker-compose.dev.yml up -d --build

# 停止服务
docker-compose -f docker-compose.dev.yml down
```

服务地址:
- 前端: http://localhost:3000
- 后端API: http://localhost:8000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### 3. 本地开发

#### 后端设置

```bash
cd backend

# 安装依赖
npm install

# 复制环境变量
cp env.example .env

# 启动PostgreSQL和Redis (使用Docker)
docker-compose -f ../docker-compose.dev.yml up postgres redis -d

# 生成Prisma客户端
npm run db:generate

# 运行数据库迁移
npm run db:migrate

# 启动开发服务器
npm run dev
```

#### 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 4. 数据库管理

```bash
# 进入后端目录
cd backend

# 查看数据库
npm run db:studio

# 重置数据库
npm run db:push
```

## 📖 API文档

### 认证相关
```
POST /api/auth/register  # 用户注册
POST /api/auth/login     # 用户登录
GET  /api/auth/profile   # 获取用户信息
```

### 提示词管理
```
GET    /api/prompts      # 获取提示词列表
POST   /api/prompts      # 创建提示词
GET    /api/prompts/:id  # 获取单个提示词
PUT    /api/prompts/:id  # 更新提示词
DELETE /api/prompts/:id  # 删除提示词
```

### 分类和标签
```
GET    /api/categories   # 获取分类列表
POST   /api/categories   # 创建分类
GET    /api/tags         # 获取标签列表
POST   /api/tags         # 创建标签
```

## 🧪 测试

```bash
# 后端测试
cd backend
npm test

# 前端测试
cd frontend
npm test
```

## 📦 构建和部署

### 开发环境
```bash
docker-compose -f docker-compose.dev.yml up --build
```

### 生产环境
```bash
docker-compose up --build
```

## 🤝 贡献指南

1. Fork 这个项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 📝 开发规范

- **代码风格**: 使用 ESLint + Prettier
- **提交信息**: 遵循 Conventional Commits
- **分支命名**: `feature/`, `bugfix/`, `hotfix/`
- **测试覆盖率**: 保持 80%+ 覆盖率

## 🐛 问题报告

如果发现任何问题，请在 [Issues](../../issues) 页面报告。

## 📄 许可证

本项目使用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢所有贡献者和开源社区的支持！

---

**开发团队** | 2024
