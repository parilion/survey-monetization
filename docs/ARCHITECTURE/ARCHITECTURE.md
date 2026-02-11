# RedBook 问卷系统架构设计文档

本文档描述 RedBook 问卷系统的整体架构设计、技术选型和目录结构。

---

## 1. 项目概述

RedBook 是一个通用问卷调查系统，支持多种计分模式和结果分析，适用于：
- 性格测试（如 MBTI、香水性格测试）
- NPS 满意度调查
- KPI 绩效考核
- 任何自定义问卷场景

### 核心特性

- **多维度评分系统**：支持 6 种计分模式
- **灵活的题目配置**：单选/多选、计分类型、权重配置
- **密码保护机制**：12小时有效期内可重复使用
- **即时结果展示**：答题后即时计算并展示结果

---

## 2. 技术栈

### 后端

| 技术 | 版本 | 用途 |
|-----|------|------|
| Node.js | >= 18 | 运行环境 |
| NestJS | ^10.0.0 | Web 框架 |
| TypeORM | ^0.3.17 | ORM 框架 |
| MySQL | 8.0+ | 主数据库 |
| class-validator | ^0.14.0 | 数据验证 |
| bcrypt | ^5.1.0 | 密码加密 |

### 管理后台前端

| 技术 | 版本 | 用途 |
|-----|------|------|
| Vue.js | ^3.3.0 | UI 框架 |
| Vue Router | ^4.2.0 | 路由管理 |
| Pinia | ^2.1.0 | 状态管理 |
| Element Plus | ^2.4.0 | UI 组件库 |
| Axios | ^1.6.0 | HTTP 客户端 |

### H5 用户端前端

| 技术 | 版本 | 用途 |
|-----|------|------|
| Vue.js | ^3.3.0 | UI 框架 |
| Vue Router | ^4.2.0 | 路由管理 |
| Pinia | ^2.1.0 | 状态管理 |
| Vant | ^4.6.0 | 移动端组件库 |
| Axios | ^1.6.0 | HTTP 客户端 |

---

## 3. 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                      客户端层                                │
│  ┌─────────────────┐        ┌─────────────────┐          │
│  │  H5用户端       │        │  管理后台       │          │
│  │  (移动端)       │        │  (PC端)        │          │
│  └────────┬────────┘        └────────┬────────┘          │
└─────────────┼─────────────────────────────┼────────────────────┘
              │                             │
              ▼                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      API 网关层                              │
│              Nginx / CDN / SSL 代理                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                      应用服务层                              │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              NestJS 后端服务                        │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │  │
│  │  │ 问卷模块  │ │ 题目模块  │ │ 密码模块         │ │  │
│  │  └──────────┘ └──────────┘ └──────────────────┘ │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │  │
│  │  │ 答题模块  │ │ 结果模块  │ │ 计分配置模块     │ │  │
│  │  └──────────┘ └──────────┘ └──────────────────┘ │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                      数据存储层                              │
│  ┌─────────────────┐                                      │
│  │     MySQL       │                                      │
│  │   (持久化)       │                                      │
│  └─────────────────┘                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. 目录结构

```
RedBook/
├── backend/                    # 后端项目
│   ├── src/
│   │   ├── common/           # 公共模块
│   │   │   ├── utils/       # 工具类
│   │   │   │   └── result-calculator.ts  # 计分计算器
│   │   │   └── constants/    # 常量定义
│   │   ├── entities/         # 实体类
│   │   │   ├── index.ts      # 实体导出
│   │   │   ├── survey.entity.ts
│   │   │   ├── question.entity.ts
│   │   │   ├── option.entity.ts
│   │   │   ├── result-template.entity.ts
│   │   │   ├── survey-score-config.entity.ts  # 计分配置
│   │   │   └── ...
│   │   ├── modules/          # 业务模块
│   │   │   ├── survey/       # 问卷模块
│   │   │   ├── question/     # 题目模块
│   │   │   ├── password/    # 密码模块
│   │   │   ├── answer/      # 答题模块
│   │   │   ├── result/      # 结果模板模块
│   │   │   └── score-config/ # 计分配置模块
│   │   ├── app.module.ts    # 根模块
│   │   └── main.ts          # 入口文件
│   ├── migrations/          # 数据库迁移
│   ├── schema.sql           # 数据库表结构
│   └── package.json
│
├── admin/                     # 管理后台前端
│   ├── src/
│   │   ├── api/             # API 接口
│   │   │   └── index.js
│   │   ├── router/          # 路由配置
│   │   │   └── index.js
│   │   ├── stores/          # 状态管理
│   │   │   └── user.js
│   │   ├── views/           # 页面组件
│   │   │   ├── Layout.vue
│   │   │   ├── Dashboard.vue
│   │   │   ├── survey/
│   │   │   │   ├── List.vue
│   │   │   │   └── ScoreConfig.vue  # 计分配置页
│   │   │   ├── question/
│   │   │   │   └── List.vue
│   │   │   ├── result/
│   │   │   │   └── List.vue
│   │   │   └── password/
│   │   │       └── List.vue
│   │   ├── App.vue
│   │   └── main.js
│   └── package.json
│
├── h5/                       # H5 用户端
│   ├── src/
│   │   ├── api/             # API 接口
│   │   │   └── index.js
│   │   ├── router/          # 路由配置
│   │   │   └── index.js
│   │   ├── stores/          # 状态管理
│   │   │   └── survey.js
│   │   ├── views/           # 页面组件
│   │   │   ├── PasswordVerify.vue  # 密码验证页
│   │   │   ├── SurveyIntro.vue     # 介绍页（暖米色调设计）
│   │   │   ├── Question.vue        # 答题页
│   │   │   └── Result.vue          # 结果页（暖米色调设计）
│   │   ├── components/      # 公共组件
│   │   ├── App.vue
│   │   └── main.js
│   └── package.json
│
├── docs/                     # 文档目录
│   ├── ARCHITECTURE.md      # 本文档
│   ├── DEPLOYMENT.md        # 部署指南
│   ├── TESTING.md           # 测试指南
│   └── SCORING_SYSTEM.md    # 计分系统文档
│
└── README.md                # 项目说明
```

---

## 5. 数据库设计

### 5.1 核心表结构

```
┌─────────────────────────────────────────────────────────┐
│                        surveys                          │
│ 问卷表                                                 │
├─────────────────────────────────────────────────────────┤
│ id              │ int       │ 主键                      │
│ title           │ varchar   │ 问卷标题                  │
│ description     │ text      │ 问卷描述                  │
│ intro_text      │ text      │ 引导文案                  │
│ intro_image     │ varchar   │ 引导图片                  │
│ intro_title     │ varchar   │ 介绍页大标题(可选)        │
│ intro_subtitle  │ varchar   │ 介绍页副标题(可选)        │
│ intro_button_text│ varchar  │ 介绍页按钮文字(可选)      │
│ status          │ tinyint   │ 状态(0禁用/1启用)        │
│ created_at      │ datetime  │ 创建时间                  │
└─────────────────────────────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
┌─────────────────────┐   ┌─────────────────────────────┐
│      questions      │   │      result_templates       │
│     题目表          │   │      结果模板表             │
├─────────────────────┤   ├─────────────────────────────┤
│ id                  │   │ id                         │
│ survey_id (FK)      │   │ survey_id (FK)            │
│ title               │   │ result_type                │
│ question_type       │   │ title                      │
│ sort_order          │   │ description                 │
│ is_required         │   │ image_url                  │
│ created_at          │   │ detail_content             │
└─────────────────────┘   │ match_type                 │
                          │ tags (JSON)                │
                          │ recommendation             │
                          │ created_at                 │
                          └─────────────────────────────┘
              │
              ▼
┌─────────────────────┐
│       options        │
│      选项表          │
├─────────────────────┤
│ id                  │
│ question_id (FK)    │
│ content             │
│ score_type          │
│ score_value         │
│ sort_order          │
└─────────────────────┘
              │
              ▼
┌───────────────────────────┐
│     access_passwords      │
│        访问密码表          │
├───────────────────────────┤
│ id                        │
│ survey_id (FK)            │
│ password                  │
│ status (0=可使用/1=已过期) │
│ generated_at              │
│ expires_at                │
└───────────────────────────┘

注：答题记录不再存储，答题后即时计算并返回结果
```

### 5.2 计分配置表

```
┌─────────────────────────────────────────────────────────┐
│                 survey_score_configs                    │
│              问卷计分配置表                            │
├─────────────────────────────────────────────────────────┤
│ id            │ int       │ 主键                      │
│ survey_id     │ int       │ 问卷ID (唯一)            │
│ score_mode   │ enum      │ 计分模式                  │
│ result_type_field │ varchar │ 结果类型字段名          │
│ dimensions    │ JSON      │ 维度配置                  │
│ ranges        │ JSON      │ 范围配置                  │
│ metrics       │ JSON      │ KPI指标配置               │
│ grade_rules   │ JSON      │ 等级规则                  │
│ tie_breaker   │ varchar   │ 平局处理方式              │
└─────────────────────────────────────────────────────────┘
```

---

## 6. API 接口设计

### 6.1 统一响应格式

```json
// 成功响应
{
  "code": 200,
  "message": "操作成功",
  "data": { ... }
}

// 错误响应
{
  "code": 400,
  "message": "参数错误",
  "timestamp": "2024-02-05T10:30:00.000Z"
}
```

### 6.2 模块接口

| 模块 | 方法 | 路径 | 功能 |
|-----|------|------|------|
| 问卷 | GET | /api/survey | 问卷列表 |
| 问卷 | POST | /api/survey | 创建问卷 |
| 问卷 | GET | /api/survey/:id | 问卷详情 |
| 问卷 | PUT | /api/survey/:id | 更新问卷 |
| 问卷 | DELETE | /api/survey/:id | 删除问卷 |
| 题目 | GET | /api/question | 题目列表 |
| 题目 | POST | /api/question | 创建题目 |
| 题目 | PUT | /api/question/:id | 更新题目 |
| 题目 | DELETE | /api/question/:id | 删除题目 |
| 结果 | GET | /api/result | 结果模板列表 |
| 结果 | POST | /api/result | 创建结果模板 |
| 密码 | POST | /api/password/generate | 批量生成密码 |
| 密码 | POST | /api/password/verify | 密码验证（12小时内可重复使用） |
| 答题 | POST | /api/answer/submit | 提交答案（即时返回结果，不存储） |
| 计分 | GET | /api/score-config/:surveyId | 获取计分配置 |
| 计分 | PUT | /api/score-config/:surveyId | 更新计分配置 |

---

## 7. 计分系统设计

### 7.1 支持的计分模式

| 模式 | 说明 | 适用场景 |
|-----|------|---------|
| SINGLE | 单类型计分 | 简单性格测试 |
| MULTI | 多类型计分 | 复合性格评估 |
| RANGE | 范围值计分 | NPS、满意度调查 |
| MULTI_DIMENSION | 多维度计分 | MBTI、大五人格 |
| KPI | 绩效考核计分 | 绩效评估 |
| CUSTOM_FORMULA | 自定义公式 | 复杂计算场景 |

### 7.2 计分配置流程

```
1. 选择计分模式
   ↓
2. 配置模式参数（维度/范围/指标）
   ↓
3. 配置选项得分
   ↓
4. 配置结果模板匹配规则
   ↓
5. 保存配置
```

---

## 8. 安全设计

### 8.1 认证授权

- JWT Token 认证
- 管理员登录验证
- API 访问控制

### 8.2 数据安全

- 密码 bcrypt 加密存储
- SQL 注入防护
- XSS 攻击防护
- CORS 跨域控制

### 8.3 业务安全

- 密码12小时有效期内可重复使用
- 密码过期后自动失效
- 答题结果即时计算，不存储用户答案

---

## 9. 性能优化

### 9.1 后端优化

- 数据库索引优化
- 连接池配置
- 缓存策略（Redis 可选）

### 9.2 前端优化

- 路由懒加载
- 组件按需引入
- Pinia 内存状态管理（不使用 localStorage 缓存，避免数据混淆）
- Google Fonts 预连接（preconnect）加速字体加载
- H5 统一视觉设计体系：SurveyIntro 和 Result 页共享暖米色调（`#f5f0eb`）+ 衬线字体排版
- H5 响应式适配：`postcss-px-to-viewport`（375px 基准）+ CSS `zoom` 桌面端缩放，视口 > 750px 时 `#app` 等比缩小居中显示

### 9.3 部署优化

- PM2 进程管理
- Nginx Gzip 压缩
- 静态资源 CDN 加速

---

## 10. 扩展性设计

### 10.1 模块化架构

- NestJS 模块化设计，易于扩展
- 业务模块独立，可插拔

### 10.2 计分系统扩展

- 支持自定义计分模式
- 支持自定义结果匹配规则
- 支持插件式预设模板

### 10.3 前端扩展

- 组件库可替换
- 路由可扩展
- 状态管理可扩展

---

## 11. 环境配置

### 11.1 开发环境

```bash
# 后端
cd backend
npm install
npm run start:dev

# 管理后台
cd admin
npm install
npm run dev

# H5端
cd h5
npm install
npm run dev
```

### 11.2 生产环境

详见 `docs/DEPLOYMENT.md`

---

## 12. 相关文档

| 文档 | 说明 |
|-----|------|
| [DEPLOYMENT.md](./DEPLOYMENT.md) | 生产环境部署指南 |
| [TESTING.md](./TESTING.md) | 系统测试指南 |
| [SCORING_SYSTEM.md](./SCORING_SYSTEM.md) | 计分系统详细文档 |
| [BUG_LOCALSTORAGE_CACHE.md](./BUG_LOCALSTORAGE_CACHE.md) | H5 缓存数据混淆问题修复 |
| [REFACTOR_PASSWORD_SYSTEM.md](./REFACTOR_PASSWORD_SYSTEM.md) | 密码系统重构记录 |

---

**文档版本:** 1.3
**最后更新:** 2026-02-07
