package com.smartfa.cluster.entity;

import com.smartfa.common.entity.BaseEntity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * 智能体实体类
 * 
 * @author SmartFA Team
 */
@Entity
@Table(name = "agents")
public class Agent extends BaseEntity {

    /**
     * 智能体ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 智能体名称
     */
    @Column(nullable = false, length = 100)
    private String name;

    /**
     * 智能体描述
     */
    @Column(length = 500)
    private String description;

    /**
     * 智能体类型
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AgentType type;

    /**
     * 智能体状态
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AgentStatus status;

    /**
     * 智能体版本
     */
    @Column(name = "version", nullable = false, length = 20)
    private String version;

    /**
     * 容器ID
     */
    @Column(name = "container_id", length = 100)
    private String containerId;

    /**
     * 主机地址
     */
    @Column(name = "host_address", length = 100)
    private String hostAddress;

    /**
     * 端口号
     */
    @Column(name = "port")
    private Integer port;

    /**
     * 能力列表（JSON格式）
     */
    @Column(name = "capabilities", columnDefinition = "TEXT")
    private String capabilities;

    /**
     * 配置参数（JSON格式）
     */
    @Column(name = "config_params", columnDefinition = "TEXT")
    private String config;

    /**
     * 最大并发任务数
     */
    @Column(name = "max_concurrent_tasks")
    private Integer maxConcurrentTasks;

    /**
     * 性能指标（JSON格式）
     */
    @Column(name = "performance_metrics", columnDefinition = "TEXT")
    private String performanceMetrics;

    /**
     * 当前任务ID
     */
    @Column(name = "current_task_id")
    private Long currentTaskId;

    /**
     * 总任务数
     */
    @Column(name = "total_tasks", nullable = false)
    private Integer totalTasks = 0;

    /**
     * 成功任务数
     */
    @Column(name = "success_tasks", nullable = false)
    private Integer successTasks = 0;

    /**
     * 失败任务数
     */
    @Column(name = "failed_tasks", nullable = false)
    private Integer failedTasks = 0;

    /**
     * 平均执行时间（秒）
     */
    @Column(name = "avg_execution_time")
    private Double avgExecutionTime;

    /**
     * CPU使用率
     */
    @Column(name = "cpu_usage")
    private Double cpuUsage;

    /**
     * 内存使用率
     */
    @Column(name = "memory_usage")
    private Double memoryUsage;

    /**
     * 最后心跳时间
     */
    @Column(name = "last_heartbeat_time")
    private LocalDateTime lastHeartbeatTime;

    /**
     * 启动时间
     */
    @Column(name = "start_time")
    private LocalDateTime startTime;

    /**
     * 创建时间
     */
    @Column(name = "created_at")
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @Column(name = "updated_at")
    private LocalDateTime updateTime;

    /**
     * 健康状态
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HealthStatus healthStatus;

    /**
     * 智能体类型枚举
     */
    public enum AgentType {
        VISION_ANALYSIS("视觉分析智能体"),
        DOCUMENT_PROCESSING("文档处理智能体"),
        DATA_ANALYSIS("数据分析智能体"),
        MODEL_TRAINING("模型训练智能体"),
        QUALITY_INSPECTION("质量检测智能体"),
        FAILURE_ANALYSIS("失效分析智能体"),
        REPORT_GENERATION("报告生成智能体"),
        COORDINATION("协调智能体"),
        MONITORING("监控智能体");

        private final String description;

        AgentType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 智能体状态枚举
     */
    public enum AgentStatus {
        IDLE("空闲"),
        BUSY("忙碌"),
        STARTING("启动中"),
        STOPPING("停止中"),
        STOPPED("已停止"),
        ERROR("错误"),
        MAINTENANCE("维护中");

        private final String description;

        AgentStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 健康状态枚举
     */
    public enum HealthStatus {
        HEALTHY("健康"),
        WARNING("警告"),
        CRITICAL("严重"),
        ERROR("错误"),
        UNKNOWN("未知"),
        STOPPED("已停止");

        private final String description;

        HealthStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    // Getter 和 Setter 方法
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

    public AgentType getType() {
        return type;
    }

    public void setType(AgentType type) {
        this.type = type;
    }

    public AgentStatus getStatus() {
        return status;
    }

    public void setStatus(AgentStatus status) {
        this.status = status;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getContainerId() {
        return containerId;
    }

    public void setContainerId(String containerId) {
        this.containerId = containerId;
    }

    public String getHostAddress() {
        return hostAddress;
    }

    public void setHostAddress(String hostAddress) {
        this.hostAddress = hostAddress;
    }

    public Integer getPort() {
        return port;
    }

    public void setPort(Integer port) {
        this.port = port;
    }

    public String getCapabilities() {
        return capabilities;
    }

    public void setCapabilities(String capabilities) {
        this.capabilities = capabilities;
    }

    public String getConfig() {
        return config;
    }

    public void setConfig(String config) {
        this.config = config;
    }

    public Integer getMaxConcurrentTasks() {
        return maxConcurrentTasks;
    }

    public void setMaxConcurrentTasks(Integer maxConcurrentTasks) {
        this.maxConcurrentTasks = maxConcurrentTasks;
    }

    public String getPerformanceMetrics() {
        return performanceMetrics;
    }

    public void setPerformanceMetrics(String performanceMetrics) {
        this.performanceMetrics = performanceMetrics;
    }

    public Long getCurrentTaskId() {
        return currentTaskId;
    }

    public void setCurrentTaskId(Long currentTaskId) {
        this.currentTaskId = currentTaskId;
    }

    public Integer getTotalTasks() {
        return totalTasks;
    }

    public void setTotalTasks(Integer totalTasks) {
        this.totalTasks = totalTasks;
    }

    public Integer getSuccessTasks() {
        return successTasks;
    }

    public void setSuccessTasks(Integer successTasks) {
        this.successTasks = successTasks;
    }

    public Integer getFailedTasks() {
        return failedTasks;
    }

    public void setFailedTasks(Integer failedTasks) {
        this.failedTasks = failedTasks;
    }

    public Double getAvgExecutionTime() {
        return avgExecutionTime;
    }

    public void setAvgExecutionTime(Double avgExecutionTime) {
        this.avgExecutionTime = avgExecutionTime;
    }

    public Double getCpuUsage() {
        return cpuUsage;
    }

    public void setCpuUsage(Double cpuUsage) {
        this.cpuUsage = cpuUsage;
    }

    public Double getMemoryUsage() {
        return memoryUsage;
    }

    public void setMemoryUsage(Double memoryUsage) {
        this.memoryUsage = memoryUsage;
    }

    public LocalDateTime getLastHeartbeatTime() {
        return lastHeartbeatTime;
    }

    public void setLastHeartbeatTime(LocalDateTime lastHeartbeatTime) {
        this.lastHeartbeatTime = lastHeartbeatTime;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
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

    public HealthStatus getHealthStatus() {
        return healthStatus;
    }

    public void setHealthStatus(HealthStatus healthStatus) {
        this.healthStatus = healthStatus;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        Agent agent = (Agent) o;
        return Objects.equals(id, agent.id) &&
                Objects.equals(name, agent.name) &&
                Objects.equals(description, agent.description) &&
                type == agent.type &&
                status == agent.status &&
                Objects.equals(version, agent.version) &&
                Objects.equals(containerId, agent.containerId) &&
                Objects.equals(hostAddress, agent.hostAddress) &&
                Objects.equals(port, agent.port) &&
                Objects.equals(capabilities, agent.capabilities) &&
                Objects.equals(config, agent.config) &&
                Objects.equals(performanceMetrics, agent.performanceMetrics) &&
                Objects.equals(currentTaskId, agent.currentTaskId) &&
                Objects.equals(totalTasks, agent.totalTasks) &&
                Objects.equals(successTasks, agent.successTasks) &&
                Objects.equals(failedTasks, agent.failedTasks) &&
                Objects.equals(avgExecutionTime, agent.avgExecutionTime) &&
                Objects.equals(cpuUsage, agent.cpuUsage) &&
                Objects.equals(memoryUsage, agent.memoryUsage) &&
                Objects.equals(lastHeartbeatTime, agent.lastHeartbeatTime) &&
                Objects.equals(startTime, agent.startTime) &&
                Objects.equals(updateTime, agent.updateTime) &&
                healthStatus == agent.healthStatus;
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), id, name, description, type, status, version, 
                containerId, hostAddress, port, capabilities, config, performanceMetrics, 
                currentTaskId, totalTasks, successTasks, failedTasks, avgExecutionTime, 
                cpuUsage, memoryUsage, lastHeartbeatTime, startTime, updateTime, healthStatus);
    }
}