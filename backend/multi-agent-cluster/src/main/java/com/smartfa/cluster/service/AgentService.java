package com.smartfa.cluster.service;

import com.smartfa.cluster.dto.AgentCreateDTO;
import com.smartfa.cluster.dto.AgentUpdateDTO;
import com.smartfa.cluster.entity.Agent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

/**
 * 智能体服务接口
 * 
 * @author SmartFA Team
 */
public interface AgentService {

    /**
     * 创建智能体
     */
    Agent createAgent(AgentCreateDTO agentCreateDTO);

    /**
     * 批量创建智能体
     */
    List<Agent> createAgents(List<AgentCreateDTO> agentCreateDTOs);

    /**
     * 获取智能体详情
     */
    Agent getAgent(Long id);

    /**
     * 分页查询智能体
     */
    Page<Agent> getAgents(String name, Agent.AgentType type, Agent.AgentStatus status, Agent.HealthStatus healthStatus, Pageable pageable);

    /**
     * 更新智能体
     */
    Agent updateAgent(Long id, AgentUpdateDTO agentUpdateDTO);

    /**
     * 删除智能体
     */
    void deleteAgent(Long id);

    /**
     * 批量删除智能体
     */
    void deleteAgents(List<Long> ids);

    /**
     * 更新智能体状态
     */
    void updateAgentStatus(Long id, String status);

    /**
     * 获取智能体统计信息
     */
    Map<String, Object> getAgentStatistics();

    /**
     * 获取智能体能力列表
     */
    List<String> getAgentCapabilities(Long id);

    /**
     * 检查智能体是否在线
     */
    boolean isAgentOnline(Long id);

    /**
     * 启动智能体
     */
    Agent startAgent(Long id);

    /**
     * 停止智能体
     */
    Agent stopAgent(Long id);

    /**
     * 重启智能体
     */
    Agent restartAgent(Long id);

    /**
     * 智能体心跳
     */
    void heartbeat(Long id);

    /**
     * 更新智能体状态
     */
    Agent updateStatus(Long id, Agent.AgentStatus status);

    /**
     * 更新性能指标
     */
    Agent updateMetrics(Long id, Map<String, Object> metrics);

    /**
     * 获取可用智能体
     */
    List<Agent> getAvailableAgents(Agent.AgentType type);

    /**
     * 分配任务给智能体
     */
    Agent assignTask(Long id, Long taskId);

    /**
     * 完成任务
     */
    Agent completeTask(Long id, Boolean success, String errorMessage);

    /**
     * 获取智能体日志
     */
    List<String> getAgentLogs(Long id, Integer limit);

    /**
     * 智能体扩容
     */
    List<Agent> scaleAgents(Agent.AgentType type, Integer count);
}