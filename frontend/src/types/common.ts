// 通用类型定义
export interface AgentStatusShape {
  status: 'active' | 'inactive' | 'busy' | 'error'
}

// 新增枚举以兼容组件中使用的常量风格
export enum AgentState {
  IDLE = 'IDLE',
  BUSY = 'BUSY',
  ERROR = 'ERROR',
  MAINTENANCE = 'MAINTENANCE'
}

// 兼容组件中直接使用的枚举名
export enum AgentStatus {
  IDLE = 'IDLE',
  BUSY = 'BUSY',
  ERROR = 'ERROR',
  MAINTENANCE = 'MAINTENANCE'
}

export interface TaskStatusShape {
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
}

export enum TaskState {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// 兼容组件中直接使用的枚举名
export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface CaseStatus {
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CLOSED'
}

// API响应类型
export interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
  success: boolean
}

// 分页响应类型
export interface PaginatedResponse<T = any> {
  records: T[]
  total: number
  current: number
  size: number
  pages: number
}

// 统计数据类型
export interface Statistics {
  total: number
  todayCount: number
  monthCount: number
  statusStats: Array<{ name: string; value: number }>
  modeStats: Array<{ name: string; value: number }>
}

// 用户类型
export interface User {
  id: number
  username: string
  realName: string
  email: string
  phone?: string
  department?: string
  role: string
  status: 'active' | 'inactive'
  createTime: string
  updateTime: string
}

// 文件类型
export interface FileInfo {
  id: number
  name: string
  size: number
  type: string
  url: string
  caseId?: number
  uploaderId: number
  uploadTime: string
}

// 过滤器类型
export interface FilterParams {
  page?: number
  size?: number
  title?: string
  status?: string
  creatorId?: number
  assigneeId?: number
  startDate?: string
  endDate?: string
}

// 图表数据类型
export interface ChartData {
  name: string
  value: number
  [key: string]: any
}

// 表格列配置类型
export interface TableColumn {
  title: string
  dataIndex: string
  key: string
  width?: number
  fixed?: 'left' | 'right'
  sorter?: boolean
  filters?: Array<{ text: string; value: string }>
  render?: (value: any, record: any, index: number) => React.ReactNode
}