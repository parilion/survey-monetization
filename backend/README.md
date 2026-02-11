<p align="center">
  <img src="https://img.shields.io/badge/RedBook-Survey%20System-blue" alt="RedBook Survey System" />
</p>

# RedBook Survey System Backend

小红书问卷测试系统的后端服务，基于 NestJS + TypeORM + MySQL 构建。

## 技术栈

- **框架**: NestJS 10.x
- **数据库**: MySQL 8.0
- **ORM**: TypeORM
- **验证**: class-validator
- **语言**: TypeScript

## 快速开始

### 环境要求

- Node.js >= 18
- MySQL >= 8.0

### 安装依赖

```bash
cd backend
npm install
```

### 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件配置数据库连接等信息
```

### 启动开发服务器

```bash
npm run start:dev
```

服务将在 `http://localhost:3000` 启动。

### 构建生产版本

```bash
npm run build
npm run start:prod
```

## 目录结构

```
backend/
├── src/
│   ├── entities/           # TypeORM 实体类
│   │   ├── admin-user.entity.ts
│   │   ├── survey.entity.ts
│   │   ├── question.entity.ts
│   │   ├── option.entity.ts
│   │   ├── result-template.entity.ts
│   │   ├── access-password.entity.ts
│   │   ├── answer-record.entity.ts
│   │   ├── survey-score-config.entity.ts
│   │   └── option-score-detail.entity.ts
│   │
│   ├── modules/            # 业务模块
│   │   ├── survey/        # 问卷管理
│   │   ├── question/       # 题目管理
│   │   ├── password/       # 密码管理
│   │   ├── answer/         # 答题服务
│   │   ├── result/         # 结果模板
│   │   └── score-config/   # 计分配置
│   │
│   ├── common/             # 公共组件
│   │   ├── utils/          # 工具函数
│   │   │   └── result-calculator.ts  # 结果计算器
│   │   └── filters/        # 过滤器
│   │       └── http-exception.filter.ts
│   │
│   ├── app.module.ts       # 根模块
│   └── main.ts             # 入口文件
│
├── .env.example            # 环境变量示例
├── package.json
└── tsconfig.json
```

## 核心模块

### 问卷模块 (Survey)

管理问卷的创建、编辑、发布。

**API 端点**:

| 方法 | 路径 | 说明 |
|-----|------|------|
| POST | `/api/surveys` | 创建问卷 |
| GET | `/api/surveys` | 获取问卷列表 |
| GET | `/api/surveys/:id` | 获取问卷详情 |
| GET | `/api/surveys/slug/:slug` | 根据slug获取问卷 |
| PUT | `/api/surveys/:id` | 更新问卷 |
| DELETE | `/api/surveys/:id` | 删除问卷 |

### 题目模块 (Question)

管理问卷题目和选项。

**API 端点**:

| 方法 | 路径 | 说明 |
|-----|------|------|
| POST | `/api/questions` | 创建题目 |
| GET | `/api/questions` | 获取题目列表 |
| PUT | `/api/questions/:id` | 更新题目 |
| DELETE | `/api/questions/:id` | 删除题目 |

### 密码模块 (Password)

管理访问密码的生成和验证。

**API 端点**:

| 方法 | 路径 | 说明 |
|-----|------|------|
| POST | `/api/password/verify` | 验证密码 |
| POST | `/api/password/generate` | 生成密码 |
| GET | `/api/password/list` | 获取密码列表 |
| DELETE | `/api/password/batch` | 批量删除密码 |

### 答题模块 (Answer)

处理用户答题并返回结果。

**API 端点**:

| 方法 | 路径 | 说明 |
|-----|------|------|
| POST | `/api/answer/submit` | 提交答案并获取结果 |

### 计分配置模块 (ScoreConfig)

配置问卷的计分规则。

**API 端点**:

| 方法 | 路径 | 说明 |
|-----|------|------|
| GET | `/api/score-config/:surveyId/or-create` | 获取或创建计分配置 |
| GET | `/api/score-config/preset/mbti` | 获取MBTI预设 |
| GET | `/api/score-config/preset/nps` | 获取NPS预设 |
| GET | `/api/score-config/preset/kpi` | 获取KPI预设 |
| POST | `/api/score-config` | 保存计分配置 |

## 计分系统

支持多种计分模式：

| 模式 | 说明 | 适用场景 |
|-----|------|---------|
| SINGLE | 单类型计分 | 简单性格测试 |
| MULTI | 多类型计分 | 复合型测试 |
| RANGE | 范围值计分 | NPS、满意度 |
| MULTI_DIMENSION | 多维度计分 | MBTI、大五人格 |
| KPI | KPI考核 | 绩效考核 |
| CUSTOM_FORMULA | 自定义公式 | 复杂计算 |

详细说明请参考 [计分系统文档](../docs/REFERENCE/SCORING_SYSTEM.md)。

## 相关文档

- [项目文档索引](../docs/README.md)
- [API接口文档](../docs/REFERENCE/API.md)
- [数据字典](../docs/REFERENCE/DATABASE.md)
- [架构设计](../docs/ARCHITECTURE/ARCHITECTURE.md)
- [部署指南](../docs/DEPLOYMENT/DEPLOYMENT.md)

## License

MIT
