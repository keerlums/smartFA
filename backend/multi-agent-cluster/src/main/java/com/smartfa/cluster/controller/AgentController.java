package com.smartfa.cluster.controller;

import com.smartfa.common.vo.Result;
import com.smartfa.cluster.dto.AgentCreateDTO;
import com.smartfa.cluster.dto.AgentUpdateDTO;
import com.smartfa.cluster.entity.Agent;
import com.smartfa.cluster.service.AgentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

/**
 * 智能体管理控制器
 * 
 * @author SmartFA Team
 */
@Tag(name = "智能体管理", description = "智能体的创建、查询、更新、删除等操作")
@RestController
@RequestMapping("/api/agents")
public class AgentController {

    @Autowired
    private AgentService agentService;

    @Operation(summary = "创建智能体")
    @PostMapping
    public Result<Agent> createAgent(@Valid @RequestBody AgentCreateDTO agentCreateDTO) {
        Agent agent = agentService.createAgent(agentCreateDTO);
        return Result.success(agent);
    }

    @Operation(summary = "批量创建智能体")
    @PostMapping("/batch")
    public Result<List<Agent>> createAgents(@Valid @RequestBody List<AgentCreateDTO> agentCreateDTOs) {
        List<Agent> agents = agentService.createAgents(agentCreateDTOs);
        return Result.success(agents);
    }

    @Operation(summary = "获取智能体详情")
    @GetMapping("/{id}")
    public Result<Agent> getAgent(@PathVariable Long id) {
        Agent agent = agentService.getAgent(id);
        return Result.success(agent);
    }

    @Operation(summary = "分页查询智能体")
    @GetMapping
    public Result<Page<Agent>> getAgents(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Agent.AgentType type,
            @RequestParam(required = false) Agent.AgentStatus status,
            @RequestParam(required = false) Agent.HealthStatus healthStatus,
            Pageable pageable) {
        
        Page<Agent> agents = agentService.getAgents(name, type, status, healthStatus, pageable);
        return Result.success(agents);
    }

    @Operation(summary = "更新智能体")
    @PutMapping("/{id}")
    public Result<Agent> updateAgent(
            @PathVariable Long id,
            @Valid @RequestBody AgentUpdateDTO agentUpdateDTO) {
        Agent agent = agentService.updateAgent(id, agentUpdateDTO);
        return Result.success(agent);
    }

    @Operation(summary = "删除智能体")
    @DeleteMapping("/{id}")
    public Result<Void> deleteAgent(@PathVariable Long id) {
        agentService.deleteAgent(id);
        return Result.success();
    }

    @Operation(summary = "启动智能体")
    @PostMapping("/{id}/start")
    public Result<Agent> startAgent(@PathVariable Long id) {
        Agent agent = agentService.startAgent(id);
        return Result.success(agent);
    }

    @Operation(summary = "停止智能体")
    @PostMapping("/{id}/stop")
    public Result<Agent> stopAgent(@PathVariable Long id) {
        Agent agent = agentService.stopAgent(id);
        return Result.success(agent);
    }

    @Operation(summary = "重启智能体")
    @PostMapping("/{id}/restart")
    public Result<Agent> restartAgent(@PathVariable Long id) {
        Agent agent = agentService.restartAgent(id);
        return Result.success(agent);
    }

    @Operation(summary = "智能体心跳")
    @PostMapping("/{id}/heartbeat")
    public Result<Void> heartbeat(@PathVariable Long id) {
        agentService.heartbeat(id);
        return Result.success();
    }

    @Operation(summary = "更新智能体状态")
    @PutMapping("/{id}/status")
    public Result<Agent> updateStatus(
            @PathVariable Long id,
            @RequestParam Agent.AgentStatus status) {
        Agent agent = agentService.updateStatus(id, status);
        return Result.success(agent);
    }

    @Operation(summary = "更新性能指标")
    @PutMapping("/{id}/metrics")
    public Result<Agent> updateMetrics(
            @PathVariable Long id,
            @RequestBody Map<String, Object> metrics) {
        Agent agent = agentService.updateMetrics(id, metrics);
        return Result.success(agent);
    }

    @Operation(summary = "获取智能体统计")
    @GetMapping("/statistics")
    public Result<Map<String, Object>> getAgentStatistics() {
        Map<String, Object> statistics = agentService.getAgentStatistics();
        return Result.success(statistics);
    }

    @Operation(summary = "获取可用智能体")
    @GetMapping("/available")
    public Result<List<Agent>> getAvailableAgents(
            @RequestParam(required = false) Agent.AgentType type) {
        List<Agent> agents = agentService.getAvailableAgents(type);
        return Result.success(agents);
    }

    @Operation(summary = "分配任务给智能体")
    @PostMapping("/{id}/assign-task")
    public Result<Agent> assignTask(
            @PathVariable Long id,
            @RequestParam Long taskId) {
        Agent agent = agentService.assignTask(id, taskId);
        return Result.success(agent);
    }

    @Operation(summary = "完成任务")
    @PostMapping("/{id}/complete-task")
    public Result<Agent> completeTask(
            @PathVariable Long id,
            @RequestParam(required = false) Boolean success,
            @RequestParam(required = false) String errorMessage) {
        Agent agent = agentService.completeTask(id, success, errorMessage);
        return Result.success(agent);
    }

    @Operation(summary = "获取智能体日志")
    @GetMapping("/{id}/logs")
    public Result<List<String>> getAgentLogs(
            @PathVariable Long id,
            @RequestParam(required = false) Integer limit) {
        List<String> logs = agentService.getAgentLogs(id, limit);
        return Result.success(logs);
    }

    @Operation(summary = "智能体扩容")
    @PostMapping("/{type}/scale")
    public Result<List<Agent>> scaleAgents(
            @RequestParam Agent.AgentType type,
            @RequestParam Integer count) {
        List<Agent> agents = agentService.scaleAgents(type, count);
        return Result.success(agents);
    }
}