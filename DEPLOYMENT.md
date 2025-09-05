# 🚀 部署指南

本项目支持多种部署方式，建议使用免费平台组合以最小化成本。

## 📋 部署架构

### 推荐方案（免费额度）
- **前端**: Vercel (Next.js原生支持)
- **后端**: Railway 或 Render
- **数据库**: PlanetScale (MySQL) 或 Neon (PostgreSQL)

## 🔧 部署准备

### 1. 环境配置
```bash
# 复制环境变量模板
cp .env.production.example .env.production

# 编辑生产环境变量
nano .env.production
```

### 2. 构建项目
```bash
# 运行部署脚本
./deploy.sh
```

## 🗄️ 数据库部署

### Option A: PlanetScale (MySQL)
1. 访问 [PlanetScale](https://planetscale.com)
2. 创建免费数据库 (5GB存储)
3. 获取连接字符串
4. 更新 `DATABASE_URL` 环境变量

```bash
DATABASE_URL="mysql://username:password@aws.connect.psdb.cloud/database_name?sslaccept=strict"
```

### Option B: Neon (PostgreSQL)
1. 访问 [Neon](https://neon.tech)
2. 创建免费数据库 (512MB存储)
3. 获取连接字符串
4. 更新 `DATABASE_URL` 环境变量

```bash
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/database_name?sslmode=require"
```

## 🖥️ 后端部署

### Option A: Railway
1. 访问 [Railway](https://railway.app)
2. 连接 GitHub 仓库
3. 选择后端服务
4. 设置环境变量：
   - `NODE_ENV=production`
   - `PORT=8080`
   - `DATABASE_URL=your_database_url`
   - `JWT_SECRET=your_jwt_secret`
   - `CORS_ORIGIN=https://your-frontend.vercel.app`

```bash
# Railway CLI 部署
npm install -g @railway/cli
railway login
railway up
```

### Option B: Render
1. 访问 [Render](https://render.com)
2. 连接 GitHub 仓库
3. 创建 Web Service
4. 配置：
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `cd backend && npm start`
   - Environment: Node.js

## 🌐 前端部署

### Vercel (推荐)
1. 访问 [Vercel](https://vercel.com)
2. 导入 GitHub 仓库
3. 配置构建设置：
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. 设置环境变量：
   - `NEXT_PUBLIC_API_URL=https://your-backend.railway.app`
   - `NEXT_PUBLIC_APP_URL=https://your-frontend.vercel.app`

```bash
# Vercel CLI 部署
npm install -g vercel
vercel --prod
```

### Option B: Netlify
1. 访问 [Netlify](https://netlify.com)
2. 连接 GitHub 仓库
3. 配置构建设置：
   - Base Directory: `frontend`
   - Build Command: `npm run build`
   - Publish Directory: `frontend/.next`

## 🔐 环境变量配置

### 后端环境变量
```bash
NODE_ENV=production
PORT=8080
DATABASE_URL=your_database_connection_string
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### 前端环境变量
```bash
NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app
NEXT_PUBLIC_APP_URL=https://your-frontend-domain.vercel.app
```

## 📊 数据库迁移

### 生产环境迁移
```bash
# 在后端目录中运行
cd backend
npm run db:migrate:prod
npm run db:seed:prod  # 可选：添加初始数据
```

### PlanetScale 专用
```bash
# PlanetScale 使用分支工作流
pscale auth login
pscale database create prompt-collection
pscale branch create prompt-collection main
pscale connect prompt-collection main --port 3309

# 在另一个终端运行迁移
npm run db:push
```

## 🔍 部署验证

### 健康检查
```bash
# 检查后端
curl https://your-backend-domain.railway.app/health

# 检查前端
curl https://your-frontend-domain.vercel.app
```

### API 测试
```bash
# 测试 API 端点
curl https://your-backend-domain.railway.app/api/auth/health
curl https://your-backend-domain.railway.app/api/prompts
```

## 📈 监控和日志

### Vercel 监控
- Analytics: 自动启用
- Functions: 查看函数执行日志
- Edge Network: 全球CDN性能监控

### Railway 监控
- Metrics: CPU, 内存使用情况
- Logs: 实时应用日志
- Deploy: 部署历史和回滚

## 🐛 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 `DATABASE_URL` 格式
   - 确认数据库服务运行状态
   - 验证防火墙和SSL设置

2. **CORS 错误**
   - 检查 `CORS_ORIGIN` 配置
   - 确认前后端域名匹配

3. **构建失败**
   - 检查 Node.js 版本兼容性
   - 验证依赖包版本
   - 查看构建日志详情

4. **环境变量未生效**
   - 重新部署服务
   - 检查变量名拼写
   - 确认变量值正确设置

## 💰 成本估算

### 免费额度（月）
- **Vercel**: 100GB带宽，无限项目
- **Railway**: 500小时运行时间，512MB内存
- **PlanetScale**: 5GB存储，1000万行读取
- **总计**: $0/月（在免费额度内）

### 超出免费额度后
- **Vercel Pro**: $20/月
- **Railway**: $5/月起
- **PlanetScale**: $29/月起

## 📝 部署清单

- [ ] 配置生产环境变量
- [ ] 创建数据库实例
- [ ] 部署后端服务
- [ ] 部署前端应用
- [ ] 运行数据库迁移
- [ ] 验证 API 连接
- [ ] 测试完整用户流程
- [ ] 设置域名（可选）
- [ ] 配置监控告警

## 🔄 CI/CD 自动化

项目已配置自动部署：
- GitHub 推送触发自动构建
- Vercel 自动部署前端
- Railway 自动部署后端
- 环境变量自动注入

## 📞 技术支持

如遇部署问题，请查看：
1. 各平台官方文档
2. GitHub Issues
3. 社区论坛支持