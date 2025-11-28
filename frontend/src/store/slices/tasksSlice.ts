import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { taskApi } from '../../services/api'

interface Task {
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

interface TasksState {
  tasks: Task[]
  loading: boolean
  error: string | null
  selectedTask: Task | null
  statistics: {
    totalTasks: number
    pendingTasks: number
    runningTasks: number
    completedTasks: number
    failedTasks: number
  }
  filters: {
    status?: string
    type?: string
    priority?: string
    assigneeId?: string
    dateRange?: [string, string]
  }
}

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
  selectedTask: null,
  statistics: {
    totalTasks: 0,
    pendingTasks: 0,
    runningTasks: 0,
    completedTasks: 0,
    failedTasks: 0
  },
  filters: {}
}

// 异步actions
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (filters: Partial<TasksState['filters']> = {}, { rejectWithValue }) => {
    try {
      const response = await taskApi.getTasks(filters)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取任务列表失败')
    }
  }
)

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await taskApi.getTaskById?.(id)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取任务详情失败')
    }
  }
)

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: Partial<Task>, { rejectWithValue }) => {
    try {
      const response = await taskApi.createTask(taskData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '创建任务失败')
    }
  }
)

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data }: { id: string; data: Partial<Task> }, { rejectWithValue }) => {
    try {
      const response = await taskApi.updateTask(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '更新任务失败')
    }
  }
)

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string, { rejectWithValue }) => {
    try {
      await taskApi.deleteTask(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '删除任务失败')
    }
  }
)

export const startTask = createAsyncThunk(
  'tasks/startTask',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await taskApi.startTask?.(id)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '启动任务失败')
    }
  }
)

export const pauseTask = createAsyncThunk(
  'tasks/pauseTask',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await taskApi.pauseTask?.(id)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '暂停任务失败')
    }
  }
)

export const resumeTask = createAsyncThunk(
  'tasks/resumeTask',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await taskApi.resumeTask?.(id)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '恢复任务失败')
    }
  }
)

export const cancelTask = createAsyncThunk(
  'tasks/cancelTask',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await taskApi.cancelTask?.(id)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '取消任务失败')
    }
  }
)

export const assignTask = createAsyncThunk(
  'tasks/assignTask',
  async ({ id, assigneeId }: { id: string; assigneeId: string }, { rejectWithValue }) => {
    try {
      const response = await taskApi.assignTask(id, assigneeId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '分配任务失败')
    }
  }
)

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setSelectedTask: (state, action: PayloadAction<Task | null>) => {
      state.selectedTask = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<TasksState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {}
    },
    updateTaskStatus: (state, action: PayloadAction<{ id: string; status: Task['status']; progress?: number }>) => {
      const task = state.tasks.find(t => t.id === action.payload.id)
      if (task) {
        task.status = action.payload.status
        if (action.payload.progress !== undefined) {
          task.progress = action.payload.progress
        }
      }
      if (state.selectedTask?.id === action.payload.id) {
        state.selectedTask.status = action.payload.status
        if (action.payload.progress !== undefined) {
          state.selectedTask.progress = action.payload.progress
        }
      }
      tasksSlice.caseReducers.calculateStatistics(state)
    },
    updateTaskProgress: (state, action: PayloadAction<{ id: string; progress: number }>) => {
      const task = state.tasks.find(t => t.id === action.payload.id)
      if (task) {
        task.progress = action.payload.progress
      }
      if (state.selectedTask?.id === action.payload.id) {
        state.selectedTask.progress = action.payload.progress
      }
    },
    clearError: (state) => {
      state.error = null
    },
    calculateStatistics: (state) => {
      state.statistics = {
        totalTasks: state.tasks.length,
        pendingTasks: state.tasks.filter(t => t.status === 'pending').length,
        runningTasks: state.tasks.filter(t => t.status === 'running').length,
        completedTasks: state.tasks.filter(t => t.status === 'completed').length,
        failedTasks: state.tasks.filter(t => t.status === 'failed').length
      }
    }
  },
  extraReducers: (builder) => {
    // fetchTasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false
        state.tasks = action.payload
        tasksSlice.caseReducers.calculateStatistics(state)
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // fetchTaskById
    builder
      .addCase(fetchTaskById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedTask = action.payload
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // createTask
    builder
      .addCase(createTask.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false
        state.tasks.push(action.payload)
        tasksSlice.caseReducers.calculateStatistics(state)
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // updateTask
    builder
      .addCase(updateTask.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false
        const index = state.tasks.findIndex(t => t.id === action.payload.id)
        if (index !== -1) {
          state.tasks[index] = action.payload
        }
        if (state.selectedTask && state.selectedTask.id === action.payload.id) {
          state.selectedTask = action.payload
        }
        tasksSlice.caseReducers.calculateStatistics(state)
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // deleteTask
    builder
      .addCase(deleteTask.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false
        state.tasks = state.tasks.filter(t => t.id !== action.payload)
        if (state.selectedTask && state.selectedTask.id === action.payload) {
          state.selectedTask = null
        }
        tasksSlice.caseReducers.calculateStatistics(state)
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // startTask
    builder
      .addCase(startTask.fulfilled, (state, action) => {
        const task = state.tasks.find(t => t.id === action.payload.id)
        if (task) {
          Object.assign(task, action.payload)
        }
        if (state.selectedTask && state.selectedTask.id === action.payload.id) {
          Object.assign(state.selectedTask, action.payload)
        }
        tasksSlice.caseReducers.calculateStatistics(state)
      })

    // pauseTask
    builder
      .addCase(pauseTask.fulfilled, (state, action) => {
        const task = state.tasks.find(t => t.id === action.payload.id)
        if (task) {
          Object.assign(task, action.payload)
        }
        if (state.selectedTask && state.selectedTask.id === action.payload.id) {
          Object.assign(state.selectedTask, action.payload)
        }
        tasksSlice.caseReducers.calculateStatistics(state)
      })

    // resumeTask
    builder
      .addCase(resumeTask.fulfilled, (state, action) => {
        const task = state.tasks.find(t => t.id === action.payload.id)
        if (task) {
          Object.assign(task, action.payload)
        }
        if (state.selectedTask && state.selectedTask.id === action.payload.id) {
          Object.assign(state.selectedTask, action.payload)
        }
        tasksSlice.caseReducers.calculateStatistics(state)
      })

    // cancelTask
    builder
      .addCase(cancelTask.fulfilled, (state, action) => {
        const task = state.tasks.find(t => t.id === action.payload.id)
        if (task) {
          Object.assign(task, action.payload)
        }
        if (state.selectedTask && state.selectedTask.id === action.payload.id) {
          Object.assign(state.selectedTask, action.payload)
        }
        tasksSlice.caseReducers.calculateStatistics(state)
      })

    // assignTask
    builder
      .addCase(assignTask.fulfilled, (state, action) => {
        const task = state.tasks.find(t => t.id === action.payload.id)
        if (task) {
          Object.assign(task, action.payload)
        }
        if (state.selectedTask && state.selectedTask.id === action.payload.id) {
          Object.assign(state.selectedTask, action.payload)
        }
      })
  }
})

export const {
  setSelectedTask,
  setFilters,
  clearFilters,
  updateTaskStatus,
  updateTaskProgress,
  clearError,
  calculateStatistics
} = tasksSlice.actions

export default tasksSlice.reducer