package com.smartfa.hub.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * 任务创建DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskCreateDTO {
    
    /**
     * 任务标题
     */
    private String title;
    
    /**
     * 任务描述
     */
    private String description;
    
    /**
     * 任务类型
     */
    private String taskType;
    
    /**
     * 优先级
     */
    private String priority;
    
    /**
     * 截止时间
     */
    private LocalDateTime deadline;
    
    /**
     * 创建人ID
     */
    private Long creatorId;
    
    /**
     * 负责人ID
     */
    private Long assigneeId;
    
    /**
     * 相关案例ID
     */
    private Long caseId;
}