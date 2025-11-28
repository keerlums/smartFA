package com.smartfa.cluster.service.impl;

import com.smartfa.cluster.dto.AgentCreateDTO;
import com.smartfa.cluster.dto.AgentUpdateDTO;
import com.smartfa.cluster.entity.Agent;
import com.smartfa.cluster.repository.AgentRepository;
import com.smartfa.cluster.service.AgentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 智能体服务实现类
 * 
 * @author SmartFA Team
 */
@Service
public class AgentServiceImpl implements AgentService {

    private static final Logger log = LoggerFactory.getLogger(AgentServiceImpl.class);

    @Autowired
    private AgentRepository agentRepository;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Agent createAgent(AgentCreateDTO agentCreateDTO) {
        try {
            Agent agent = new Agent();
            agent.setName(agentCreateDTO.getName());
                agent.setType(Agent.AgentType.valueOf(agentCreateDTO.getType()));
            agent.setDescription(agentCreateDTO.getDescription());
            agent.setConfig(agentCreateDTO.getConfig());
            // 将 List<String> 转换为 JSON 字符串
        if (agentCreateDTO.getCapabilities() != null) {
            agent.setCapabilities(agentCreateDTO.getCapabilities().toString());
        }
            agent.setMaxConcurrentTasks(agentCreateDTO.getMaxConcurrentTasks());
            agent.setStatus(agentCreateDTO.getStatus() != null ? 
                Agent.AgentStatus.valueOf(agentCreateDTO.getStatus()) : Agent.AgentStatus.IDLE);
            agent.setCreateTime(LocalDateTime.now());
            agent.setUpdateTime(LocalDateTime.now());

            Agent savedAgent = agentRepository.save(agent);
            log.info("创建智能体成功: {}", savedAgent.getName());
            return savedAgent;

        } catch (Exception e) {
            log.error("创建智能体失败: {}", e.getMessage(), e);
            throw new RuntimeException("创建智能体失败");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<Agent> createAgents(List<AgentCreateDTO> agentCreateDTOs) {
        return agentCreateDTOs.stream()
                .map(this::createAgent)
                .collect(Collectors.toList());
    }

    @Override
    public Agent getAgent(Long id) {
        return agentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("智能体不存在: " + id));
    }

    @Override
    public Page<Agent> getAgents(String name, Agent.AgentType type, Agent.AgentStatus status, Agent.HealthStatus healthStatus, Pageable pageable) {
        // 这里简化实现，实际应该根据条件查询
        return agentRepository.findAll(pageable);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Agent updateAgent(Long id, AgentUpdateDTO agentUpdateDTO) {
        try {
            Agent agent = getAgent(id);
            
            if (agentUpdateDTO.getName() != null) {
                agent.setName(agentUpdateDTO.getName());
            }
            if (agentUpdateDTO.getType() != null) {
                    agent.setType(Agent.AgentType.valueOf(agentUpdateDTO.getType()));
            }
            if (agentUpdateDTO.getDescription() != null) {
                agent.setDescription(agentUpdateDTO.getDescription());
            }
            if (agentUpdateDTO.getConfig() != null) {
                agent.setConfig(agentUpdateDTO.getConfig());
            }
            if (agentUpdateDTO.getCapabilities() != null) {
                agent.setCapabilities(agentUpdateDTO.getCapabilities().toString());
            }
            if (agentUpdateDTO.getMaxConcurrentTasks() != null) {
                agent.setMaxConcurrentTasks(agentUpdateDTO.getMaxConcurrentTasks());
            }
            if (agentUpdateDTO.getStatus() != null) {
                agent.setStatus(Agent.AgentStatus.valueOf(agentUpdateDTO.getStatus()));
            }
            
            agent.setUpdateTime(LocalDateTime.now());
            
            Agent updatedAgent = agentRepository.save(agent);
            log.info("更新智能体成功: {}", updatedAgent.getName());
            return updatedAgent;

        } catch (Exception e) {
            log.error("更新智能体失败: {}", e.getMessage(), e);
            throw new RuntimeException("更新智能体失败");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteAgent(Long id) {
        try {
            Agent agent = getAgent(id);
            agentRepository.delete(agent);
            log.info("删除智能体成功: {}", agent.getName());
        } catch (Exception e) {
            log.error("删除智能体失败: {}", e.getMessage(), e);
            throw new RuntimeException("删除智能体失败");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteAgents(List<Long> ids) {
        ids.forEach(this::deleteAgent);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateAgentStatus(Long id, String status) {
        try {
            Agent agent = getAgent(id);
            agent.setStatus(Agent.AgentStatus.valueOf(status));
            agent.setUpdateTime(LocalDateTime.now());
            agentRepository.save(agent);
            log.info("更新智能体状态成功: {} -> {}", agent.getName(), status);
        } catch (Exception e) {
            log.error("更新智能体状态失败: {}", e.getMessage(), e);
            throw new RuntimeException("更新智能体状态失败");
        }
    }

    @Override
    public Map<String, Object> getAgentStatistics() {
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalAgents", agentRepository.count());
        statistics.put("onlineAgents", 0L); // 简化实现
        statistics.put("offlineAgents", 0L); // 简化实现
        statistics.put("busyAgents", 0L); // 简化实现
        return statistics;
    }

    @Override
    public List<String> getAgentCapabilities(Long id) {
        Agent agent = getAgent(id);
        // 简化实现，实际应该解析 JSON 字符串
        return List.of("VISION_ANALYSIS", "DOCUMENT_PROCESSING");
    }

    @Override
    public boolean isAgentOnline(Long id) {
        try {
            Agent agent = getAgent(id);
            return Agent.AgentStatus.IDLE.equals(agent.getStatus()) || Agent.AgentStatus.BUSY.equals(agent.getStatus());
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Agent startAgent(Long id) {
        try {
            Agent agent = getAgent(id);
            agent.setStatus(Agent.AgentStatus.BUSY);
            agent.setHealthStatus(Agent.HealthStatus.HEALTHY);
            agent.setUpdateTime(LocalDateTime.now());
            Agent savedAgent = agentRepository.save(agent);
            log.info("启动智能体成功: {}", savedAgent.getName());
            return savedAgent;
        } catch (Exception e) {
            log.error("启动智能体失败: {}", e.getMessage(), e);
            throw new RuntimeException("启动智能体失败");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Agent stopAgent(Long id) {
        try {
            Agent agent = getAgent(id);
            agent.setStatus(Agent.AgentStatus.STOPPED);
            agent.setHealthStatus(Agent.HealthStatus.STOPPED);
            agent.setUpdateTime(LocalDateTime.now());
            Agent savedAgent = agentRepository.save(agent);
            log.info("停止智能体成功: {}", savedAgent.getName());
            return savedAgent;
        } catch (Exception e) {
            log.error("停止智能体失败: {}", e.getMessage(), e);
            throw new RuntimeException("停止智能体失败");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Agent restartAgent(Long id) {
        try {
            stopAgent(id);
            return startAgent(id);
        } catch (Exception e) {
            log.error("重启智能体失败: {}", e.getMessage(), e);
            throw new RuntimeException("重启智能体失败");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void heartbeat(Long id) {
        try {
            Agent agent = getAgent(id);
            agent.setLastHeartbeatTime(LocalDateTime.now());
            agent.setHealthStatus(Agent.HealthStatus.HEALTHY);
            agent.setUpdateTime(LocalDateTime.now());
            agentRepository.save(agent);
        } catch (Exception e) {
            log.error("智能体心跳失败: {}", e.getMessage(), e);
            throw new RuntimeException("智能体心跳失败");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Agent updateStatus(Long id, Agent.AgentStatus status) {
        try {
            Agent agent = getAgent(id);
            agent.setStatus(status);
            agent.setUpdateTime(LocalDateTime.now());
            Agent savedAgent = agentRepository.save(agent);
            log.info("更新智能体状态成功: {} -> {}", agent.getName(), status);
            return savedAgent;
        } catch (Exception e) {
            log.error("更新智能体状态失败: {}", e.getMessage(), e);
            throw new RuntimeException("更新智能体状态失败");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Agent updateMetrics(Long id, Map<String, Object> metrics) {
        try {
            Agent agent = getAgent(id);
            // 简化实现，实际应该解析metrics并更新相应字段
            agent.setUpdateTime(LocalDateTime.now());
            Agent savedAgent = agentRepository.save(agent);
            log.info("更新智能体性能指标成功: {}", agent.getName());
            return savedAgent;
        } catch (Exception e) {
            log.error("更新智能体性能指标失败: {}", e.getMessage(), e);
            throw new RuntimeException("更新智能体性能指标失败");
        }
    }

    @Override
    public List<Agent> getAvailableAgents(Agent.AgentType type) {
        // 简化实现，实际应该根据类型和状态查询
        return agentRepository.findAll().stream()
                .filter(agent -> Agent.AgentStatus.IDLE.equals(agent.getStatus()))
                .filter(agent -> type == null || type.equals(agent.getType()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Agent assignTask(Long id, Long taskId) {
        try {
            Agent agent = getAgent(id);
            agent.setStatus(Agent.AgentStatus.BUSY);
            agent.setCurrentTaskId(taskId);
            agent.setUpdateTime(LocalDateTime.now());
            Agent savedAgent = agentRepository.save(agent);
            log.info("分配任务给智能体成功: {} -> {}", agent.getName(), taskId);
            return savedAgent;
        } catch (Exception e) {
            log.error("分配任务给智能体失败: {}", e.getMessage(), e);
            throw new RuntimeException("分配任务给智能体失败");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Agent completeTask(Long id, Boolean success, String errorMessage) {
        try {
            Agent agent = getAgent(id);
            agent.setStatus(Agent.AgentStatus.IDLE);
            agent.setCurrentTaskId(null);
            if (success != null && !success) {
                agent.setHealthStatus(Agent.HealthStatus.ERROR);
            }
            agent.setUpdateTime(LocalDateTime.now());
            Agent savedAgent = agentRepository.save(agent);
            log.info("智能体完成任务成功: {}", agent.getName());
            return savedAgent;
        } catch (Exception e) {
            log.error("智能体完成任务失败: {}", e.getMessage(), e);
            throw new RuntimeException("智能体完成任务失败");
        }
    }

    @Override
    public List<String> getAgentLogs(Long id, Integer limit) {
        // 简化实现，实际应该从日志系统获取
        return List.of(
            "智能体启动成功",
            "接收到任务分配",
            "任务处理中",
            "任务完成"
        );
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<Agent> scaleAgents(Agent.AgentType type, Integer count) {
        try {
            List<Agent> newAgents = new java.util.ArrayList<>();
            for (int i = 0; i < count; i++) {
                Agent agent = new Agent();
                agent.setName("智能体-" + type.name() + "-" + System.currentTimeMillis() + "-" + i);
                agent.setType(type);
                agent.setStatus(Agent.AgentStatus.IDLE);
                agent.setHealthStatus(Agent.HealthStatus.HEALTHY);
                agent.setCreateTime(LocalDateTime.now());
                agent.setUpdateTime(LocalDateTime.now());
                newAgents.add(agentRepository.save(agent));
            }
            log.info("智能体扩容成功: {} x {}", type.name(), count);
            return newAgents;
        } catch (Exception e) {
            log.error("智能体扩容失败: {}", e.getMessage(), e);
            throw new RuntimeException("智能体扩容失败");
        }
    }
}