-- 失效分析智能辅助平台 - 基础数据表结构
-- 版本：1.0
-- 创建时间：2024-01-01

-- 用户表
CREATE TABLE `sys_user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `password` VARCHAR(100) NOT NULL COMMENT '密码',
    `real_name` VARCHAR(50) COMMENT '真实姓名',
    `email` VARCHAR(100) COMMENT '邮箱',
    `phone` VARCHAR(20) COMMENT '手机号',
    `department` VARCHAR(100) COMMENT '部门',
    `position` VARCHAR(50) COMMENT '职位',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 角色表
CREATE TABLE `sys_role` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '角色ID',
    `role_name` VARCHAR(50) NOT NULL COMMENT '角色名称',
    `role_code` VARCHAR(50) NOT NULL COMMENT '角色编码',
    `description` VARCHAR(200) COMMENT '角色描述',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_role_code` (`role_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- 用户角色关联表
CREATE TABLE `sys_user_role` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `role_id` BIGINT NOT NULL COMMENT '角色ID',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_role` (`user_id`, `role_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';

-- 失效分析案例表
CREATE TABLE `fa_case` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '案例ID',
    `case_number` VARCHAR(50) NOT NULL COMMENT '案例编号',
    `title` VARCHAR(200) NOT NULL COMMENT '案例标题',
    `description` TEXT COMMENT '案例描述',
    `product_name` VARCHAR(100) COMMENT '产品名称',
    `product_model` VARCHAR(100) COMMENT '产品型号',
    `failure_date` DATE COMMENT '失效日期',
    `failure_location` VARCHAR(200) COMMENT '失效位置',
    `failure_mode` VARCHAR(100) COMMENT '失效模式',
    `failure_mechanism` VARCHAR(100) COMMENT '失效机理',
    `severity_level` VARCHAR(20) COMMENT '严重程度',
    `status` VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态：PENDING-待处理，PROCESSING-处理中，COMPLETED-已完成，CLOSED-已关闭',
    `creator_id` BIGINT COMMENT '创建人ID',
    `assignee_id` BIGINT COMMENT '负责人ID',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_case_number` (`case_number`),
    KEY `idx_creator_id` (`creator_id`),
    KEY `idx_assignee_id` (`assignee_id`),
    KEY `idx_status` (`status`),
    KEY `idx_failure_date` (`failure_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='失效分析案例表';

-- 文件信息表
CREATE TABLE `fa_file` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '文件ID',
    `case_id` BIGINT COMMENT '关联案例ID',
    `file_name` VARCHAR(255) NOT NULL COMMENT '文件名',
    `original_name` VARCHAR(255) NOT NULL COMMENT '原始文件名',
    `file_path` VARCHAR(500) NOT NULL COMMENT '文件路径',
    `file_size` BIGINT COMMENT '文件大小（字节）',
    `file_type` VARCHAR(50) COMMENT '文件类型',
    `mime_type` VARCHAR(100) COMMENT 'MIME类型',
    `md5_hash` VARCHAR(32) COMMENT 'MD5哈希值',
    `upload_user_id` BIGINT COMMENT '上传用户ID',
    `analysis_status` VARCHAR(20) DEFAULT 'PENDING' COMMENT '分析状态：PENDING-待分析，PROCESSING-分析中，COMPLETED-已完成，FAILED-失败',
    `analysis_result` TEXT COMMENT '分析结果',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_case_id` (`case_id`),
    KEY `idx_upload_user_id` (`upload_user_id`),
    KEY `idx_analysis_status` (`analysis_status`),
    KEY `idx_md5_hash` (`md5_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文件信息表';

-- 任务表
CREATE TABLE `fa_task` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '任务ID',
    `task_number` VARCHAR(50) NOT NULL COMMENT '任务编号',
    `case_id` BIGINT COMMENT '关联案例ID',
    `task_name` VARCHAR(200) NOT NULL COMMENT '任务名称',
    `task_type` VARCHAR(50) NOT NULL COMMENT '任务类型：ANALYSIS-分析，INSPECTION-检查，TEST-测试，REPORT-报告',
    `description` TEXT COMMENT '任务描述',
    `priority` VARCHAR(20) DEFAULT 'MEDIUM' COMMENT '优先级：HIGH-高，MEDIUM-中，LOW-低',
    `status` VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态：PENDING-待处理，PROCESSING-处理中，COMPLETED-已完成，CANCELLED-已取消',
    `creator_id` BIGINT COMMENT '创建人ID',
    `assignee_id` BIGINT COMMENT '负责人ID',
    `parent_task_id` BIGINT COMMENT '父任务ID',
    `estimated_hours` DECIMAL(5,2) COMMENT '预估工时',
    `actual_hours` DECIMAL(5,2) COMMENT '实际工时',
    `start_time` DATETIME COMMENT '开始时间',
    `end_time` DATETIME COMMENT '结束时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_task_number` (`task_number`),
    KEY `idx_case_id` (`case_id`),
    KEY `idx_creator_id` (`creator_id`),
    KEY `idx_assignee_id` (`assignee_id`),
    KEY `idx_parent_task_id` (`parent_task_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务表';

-- 智能体表
CREATE TABLE `fa_agent` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '智能体ID',
    `agent_name` VARCHAR(100) NOT NULL COMMENT '智能体名称',
    `agent_type` VARCHAR(50) NOT NULL COMMENT '智能体类型：ANALYSIS-分析，INSPECTION-检查，EXPERT-专家，COORDINATOR-协调者',
    `description` TEXT COMMENT '智能体描述',
    `capabilities` JSON COMMENT '能力列表',
    `model_config` JSON COMMENT '模型配置',
    `status` VARCHAR(20) DEFAULT 'ACTIVE' COMMENT '状态：ACTIVE-激活，INACTIVE-未激活，BUSY-忙碌，ERROR-错误',
    `last_heartbeat` DATETIME COMMENT '最后心跳时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_agent_type` (`agent_type`),
    KEY `idx_status` (`status`),
    KEY `idx_last_heartbeat` (`last_heartbeat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='智能体表';

-- 智能体任务关联表
CREATE TABLE `fa_agent_task` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `agent_id` BIGINT NOT NULL COMMENT '智能体ID',
    `task_id` BIGINT NOT NULL COMMENT '任务ID',
    `status` VARCHAR(20) DEFAULT 'ASSIGNED' COMMENT '状态：ASSIGNED-已分配，PROCESSING-处理中，COMPLETED-已完成，FAILED-失败',
    `start_time` DATETIME COMMENT '开始时间',
    `end_time` DATETIME COMMENT '结束时间',
    `result` TEXT COMMENT '执行结果',
    `error_message` TEXT COMMENT '错误信息',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_agent_task` (`agent_id`, `task_id`),
    KEY `idx_agent_id` (`agent_id`),
    KEY `idx_task_id` (`task_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='智能体任务关联表';

-- 知识库表
CREATE TABLE `fa_knowledge` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '知识ID',
    `title` VARCHAR(200) NOT NULL COMMENT '知识标题',
    `category` VARCHAR(100) COMMENT '知识分类',
    `content` LONGTEXT COMMENT '知识内容',
    `keywords` VARCHAR(500) COMMENT '关键词',
    `failure_mode` VARCHAR(100) COMMENT '相关失效模式',
    `failure_mechanism` VARCHAR(100) COMMENT '相关失效机理',
    `reference_type` VARCHAR(50) COMMENT '参考类型：CASE-案例，STANDARD-标准，EXPERIENCE-经验',
    `reference_id` BIGINT COMMENT '参考ID',
    `status` VARCHAR(20) DEFAULT 'ACTIVE' COMMENT '状态：ACTIVE-激活，INACTIVE-未激活',
    `creator_id` BIGINT COMMENT '创建人ID',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_category` (`category`),
    KEY `idx_failure_mode` (`failure_mode`),
    KEY `idx_failure_mechanism` (`failure_mechanism`),
    KEY `idx_creator_id` (`creator_id`),
    KEY `idx_status` (`status`),
    FULLTEXT KEY `ft_title_content` (`title`, `content`, `keywords`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库表';

-- 分析报告表
CREATE TABLE `fa_report` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '报告ID',
    `report_number` VARCHAR(50) NOT NULL COMMENT '报告编号',
    `case_id` BIGINT NOT NULL COMMENT '关联案例ID',
    `title` VARCHAR(200) NOT NULL COMMENT '报告标题',
    `summary` TEXT COMMENT '报告摘要',
    `content` LONGTEXT COMMENT '报告内容',
    `conclusion` TEXT COMMENT '结论',
    `recommendation` TEXT COMMENT '建议',
    `report_type` VARCHAR(50) DEFAULT 'STANDARD' COMMENT '报告类型：STANDARD-标准，DETAILED-详细，SIMPLE-简单',
    `status` VARCHAR(20) DEFAULT 'DRAFT' COMMENT '状态：DRAFT-草稿，REVIEWING-审核中，APPROVED-已批准，PUBLISHED-已发布',
    `creator_id` BIGINT COMMENT '创建人ID',
    `reviewer_id` BIGINT COMMENT '审核人ID',
    `publish_time` DATETIME COMMENT '发布时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_report_number` (`report_number`),
    KEY `idx_case_id` (`case_id`),
    KEY `idx_creator_id` (`creator_id`),
    KEY `idx_reviewer_id` (`reviewer_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分析报告表';

-- 系统配置表
CREATE TABLE `sys_config` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '配置ID',
    `config_key` VARCHAR(100) NOT NULL COMMENT '配置键',
    `config_value` TEXT COMMENT '配置值',
    `config_type` VARCHAR(50) DEFAULT 'STRING' COMMENT '配置类型：STRING-字符串，NUMBER-数字，BOOLEAN-布尔值，JSON-JSON对象',
    `description` VARCHAR(200) COMMENT '配置描述',
    `is_system` TINYINT DEFAULT 0 COMMENT '是否系统配置：1-是，0-否',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- 操作日志表
CREATE TABLE `sys_operation_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '日志ID',
    `user_id` BIGINT COMMENT '用户ID',
    `username` VARCHAR(50) COMMENT '用户名',
    `operation` VARCHAR(100) COMMENT '操作类型',
    `method` VARCHAR(200) COMMENT '请求方法',
    `params` TEXT COMMENT '请求参数',
    `result` TEXT COMMENT '操作结果',
    `ip` VARCHAR(50) COMMENT 'IP地址',
    `user_agent` VARCHAR(500) COMMENT '用户代理',
    `execution_time` BIGINT COMMENT '执行时间（毫秒）',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_operation` (`operation`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 添加外键约束
ALTER TABLE `sys_user_role` ADD CONSTRAINT `fk_user_role_user_id` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE;
ALTER TABLE `sys_user_role` ADD CONSTRAINT `fk_user_role_role_id` FOREIGN KEY (`role_id`) REFERENCES `sys_role` (`id`) ON DELETE CASCADE;
ALTER TABLE `fa_case` ADD CONSTRAINT `fk_case_creator_id` FOREIGN KEY (`creator_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL;
ALTER TABLE `fa_case` ADD CONSTRAINT `fk_case_assignee_id` FOREIGN KEY (`assignee_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL;
ALTER TABLE `fa_file` ADD CONSTRAINT `fk_file_case_id` FOREIGN KEY (`case_id`) REFERENCES `fa_case` (`id`) ON DELETE CASCADE;
ALTER TABLE `fa_file` ADD CONSTRAINT `fk_file_upload_user_id` FOREIGN KEY (`upload_user_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL;
ALTER TABLE `fa_task` ADD CONSTRAINT `fk_task_case_id` FOREIGN KEY (`case_id`) REFERENCES `fa_case` (`id`) ON DELETE CASCADE;
ALTER TABLE `fa_task` ADD CONSTRAINT `fk_task_creator_id` FOREIGN KEY (`creator_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL;
ALTER TABLE `fa_task` ADD CONSTRAINT `fk_task_assignee_id` FOREIGN KEY (`assignee_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL;
ALTER TABLE `fa_task` ADD CONSTRAINT `fk_task_parent_task_id` FOREIGN KEY (`parent_task_id`) REFERENCES `fa_task` (`id`) ON DELETE CASCADE;
ALTER TABLE `fa_agent_task` ADD CONSTRAINT `fk_agent_task_agent_id` FOREIGN KEY (`agent_id`) REFERENCES `fa_agent` (`id`) ON DELETE CASCADE;
ALTER TABLE `fa_agent_task` ADD CONSTRAINT `fk_agent_task_task_id` FOREIGN KEY (`task_id`) REFERENCES `fa_task` (`id`) ON DELETE CASCADE;
ALTER TABLE `fa_knowledge` ADD CONSTRAINT `fk_knowledge_creator_id` FOREIGN KEY (`creator_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL;
ALTER TABLE `fa_report` ADD CONSTRAINT `fk_report_case_id` FOREIGN KEY (`case_id`) REFERENCES `fa_case` (`id`) ON DELETE CASCADE;
ALTER TABLE `fa_report` ADD CONSTRAINT `fk_report_creator_id` FOREIGN KEY (`creator_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL;
ALTER TABLE `fa_report` ADD CONSTRAINT `fk_report_reviewer_id` FOREIGN KEY (`reviewer_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL;
ALTER TABLE `sys_operation_log` ADD CONSTRAINT `fk_operation_log_user_id` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL;