# 📋 部署检查列表

部署前请确保完成以下检查项。

## 🔧 代码准备

### 后端 (Backend)
- [x] ✅ 更新 Prisma schema 支持 PostgreSQL
- [x] ✅ 创建生产环境数据库迁移文件
- [x] ✅ 配置 CORS 支持生产域名
- [x] ✅ 添加健康检查端点
- [x] ✅ 配置生产环境构建脚本
- [x] ✅ 添加错误处理和日志记录

### 前端 (Frontend)  
- [x] ✅ 配置 Next.js standalone 输出
- [x] ✅ 更新 API 端口配置 (8080)
- [x] ✅ 添加生产环境安全头
- [x] ✅ 配置图像域名白名单
- [x] ✅ 优化构建配置

### 基础设施
- [x] ✅ Docker 多阶段构建配置
- [x] ✅ Docker Compose 服务编排
- [x] ✅ Railway 部署配置
- [x] ✅ Vercel 部署配置
- [x] ✅ GitHub Actions CI/CD

## 🗄️ 数据库设置

### 选项 A: Neon (PostgreSQL) - 推荐
```bash
# 1. 访问 https://neon.tech
# 2. 创建账号并新建数据库
# 3. 复制连接字符串，格式类似：
postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/database_name?sslmode=require
```

### 选项 B: PlanetScale (MySQL)
```bash
# 1. 访问 https://planetscale.com  
# 2. 创建账号并新建数据库
# 3. 复制连接字符串，格式类似：
mysql://username:password@aws.connect.psdb.cloud/database_name?sslaccept=strict
```

## 🖥️ 后端部署

### Railway (推荐)
```bash
# 1. 访问 https://railway.app
# 2. 使用 GitHub 账号登录
# 3. 点击 "New Project" > "Deploy from GitHub repo"
# 4. 选择 prompt-collection-website 仓库
# 5. 设置环境变量：
```

**必需的环境变量：**
```bash
NODE_ENV=production
PORT=8080  
DATABASE_URL=你的数据库连接字符串
JWT_SECRET=你的超级安全密钥至少32字符
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://你的前端域名.vercel.app
```

**高级配置：**
```bash
# Railway 特定设置
Build Command: cd backend && npm install && npm run build
Start Command: cd backend && npm start
Root Directory: /

# 资源配置
Memory: 512MB (免费额度)
CPU: 共享 vCPU
```

### 备选: Render
```bash
# 1. 访问 https://render.com
# 2. 连接 GitHub 仓库
# 3. 创建 Web Service
# 4. 配置相同的环境变量
```

## 🌐 前端部署

### Vercel (推荐)
```bash
# 1. 访问 https://vercel.com
# 2. 使用 GitHub 账号登录  
# 3. 点击 "New Project"
# 4. 导入 prompt-collection-website 仓库
```

**构建配置：**
```bash
Framework Preset: Next.js
Root Directory: frontend
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

**环境变量：**
```bash
NEXT_PUBLIC_API_URL=https://你的后端域名.railway.app
NEXT_PUBLIC_APP_URL=https://你的前端域名.vercel.app
NEXT_PUBLIC_APP_NAME=提示词收集网站
```

## 🔐 安全配置

### JWT 密钥生成
```bash
# 生成 32 字符安全密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 域名配置
```bash
# 后端 CORS_ORIGIN 必须精确匹配前端域名
CORS_ORIGIN=https://your-app.vercel.app

# 前端 API_URL 必须精确匹配后端域名  
NEXT_PUBLIC_API_URL=https://your-app.railway.app
```

## 🚀 部署步骤

### 1. 准备环境变量
```bash
# 复制并编辑生产环境配置
cp .env.production.example .env.production
nano .env.production
```

### 2. 本地构建测试
```bash
# 运行部署脚本
./deploy.sh

# 或手动构建
cd backend && npm install && npm run build
cd ../frontend && npm install && npm run build
```

### 3. 推送代码到 GitHub
```bash
git add .
git commit -m "feat: add production deployment configuration"
git push origin main
```

### 4. 部署后端 (Railway)
- Railway 会自动检测代码推送并开始部署
- 查看构建日志确保无错误
- 复制生成的服务 URL

### 5. 部署前端 (Vercel)  
- 更新前端环境变量中的 NEXT_PUBLIC_API_URL
- Vercel 会自动部署
- 复制生成的部署 URL

### 6. 数据库迁移
```bash
# 在 Railway 终端或本地运行
npm run db:migrate:prod

# 可选：添加种子数据
npm run db:seed:prod
```

## ✅ 部署验证

### 手动测试
```bash
# 设置你的实际域名
export BACKEND_URL="https://your-app.railway.app"
export FRONTEND_URL="https://your-app.vercel.app"

# 运行健康检查
./scripts/health-check.sh
```

### API 端点测试
```bash
# 测试后端健康状况
curl https://your-app.railway.app/health

# 测试 API 文档  
curl https://your-app.railway.app/api

# 测试前端
curl https://your-app.vercel.app
```

### 功能测试
1. 访问前端应用
2. 尝试用户注册/登录
3. 创建分类和标签
4. 创建和编辑提示词
5. 测试搜索和筛选功能
6. 验证响应式设计

## 📊 监控和维护

### 日志查看
```bash
# Railway 日志
# 在 Railway dashboard 查看 Logs 标签

# Vercel 日志  
# 在 Vercel dashboard 查看 Functions 标签
```

### 性能监控
- Railway: 自动监控 CPU 和内存使用
- Vercel: 自动监控页面性能和函数执行

### 数据库监控
- Neon: 在控制面板查看连接和查询统计
- PlanetScale: 在控制面板查看查询性能

## 🐛 常见问题

### 1. 数据库连接失败
```bash
# 检查连接字符串格式
# PostgreSQL: postgresql://user:pass@host:port/db?sslmode=require  
# MySQL: mysql://user:pass@host:port/db?sslaccept=strict
```

### 2. CORS 错误
```bash
# 确保 CORS_ORIGIN 精确匹配
CORS_ORIGIN=https://your-exact-domain.vercel.app  # 不要尾部斜杠
```

### 3. 构建失败
```bash
# 检查 Node.js 版本 (建议 18.x)
# 确保依赖版本兼容
# 查看详细构建日志
```

### 4. 环境变量未生效
```bash
# Railway: 重新部署服务
# Vercel: 重新部署项目
# 检查变量名拼写和值格式
```

## 💰 成本优化

### 免费额度监控
- **Vercel**: 100GB 带宽/月，无限项目
- **Railway**: 500 小时/月，512MB 内存
- **Neon**: 512MB 数据库，3GB 传输/月
- **PlanetScale**: 5GB 存储，1000万行读取/月

### 超额警告
- 设置用量警告阈值
- 监控数据库连接数和查询频率
- 优化前端静态资源

## 🔄 后续优化

部署成功后的改进方向：
- [ ] 配置自定义域名
- [ ] 启用 CDN 和缓存策略
- [ ] 添加错误监控 (Sentry)
- [ ] 设置数据库备份策略
- [ ] 配置监控告警
- [ ] 优化 SEO 配置
- [ ] 添加分析统计

---

**🎉 祝部署顺利！如有问题请查阅 DEPLOYMENT.md 获取详细说明。**