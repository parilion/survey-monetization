# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

小红书问卷测试付费系统 - 一个完整的问卷测试变现系统，用户在小红书购买后通过密码访问完成测试。

**技术栈：**
- 后端：NestJS + TypeORM + MySQL 8.0
- 管理后台：Vue 3 + Element Plus + Vite
- H5用户端：Vue 3 + Vant UI + Vite

## 常用命令

### 后端开发
```bash
cd backend
npm install          # 安装依赖
npm run start:dev    # 开发模式（热更新）
npm run build        # 生产构建
npm run start:prod   # 生产运行
```

### 管理后台 (端口 5174)
```bash
cd admin
npm install
npm run dev          # 开发模式
npm run build        # 生产构建
```

### H5用户端 (端口 5173)
```bash
cd h5
npm install
npm run dev          # 开发模式
npm run build        # 生产构建
```

## 项目结构

```
RedBook/
├── backend/src/
│   ├── entities/          # 9个TypeORM实体 (survey, question, option, etc.)
│   ├── modules/            # 6个业务模块 (survey, question, password, answer, result, score-config)
│   ├── common/            # 公共组件 (utils, filters)
│   ├── app.module.ts      # 根模块 - 配置数据库连接和业务模块
│   └── main.ts            # 入口 - 全局异常过滤器、ValidationPipe、CORS
├── admin/src/
│   ├── views/             # 页面组件 (Login, Layout, Dashboard, survey/, question/, etc.)
│   ├── api/               # Axios封装和API接口
│   ├── router/            # 路由配置
│   └── stores/           # Pinia状态管理
├── h5/src/
│   ├── views/            # 页面 (PasswordVerify, SurveyIntro, Question, Result)
│   ├── api/              # API接口封装
│   ├── router/           # 路由配置
│   └── stores/           # 问卷状态管理
└── database/schema.sql   # MySQL数据库表结构 (8张表)
```

## 架构要点

### 后端架构
- **模块化设计**：每个业务模块包含 controller、service、dto、entity
- **全局前缀**：所有API以 `/api` 开头
- **数据库**：MySQL 8.0，使用 TypeORM 管理
- **验证**：class-validator + ValidationPipe
- **计分系统**：支持简单计分，结果计算逻辑在 `common/utils/result-calculator.ts`

### 前端架构
- **Vite代理**：admin 和 h5 的 vite.config.js 都配置了 `/api` 代理到 `http://localhost:3000`
- **API路径**：所有前端请求通过代理访问后端
- **状态管理**：Pinia (admin: user.js, h5: survey.js)
- **H5数据流**：不使用 localStorage 缓存，每次访问从 API 获取最新数据，避免问卷数据混淆

### 数据库关键表
- `surveys` - 问卷配置（含 `intro_title`、`intro_subtitle`、`intro_button_text` 介绍页自定义字段）
- `questions` + `options` - 题目和选项
- `access_passwords` - 访问密码 (12小时有效期内可重复使用)
- `result_templates` - 结果模板

### H5 视觉设计体系
- **统一暖米色调**：介绍页（SurveyIntro）和结果页（Result）共享同一套设计语言
- **Google Fonts**：Playfair Display（衬线大标题）、Noto Serif SC（中文衬线）、Noto Sans SC（正文）
- **色彩体系**：背景 `#f5f0eb`，标题 `#3a2e22`，正文 `#5a4a3a`，浅金 `#b8a692`，高亮 `#b8865a`
- **介绍页支持独立配置**：每个问卷可自定义 introTitle / introSubtitle / introButtonText，不填则回退到默认值

### H5 响应式适配
- **移动端优先**：使用 `postcss-px-to-viewport-8-plugin`（viewportWidth: 375）将 px 转为 vw，手机端完美匹配设计稿
- **桌面端 CSS zoom 缩放**：视口 > 750px 时，通过 `index.html` 中的内联脚本对 `#app` 施加 CSS `zoom` 等比缩小到 750px 宽度并居中显示
- **手机端零影响**：视口 <= 750px 时不做任何处理，vw 单位正常生效
- **桌面端背景**：宽屏设备下 `html` 背景色设为暖米色 `#f5f0eb`（在 `App.vue` 媒体查询中配置）
- **已知限制**：Vant 的 Toast/Dialog 通过 teleport 挂在 body 下，不受 `#app` zoom 影响，桌面端可能偏大

### 密码系统
- 密码从生成时起12小时内有效
- 有效期内可重复使用（刷新页面、重新测试都可以）
- 答题结果即时计算返回，不存储到数据库

## 开发注意事项

- 默认管理员：`admin` / `admin123`
- 后端运行在 `http://localhost:3000`
- CORS配置在 `backend/.env` 的 `CORS_ORIGIN`
- 修改数据库配置后需要重启后端服务

## 文档导航

### 使用指南
- [管理员使用手册](./docs/GUIDE/ADMIN_GUIDE.md) - 问卷创建、题目配置、密码管理完整流程
- [H5用户使用指南](./docs/GUIDE/H5_USER_GUIDE.md) - 用户端密码验证、答题流程说明

### 参考文档
- [API接口文档](./docs/REFERENCE/API.md) - 所有API接口说明和示例
- [数据字典](./docs/REFERENCE/DATABASE.md) - 数据库表结构和字段说明
- [计分系统](./docs/REFERENCE/SCORING_SYSTEM.md) - 6种计分模式详解
- [题目配置指南](./docs/REFERENCE/QUESTION_CONFIG.md) - 表单填写详细说明

### 架构与部署
- [架构设计](./docs/ARCHITECTURE/ARCHITECTURE.md) - 系统整体架构说明
- [部署指南](./docs/DEPLOYMENT/DEPLOYMENT.md) - 生产环境部署步骤

### 开发记录
- [密码系统重构](./docs/CHANGELOG/PASSWORD_REFACTOR.md) - 从一次性密码改为12小时有效
- [LocalStorage修复](./docs/CHANGELOG/LOCALSTORAGE_FIX.md) - 缓存数据混淆问题修复
- [计分配置修复](./docs/CHANGELOG/SCORING_FIX.md) - Vue响应式问题修复
- [URL Slug功能](./docs/CHANGELOG/URL_SLUG_FEATURE.md) - 问卷专属URL功能设计
