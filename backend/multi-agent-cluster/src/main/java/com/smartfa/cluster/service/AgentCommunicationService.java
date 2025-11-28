
package com.smartfa.cluster.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;

import com.smartfa.cluster.entity.Agent;
import com.smartfa.cluster.dto.MessageDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.Map;

/**
 * 智能体通信服务
 */
@Service
public class AgentCommunicationService {

    @Autowired
    private ObjectMapper objectMapper;

    // 智能体消息队列
    private final Map<String, BlockingQueue<MessageDto>> agentMessageQueues = new ConcurrentHashMap<>();
    
    // 智能体连接状态
    private final Map<String, Boolean> agentConnections = new ConcurrentHashMap<>();

    /**
     * 注册智能体
     */
    public void registerAgent(String agentId) {
        agentMessageQueues.put(agentId, new LinkedBlockingQueue<>());
        agentConnections.put(agentId, true);
    }

    /**
     * 注销智能体
     */
    public void unregisterAgent(String agentId) {
        agentMessageQueues.remove(agentId);
        agentConnections.remove(agentId);
    }

    /**
     * 发送消息到指定智能体
     */
    public boolean sendMessage(String fromAgentId, String toAgentId, MessageDto message) {
        if (!isAgentConnected(toAgentId)) {
            return false;
        }
        
        message.setFromAgentId(fromAgentId);
        message.setToAgentId(toAgentId);
        message.setTimestamp(System.currentTimeMillis());
        
        BlockingQueue<MessageDto> queue = agentMessageQueues.get(toAgentId);
        if (queue != null) {
            return queue.offer(message);
        }
        
        return false;
    }

    /**
     * 广播消息到所有智能体
     */
    public void broadcastMessage(String fromAgentId, MessageDto message) {
        agentConnections.forEach((agentId, connected) -> {
            if (connected && !agentId.equals(fromAgentId)) {
                sendMessage(fromAgentId, agentId, message);
            }
        });
    }

    /**
     * 获取智能体的消息
     */
    public MessageDto receiveMessage(String agentId) throws InterruptedException {
        BlockingQueue<MessageDto> queue = agentMessageQueues.get(agentId);
        if (queue != null) {
            return queue.take();
        }
        return null;
    }

    /**
     * 获取智能体的消息（非阻塞）
     */
    public MessageDto receiveMessageNonBlocking(String agentId) {
        BlockingQueue<MessageDto> queue = agentMessageQueues.get(agentId);
        if (queue != null) {
            return queue.poll();
        }
        return null;
    }

    /**
     * 检查智能体是否在线
     */
    public boolean isAgentConnected(String agentId) {
        return agentConnections.getOrDefault(agentId, false);
    }

    /**
     * 更新智能体连接状态
     */
    public void updateAgentConnection(String agentId, boolean connected) {
        agentConnections.put(agentId, connected);
    }

    /**
     * 获取在线智能体列表
     */
    public java.util.List<String> getOnlineAgents() {
        return agentConnections.entrySet().stream()
                .filter(Map.Entry::getValue)
                .map(Map.Entry::getKey)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * 创建任务分配消息
     */
    public MessageDto createTaskAssignmentMessage(String taskId, String taskType, Object taskData) {
        try {
            MessageDto message = new MessageDto();
            message.setType("TASK_ASSIGNMENT");
            Map<String, Object> contentMap = Map.of(
                "taskId", taskId,
                "taskType", taskType,
                "taskData", taskData
            );
            message.setContent(objectMapper.writeValueAsString(contentMap));
            return message;
        } catch (Exception e) {
            throw new RuntimeException("创建任务分配消息失败", e);
        }
    }

    /**
     * 创建任务状态消息
     */
    public MessageDto createTaskStatusMessage(String taskId, String status, Object result) {
        try {
            MessageDto message = new MessageDto();
            message.setType("TASK_STATUS");
            message.setContent(objectMapper.writeValueAsString(Map.of(
                "taskId", taskId,
                "status", status,
                "result", result
            )));
            return message;
        } catch (Exception e) {
            throw new RuntimeException("创建任务状态消息失败", e);
        }
    }

    /**
     * 创建协作请求消息
     */
    public MessageDto createCollaborationRequest(String taskId, String requiredCapability, Object requestData) {
        try {
            MessageDto message = new MessageDto();
            message.setType("COLLABORATION_REQUEST");
            message.setContent(objectMapper.writeValueAsString(Map.of(
                "taskId", taskId,
                "requiredCapability", requiredCapability,
                "requestData", requestData
            )));
            return message;
        } catch (Exception e) {
            throw new RuntimeException("创建协作请求消息失败", e);
        }
    }

    /**
     * 创建协作响应消息
     */
    public MessageDto createCollaborationResponse(String taskId, boolean canCollaborate, Object responseData) {
        try {
            MessageDto message = new MessageDto();
            message.setType("COLLABORATION_RESPONSE");
            message.setContent(objectMapper.writeValueAsString(Map.of(
                "taskId", taskId,
                "canCollaborate", canCollaborate,
                "responseData", responseData
            )));
            return message;
        } catch (Exception e) {
            throw new RuntimeException("创建协作响应消息失败", e);
        }
    }

    /**
     * 创建心跳消息
     */
    public MessageDto createHeartbeatMessage(String agentId, Map<String, Object> status) {
        try {
            MessageDto message = new MessageDto();
            message.setType("HEARTBEAT");
            message.setContent(objectMapper.writeValueAsString(Map.of(
                "agentId", agentId,
                "status", status,
                "timestamp", System.currentTimeMillis()
            )));
            return message;
        } catch (Exception e) {
            throw new RuntimeException("创建心跳消息失败", e);
        }
    }

    /**
     * 获取智能体消息队列大小
     */
    public int getAgentQueueSize(String agentId) {
        BlockingQueue<MessageDto> queue = agentMessageQueues.get(agentId);
        return queue != null ? queue.size() : 0;
    }

    /**
     * 清空智能体消息队列
     */
    public void clearAgentQueue(String agentId) {
        BlockingQueue<MessageDto> queue = agentMessageQueues.get(agentId);
        if (queue != null) {
            queue.clear();
        }
    }

    /**
     * 获取系统通信统计信息
     */
    public Map<String, Object> getCommunicationStats() {
        Map<String, Object> stats = new ConcurrentHashMap<>();
        stats.put("totalAgents", agentConnections.size());
        stats.put("onlineAgents", getOnlineAgents().size());
        
        Map<String, Integer> queueSizes = new ConcurrentHashMap<>();
        agentMessageQueues.forEach((agentId, queue) -> {
            queueSizes.put(agentId, queue.size());
        });
        stats.put("queueSizes", queueSizes);
        
        return stats;
    }
}