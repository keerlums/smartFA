package com.smartfa.hub.service;

import com.smartfa.hub.dto.TaskCreateDTO;
import com.smartfa.hub.dto.TaskUpdateDTO;
import com.smartfa.hub.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

/**
 * 任务服务接口
 * 
 * @author SmartFA Team
 */
public interface TaskService {

    /**
     * 创建任务
     */
    Task createTask(TaskCreateDTO taskCreateDTO);

    /**
     * 批量创建任务
     */
    List<Task> createTasks(List<TaskCreateDTO> taskCreateDTOs);

    /**
     * 获取任务
     */
    Task getTask(Long id);

    /**
     * 分页查询任务
     */
    Page<Task> getTasks(String name, Task.TaskType type, Task.TaskStatus status, 
                       Long creatorId, Long agentId, Pageable pageable);

    /**
     * 更新任务
     */
    Task updateTask(Long id, TaskUpdateDTO taskUpdateDTO);

    /**
     * 删除任务
     */
    void deleteTask(Long id);

    /**
     * 开始任务
     */
    Task startTask(Long id);

    /**
     * 暂停任务
     */
    Task pauseTask(Long id);

    /**
     * 恢复任务
     */
    Task resumeTask(Long id);

    /**
     * 取消任务
     */
    Task cancelTask(Long id);

    /**
     * 重试任务
     */
    Task retryTask(Long id);

    /**
     * 更新任务进度
     */
    Task updateProgress(Long id, Integer progress);

    /**
     * 完成任务
     */
    Task completeTask(Long id, Map<String, Object> result);

    /**
     * 任务失败
     */
    Task failTask(Long id, String errorMessage);

    /**
     * 获取任务统计
     */
    Map<String, Object> getTaskStatistics();

    /**
     * 获取我的任务
     */
    Page<Task> getMyTasks(Task.TaskStatus status, Pageable pageable);

    /**
     * 智能任务分解
     */
    List<Task> decomposeTask(Long parentTaskId, String description);

    /**
     * 任务调度
     */
    void scheduleTask(Long taskId);

    /**
     * 批量任务调度
     */
    void scheduleTasks();
}