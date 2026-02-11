# API接口文档

本文档描述 RedBook 问卷系统的后端API接口规范。

## 基础信息

| 项目 | 值 |
|-----|-----|
| Base URL | `/api` |
| 认证方式 | 无（公开API） |
| 响应格式 | JSON |
| 编码 | UTF-8 |

## 通用响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

### 响应码说明

| code | 说明 |
|-----|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 问卷模块 (Survey)

### 创建问卷

**POST** `/api/surveys`

**请求体**：

```json
{
  "title": "问卷标题",
  "slug": "test123",
  "status": 0,
  "introTitle": "测试标题",
  "introSubtitle": "测试副标题",
  "introButtonText": "开始测试"
}
```

**响应**：

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 1,
    "title": "问卷标题",
    "slug": "test123",
    "status": 0,
    "createdAt": "2026-02-10T10:00:00.000Z"
  }
}
```

---

### 获取问卷列表

**GET** `/api/surveys`

**查询参数**：

| 参数 | 类型 | 说明 | 默认值 |
|-----|------|-----|-------|
| page | number | 页码 | 1 |
| limit | number | 每页数量 | 20 |
| status | number | 状态筛选 | - |

**响应**：

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

---

### 根据slug获取问卷

**GET** `/api/surveys/slug/:slug`

**响应**：

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "title": "问卷标题",
    "slug": "test123",
    "introTitle": "测试标题",
    "introSubtitle": "测试副标题",
    "introButtonText": "开始测试",
    "questions": [...],
    "resultTemplates": [...]
  }
}
```

---

### 获取问卷详情

**GET** `/api/surveys/:id`

**响应**：

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "title": "问卷标题",
    "slug": "test123",
    "status": 1,
    "questions": [...]
  }
}
```

---

### 更新问卷

**PUT** `/api/surveys/:id`

**请求体**（部分更新）：

```json
{
  "title": "新的标题",
  "status": 1
}
```

---

### 删除问卷

**DELETE** `/api/surveys/:id`

---

## 题目模块 (Question)

### 创建题目

**POST** `/api/questions`

**请求体**：

```json
{
  "surveyId": 1,
  "title": "题目内容",
  "order": 1,
  "questionType": "single",
  "options": [
    {
      "content": "选项A",
      "scoreValue": 1,
      "scoreType": "A"
    },
    {
      "content": "选项B",
      "scoreValue": 1,
      "scoreType": "B"
    }
  ]
}
```

---

### 获取题目列表

**GET** `/api/questions`

**查询参数**：

| 参数 | 类型 | 说明 |
|-----|------|-----|
| surveyId | number | 问卷ID |

---

### 更新题目

**PUT** `/api/questions/:id`

---

### 删除题目

**DELETE** `/api/questions/:id`

---

## 密码模块 (Password)

### 验证密码（H5调用）

**POST** `/api/password/verify`

**请求体**：

```json
{
  "password": "abc12345",
  "surveyId": 1
}
```

**响应**：

```json
{
  "code": 200,
  "message": "验证成功",
  "data": {
    "valid": true,
    "survey": {
      "id": 1,
      "title": "问卷标题",
      "slug": "test123"
    }
  }
}
```

---

### 生成密码（管理后台）

**POST** `/api/password/generate`

**请求体**：

```json
{
  "surveyId": 1,
  "count": 10
}
```

**响应**：

```json
{
  "code": 200,
  "message": "生成成功",
  "data": {
    "passwords": ["abc12345", "def67890", ...]
  }
}
```

---

### 获取密码列表

**GET** `/api/password/list`

**查询参数**：

| 参数 | 类型 | 说明 | 默认值 |
|-----|------|-----|-------|
| surveyId | number | 问卷ID | - |
| status | number | 状态 | - |
| page | number | 页码 | 1 |
| limit | number | 每页数量 | 50 |

---

### 批量删除密码

**DELETE** `/api/password/batch`

**请求体**：

```json
{
  "ids": [1, 2, 3]
}
```

---

## 答题模块 (Answer)

### 提交答案（H5调用）

**POST** `/api/answer/submit`

**请求体**：

```json
{
  "surveyId": 1,
  "password": "abc12345",
  "answers": [
    {
      "questionId": 1,
      "optionIds": [1, 2]
    }
  ]
}
```

**响应**：

```json
{
  "code": 200,
  "message": "提交成功",
  "data": {
    "resultType": "ESTJ",
    "resultTypeLabel": "管理者型",
    "resultScore": 85,
    "result": {
      "id": 1,
      "title": "管理者型",
      "description": "务实、果断、有组织能力",
      "tags": ["领导力", "执行力"],
      "recommendation": "您天生具有领导才能..."
    }
  }
}
```

---

## 结果模板模块 (Result)

### 创建结果模板

**POST** `/api/results`

**请求体**：

```json
{
  "surveyId": 1,
  "resultType": "ESTJ",
  "title": "管理者型",
  "description": "简短描述",
  "detailContent": "详细描述",
  "tags": ["标签1", "标签2"],
  "recommendation": "推荐建议"
}
```

---

### 获取结果模板列表

**GET** `/api/results`

**查询参数**：`surveyId`

---

### 更新结果模板

**PUT** `/api/results/:id`

---

### 删除结果模板

**DELETE** `/api/results/:id`

---

## 计分配置模块 (ScoreConfig)

> **说明**：当前版本支持两种计分模式：`vote`（投票制）和 `score`（累加制）。

### 获取或创建计分配置

**GET** `/api/score-config/:surveyId/or-create`

**响应**：

```json
{
  "code": 200,
  "data": {
    "id": 1,
    "surveyId": 1,
    "scoreMode": "vote",
    "tieBreaker": "first",
    "ranges": [],
    "isNew": false
  }
}
```

---

### 获取计分配置

**GET** `/api/score-config/:surveyId`

**响应**：

```json
{
  "code": 200,
  "data": {
    "id": 1,
    "surveyId": 1,
    "scoreMode": "vote",
    "tieBreaker": "first",
    "ranges": []
  }
}
```

---

### 保存计分配置

**POST** `/api/score-config`

**请求体**：

```json
{
  "surveyId": 1,
  "scoreMode": "vote",
  "tieBreaker": "first",
  "ranges": [],
  "remark": ""
}
```

**响应**：

```json
{
  "code": 200,
  "data": {
    "id": 1,
    "surveyId": 1,
    "scoreMode": "vote",
    "tieBreaker": "first",
    "ranges": [],
    "createdAt": "2026-02-10T10:00:00.000Z",
    "updatedAt": "2026-02-10T10:00:00.000Z"
  }
}
```

---

### 删除计分配置

**DELETE** `/api/score-config/:surveyId`

---

## 错误码详细说明

| 错误码 | 说明 | 处理建议 |
|-------|------|---------|
| 40001 | 密码为空 | 检查请求参数 |
| 40002 | 密码错误 | 确认密码是否正确 |
| 40003 | 密码已过期 | 联系管理员获取新密码 |
| 40004 | 问卷未发布 | 等待问卷发布 |
| 40005 | 问卷不存在 | 检查问卷ID |
| 40006 | 题目不完整 | 检查题目配置 |
| 40007 | 结果模板缺失 | 配置结果模板 |
| 50001 | 服务器错误 | 联系技术支持 |
