-- 创建 result_template 表
CREATE TABLE IF NOT EXISTS `result_template` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `survey_id` int unsigned NOT NULL COMMENT '问卷ID',
  `result_type` varchar(50) NOT NULL COMMENT '结果类型',
  `title` varchar(200) NOT NULL COMMENT '结果标题',
  `description` varchar(500) DEFAULT NULL COMMENT '简短描述',
  `image_url` varchar(500) DEFAULT NULL COMMENT '图片URL',
  `detail_content` text COMMENT '详细内容',
  `min_score` int DEFAULT NULL COMMENT '最小分数',
  `max_score` int DEFAULT NULL COMMENT '最大分数',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_survey_id` (`survey_id`),
  KEY `idx_result_type` (`result_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='结果模板表';

-- 插入测试数据
INSERT INTO `result_template` (`survey_id`, `result_type`, `title`, `description`, `detail_content`) VALUES
(1, 'Citrus', '日光柑橘调', '元气、少年感、直率、乐观', '你的灵魂像一颗在阳光下爆开的柠檬，充满无限的生命力。你乐观、直接，讨厌拐弯抹角。你就像夏日的微风，无论走到哪里都能驱散阴霾。你的内心住着一个永远长不大的少年，对世界永远保持着好奇与热情。'),
(1, 'Rose', '浪漫玫瑰调', '温柔、浪漫、优雅、细腻', '你的性格如同一朵清晨带露的玫瑰，温柔而富有诗意。你善于感知生活中的美好，对艺术和美有着独特的追求。你的内心细腻敏感，总是能捕捉到他人忽略的细节。'),
(1, 'Woody', '沉稳木质调', '稳重、睿智、内敛、深沉', '你的灵魂如同历经岁月沉淀的檀香，散发着沉稳而深邃的魅力。你不喜欢张扬，却有着让人安心的力量。你的思考深入而全面，总是能在纷繁复杂中找到本质。'),
(1, 'Lavender', '优雅薰衣草调', '平和、宁静、放松、舒适', '你的性格如同普罗旺斯的薰衣草田，宁静而优雅。你追求内心的平和，不喜欢激烈的冲突。你的存在本身就是一种治愈，让周围的人感到安心和放松。');
