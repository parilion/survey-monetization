# 小红书问卷测试付费系统

## 📋 项目简介

一个完整的问卷测试付费网站，通过小红书引流变现。用户在小红书店铺购买测试（1.88元），客服发送链接和密码（12小时有效期），用户完成30道题目测试，获得个性化测试报告。

**当前版本：** MVP v1.0
**开发状态：** ✅ 已完成
**开发时间：** 2026-02-04

## 🎯 核心功能

- ✅ 密码验证与过期机制（12小时自动过期）
- ✅ 答题流程（30题，进度自动保存）
- ✅ 结果计算与展示（简单计分制）
- ✅ 问卷题目管理（CRUD完整功能）
- ✅ 密码生成管理（批量生成）
- ✅ 基础数据统计
- ✅ 答题记录查询

## 🏗️ 技术架构

### 后端技术栈
- **框架：** Node.js + NestJS
- **数据库：** MySQL 8.0+
- **缓存：** Redis 6+（可选）
- **ORM：** TypeORM
- **验证：** class-validator

### 前端技术栈
- **H5用户端：** Vue 3 + Vite + Vant UI
- **管理后台：** Vue 3 + Vite + Element Plus
- **状态管理：** Pinia
- **路由：** Vue Router
- **HTTP客户端：** Axios

## 📦 项目结构

```
RedBook/
├── backend/              # NestJS后端服务
│   ├── src/
│   │   ├── entities/    # 数据实体（7个）
│   │   ├── modules/     # 业务模块（5个）
│   │   ├── common/      # 公共组件
│   │   └── main.ts      # 入口文件
│   ├── .env             # 环境配置
│   ├── .env.example     # 环境配置示例
│   └── API.md           # API文档
│
├── h5/                  # H5用户端
│   ├── src/
│   │   ├── views/       # 页面组件（4个）
│   │   ├── stores/      # 状态管理
│   │   ├── router/      # 路由配置
│   │   └── api/         # API接口
│   └── README.md
│
├── admin/               # 管理后台
│   ├── src/
│   │   ├── views/       # 页面组件（8个）
│   │   ├── stores/      # 状态管理
│   │   ├── router/      # 路由配置
│   │   └── api/         # API接口
│   └── README.md
│
├── database/
│   ├── schema.sql       # 数据库表结构（8张表）
│   └── README.md        # 数据库说明
│
├── docs/
│   ├── DEPLOYMENT.md    # 部署指南
│   └── TESTING.md       # 测试指南
│
└── README.md            # 项目说明（本文件）
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- MySQL >= 8.0
- Redis >= 6.0（可选）
- npm 或 pnpm

### 1. 克隆项目

```bash
git clone <repository-url>
cd RedBook
```

### 2. 初始化数据库

```bash
# 进入MySQL
mysql -u root -p

# 执行数据库脚本
source database/schema.sql
```

详细说明请查看：[database/README.md](./database/README.md)

### 3. 配置后端

```bash
cd backend

# 安装依赖（如果还未安装）
npm install

# 复制环境配置
cp .env.example .env

# 编辑.env文件，修改数据库密码等配置
# DB_PASSWORD=你的MySQL密码

# 启动开发服务器
npm run start:dev
```

后端服务将运行在：http://localhost:3000

### 4. 启动H5前端

```bash
cd h5

# 安装依赖（如果还未安装）
npm install

# 启动开发服务器
npm run dev
```

H5前端将运行在：http://localhost:5173

### 5. 启动管理后台

```bash
cd admin

# 安装依赖（如果还未安装）
npm install

# 启动开发服务器
npm run dev
```

管理后台将运行在：http://localhost:5174

**默认管理员账号：**
- 用户名：`admin`
- 密码：`admin123`

## 📖 详细文档

- [API文档](./backend/API.md) - 后端API接口说明
- [数据库文档](./database/README.md) - 数据库表结构说明
- [部署指南](./docs/DEPLOYMENT.md) - 生产环境部署步骤
- [测试指南](./docs/TESTING.md) - 功能测试步骤

## 🎯 使用流程

### 管理员操作

1. **登录管理后台** → http://localhost:5174
2. **创建问卷** → 填写标题、描述、引导文案
3. **添加题目** → 30道题，每题4个选项，设置计分类型
4. **配置结果模板** → 为每种性格类型创建结果描述
5. **生成密码** → 批量生成100个测试密码
6. **发送给用户** → 复制密码通过小红书客服发送

### 用户测试流程

1. **访问H5页面** → http://localhost:5173
2. **输入密码** → 验证密码（12小时有效）
3. **查看介绍** → "寻香·性格测试"说明
4. **开始答题** → 完成30道题（进度自动保存）
5. **查看结果** → 获得性格类型和详细描述

## 🔧 开发相关

### 后端开发

```bash
cd backend

# 开发模式
npm run start:dev

# 生产模式
npm run build
npm run start:prod

# 运行测试
npm run test
```

### 前端开发

```bash
# H5前端
cd h5
npm run dev        # 开发模式
npm run build      # 生产构建
npm run preview    # 预览构建结果

# 管理后台
cd admin
npm run dev        # 开发模式
npm run build      # 生产构建
npm run preview    # 预览构建结果
```

## 📊 项目数据

| 统计项 | 数量 |
|--------|------|
| 数据库表 | 8张 |
| 后端API | 26个 |
| 实体类 | 7个 |
| H5页面 | 4个 |
| 管理后台页面 | 8个 |
| 总代码行数 | ~7100行 |

## 🔐 安全说明

**⚠️ 重要：生产环境部署前必须修改：**

1. 修改管理员默认密码
2. 修改 JWT_SECRET 为随机字符串
3. 配置CORS允许的域名
4. 启用HTTPS
5. 配置防火墙规则

详细安全配置请查看：[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

## 🐛 故障排除

### 后端无法启动

1. 检查MySQL是否运行：`mysql -u root -p`
2. 检查数据库是否创建：`SHOW DATABASES;`
3. 检查.env配置是否正确

### 前端连接后端失败

1. 确认后端已启动：http://localhost:3000/api
2. 检查浏览器控制台错误信息
3. 检查vite.config.js中的proxy配置

### 密码验证失败

1. 确认密码是否已生成
2. 检查密码状态（未使用/已使用/已过期）
3. 确认密码是否在12小时有效期内

更多问题请查看：[docs/TESTING.md](./docs/TESTING.md)

## 📝 待优化功能（V1.1）

- [ ] 管理员JWT认证
- [ ] Redis缓存优化
- [ ] 图片上传功能
- [ ] 数据可视化图表
- [ ] 题目拖拽排序
- [ ] 导出Excel功能
- [ ] 分享功能
- [ ] 自动发货对接

## 📄 许可证

MIT License

## 👥 贡献者

- 开发者：全栈开发
- AI助手：Claude Opus 4.5

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- GitHub Issues：<repository-url>/issues
- Email：your-email@example.com

---

**最后更新时间：** 2026-02-04
**版本号：** v1.0.0
