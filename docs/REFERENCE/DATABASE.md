# 数据字典

本文档描述 RedBook 问卷系统的数据库表结构和字段说明。

## ER图

```
┌─────────────────┐       ┌─────────────────┐
│    surveys      │       │   questions     │
├─────────────────┤       ├─────────────────┤
│ id              │───┐   │ id              │
│ title           │   │   │ survey_id       │───┐
│ slug            │   │   │ title           │   │
│ status          │   │   │ order           │   │
│ introTitle      │   │   │ question_type   │   │
│ introSubtitle   │   └──│ options         │   │
│ introButtonText │       └─────────────────┘   │
│ created_at      │               │
└─────────────────┘               │
                                 ▼
┌─────────────────┐       ┌─────────────────┐
│  result_templates│      │     options     │
├─────────────────┤       ├─────────────────┤
│ id              │       │ id              │
│ survey_id       │       │ question_id     │
│ result_type     │       │ content         │
│ title           │       │ score_value     │
│ description     │       │ score_type      │
│ tags            │       └─────────────────┘
│ recommendation  │
└─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│ access_passwords │       │survey_score_   │
├─────────────────┤       │configs         │
│ id              │       ├─────────────────┤
│ survey_id       │       │ id              │
│ password        │       │ survey_id       │
│ status          │       │ score_mode      │
│ expires_at      │       │ ranges          │
└─────────────────┘       │ tie_breaker     │
                          └─────────────────┘

┌─────────────────┐
│answer_records   │  (仅保留结构，不存储新数据)
├─────────────────┤
│ id              │
│ survey_id       │
│ password_id     │
│ answers         │
│ result_type     │
│ result_score    │
└─────────────────┘
```

┌─────────────────┐
│survey_score_    │
│configs          │
├─────────────────┤
│ id              │
│ survey_id       │
│ score_mode      │  简化版：vote / score
│ ranges         │
│ tie_breaker     │
└─────────────────┘
```

---

## 表结构

### surveys（问卷表）

存储问卷基本信息。

```sql
CREATE TABLE `surveys` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(100) NOT NULL COMMENT '问卷标题',
  `slug` VARCHAR(50) NOT NULL COMMENT 'URL短码',
  `status` TINYINT DEFAULT 0 COMMENT '状态: 0=草稿, 1=已发布',
  `intro_title` VARCHAR(200) DEFAULT NULL COMMENT '介绍页标题',
  `intro_subtitle` VARCHAR(500) DEFAULT NULL COMMENT '介绍页副标题',
  `intro_button_text` VARCHAR(50) DEFAULT NULL COMMENT '介绍页按钮文字',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

| 字段 | 类型 | 约束 | 默认值 | 说明 |
|-----|------|-----|-------|------|
| id | INT | PRIMARY | AUTO | 问卷ID |
| title | VARCHAR(100) | NOT NULL | - | 问卷标题 |
| slug | VARCHAR(50) | UNIQUE | - | URL短码 |
| status | TINYINT | DEFAULT 0 | 0=草稿, 1=已发布 |
| intro_title | VARCHAR(200) | NULL | - | 介绍页标题 |
| intro_subtitle | VARCHAR(500 - | 介绍页副标题 |
) | NULL || intro_button_text | VARCHAR(50) | NULL | - | 按钮文字 |
| created_at | DATETIME | DEFAULT | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT + UPDATE | CURRENT_TIMESTAMP | 更新时间 |

---

### questions（题目表）

存储问卷题目。

```sql
CREATE TABLE `questions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `survey_id` INT UNSIGNED NOT NULL COMMENT '问卷ID',
  `title` VARCHAR(500) NOT NULL COMMENT '题目内容',
  `order` INT DEFAULT 0 COMMENT '排序序号',
  `question_type` ENUM('single', 'multi') DEFAULT 'single' COMMENT '题目类型',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_survey_id` (`survey_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

| 字段 | 类型 | 约束 | 说明 |
|-----|------|-----|------|
| id | INT | PRIMARY | 题目ID |
| survey_id | INT | NOT NULL | 所属问卷ID |
| title | VARCHAR(500) | NOT NULL | 题目内容 |
| order | INT | DEFAULT 0 | 排序序号 |
| question_type | ENUM | DEFAULT 'single' | single=单选, multi=多选 |
| created_at | DATETIME | DEFAULT | 创建时间 |
| updated_at | DATETIME | DEFAULT + UPDATE | 更新时间 |

---

### options（选项表）

存储题目选项。

```sql
CREATE TABLE `options` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `question_id` INT UNSIGNED NOT NULL COMMENT '题目ID',
  `content` TEXT NOT NULL COMMENT '选项内容',
  `score_value` INT DEFAULT 1 COMMENT '计分分值',
  `score_type` VARCHAR(50) DEFAULT NULL COMMENT '结果类型标识',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_question_id` (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | INT | 选项ID |
| question_id | INT | 所属题目ID |
| content | TEXT | 选项文字 |
| score_value | INT | 计分分值，默认1 |
| score_type | VARCHAR(50) | 结果类型标识，用于匹配结果模板 |
| sort_order | INT | 排序 |

> **说明**：当前版本只使用上述字段。其他字段（target_types、mapped_type、dimension_scores等）已移除。

---

### result_templates（结果模板表）

存储测试结果模板。

```sql
CREATE TABLE `result_templates` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `survey_id` INT UNSIGNED NOT NULL COMMENT '问卷ID',
  `result_type` VARCHAR(50) NOT NULL COMMENT '结果类型标识',
  `title` VARCHAR(100) NOT NULL COMMENT '结果标题',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '简短描述',
  `detail_content` TEXT DEFAULT NULL COMMENT '详细内容',
  `image_url` VARCHAR(500) DEFAULT NULL COMMENT '结果图片',
  `match_type` ENUM('highest', 'range', 'custom') DEFAULT 'highest' COMMENT '匹配方式',
  `match_condition` JSON DEFAULT NULL COMMENT '匹配条件',
  `dimension_scores` JSON DEFAULT NULL COMMENT '各维度期望得分',
  `tags` JSON DEFAULT NULL COMMENT '标签列表',
  `recommendation` TEXT DEFAULT NULL COMMENT '推荐内容',
  `recommendation_url` VARCHAR(500) DEFAULT NULL COMMENT '推荐链接',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_survey_type` (`survey_id`, `result_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | INT | 模板ID |
| survey_id | INT | 所属问卷ID |
| result_type | VARCHAR(50) | 结果类型标识 |
| title | VARCHAR(100) | 结果标题 |
| description | VARCHAR(500) | 简短描述 |
| detail_content | TEXT | 详细内容 |
| image_url | VARCHAR(500) | 结果图片URL |
| match_type | ENUM | highest/range/custom |
| match_condition | JSON | 匹配条件 |
| dimension_scores | JSON | 期望维度得分 |
| tags | JSON | 标签列表 |
| recommendation | TEXT | 推荐建议 |
| recommendation_url | VARCHAR(500) | 推荐链接 |
| sort_order | INT | 排序 |

> **说明**：当前版本通过 `result_type` 精确匹配结果模板，以下字段保留但不使用：match_type、match_condition、dimension_scores、min_score、max_score。

---

### access_passwords（访问密码表）

存储访问密码。

```sql
CREATE TABLE `access_passwords` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `survey_id` INT UNSIGNED NOT NULL COMMENT '问卷ID',
  `password` VARCHAR(50) NOT NULL COMMENT '密码',
  `status` TINYINT DEFAULT 0 COMMENT '状态: 0=可使用, 1=已过期',
  `expires_at` DATETIME NOT NULL COMMENT '过期时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_survey_id` (`survey_id`),
  KEY `idx_password` (`password`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | INT | 密码ID |
| survey_id | INT | 所属问卷ID |
| password | VARCHAR(50) | 访问密码 |
| status | TINYINT | 0=可使用, 1=已过期 |
| expires_at | DATETIME | 过期时间 |
| created_at | DATETIME | 创建时间 |

---

### answer_records（答题记录表）

> **注意**：当前版本答题记录不持久化存储，仅保留表结构以兼容旧数据。

```sql
CREATE TABLE `answer_records` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `survey_id` INT UNSIGNED NOT NULL COMMENT '问卷ID',
  `password_id` INT UNSIGNED NOT NULL COMMENT '密码ID',
  `answers` JSON DEFAULT NULL COMMENT '答题记录JSON',
  `result_type` VARCHAR(50) DEFAULT NULL COMMENT '结果类型',
  `result_score` INT DEFAULT NULL COMMENT '结果得分',
  `completed_at` DATETIME DEFAULT NULL COMMENT '完成时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_survey_id` (`survey_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | INT | 记录ID |
| survey_id | INT | 问卷ID |
| password_id | INT | 密码ID |
| answers | JSON | 答题详情 |
| result_type | VARCHAR(50) | 结果类型 |
| result_score | INT | 结果得分 |
| completed_at | DATETIME | 完成时间 |
| created_at | DATETIME | 记录创建时间 |

> **说明**：当前版本不再存储答题记录，以下字段保留但不使用：dimension_scores、metric_scores、match_score、user_ip、user_agent。

```sql
CREATE TABLE `answer_records` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `survey_id` INT UNSIGNED NOT NULL COMMENT '问卷ID',
  `password_id` INT UNSIGNED DEFAULT NULL COMMENT '密码ID',
  `answers` JSON DEFAULT NULL COMMENT '答案详情',
  `dimension_scores` JSON DEFAULT NULL COMMENT '维度得分',
  `metric_scores` JSON DEFAULT NULL COMMENT '指标得分',
  `result_type` VARCHAR(50) DEFAULT NULL COMMENT '结果类型',
  `result_score` INT DEFAULT NULL COMMENT '结果得分',
  `match_score` INT DEFAULT NULL COMMENT '匹配度',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_survey_id` (`survey_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | INT | 记录ID |
| survey_id | INT | 问卷ID |
| password_id | INT | 密码ID |
| answers | JSON | 答案详情 |
| dimension_scores | JSON | 维度得分 |
| metric_scores | JSON | 指标得分 |
| result_type | VARCHAR(50) | 结果类型 |
| result_score | INT | 结果得分 |
| match_score | INT | 匹配度分数 |
| created_at | DATETIME | 答题时间 |

---

### survey_score_configs（问卷计分配置表）

> **说明**：当前版本只使用 `score_mode`、`ranges` 和 `tie_breaker` 字段，其他字段保留但不使用。

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

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | INT | 配置ID |
| survey_id | INT | 问卷ID |
| score_mode | VARCHAR(20) | vote=投票制, score=累加制 |
| ranges | JSON | 分数区间配置（累加制用） |
| tie_breaker | VARCHAR(20) | 平局处理方式 |
| remark | TEXT | 备注 |

---

### option_score_details（选项计分详情表）

> **说明**：当前版本不再使用此表，保留表结构以兼容旧数据。

```sql
CREATE TABLE `option_score_details` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `option_id` INT UNSIGNED NOT NULL COMMENT '选项ID',
  `dimension_scores` JSON DEFAULT NULL COMMENT '维度得分详情',
  `metric_scores` JSON DEFAULT NULL COMMENT '指标得分详情',
  `formula_values` JSON DEFAULT NULL COMMENT '公式变量值',
  `target_types` JSON DEFAULT NULL COMMENT '目标类型数组',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_option_id` (`option_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | INT | 详情ID |
| option_id | INT | 选项ID |
| dimension_scores | JSON | 维度得分 |
| metric_scores | JSON | 指标得分 |
| formula_values | JSON | 公式变量 |
| target_types | JSON | 目标类型 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

---

### admin_users（管理员表）

```sql
CREATE TABLE `admin_users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(100) NOT NULL COMMENT '密码(bcrypt)',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 枚举值说明

### status（问卷状态）

| 值 | 说明 |
|---|------|
| 0 | 草稿 |
| 1 | 已发布 |

### question_type（题目类型）

| 值 | 说明 |
|---|------|
| single | 单选 |
| multi | 多选 |

### password_status（密码状态）

| 值 | 说明 |
|---|------|
| 0 | 可使用 |
| 1 | 已过期 |

### score_mode（计分模式）

> **说明**：当前版本只使用 `vote` 和 `score` 两种模式。

| 值 | 说明 |
|---|------|
| vote | 投票制：统计各类型选择次数 |
| score | 累加制：分值累加后按区间匹配 |

### match_type（结果匹配方式）

> **说明**：此枚举在简化版系统中不再使用，保留以兼容旧数据。

| 值 | 说明 |
|---|------|
| highest | 最高分匹配 |
| range | 范围匹配 |
| custom | 自定义匹配 |

---

## 索引优化建议

```sql
-- 密码查询优化
CREATE INDEX idx_password_status ON access_passwords(status, expires_at);

-- 答题记录查询优化
CREATE INDEX idx_answer_survey ON answer_records(survey_id, created_at);

-- 问卷slug查询优化
CREATE INDEX idx_slug ON surveys(slug);
```
