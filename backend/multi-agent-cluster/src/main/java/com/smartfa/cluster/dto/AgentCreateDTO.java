package com.smartfa.cluster.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * 智能体创建DTO
 * 
 * @author SmartFA Team
 */
public class AgentCreateDTO {

    /**
     * 智能体名称
     */
    @NotBlank(message = "智能体名称不能为空")
    @Size(max = 100, message = "智能体名称长度不能超过100个字符")
    private String name;

    /**
     * 智能体类型
     */
    @NotBlank(message = "智能体类型不能为空")
    private String type;

    /**
     * 智能体描述
     */
    @Size(max = 500, message = "智能体描述长度不能超过500个字符")
    private String description;

    /**
     * 智能体配置（JSON格式）
     */
    private String config;

    /**
     * 智能体能力列表
     */
    private List<String> capabilities;

    /**
     * 最大并发任务数
     */
    @NotNull(message = "最大并发任务数不能为空")
    private Integer maxConcurrentTasks;

    /**
     * 智能体状态
     */
    private String status;

    // Getter 和 Setter 方法
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getConfig() {
        return config;
    }

    public void setConfig(String config) {
        this.config = config;
    }

    public List<String> getCapabilities() {
        return capabilities;
    }

    public void setCapabilities(List<String> capabilities) {
        this.capabilities = capabilities;
    }

    public Integer getMaxConcurrentTasks() {
        return maxConcurrentTasks;
    }

    public void setMaxConcurrentTasks(Integer maxConcurrentTasks) {
        this.maxConcurrentTasks = maxConcurrentTasks;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}