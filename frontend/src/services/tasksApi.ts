import api from './api'

export interface Task {
  id: string
  title: string
  description: string
  type: 'analysis' | 'inspection' | 'report' | 'recommendation'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  creatorId: string
  assigneeId?: string
  agentId?: string
  caseId?: string
  progress: number
  startTime?: string
  endTime?: string
  estimatedDuration?: number
  actualDuration?: number
  result?: any
  error?: string
  dependencies: string[]
  subtasks: string[]
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

export const tasksApi = {
  // 获取任务列表
  getTasks: async (filters?: any) => {
    const response = await api.get('/api/tasks', { params: filters })
    return response.data
  },

  // 获取任务详情
  getTaskById: async (id: string) => {
    const response = await api.get(`/api/tasks/${id}`)
    return response.data
  },

  // 创建任务
  createTask: async (taskData: Partial<Task>) => {
    const response = await api.post('/api/tasks', taskData)
    return response.data
  },

  // 更新任务
  updateTask: async (id: string, taskData: Partial<Task>) => {
    const response = await api.put(`/api/tasks/${id}`, taskData)
    return response.data
  },

  // 删除任务
  deleteTask: async (id: string) => {
    const response = await api.delete(`/api/tasks/${id}`)
    return response.data
  },

  // 启动任务
  startTask: async (id: string) => {
    const response = await api.post(`/api/tasks/${id}/start`)
    return response.data
  },

  // 暂停任务
  pauseTask: async (id: string) => {
    const response = await api.post(`/api/tasks/${id}/pause`)
    return response.data
  },

  // 恢复任务
  resumeTask: async (id: string) => {
    const response = await api.post(`/api/tasks/${id}/resume`)
    return response.data
  },

  // 取消任务
  cancelTask: async (id: string) => {
    const response = await api.post(`/api/tasks/${id}/cancel`)
    return response.data
  },

  // 分配任务
  assignTask: async (id: string, assigneeId: string) => {
    const response = await api.post(`/api/tasks/${id}/assign`, { assigneeId })
    return response.data
  },

  // 获取任务日志
  getTaskLogs: async (id: string) => {
    const response = await api.get(`/api/tasks/${id}/logs`)
    return response.data
  },

  // 获取任务统计信息
  getTaskStatistics: async () => {
    const response = await api.get('/api/tasks/statistics')
    return response.data
  },

  // 批量操作任务
  batchUpdateTasks: async (taskIds: string[], updateData: Partial<Task>) => {
    const response = await api.put('/api/tasks/batch', { taskIds, updateData })
    return response.data
  },

  // 获取任务依赖关系
  getTaskDependencies: async (id: string) => {
    const response = await api.get(`/api/tasks/${id}/dependencies`)
    return response.data
  },

  // 更新任务进度
  updateTaskProgress: async (id: string, progress: number) => {
    const response = await api.put(`/api/tasks/${id}/progress`, { progress })
    return response.data
  }
}