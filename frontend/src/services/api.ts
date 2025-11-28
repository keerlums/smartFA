import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { message } from 'antd'

// 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加认证token
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response
    
    // 如果响应包含标准的Result结构
    if (data && typeof data === 'object' && 'code' in data) {
      if (data.code === 200) {
        return response
      } else {
        // 业务错误
        message.error(data.message || '请求失败')
        return Promise.reject(new Error(data.message || '请求失败'))
      }
    }
    
    return response
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          message.error('未授权，请重新登录')
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          message.error('拒绝访问')
          break
        case 404:
          message.error('请求的资源不存在')
          break
        case 500:
          message.error('服务器内部错误')
          break
        default:
          message.error(data?.message || '网络错误')
      }
    } else if (error.request) {
      message.error('网络连接失败')
    } else {
      message.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

// API方法封装
export const caseApi: any = {
  // 获取案例列表
  getCases: (params?: any) => api.get('/api/cases', { params }),
  
  // 获取案例详情
  getCaseById: (id: number) => api.get(`/api/cases/${id}`),
  
  // 创建案例
  createCase: (data: any) => api.post('/api/cases', data),
  
  // 更新案例
  updateCase: (id: number, data: any) => api.put(`/api/cases/${id}`, data),
  
  // 删除案例
  deleteCase: (id: number) => api.delete(`/api/cases/${id}`),
  
  // 分配案例
  assignCase: (id: number, assigneeId: number) => 
    api.put(`/api/cases/${id}/assign`, null, { params: { assigneeId } }),
  
  // 更新案例状态
  updateCaseStatus: (id: number, status: string) => 
    api.put(`/api/cases/${id}/status`, null, { params: { status } }),
  
  // 获取统计信息
  getStatistics: () => api.get('/api/cases/statistics'),
  
  // 获取最近案例
  getRecentCases: (limit?: number) => api.get('/api/cases/recent', { params: { limit } }),
}

export const fileApi: any = {
  // 上传文件
  uploadFile: (file: File, onProgress?: (p: number) => void, caseId?: number) => {
    const formData = new FormData()
    formData.append('file', file)
    if (caseId) {
      formData.append('caseId', caseId.toString())
    }
    return api.post('/api/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent: any) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100)
            try { onProgress(percent) } catch (e) { /* ignore */ }
          }
        }
    })
  },
  
  // 获取文件列表
  getFiles: (caseId?: number) => api.get('/api/files', { params: { caseId } }),
  
  // 下载文件
  downloadFile: (fileId: number | string) => api.get(`/api/files/${fileId}/download`, { responseType: 'blob' }),
  
  // 删除文件
  deleteFile: (fileId: number | string) => api.delete(`/api/files/${fileId}`),
}

// 兼容别名
fileApi.upload = (file: File, onProgress?: (p: number) => void, caseId?: number) => fileApi.uploadFile(file, onProgress, caseId)
fileApi.get = (caseId?: number) => fileApi.getFiles(caseId)
fileApi.download = (fileId: number) => fileApi.downloadFile(fileId)
fileApi.delete = (fileId: number) => fileApi.deleteFile(fileId)

// caseApi 兼容旧名
caseApi.create = caseApi.createCase
caseApi.update = caseApi.updateCase
caseApi.delete = caseApi.deleteCase
caseApi.get = caseApi.getCases
caseApi.getDetail = caseApi.getCaseById

export const taskApi: any = {
  // 获取任务列表
  getTasks: (params?: any) => api.get('/api/tasks', { params }),
  
  // 创建任务
  createTask: (data: any) => api.post('/api/tasks', data),
  
  // 更新任务
  updateTask: (id: string, data: any) => api.put(`/api/tasks/${id}`, data),
  
  // 删除任务
  deleteTask: (id: string) => api.delete(`/api/tasks/${id}`),
  
  // 分配任务
  assignTask: (id: string, assigneeId: string) => 
    api.put(`/api/tasks/${id}/assign`, null, { params: { assigneeId } }),
  
  // 更新任务状态
  updateTaskStatus: (id: string, status: string) => 
    api.put(`/api/tasks/${id}/status`, null, { params: { status } }),

  // 获取任务详情
  getTaskById: (id: string) => api.get(`/api/tasks/${id}`),

  // 启动任务
  startTask: (id: string) => api.post(`/api/tasks/${id}/start`),

  // 暂停任务
  pauseTask: (id: string) => api.post(`/api/tasks/${id}/pause`),

  // 恢复任务
  resumeTask: (id: string) => api.post(`/api/tasks/${id}/resume`),

  // 取消任务
  cancelTask: (id: string) => api.post(`/api/tasks/${id}/cancel`),
}

// 兼容旧调用名
taskApi.getList = (params?: any) => taskApi.getTasks(params)
taskApi.update = (id: string, data: any) => taskApi.updateTask(id, data)
taskApi.cancel = (id: string) => taskApi.cancelTask(id)
taskApi.getDetail = (id: string) => taskApi.getTaskById(id)
taskApi.getLogs = (id: string) => api.get(`/api/tasks/${id}/logs`)

export const agentApi: any = {
  // 获取智能体列表
  getAgents: (params?: any) => api.get('/api/agents', { params }),
  
  // 获取智能体详情
  getAgentById: (id: number) => api.get(`/api/agents/${id}`),
  
  // 创建智能体
  createAgent: (data: any) => api.post('/api/agents', data),
  
  // 更新智能体
  updateAgent: (id: number, data: any) => api.put(`/api/agents/${id}`, data),
  
  // 删除智能体
  deleteAgent: (id: number) => api.delete(`/api/agents/${id}`),
  
  // 启动智能体
  startAgent: (id: number) => api.post(`/api/agents/${id}/start`),
  
  // 停止智能体
  stopAgent: (id: number) => api.post(`/api/agents/${id}/stop`),
  
  // 获取智能体任务
  getAgentTasks: (agentId: number) => api.get(`/api/agents/${agentId}/tasks`),
}

// 兼容旧调用名（组件中有使用 getList/start/stop/restart/getDetail/getMetrics）
agentApi.getList = (params?: any) => agentApi.getAgents(params)
agentApi.start = (id: number) => agentApi.startAgent(id)
agentApi.stop = (id: number) => agentApi.stopAgent(id)
agentApi.restart = (id: number) => api.post(`/api/agents/${id}/restart`)
agentApi.getDetail = (id: number) => agentApi.getAgentById(id)
agentApi.getMetrics = (id: number) => api.get(`/api/agents/${id}/metrics`)

export const userApi = {
  // 登录
  login: (username: string, password: string) => 
    api.post('/api/auth/login', { username, password }),
  
  // 登出
  logout: () => api.post('/api/auth/logout'),
  
  // 获取用户信息
  getUserInfo: () => api.get('/api/auth/userinfo'),
  
  // 获取用户列表
  getUsers: (params?: any) => api.get('/api/users', { params }),
  
  // 创建用户
  createUser: (data: any) => api.post('/api/users', data),
  
  // 更新用户
  updateUser: (id: number, data: any) => api.put(`/api/users/${id}`, data),
  
  // 删除用户
  deleteUser: (id: number) => api.delete(`/api/users/${id}`),
  
  // 修改密码
  changePassword: (oldPassword: string, newPassword: string) => 
    api.put('/api/auth/password', { oldPassword, newPassword }),
}

export const reportApi = {
  // 获取报告列表
  getReports: (params?: any) => api.get('/api/reports', { params }),
  
  // 获取报告详情
  getReportById: (id: number) => api.get(`/api/reports/${id}`),
  
  // 创建报告
  createReport: (data: any) => api.post('/api/reports', data),
  
  // 更新报告
  updateReport: (id: number, data: any) => api.put(`/api/reports/${id}`, data),
  
  // 删除报告
  deleteReport: (id: number) => api.delete(`/api/reports/${id}`),
  
  // 生成报告
  generateReport: (caseId: number, reportType: string) => 
    api.post('/api/reports/generate', { caseId, reportType }),
  
  // 下载报告
  downloadReport: (id: number) => api.get(`/api/reports/${id}/download`, { responseType: 'blob' }),
}

// 仪表盘相关 API（兼容引用）
export const dashboardApi = {
  getRealTimeMetrics: () => api.get('/api/dashboard/metrics'),
}

export default api
export { api }