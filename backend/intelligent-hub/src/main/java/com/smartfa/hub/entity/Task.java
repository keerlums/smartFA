package com.smartfa.hub.entity;

import com.smartfa.common.entity.BaseEntity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Objects;

/**
 * 任务实体类
 * 
 * @author SmartFA Team
 */
@Entity
@Table(name = "tasks")
public class Task extends BaseEntity {

    /**
     * 任务ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 任务名称
     */
    @Column(nullable = false, length = 200)
    private String name;

    /**
     * 任务描述
     */
    @Column(length = 1000)
    private String description;

    /**
     * 任务类型
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskType type;

    /**
     * 任务状态
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status;

    /**
     * 优先级
     */
    @Column(nullable = false)
    private Integer priority;

    /**
     * 创建者ID
     */
    @Column(name = "creator_id", nullable = false)
    private Long creatorId;

    /**
     * 分配的智能体ID
     */
    @Column(name = "agent_id")
    private Long agentId;

    /**
     * 父任务ID（用于任务分解）
     */
    @Column(name = "parent_task_id")
    private Long parentTaskId;

    /**
     * 任务参数（JSON格式）
     */
    @Column(name = "task_params", columnDefinition = "TEXT")
    private String taskParams;

    /**
     * 任务结果（JSON格式）
     */
    @Column(name = "task_result", columnDefinition = "TEXT")
    private String taskResult;

    /**
     * 预计开始时间
     */
    @Column(name = "estimated_start_time")
    private LocalDateTime estimatedStartTime;

    /**
     * 预计结束时间
     */
    @Column(name = "estimated_end_time")
    private LocalDateTime estimatedEndTime;

    /**
     * 实际开始时间
     */
    @Column(name = "actual_start_time")
    private LocalDateTime actualStartTime;

    /**
     * 实际结束时间
     */
    @Column(name = "actual_end_time")
    private LocalDateTime actualEndTime;

    /**
     * 进度百分比
     */
    @Column(nullable = false)
    private Integer progress = 0;

    /**
     * 错误信息
     */
    @Column(name = "error_message", length = 1000)
    private String errorMessage;

    /**
     * 重试次数
     */
    @Column(name = "retry_count", nullable = false)
    private Integer retryCount = 0;

    /**
     * 最大重试次数
     */
    @Column(name = "max_retry_count", nullable = false)
    private Integer maxRetryCount = 3;

    /**
     * 任务类型枚举
     */
    public enum TaskType {
        IMAGE_ANALYSIS("图像分析"),
        DOCUMENT_ANALYSIS("文档分析"),
        DATA_PROCESSING("数据处理"),
        MODEL_TRAINING("模型训练"),
        REPORT_GENERATION("报告生成"),
        MULTI_MODAL_FUSION("多模态融合"),
        QUALITY_INSPECTION("质量检测"),
        FAILURE_ANALYSIS("失效分析");

        private final String description;

        TaskType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 任务状态枚举
     */
    public enum TaskStatus {
        PENDING("待处理"),
        RUNNING("运行中"),
        COMPLETED("已完成"),
        FAILED("失败"),
        CANCELLED("已取消"),
        PAUSED("暂停");

        private final String description;

        TaskStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    // Getter and Setter methods
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TaskType getType() {
        return type;
    }

    public void setType(TaskType type) {
        this.type = type;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public Long getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(Long creatorId) {
        this.creatorId = creatorId;
    }

    public Long getAgentId() {
        return agentId;
    }

    public void setAgentId(Long agentId) {
        this.agentId = agentId;
    }

    public Long getParentTaskId() {
        return parentTaskId;
    }

    public void setParentTaskId(Long parentTaskId) {
        this.parentTaskId = parentTaskId;
    }

    public String getTaskParams() {
        return taskParams;
    }

    public void setTaskParams(String taskParams) {
        this.taskParams = taskParams;
    }

    public String getTaskResult() {
        return taskResult;
    }

    public void setTaskResult(String taskResult) {
        this.taskResult = taskResult;
    }

    public LocalDateTime getEstimatedStartTime() {
        return estimatedStartTime;
    }

    public void setEstimatedStartTime(LocalDateTime estimatedStartTime) {
        this.estimatedStartTime = estimatedStartTime;
    }

    public LocalDateTime getEstimatedEndTime() {
        return estimatedEndTime;
    }

    public void setEstimatedEndTime(LocalDateTime estimatedEndTime) {
        this.estimatedEndTime = estimatedEndTime;
    }

    public LocalDateTime getActualStartTime() {
        return actualStartTime;
    }

    public void setActualStartTime(LocalDateTime actualStartTime) {
        this.actualStartTime = actualStartTime;
    }

    public LocalDateTime getActualEndTime() {
        return actualEndTime;
    }

    public void setActualEndTime(LocalDateTime actualEndTime) {
        this.actualEndTime = actualEndTime;
    }

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public Integer getRetryCount() {
        return retryCount;
    }

    public void setRetryCount(Integer retryCount) {
        this.retryCount = retryCount;
    }

    public Integer getMaxRetryCount() {
        return maxRetryCount;
    }

    public void setMaxRetryCount(Integer maxRetryCount) {
        this.maxRetryCount = maxRetryCount;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        Task task = (Task) o;
        return Objects.equals(id, task.id) &&
                Objects.equals(name, task.name) &&
                Objects.equals(description, task.description) &&
                type == task.type &&
                status == task.status &&
                Objects.equals(priority, task.priority) &&
                Objects.equals(creatorId, task.creatorId) &&
                Objects.equals(agentId, task.agentId) &&
                Objects.equals(parentTaskId, task.parentTaskId) &&
                Objects.equals(taskParams, task.taskParams) &&
                Objects.equals(taskResult, task.taskResult) &&
                Objects.equals(estimatedStartTime, task.estimatedStartTime) &&
                Objects.equals(estimatedEndTime, task.estimatedEndTime) &&
                Objects.equals(actualStartTime, task.actualStartTime) &&
                Objects.equals(actualEndTime, task.actualEndTime) &&
                Objects.equals(progress, task.progress) &&
                Objects.equals(errorMessage, task.errorMessage) &&
                Objects.equals(retryCount, task.retryCount) &&
                Objects.equals(maxRetryCount, task.maxRetryCount);
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), id, name, description, type, status, priority, 
                creatorId, agentId, parentTaskId, taskParams, taskResult, 
                estimatedStartTime, estimatedEndTime, actualStartTime, actualEndTime, 
                progress, errorMessage, retryCount, maxRetryCount);
    }
}