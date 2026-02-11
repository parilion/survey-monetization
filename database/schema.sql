-- 小红书问卷测试付费系统 - 数据库表结构
-- 创建时间: 2026-02-04
-- MySQL 8.0+
-- 表数量: 10

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `redbook_survey` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `redbook_survey`;

-- ============================================
-- 1. 管理员表
-- ============================================
CREATE TABLE `admin_users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '管理员ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码(bcrypt加密)',
  `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0=禁用, 1=启用',
  `last_login_at` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';

-- 插入默认管理员 (密码: admin123, 需要在应用中使用bcrypt加密)
INSERT INTO `admin_users` (`username`, `password`, `nickname`, `status`)
VALUES ('admin', '$2b$10$XqzW8QJ9Y.K9KZ9X9X9X9euZ9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9', '超级管理员', 1);

-- ============================================
-- 2. 问卷表
-- ============================================
CREATE TABLE `surveys` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '问卷ID',
  `slug` VARCHAR(50) NOT NULL COMMENT '问卷短码，用于URL唯一标识',
  `title` VARCHAR(200) NOT NULL COMMENT '问卷标题',
  `description` TEXT DEFAULT NULL COMMENT '问卷描述',
  `intro_image` VARCHAR(500) DEFAULT NULL COMMENT '引导页图片URL',
  `intro_text` TEXT DEFAULT NULL COMMENT '引导页文案',
  `intro_title` VARCHAR(200) DEFAULT NULL COMMENT '介绍页大标题',
  `intro_subtitle` VARCHAR(200) DEFAULT NULL COMMENT '介绍页副标题',
  `intro_button_text` VARCHAR(50) DEFAULT NULL COMMENT '介绍页按钮文字',
  `total_questions` INT NOT NULL DEFAULT 0 COMMENT '题目总数',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0=禁用, 1=启用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_slug` (`slug`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='问卷表';

-- ============================================
-- 3. 题目表
-- ============================================
CREATE TABLE `questions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '题目ID',
  `survey_id` INT UNSIGNED NOT NULL COMMENT '所属问卷ID',
  `title` TEXT NOT NULL COMMENT '题目标题',
  `question_type` VARCHAR(20) NOT NULL DEFAULT 'single' COMMENT '题目类型: single=单选, multiple=多选',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序顺序(从1开始)',
  `is_required` TINYINT NOT NULL DEFAULT 1 COMMENT '是否必答: 0=否, 1=是',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_survey_sort` (`survey_id`, `sort_order`),
  CONSTRAINT `fk_questions_survey` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='题目表';

-- ============================================
-- 4. 选项表
-- ============================================
CREATE TABLE `options` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '选项ID',
  `question_id` INT UNSIGNED NOT NULL COMMENT '所属题目ID',
  `content` TEXT NOT NULL COMMENT '选项内容',
  `score_type` VARCHAR(50) DEFAULT NULL COMMENT '计分类型(用于结果计算, 如: Citrus, Rose, Lavender)',
  `score_value` INT NOT NULL DEFAULT 1 COMMENT '计分分值（加权计分用）',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序顺序',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_question` (`question_id`),
  CONSTRAINT `fk_options_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='选项表';

-- ============================================
-- 5. 结果模板表
-- ============================================
CREATE TABLE `result_templates` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '结果模板ID',
  `survey_id` INT UNSIGNED NOT NULL COMMENT '所属问卷ID',
  `result_type` VARCHAR(50) NOT NULL COMMENT '结果类型(与score_type对应, 如: Citrus, Rose)',
  `title` VARCHAR(200) NOT NULL COMMENT '结果标题',
  `description` TEXT DEFAULT NULL COMMENT '结果描述',
  `image_url` VARCHAR(500) DEFAULT NULL COMMENT '结果图片URL',
  `detail_content` LONGTEXT DEFAULT NULL COMMENT '详细内容(富文本)',
  `min_score` INT DEFAULT 0 COMMENT '最低分数(可选)',
  `max_score` INT DEFAULT 100 COMMENT '最高分数(可选)',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_survey_type` (`survey_id`, `result_type`),
  KEY `idx_survey` (`survey_id`),
  CONSTRAINT `fk_results_survey` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='结果模板表';

-- ============================================
-- 6. 密码表
-- ============================================
CREATE TABLE `access_passwords` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '密码ID',
  `survey_id` INT UNSIGNED NOT NULL COMMENT '所属问卷ID',
  `password` VARCHAR(50) NOT NULL COMMENT '访问密码',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0=可使用, 1=已过期',
  `generated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '生成时间',
  `expires_at` DATETIME NOT NULL COMMENT '过期时间(生成时间+12小时)',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_password` (`password`),
  KEY `idx_survey` (`survey_id`),
  KEY `idx_password_status` (`password`, `status`, `expires_at`),
  CONSTRAINT `fk_passwords_survey` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='访问密码表';

-- ============================================
-- 7. 答题记录表
-- ============================================
CREATE TABLE `answer_records` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `password_id` INT UNSIGNED NOT NULL COMMENT '密码ID',
  `survey_id` INT UNSIGNED NOT NULL COMMENT '问卷ID',
  `answers` JSON NOT NULL COMMENT '答题记录(JSON格式: [{questionId, optionId}])',
  `result_type` VARCHAR(50) DEFAULT NULL COMMENT '测试结果类型',
  `result_score` INT DEFAULT NULL COMMENT '测试结果分数',
  `dimension_scores` JSON DEFAULT NULL COMMENT '维度得分详情',
  `metric_scores` JSON DEFAULT NULL COMMENT 'KPI指标得分详情',
  `match_score` INT DEFAULT NULL COMMENT '匹配度分数',
  `completed_at` DATETIME DEFAULT NULL COMMENT '完成时间',
  `user_ip` VARCHAR(50) DEFAULT NULL COMMENT '用户IP',
  `user_agent` VARCHAR(500) DEFAULT NULL COMMENT '用户UA',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_password` (`password_id`),
  KEY `idx_survey_completed` (`survey_id`, `completed_at`),
  KEY `idx_result_type` (`result_type`),
  CONSTRAINT `fk_answers_password` FOREIGN KEY (`password_id`) REFERENCES `access_passwords` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_answers_survey` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='答题记录表';

-- ============================================
-- 8. 系统配置表 (可选,用于存储系统级配置)
-- ============================================
CREATE TABLE `system_configs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `config_key` VARCHAR(100) NOT NULL COMMENT '配置键',
  `config_value` TEXT DEFAULT NULL COMMENT '配置值',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '配置说明',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- 插入默认配置
INSERT INTO `system_configs` (`config_key`, `config_value`, `description`) VALUES
('password_validity_hours', '12', '密码有效期(小时)'),
('max_answer_time_hours', '24', '最长答题时间(小时)'),
('system_title', '小红书问卷测试系统', '系统标题');

-- ============================================
-- 9. 问卷计分配置表
-- ============================================
CREATE TABLE `survey_score_configs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `survey_id` INT UNSIGNED NOT NULL COMMENT '问卷ID',
  `score_mode` VARCHAR(20) NOT NULL DEFAULT 'vote' COMMENT '计分模式: vote=投票制, score=累加制',
  `ranges` JSON DEFAULT NULL COMMENT '分数区间配置（累加制用）',
  `tie_breaker` VARCHAR(20) NOT NULL DEFAULT 'first' COMMENT '平局处理方式：first=取第一个, random=随机, all=返回全部',
  `remark` TEXT DEFAULT NULL COMMENT '备注说明',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_survey_id` (`survey_id`),
  CONSTRAINT `fk_score_config_survey` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='问卷计分配置表';

-- ============================================
-- 10. 选项计分详情表
-- ============================================
CREATE TABLE `option_score_details` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '详情ID',
  `option_id` INT UNSIGNED NOT NULL COMMENT '选项ID',
  `score_mode` ENUM('vote', 'score') NOT NULL DEFAULT 'vote' COMMENT '适用的计分模式',
  `score_value` INT NOT NULL DEFAULT 1 COMMENT '基础分值',
  `target_types` JSON DEFAULT NULL COMMENT '目标类型列表（多选模式用）',
  `dimension_scores` JSON DEFAULT NULL COMMENT '维度得分 JSON',
  `metric_scores` JSON DEFAULT NULL COMMENT 'KPI指标得分 JSON',
  `formula_values` JSON DEFAULT NULL COMMENT '公式变量值 JSON',
  `mapped_type` VARCHAR(50) DEFAULT NULL COMMENT '映射结果类型（MAP模式）',
  `remark` VARCHAR(200) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_option_id` (`option_id`),
  CONSTRAINT `fk_score_detail_option` FOREIGN KEY (`option_id`) REFERENCES `options` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='选项计分详情表';

-- ============================================
-- 索引优化说明
-- ============================================
-- 1. access_passwords.idx_password_status: 用于密码验证查询优化
-- 2. answer_records.idx_survey_completed: 用于数据统计查询优化
-- 3. questions.idx_survey_sort: 用于按顺序获取题目优化

-- ============================================
-- 数据示例 (可选,用于开发测试)
-- ============================================
-- 创建示例问卷
INSERT INTO `surveys` (`slug`, `title`, `description`, `intro_text`, `total_questions`, `status`) VALUES
('perfume-test', '你是哪种香水性格?', '通过30道题目,测试你的独特香水性格', '欢迎来到香水性格测试! 通过简单的30道题目,我们将为你揭示你的独特性格特质。请根据真实感受作答,没有对错之分。', 30, 1);

-- ============================================
-- 注意事项
-- ============================================
-- 1. 管理员密码需要在应用中使用 bcrypt 加密后再插入
-- 2. JSON 字段需要 MySQL 5.7.8+ 支持
-- 3. 外键约束使用 CASCADE 删除,删除问卷时会自动删除相关数据
-- 4. 时间字段统一使用 DATETIME 类型
-- 5. 字符集统一使用 utf8mb4,支持 emoji
-- 6. 总共10张表: admin_users, surveys, questions, options, result_templates,
--    access_passwords, answer_records, system_configs, survey_score_configs, option_score_details
