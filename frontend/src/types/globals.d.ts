// Provide both UPPERCASE constant access (e.g. TaskStatus.COMPLETED)
// and lowercase string values (e.g. 'completed') to match existing code.
declare const TaskStatus: {
  PENDING: 'pending'
  COMPLETED: 'completed'
  RUNNING: 'running'
  FAILED: 'failed'
  CANCELED: 'cancelled'
  CANCELLED: 'cancelled'
}
declare type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus]

declare const AgentStatus: {
  IDLE: 'idle'
  BUSY: 'busy'
  RUNNING: 'running'
  STOPPED: 'stopped'
  ERROR: 'error'
  MAINTENANCE: 'maintenance'
}
declare type AgentStatus = typeof AgentStatus[keyof typeof AgentStatus]

// Broad Case type to reduce mismatch errors during progressive fixes.
declare interface Case {
  id?: number | string
  caseNumber?: string
  title?: string
  description?: string
  status?: TaskStatus | string
  severityLevel?: string
  assignedAgent?: string
  createdAt?: string
  updatedAt?: string
  tags: string[]
  // failure details often used in CaseManagement
  failureType?: string
  progress?: number
  attachments?: number
  productName?: string
  productModel?: string
  failureDate?: string
  failureLocation?: string
}

declare interface Task {
  id?: number | string
  name?: string
  status?: TaskStatus | string
  progress?: number
  createdAt?: string
  updatedAt?: string
}

declare interface Agent {
  id?: number | string
  name?: string
  status?: AgentStatus | string
  ip?: string
  version?: string
  lastHeartbeat?: string
}

declare interface User {
  id?: number | string
  username?: string
  displayName?: string
  avatar?: string
  realName?: string
  email?: string
  roles?: string[]
}
