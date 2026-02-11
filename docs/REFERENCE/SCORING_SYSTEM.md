# 计分系统文档

## 1. 系统概述

本系统支持两种简化的计分模式，满足大部分问卷测试场景。

### 核心特性

- **2种计分模式**：投票制、累加制
- **平局处理**：支持取第一个、随机选择、返回全部
- **分数区间**：累加制支持按分数区间匹配结果
- **向后兼容**：未配置计分配置时默认使用投票制

---

## 2. 计分模式详解

### 2.1 VOTE 模式（投票制）

**适用场景**：性格测试、偏好测试、MBTI等

**特点**：
- 统计各结果类型的选择次数
- 最高票数者获胜
- 支持平局处理

**配置示例**：
```json
{
  "scoreMode": "vote",
  "tieBreaker": "first"
}
```

**计算逻辑**：
- 用户每选一个选项，对应结果类型 +1 票
- 统计所有类型的票数
- 票数最高者为最终结果

**平局处理**：
| 值 | 说明 |
|---|------|
| `first` | 返回得分最高的第一个类型 |
| `random` | 随机选择一个 |
| `all` | 返回所有最高分类型（逗号分隔） |

---

### 2.2 SCORE 模式（累加制）

**适用场景**：NPS评分、满意度调查、评分类问卷

**特点**：
- 每个选项有对应的分值
- 累加所有选项分值得到总分
- 根据总分区间匹配结果

**配置示例**：
```json
{
  "scoreMode": "score",
  "ranges": [
    {"min": 9, "result": "promoter", "label": "推荐者"},
    {"min": 7, "max": 8, "result": "passive", "label": "中立者"},
    {"max": 6, "result": "detractor", "label": "贬损者"}
  ]
}
```

**区间配置说明**：
| 字段 | 类型 | 说明 |
|-----|------|------|
| min | number | 最小值（含），不传表示无限小 |
| max | number | 最大值（含），不传表示无限大 |
| result | string | 结果类型标识 |
| label | string | 结果标签 |

**区间匹配顺序**：按 `min` 值降序排序，优先匹配高分范围。

---

## 3. 选项配置

### 投票制选项配置

| 字段 | 说明 | 示例 |
|-----|------|------|
| content | 选项文字 | "我喜欢独处" |
| scoreType | 结果类型标识 | "A"、"ESTJ" |
| scoreValue | 分值（可选） | 默认为1 |

**示例**：
| 选项内容 | scoreType |
|---------|-----------|
| 喜欢社交活动 | A |
| 喜欢安静独处 | B |

---

### 累加制选项配置

| 字段 | 说明 | 示例 |
|-----|------|------|
| content | 选项文字 | "非常满意" |
| scoreValue | 分值（必填） | 5 |
| scoreType | 结果类型（可选） | promoter |

**示例**：
| 选项内容 | scoreValue |
|---------|-----------|
| 非常满意 | 5 |
| 满意 | 4 |
| 一般 | 3 |
| 不满意 | 2 |
| 非常不满意 | 1 |

---

## 4. API 接口

### 4.1 计分配置接口

| 方法 | 路径 | 说明 |
|-----|------|------|
| GET | `/api/score-config/:surveyId` | 获取计分配置 |
| GET | `/api/score-config/:surveyId/or-create` | 获取或创建计分配置 |
| POST | `/api/score-config` | 创建/更新计分配置 |
| PUT | `/api/score-config/:surveyId` | 更新计分配置 |
| DELETE | `/api/score-config/:surveyId` | 删除计分配置 |

---

### 4.2 创建/更新配置

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

### 4.3 答题提交响应

**POST** `/api/answer/submit`

**响应数据**：
```json
{
  "code": 200,
  "data": {
    "resultType": "A",
    "resultTypeLabel": null,
    "resultScore": 5,
    "scores": {"A": 3, "B": 2},
    "details": null,
    "result": {
      "id": 1,
      "title": "测试结果A",
      "description": "简短描述",
      "detailContent": "详细内容",
      "tags": ["标签1", "标签2"],
      "recommendation": "推荐建议"
    }
  }
}
```

**响应字段说明**：
| 字段 | 类型 | 说明 |
|-----|------|------|
| resultType | string | 结果类型标识 |
| resultTypeLabel | string | 结果标签（累加制） |
| resultScore | number | 总分/最高票数 |
| scores | object | 各类型票数或得分详情 |
| result | object | 结果模板内容 |

---

## 5. 数据库设计

### 5.1 survey_score_configs 表

```sql
CREATE TABLE `survey_score_configs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `survey_id` INT UNSIGNED NOT NULL COMMENT '问卷ID',
  `score_mode` VARCHAR(20) DEFAULT 'vote' COMMENT '计分模式: vote=投票制, score=累加制',
  `ranges` JSON DEFAULT NULL COMMENT '分数区间配置（累加制用）',
  `tie_breaker` VARCHAR(20) DEFAULT 'first' COMMENT '平局处理方式',
  `remark` TEXT DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_survey_id` (`survey_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 6. 管理后台配置

### 6.1 配置步骤

1. 进入 **问卷管理**，找到目标问卷
2. 点击 **计分配置** 按钮
3. 选择计分模式：
   - **投票制**：适用于性格测试、偏好测试
   - **累加制**：适用于评分问卷、NPS
4. 设置平局处理方式（投票制）
5. 配置分数区间（累加制）
6. 保存配置

### 6.2 配置累加制分数区间

```
分数区间示例（NPS）：
- 9分及以上 → 推荐者
- 7-8分 → 中立者
- 0-6分 → 贬损者

JSON配置：
[
  {"min": 9, "result": "promoter", "label": "推荐者"},
  {"min": 7, "max": 8, "result": "passive", "label": "中立者"},
  {"max": 6, "result": "detractor", "label": "贬损者"}
]
```

---

## 7. 使用示例

### 7.1 性格测试（投票制）

**问卷**：测测你是"早起鸟"还是"夜猫子"

**配置**：
```json
{
  "scoreMode": "vote",
  "tieBreaker": "first"
}
```

**选项**：
| 选项内容 | scoreType |
|---------|-----------|
| 我早上精力最充沛 | 早起鸟 |
| 我晚上思维最活跃 | 夜猫子 |

**计算**：统计"早起鸟"和"夜猫子"的票数，票高者获胜。

---

### 7.2 NPS评分（累加制）

**问卷**：满意度调查（5题，每题0-10分）

**配置**：
```json
{
  "scoreMode": "score",
  "ranges": [
    {"min": 40, "result": "very_satisfied", "label": "非常满意"},
    {"min": 30, "max": 39, "result": "satisfied", "label": "满意"},
    {"min": 20, "max": 29, "result": "neutral", "label": "一般"},
    {"max": 19, "result": "dissatisfied", "label": "不满意"}
  ]
}
```

**选项**：
| 题目 | 选项分值 |
|-----|---------|
| 题1 | 0-10 |
| 题2 | 0-10 |
| 题3 | 0-10 |
| 题4 | 0-10 |
| 题5 | 0-10 |

**计算**：5题总分40-50分 → "非常满意"；0-19分 → "不满意"。

---

## 8. 常见问题

### Q1: 选择哪种计分模式？

| 场景 | 推荐模式 |
|-----|---------|
| 性格测试、偏好测试 | 投票制 |
| NPS、满意度评分 | 累加制 |
| MBTI风格测试 | 投票制 |

### Q2: 累加制的分数区间如何配置？

- 按分数从高到低配置
- `min` 表示最低分（含），`max` 表示最高分（含）
- 不传 `min` 表示无限小，不传 `max` 表示无限大

### Q3: 投票制如何处理平局？

在"平局处理"设置中选择：
- **取第一个**：返回得分最高的第一个类型（推荐）
- **随机选择**：随机选择一个
- **返回全部**：返回所有最高分类型（逗号分隔）

### Q4: 没有配置结果模板会怎样？

系统会返回默认结果：
```json
{
  "title": "{resultType}型",
  "description": "您的性格特质分析结果",
  "detailContent": "根据您的回答，您展现了典型的{resultType}型性格特质..."
}
```

---

## 9. 版本历史

| 版本 | 日期 | 变更 |
|-----|------|------|
| 2.0 | 2026-02-10 | 简化为两种计分模式 |
| 1.0 | 2024-02-05 | 初始版本，支持6种计分模式 |
