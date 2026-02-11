-- =====================================================
-- 通用多维度评分系统数据库迁移脚本
-- 执行时间: 2024-XX-XX
-- =====================================================

-- =====================================================
-- 1. 扩展 options 表添加 score_value 字段
-- =====================================================
ALTER TABLE `options`
ADD COLUMN `score_value` INT DEFAULT 1 COMMENT '计分分值（加权计分用）' AFTER `score_type`;

-- =====================================================
-- 2. 创建 survey_score_configs 表（问卷计分配置）
-- =====================================================
CREATE TABLE IF NOT EXISTS `survey_score_configs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `survey_id` INT UNSIGNED NOT NULL COMMENT '问卷ID',
  `score_mode` ENUM('single', 'multi', 'range', 'map', 'multi_dimension', 'kpi', 'custom_formula') DEFAULT 'single' COMMENT '计分模式',
  `result_type_field` VARCHAR(50) DEFAULT NULL COMMENT '结果类型字段名，如 E/I 用于MBTI',
  `result_type_length` TINYINT DEFAULT 1 COMMENT '结果类型字符长度',
  `dimensions` JSON DEFAULT NULL COMMENT '维度配置',
  `ranges` JSON DEFAULT NULL COMMENT '范围配置（RANGE模式）',
  `metrics` JSON DEFAULT NULL COMMENT 'KPI指标配置',
  `grade_rules` JSON DEFAULT NULL COMMENT '等级规则（KPI模式）',
  `formula_template` TEXT DEFAULT NULL COMMENT '自定义计算公式',
  `tie_breaker` VARCHAR(20) DEFAULT 'first' COMMENT '平局处理方式',
  `remark` TEXT DEFAULT NULL COMMENT '备注说明',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_survey_id` (`survey_id`),
  KEY `idx_score_mode` (`score_mode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='问卷计分配置表';

-- =====================================================
-- 3. 创建 option_score_details 表（选项计分详情）
-- =====================================================
CREATE TABLE IF NOT EXISTS `option_score_details` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `option_id` INT UNSIGNED NOT NULL COMMENT '选项ID',
  `score_mode` ENUM('single', 'multi', 'range', 'map', 'multi_dimension', 'kpi', 'custom_formula') DEFAULT 'single' COMMENT '适用的计分模式',
  `score_value` INT DEFAULT 1 COMMENT '基础分值',
  `target_types` JSON DEFAULT NULL COMMENT '目标类型列表',
  `dimension_scores` JSON DEFAULT NULL COMMENT '维度得分',
  `metric_scores` JSON DEFAULT NULL COMMENT 'KPI指标得分',
  `formula_values` JSON DEFAULT NULL COMMENT '公式变量值',
  `mapped_type` VARCHAR(50) DEFAULT NULL COMMENT '映射结果类型（MAP模式）',
  `remark` VARCHAR(200) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_option_id` (`option_id`),
  KEY `idx_score_mode` (`score_mode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='选项计分详情表';

-- =====================================================
-- 4. 扩展 result_templates 表添加新字段
-- =====================================================
ALTER TABLE `result_templates`
ADD COLUMN `match_type` ENUM('highest', 'range', 'custom') DEFAULT 'highest' COMMENT '匹配方式' AFTER `max_score`,
ADD COLUMN `match_condition` JSON DEFAULT NULL COMMENT '匹配条件' AFTER `match_type`,
ADD COLUMN `dimension_scores` JSON DEFAULT NULL COMMENT '各维度期望得分' AFTER `match_condition`,
ADD COLUMN `tags` JSON DEFAULT NULL COMMENT '标签列表' AFTER `dimension_scores`,
ADD COLUMN `recommendation` TEXT DEFAULT NULL COMMENT '推荐内容/建议' AFTER `tags`,
ADD COLUMN `recommendation_url` VARCHAR(500) DEFAULT NULL COMMENT '推荐链接' AFTER `recommendation`,
ADD COLUMN `sort_order` INT DEFAULT 0 COMMENT '排序' AFTER `recommendation_url`;

-- =====================================================
-- 5. 扩展 answer_records 表添加新字段
-- =====================================================
ALTER TABLE `answer_records`
ADD COLUMN `dimension_scores` JSON DEFAULT NULL COMMENT '维度得分详情' AFTER `result_score`,
ADD COLUMN `metric_scores` JSON DEFAULT NULL COMMENT 'KPI指标得分详情' AFTER `dimension_scores`,
ADD COLUMN `match_score` INT DEFAULT NULL COMMENT '匹配度分数' AFTER `metric_scores`;

-- =====================================================
-- 6. MBTI 预设配置示例
-- =====================================================

-- MBTI 问卷计分配置
INSERT INTO `survey_score_configs` (
  `survey_id`, `score_mode`, `result_type_field`, `result_type_length`,
  `dimensions`, `tie_breaker`
) VALUES (
  2,  -- 替换为实际的 MBTI 问卷ID
  'multi_dimension',
  'E,I,S,N,T,F,J,P',
  4,
  '[
    {"key": "E", "label": "外向", "weight": 1, "inverse": false},
    {"key": "I", "label": "内向", "weight": 1, "inverse": true},
    {"key": "S", "label": "感觉", "weight": 1, "inverse": false},
    {"key": "N", "label": "直觉", "weight": 1, "inverse": true},
    {"key": "T", "label": "思考", "weight": 1, "inverse": false},
    {"key": "F", "label": "情感", "weight": 1, "inverse": true},
    {"key": "J", "label": "判断", "weight": 1, "inverse": false},
    {"key": "P", "label": "知觉", "weight": 1, "inverse": true}
  ]',
  'first'
);

-- =====================================================
-- 7. NPS 预设配置示例
-- =====================================================

-- NPS 问卷计分配置
INSERT INTO `survey_score_configs` (
  `survey_id`, `score_mode`, `ranges`
) VALUES (
  3,  -- 替换为实际的 NPS 问卷ID
  'range',
  '[
    {"min": 9, "result": "promoter", "label": "推荐者"},
    {"min": 7, "max": 8, "result": "passive", "label": "中立者"},
    {"max": 6, "result": "detractor", "label": "贬损者"}
  ]'
);

-- =====================================================
-- 8. KPI 预设配置示例
-- =====================================================

-- KPI 问卷计分配置
INSERT INTO `survey_score_configs` (
  `survey_id`, `score_mode`, `metrics`, `grade_rules`
) VALUES (
  4,  -- 替换为实际的 KPI 问卷ID
  'kpi',
  '[
    {"key": "efficiency", "label": "效率", "weight": 0.3},
    {"key": "quality", "label": "质量", "weight": 0.4},
    {"key": "teamwork", "label": "协作", "weight": 0.3}
  ]',
  '[
    {"min": 90, "grade": "S", "label": "卓越"},
    {"min": 80, "max": 89, "grade": "A", "label": "优秀"},
    {"min": 60, "max": 79, "grade": "B", "label": "合格"},
    {"min": 0, "max": 59, "grade": "C", "label": "待改进"}
  ]'
);

-- =====================================================
-- 9. MBTI 结果模板示例
-- =====================================================
INSERT INTO `result_templates` (
  `survey_id`, `result_type`, `title`, `description`, `image_url`,
  `match_type`, `dimension_scores`, `tags`, `recommendation`
) VALUES
(2, 'ESTJ', '管理者型', '务实、果断、有组织能力', NULL, 'custom', '{"E":8,"S":8,"T":8,"J":8}', ['领导力', '执行力'], '您天生具有领导才能，适合管理和组织工作。'),
(2, 'ENTJ', '指挥官型', '大胆、富有想象力、有强大的意志力', NULL, 'custom', '{"E":8,"N":8,"T":8,"J":8}', ['战略思维', '决策力'], '您是天生的领导者，具有远见卓识和强大的执行力。'),
(2, 'ESFJ', '执政官型', '热心肠、有责任感、善于社交', NULL, 'custom', '{"E":8,"S":8,"F":8,"J":8}', ['社交能力', '责任心'], '您热心助人，是团队中的凝聚力和调和剂。'),
-- ... 更多 MBTI 结果类型
(2, 'INTJ', '建筑师型', '富有想象力和战略性的思想家', NULL, 'custom', '{"I":8,"N":8,"T":8,"J":8}', ['独立思考', '战略规划'], '您具有深刻的洞察力和战略思维能力。');

-- =====================================================
-- 回滚脚本（如需回滚执行此部分）
-- =====================================================

-- DROP TABLE IF EXISTS `option_score_details`;
-- DROP TABLE IF EXISTS `survey_score_configs`;

-- ALTER TABLE `options` DROP COLUMN `score_value`;

-- ALTER TABLE `result_templates`
-- DROP COLUMN `match_type`,
-- DROP COLUMN `match_condition`,
-- DROP COLUMN `dimension_scores`,
-- DROP COLUMN `tags`,
-- DROP COLUMN `recommendation`,
-- DROP COLUMN `recommendation_url`,
-- DROP COLUMN `sort_order`;

-- ALTER TABLE `answer_records`
-- DROP COLUMN `dimension_scores`,
-- DROP COLUMN `metric_scores`,
-- DROP COLUMN `match_score`;
