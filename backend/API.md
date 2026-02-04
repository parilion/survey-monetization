# 小红书问卷测试系统 - API 文档

基础URL: `http://localhost:3000/api`

## 1. 密码管理 `/password`

### 1.1 验证密码（H5用户端）
```
POST /api/password/verify
Content-Type: application/json

{
  "password": "ABC12345"
}

响应:
{
  "code": 200,
  "message": "验证成功",
  "data": {
    "passwordId": 1,
    "surveyId": 1,
    "survey": {...},
    "expiresAt": "2026-02-05T07:00:00.000Z"
  }
}
```

### 1.2 批量生成密码（管理后台）
```
POST /api/password/generate

{
  "surveyId": 1,
  "count": 100
}
```

### 1.3 获取密码列表（管理后台）
```
GET /api/password/list?surveyId=1&status=0&page=1&limit=50
```

### 1.4 批量删除密码（管理后台）
```
DELETE /api/password/batch

{
  "ids": [1, 2, 3]
}
```

## 2. 问卷管理 `/survey`

### 2.1 创建问卷
```
POST /api/survey

{
  "title": "你是哪种香水性格?",
  "description": "测试描述",
  "introText": "引导文案",
  "introImage": "图片URL",
  "status": 1
}
```

### 2.2 获取问卷列表
```
GET /api/survey?page=1&limit=20&status=1
```

### 2.3 获取问卷详情
```
GET /api/survey/:id
```

### 2.4 获取问卷详情（包含题目）
```
GET /api/survey/:id/with-questions
```

### 2.5 更新问卷
```
PUT /api/survey/:id

{
  "title": "新标题"
}
```

### 2.6 删除问卷
```
DELETE /api/survey/:id
```

## 3. 题目管理 `/question`

### 3.1 创建题目
```
POST /api/question

{
  "surveyId": 1,
  "title": "你喜欢的香型是?",
  "questionType": "single",
  "sortOrder": 1,
  "isRequired": 1,
  "options": [
    {
      "content": "清新柑橘",
      "scoreType": "Citrus",
      "sortOrder": 0
    },
    {
      "content": "浪漫玫瑰",
      "scoreType": "Rose",
      "sortOrder": 1
    }
  ]
}
```

### 3.2 批量创建题目
```
POST /api/question/batch

{
  "surveyId": 1,
  "questions": [...]
}
```

### 3.3 获取题目列表
```
GET /api/question?surveyId=1
```

### 3.4 获取题目详情
```
GET /api/question/:id
```

### 3.5 更新题目
```
PUT /api/question/:id

{
  "title": "新题目",
  "options": [...]
}
```

### 3.6 删除题目
```
DELETE /api/question/:id
```

### 3.7 批量删除题目
```
DELETE /api/question/batch

{
  "ids": [1, 2, 3]
}
```

## 4. 答题管理 `/answer`

### 4.1 提交答题结果（H5用户端）
```
POST /api/answer/submit

{
  "passwordId": 1,
  "surveyId": 1,
  "answers": [
    {
      "questionId": 1,
      "optionId": 2
    },
    {
      "questionId": 2,
      "optionId": 5
    }
  ]
}

响应:
{
  "code": 200,
  "message": "提交成功",
  "data": {
    "recordId": 1,
    "resultType": "Citrus",
    "resultScore": 15,
    "scores": {
      "Citrus": 15,
      "Rose": 10,
      "Lavender": 5
    },
    "result": {
      "id": 1,
      "title": "清新柑橘型",
      "description": "你是...",
      "imageUrl": "...",
      "detailContent": "..."
    }
  }
}
```

### 4.2 获取答题结果（H5用户端）
```
GET /api/answer/result/:passwordId
```

### 4.3 获取答题记录列表（管理后台）
```
GET /api/answer/list?surveyId=1&page=1&limit=50
```

### 4.4 获取答题详情（管理后台）
```
GET /api/answer/:id
```

## 5. 结果模板管理 `/result`

### 5.1 创建结果模板
```
POST /api/result

{
  "surveyId": 1,
  "resultType": "Citrus",
  "title": "清新柑橘型",
  "description": "简短描述",
  "imageUrl": "图片URL",
  "detailContent": "详细内容（富文本）",
  "minScore": 0,
  "maxScore": 30
}
```

### 5.2 获取结果模板列表
```
GET /api/result?surveyId=1
```

### 5.3 获取结果模板详情
```
GET /api/result/:id
```

### 5.4 更新结果模板
```
PUT /api/result/:id

{
  "title": "新标题"
}
```

### 5.5 删除结果模板
```
DELETE /api/result/:id
```

## 错误响应格式

```json
{
  "code": 400,
  "message": "错误信息",
  "timestamp": "2026-02-04T12:00:00.000Z"
}
```

## 常见状态码

- 200: 成功
- 400: 请求参数错误
- 404: 资源不存在
- 500: 服务器内部错误

## 注意事项

1. 所有请求和响应的 Content-Type 均为 `application/json`
2. 密码有效期为12小时（可在环境变量中配置）
3. 密码使用后状态会变为"已使用"，不可重复使用
4. 答题记录一旦提交完成，不可修改（可重新生成密码重测）
5. 删除问卷会级联删除相关的题目、选项、结果模板、密码等数据
