-- 失效分析智能辅助平台 - 初始化数据
-- 版本：2.0
-- 创建时间：2024-01-01

-- 插入默认角色
INSERT INTO `sys_role` (`role_name`, `role_code`, `description`) VALUES
('超级管理员', 'SUPER_ADMIN', '系统超级管理员，拥有所有权限'),
('系统管理员', 'ADMIN', '系统管理员，负责用户和系统配置管理'),
('失效分析工程师', 'FA_ENGINEER', '失效分析工程师，负责案例分析和处理'),
('质量工程师', 'QUALITY_ENGINEER', '质量工程师，负责质量相关分析'),
('审核员', 'REVIEWER', '审核员，负责报告和案例审核'),
('普通用户', 'USER', '普通用户，只能查看相关信息');

-- 插入默认管理员用户
INSERT INTO `sys_user` (`username`, `password`, `real_name`, `email`, `department`, `position`, `status`) VALUES
('admin', '$2a$10$7JB720yubVSOfvVWbfXCOOxjTOQcQjmrJF1ZM4nAVccp/.rkMlDWy', '系统管理员', 'admin@smartfa.com', 'IT部门', '系统管理员', 1),
('fa_engineer', '$2a$10$7JB720yubVSOfvVWbfXCOOxjTOQcQjmrJF1ZM4nAVccp/.rkMlDWy', '失效分析工程师', 'fa@smartfa.com', '技术部', '高级工程师', 1);

-- 分配角色给用户
INSERT INTO `sys_user_role` (`user_id`, `role_id`) VALUES
(1, 1), -- admin -> SUPER_ADMIN
(2, 3); -- fa_engineer -> FA_ENGINEER

-- 插入系统配置
INSERT INTO `sys_config` (`config_key`, `config_value`, `config_type`, `description`, `is_system`) VALUES
('system.name', '失效分析智能辅助平台', 'STRING', '系统名称', 1),
('system.version', '1.0.0', 'STRING', '系统版本', 1),
('file.upload.max_size', '104857600', 'NUMBER', '文件上传最大大小（字节）', 1),
('file.upload.allowed_types', 'pdf,doc,docx,xls,xlsx,png,jpg,jpeg,gif,mp4,avi,mp3,wav', 'STRING', '允许上传的文件类型', 1),
('ai.llm.model', 'gpt-3.5-turbo', 'STRING', '默认LLM模型', 1),
('ai.llm.max_tokens', '4096', 'NUMBER', 'LLM最大token数', 1),
('ai.llm.temperature', '0.7', 'NUMBER', 'LLM温度参数', 1),
('case.auto_number', 'FA{yyyyMMdd}{0000}', 'STRING', '案例编号生成规则', 1),
('task.auto_number', 'TASK{yyyyMMdd}{0000}', 'STRING', '任务编号生成规则', 1),
('report.auto_number', 'RPT{yyyyMMdd}{0000}', 'STRING', '报告编号生成规则', 1);

-- 插入默认智能体
INSERT INTO `fa_agent` (`agent_name`, `agent_type`, `description`, `capabilities`, `model_config`, `status`) VALUES
('文档分析专家', 'ANALYSIS', '专门负责文档内容分析和信息提取的智能体', 
 JSON_ARRAY('文档解析', '文本提取', '语义分析', '关键信息识别'),
 JSON_OBJECT('model', 'gpt-3.5-turbo', 'temperature', 0.3, 'max_tokens', 2048),
 'ACTIVE'),
('图像分析专家', 'ANALYSIS', '专门负责图像分析和视觉检测的智能体',
 JSON_ARRAY('图像识别', '缺陷检测', '尺寸测量', '特征提取'),
 JSON_OBJECT('model', 'claude-3', 'temperature', 0.2, 'max_tokens', 1024),
 'ACTIVE'),
('失效模式专家', 'EXPERT', '失效分析领域专家，提供专业的失效分析和建议',
 JSON_ARRAY('失效模式识别', '失效机理分析', '预防措施建议', '标准解读'),
 JSON_OBJECT('model', 'gpt-4', 'temperature', 0.1, 'max_tokens', 3072),
 'ACTIVE'),
('质量标准专家', 'EXPERT', '质量标准和规范专家',
 JSON_ARRAY('标准解读', '合规检查', '质量评估', '标准对比'),
 JSON_OBJECT('model', 'gpt-3.5-turbo', 'temperature', 0.1, 'max_tokens', 2048),
 'ACTIVE'),
('任务协调者', 'COORDINATOR', '负责任务分解和智能体协调的智能体',
 JSON_ARRAY('任务分解', '资源调度', '进度监控', '结果整合'),
 JSON_OBJECT('model', 'gpt-3.5-turbo', 'temperature', 0.5, 'max_tokens', 1536),
 'ACTIVE');

-- 插入知识库基础数据
INSERT INTO `fa_knowledge` (`title`, `category`, `content`, `keywords`, `failure_mode`, `failure_mechanism`, `reference_type`, `status`, `creator_id`) VALUES
('失效分析基本流程', '方法论', '失效分析是一个系统性的过程，包括问题定义、数据收集、原因分析、验证测试和报告编写等步骤。每个步骤都需要严格按照规范执行，确保分析结果的准确性和可靠性。', '失效分析,流程,方法论,步骤', 'N/A', 'N/A', 'EXPERIENCE', 'ACTIVE', 1),
('常见失效模式分类', '失效模式', '根据失效的性质和表现形式，失效模式可以分为：断裂失效、变形失效、腐蚀失效、磨损失效、疲劳失效等。每种失效模式都有其特定的特征和分析方法。', '失效模式,分类,断裂,变形,腐蚀,磨损,疲劳', '多种失效模式', '多种失效机理', 'EXPERIENCE', 'ACTIVE', 1),
('材料疲劳失效机理', '失效机理', '疲劳失效是材料在循环载荷作用下逐渐产生损伤并最终导致断裂的过程。疲劳过程通常包括裂纹萌生、裂纹扩展和最终断裂三个阶段。', '疲劳,循环载荷,裂纹萌生,裂纹扩展,断裂', '疲劳失效', '循环载荷损伤', 'EXPERIENCE', 'ACTIVE', 1),
('断口分析技术', '分析技术', '断口分析是失效分析的重要手段，包括宏观断口分析和微观断口分析。常用的分析设备有扫描电子显微镜(SEM)、能谱仪(EDS)等。', '断口分析,宏观分析,微观分析,SEM,EDS', '断裂失效', '多种失效机理', 'STANDARD', 'ACTIVE', 1);

-- 创建索引优化查询性能
CREATE INDEX `idx_fa_case_create_time` ON `fa_case` (`create_time`);
CREATE INDEX `idx_fa_file_create_time` ON `fa_file` (`create_time`);
CREATE INDEX `idx_fa_task_create_time` ON `fa_task` (`create_time`);
CREATE INDEX `idx_fa_agent_create_time` ON `fa_agent` (`create_time`);
CREATE INDEX `idx_fa_knowledge_create_time` ON `fa_knowledge` (`create_time`);
CREATE INDEX `idx_fa_report_create_time` ON `fa_report` (`create_time`);
CREATE INDEX `idx_sys_operation_log_create_time` ON `sys_operation_log` (`create_time`);

-- 创建复合索引
CREATE INDEX `idx_fa_case_status_creator` ON `fa_case` (`status`, `creator_id`);
CREATE INDEX `idx_fa_task_status_assignee` ON `fa_task` (`status`, `assignee_id`);
CREATE INDEX `idx_fa_file_case_status` ON `fa_file` (`case_id`, `analysis_status`);
CREATE INDEX `idx_fa_agent_task_status` ON `fa_agent_task` (`agent_id`, `status`);