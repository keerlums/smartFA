package com.smartfa.hub.controller;

import com.smartfa.common.vo.Result;
import com.smartfa.hub.dto.TaskCreateDTO;
import com.smartfa.hub.dto.TaskUpdateDTO;
import com.smartfa.hub.entity.Task;
import com.smartfa.hub.service.TaskService;
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
 * 任务管理控制器
 * 
 * @author SmartFA Team
 */
@Tag(name = "任务管理", description = "任务的创建、查询、更新、删除等操作")
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Operation(summary = "创建任务")
    @PostMapping
    public Result<Task> createTask(@Valid @RequestBody TaskCreateDTO taskCreateDTO) {
        Task task = taskService.createTask(taskCreateDTO);
        return Result.success(task);
    }

    @Operation(summary = "批量创建任务")
    @PostMapping("/batch")
    public Result<List<Task>> createTasks(@Valid @RequestBody List<TaskCreateDTO> taskCreateDTOs) {
        List<Task> tasks = taskService.createTasks(taskCreateDTOs);
        return Result.success(tasks);
    }

    @Operation(summary = "获取任务详情")
    @GetMapping("/{id}")
    public Result<Task> getTask(@PathVariable Long id) {
        Task task = taskService.getTask(id);
        return Result.success(task);
    }

    @Operation(summary = "分页查询任务")
    @GetMapping
    public Result<Page<Task>> getTasks(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Task.TaskType type,
            @RequestParam(required = false) Task.TaskStatus status,
            @RequestParam(required = false) Long creatorId,
            @RequestParam(required = false) Long agentId,
            Pageable pageable) {
        
        Page<Task> tasks = taskService.getTasks(name, type, status, creatorId, agentId, pageable);
        return Result.success(tasks);
    }

    @Operation(summary = "更新任务")
    @PutMapping("/{id}")
    public Result<Task> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskUpdateDTO taskUpdateDTO) {
        Task task = taskService.updateTask(id, taskUpdateDTO);
        return Result.success(task);
    }

    @Operation(summary = "删除任务")
    @DeleteMapping("/{id}")
    public Result<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return Result.success();
    }

    @Operation(summary = "开始任务")
    @PostMapping("/{id}/start")
    public Result<Task> startTask(@PathVariable Long id) {
        Task task = taskService.startTask(id);
        return Result.success(task);
    }

    @Operation(summary = "暂停任务")
    @PostMapping("/{id}/pause")
    public Result<Task> pauseTask(@PathVariable Long id) {
        Task task = taskService.pauseTask(id);
        return Result.success(task);
    }

    @Operation(summary = "恢复任务")
    @PostMapping("/{id}/resume")
    public Result<Task> resumeTask(@PathVariable Long id) {
        Task task = taskService.resumeTask(id);
        return Result.success(task);
    }

    @Operation(summary = "取消任务")
    @PostMapping("/{id}/cancel")
    public Result<Task> cancelTask(@PathVariable Long id) {
        Task task = taskService.cancelTask(id);
        return Result.success(task);
    }

    @Operation(summary = "重试任务")
    @PostMapping("/{id}/retry")
    public Result<Task> retryTask(@PathVariable Long id) {
        Task task = taskService.retryTask(id);
        return Result.success(task);
    }

    @Operation(summary = "更新任务进度")
    @PutMapping("/{id}/progress")
    public Result<Task> updateProgress(
            @PathVariable Long id,
            @RequestParam Integer progress) {
        Task task = taskService.updateProgress(id, progress);
        return Result.success(task);
    }

    @Operation(summary = "完成任务")
    @PostMapping("/{id}/complete")
    public Result<Task> completeTask(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> result) {
        Task task = taskService.completeTask(id, result);
        return Result.success(task);
    }

    @Operation(summary = "任务失败")
    @PostMapping("/{id}/fail")
    public Result<Task> failTask(
            @PathVariable Long id,
            @RequestParam String errorMessage) {
        Task task = taskService.failTask(id, errorMessage);
        return Result.success(task);
    }

    @Operation(summary = "获取任务统计")
    @GetMapping("/statistics")
    public Result<Map<String, Object>> getTaskStatistics() {
        Map<String, Object> statistics = taskService.getTaskStatistics();
        return Result.success(statistics);
    }

    @Operation(summary = "获取我的任务")
    @GetMapping("/my")
    public Result<Page<Task>> getMyTasks(
            @RequestParam(required = false) Task.TaskStatus status,
            Pageable pageable) {
        Page<Task> tasks = taskService.getMyTasks(status, pageable);
        return Result.success(tasks);
    }
}