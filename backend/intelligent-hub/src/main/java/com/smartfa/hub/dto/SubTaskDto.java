package com.smartfa.hub.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

/**
 * 子任务DTO
 */
public class SubTaskDto {
    
    /**
     * 子任务ID
     */
    private Long id;
    
    /**
     * 子任务标题
     */
    private String title;
    
    /**
     * 子任务描述
     */
    private String description;
    
    /**
     * 子任务类型
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
     * 负责人ID
     */
    private Long assigneeId;
    
    /**
     * 任务状态
     */
    private String status;
    
    /**
     * 进度百分比
     */
    private Integer progress;
    
    /**
     * 父任务ID
     */
    private Long parentTaskId;
    
    /**
     * 创建时间
     */
    private LocalDateTime createTime;
    
    /**
     * 更新时间
     */
    private LocalDateTime updateTime;

    /**
     * 智能体类型
     */
    private String agentType;

    /**
     * 预计持续时间（分钟）
     */
    private Integer estimatedDuration;

    /**
     * 依赖的子任务ID列表
     */
    private List<Long> dependencies;

    // 默认构造函数
    public SubTaskDto() {}

    // 全参构造函数
    public SubTaskDto(Long id, String title, String description, String taskType, String priority, 
                      LocalDateTime deadline, Long assigneeId, String status, Integer progress, 
                      Long parentTaskId, LocalDateTime createTime, LocalDateTime updateTime,
                      String agentType, Integer estimatedDuration, List<Long> dependencies) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.taskType = taskType;
        this.priority = priority;
        this.deadline = deadline;
        this.assigneeId = assigneeId;
        this.status = status;
        this.progress = progress;
        this.parentTaskId = parentTaskId;
        this.createTime = createTime;
        this.updateTime = updateTime;
        this.agentType = agentType;
        this.estimatedDuration = estimatedDuration;
        this.dependencies = dependencies;
    }

    // Builder 模式支持
    public static SubTaskDtoBuilder builder() {
        return new SubTaskDtoBuilder();
    }

    // Getter 和 Setter 方法
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTaskType() {
        return taskType;
    }

    public void setTaskType(String taskType) {
        this.taskType = taskType;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public LocalDateTime getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDateTime deadline) {
        this.deadline = deadline;
    }

    public Long getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(Long assigneeId) {
        this.assigneeId = assigneeId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public Long getParentTaskId() {
        return parentTaskId;
    }

    public void setParentTaskId(Long parentTaskId) {
        this.parentTaskId = parentTaskId;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public LocalDateTime getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }

    public String getAgentType() {
        return agentType;
    }

    public void setAgentType(String agentType) {
        this.agentType = agentType;
    }

    public Integer getEstimatedDuration() {
        return estimatedDuration;
    }

    public void setEstimatedDuration(Integer estimatedDuration) {
        this.estimatedDuration = estimatedDuration;
    }

    public List<Long> getDependencies() {
        return dependencies;
    }

    public void setDependencies(List<Long> dependencies) {
        this.dependencies = dependencies;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SubTaskDto subTaskDto = (SubTaskDto) o;
        return Objects.equals(id, subTaskDto.id) &&
                Objects.equals(title, subTaskDto.title) &&
                Objects.equals(description, subTaskDto.description) &&
                Objects.equals(taskType, subTaskDto.taskType) &&
                Objects.equals(priority, subTaskDto.priority) &&
                Objects.equals(deadline, subTaskDto.deadline) &&
                Objects.equals(assigneeId, subTaskDto.assigneeId) &&
                Objects.equals(status, subTaskDto.status) &&
                Objects.equals(progress, subTaskDto.progress) &&
                Objects.equals(parentTaskId, subTaskDto.parentTaskId) &&
                Objects.equals(createTime, subTaskDto.createTime) &&
                Objects.equals(updateTime, subTaskDto.updateTime) &&
                Objects.equals(agentType, subTaskDto.agentType) &&
                Objects.equals(estimatedDuration, subTaskDto.estimatedDuration) &&
                Objects.equals(dependencies, subTaskDto.dependencies);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, title, description, taskType, priority, deadline, 
                assigneeId, status, progress, parentTaskId, createTime, updateTime,
                agentType, estimatedDuration, dependencies);
    }

    @Override
    public String toString() {
        return "SubTaskDto{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", taskType='" + taskType + '\'' +
                ", priority='" + priority + '\'' +
                ", deadline=" + deadline +
                ", assigneeId=" + assigneeId +
                ", status='" + status + '\'' +
                ", progress=" + progress +
                ", parentTaskId=" + parentTaskId +
                ", createTime=" + createTime +
                ", updateTime=" + updateTime +
                '}';
    }

    // Builder 类
    public static class SubTaskDtoBuilder {
        private Long id;
        private String title;
        private String description;
        private String taskType;
        private String priority;
        private LocalDateTime deadline;
        private Long assigneeId;
        private String status;
        private Integer progress;
        private Long parentTaskId;
        private LocalDateTime createTime;
        private LocalDateTime updateTime;
        private String agentType;
        private Integer estimatedDuration;
        private List<Long> dependencies;

        public SubTaskDtoBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public SubTaskDtoBuilder name(String name) {
            this.title = name;
            return this;
        }

        public SubTaskDtoBuilder title(String title) {
            this.title = title;
            return this;
        }

        public SubTaskDtoBuilder description(String description) {
            this.description = description;
            return this;
        }

        public SubTaskDtoBuilder type(String type) {
            this.taskType = type;
            return this;
        }

        public SubTaskDtoBuilder taskType(String taskType) {
            this.taskType = taskType;
            return this;
        }

        public SubTaskDtoBuilder agentType(String agentType) {
            this.agentType = agentType;
            return this;
        }

        public SubTaskDtoBuilder estimatedDuration(Integer estimatedDuration) {
            this.estimatedDuration = estimatedDuration;
            return this;
        }

        public SubTaskDtoBuilder dependencies(List<Long> dependencies) {
            this.dependencies = dependencies;
            return this;
        }

        public SubTaskDtoBuilder priority(String priority) {
            this.priority = priority;
            return this;
        }

        public SubTaskDtoBuilder deadline(LocalDateTime deadline) {
            this.deadline = deadline;
            return this;
        }

        public SubTaskDtoBuilder assigneeId(Long assigneeId) {
            this.assigneeId = assigneeId;
            return this;
        }

        public SubTaskDtoBuilder status(String status) {
            this.status = status;
            return this;
        }

        public SubTaskDtoBuilder progress(Integer progress) {
            this.progress = progress;
            return this;
        }

        public SubTaskDtoBuilder parentTaskId(Long parentTaskId) {
            this.parentTaskId = parentTaskId;
            return this;
        }

        public SubTaskDtoBuilder createTime(LocalDateTime createTime) {
            this.createTime = createTime;
            return this;
        }

        public SubTaskDtoBuilder updateTime(LocalDateTime updateTime) {
            this.updateTime = updateTime;
            return this;
        }

        public SubTaskDto build() {
            return new SubTaskDto(id, title, description, taskType, priority, 
                    deadline, assigneeId, status, progress, parentTaskId, createTime, updateTime,
                    agentType, estimatedDuration, dependencies);
        }
    }
}