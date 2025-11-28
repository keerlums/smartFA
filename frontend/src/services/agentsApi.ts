import api from './api'

export interface Agent {
  id: string
  name: string
  type: string
  status: 'active' | 'inactive' | 'busy' | 'error'
  capabilities: string[]
  currentTask?: string
  performance: {
    successRate: number
    avgResponseTime: number
    tasksCompleted: number
  }
  lastActiveTime: string
  config: Record<string, any>
}

export const agentsApi = {
  // 获取智能体列表
  getAgents: async (params?: any) => {
    const response = await api.get('/api/agents', { params })
    return response.data
  },

  // 获取智能体详情
  getAgentById: async (id: string) => {
    const response = await api.get(`/api/agents/${id}`)
    return response.data
  },

  // 创建智能体
  createAgent: async (agentData: Partial<Agent>) => {
    const response = await api.post('/api/agents', agentData)
    return response.data
  },

  // 更新智能体
  updateAgent: async (id: string, agentData: Partial<Agent>) => {
    const response = await api.put(`/api/agents/${id}`, agentData)
    return response.data
  },

  // 删除智能体
  deleteAgent: async (id: string) => {
    const response = await api.delete(`/api/agents/${id}`)
    return response.data
  },

  // 启动智能体
  startAgent: async (id: string) => {
    const response = await api.post(`/api/agents/${id}/start`)
    return response.data
  },

  // 停止智能体
  stopAgent: async (id: string) => {
    const response = await api.post(`/api/agents/${id}/stop`)
    return response.data
  },

  // 获取智能体性能数据
  getAgentPerformance: async (id: string) => {
    const response = await api.get(`/api/agents/${id}/performance`)
    return response.data
  },

  // 获取智能体日志
  getAgentLogs: async (id: string, params?: any) => {
    const response = await api.get(`/api/agents/${id}/logs`, { params })
    return response.data
  },

  // 测试智能体
  testAgent: async (id: string, testData: any) => {
    const response = await api.post(`/api/agents/${id}/test`, testData)
    return response.data
  },

  // 获取智能体统计信息
  getAgentStatistics: async () => {
    const response = await api.get('/api/agents/statistics')
    return response.data
  }
}