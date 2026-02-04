# 小红书问卷测试付费系统

## 项目概述

一个问卷测试付费网站，通过小红书引流变现。用户在小红书店铺购买测试(1.88元)，客服发送链接和密码(12小时有效期)，用户完成30道题目测试，获得个性化测试报告。

## 技术栈

### 后端
- 框架: Node.js + NestJS
- 数据库: MySQL 8.0+
- 缓存: Redis 6+

### 前端
- H5用户端: Vue 3 + Vite + Vant UI
- 管理后台: Vue 3 + Element Plus
- 状态管理: Pinia
- 路由: Vue Router

## 项目结构

```
RedBook/
├── backend/          # NestJS后端
├── h5/              # Vue3 H5用户端
├── admin/           # Vue3 管理后台
├── database/        # 数据库脚本
└── 示例图/          # 原型图
```

## 开发计划

- 第1周: 基础架构搭建
- 第2周: H5答题流程开发
- 第3周: 管理后台开发
- 第4周: 测试优化与上线

## 快速开始

### 后端

```bash
cd backend
npm install
npm run start:dev
```

### H5前端

```bash
cd h5
npm install
npm run dev
```

### 管理后台

```bash
cd admin
npm install
npm run dev
```

## 核心功能

- ✅ 密码验证与过期机制(12小时)
- ✅ 答题流程(30题,进度保存)
- ✅ 结果计算与展示
- ✅ 问卷题目管理
- ✅ 密码生成管理
- ✅ 基础数据统计

## License

MIT
