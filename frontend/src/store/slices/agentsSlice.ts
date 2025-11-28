import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { agentApi } from '../../services/api'

interface Agent {
  id: number
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

interface AgentsState {
  agents: Agent[]
  loading: boolean
  error: string | null
  selectedAgent: Agent | null
  statistics: {
    totalAgents: number
    activeAgents: number
    busyAgents: number
    errorAgents: number
  }
}

const initialState: AgentsState = {
  agents: [],
  loading: false,
  error: null,
  selectedAgent: null,
  statistics: {
    totalAgents: 0,
    activeAgents: 0,
    busyAgents: 0,
    errorAgents: 0
  }
}

// 异步actions
export const fetchAgents = createAsyncThunk(
  'agents/fetchAgents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await agentApi.getAgents()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取智能体列表失败')
    }
  }
)

export const createAgent = createAsyncThunk(
  'agents/createAgent',
  async (agentData: Partial<Agent>, { rejectWithValue }) => {
    try {
      const response = await agentApi.createAgent(agentData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '创建智能体失败')
    }
  }
)

export const updateAgent = createAsyncThunk(
  'agents/updateAgent',
  async ({ id, data }: { id: number; data: Partial<Agent> }, { rejectWithValue }) => {
    try {
      const response = await agentApi.updateAgent(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '更新智能体失败')
    }
  }
)

export const deleteAgent = createAsyncThunk(
  'agents/deleteAgent',
  async (id: number, { rejectWithValue }) => {
    try {
      await agentApi.deleteAgent(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '删除智能体失败')
    }
  }
)

export const startAgent = createAsyncThunk(
  'agents/startAgent',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await agentApi.startAgent(id)
      return { id, agent: response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '启动智能体失败')
    }
  }
)

export const stopAgent = createAsyncThunk(
  'agents/stopAgent',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await agentApi.stopAgent(id)
      return { id, agent: response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '停止智能体失败')
    }
  }
)

const agentsSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    setSelectedAgent: (state, action: PayloadAction<Agent | null>) => {
      state.selectedAgent = action.payload
    },
    updateAgentStatus: (state, action: PayloadAction<{ id: string; status: Agent['status'] }>) => {
      const agent = state.agents.find(a => String(a.id) === String(action.payload.id))
      if (agent) {
        agent.status = action.payload.status
      }
    },
    updateAgentPerformance: (state, action: PayloadAction<{ id: string; performance: Agent['performance'] }>) => {
      const agent = state.agents.find(a => String(a.id) === String(action.payload.id))
      if (agent) {
        agent.performance = action.payload.performance
      }
    },
    clearError: (state) => {
      state.error = null
    },
    calculateStatistics: (state) => {
      state.statistics = {
        totalAgents: state.agents.length,
        activeAgents: state.agents.filter(a => a.status === 'active').length,
        busyAgents: state.agents.filter(a => a.status === 'busy').length,
        errorAgents: state.agents.filter(a => a.status === 'error').length
      }
    }
  },
  extraReducers: (builder) => {
    // fetchAgents
    builder
      .addCase(fetchAgents.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.loading = false
        state.agents = action.payload
        agentsSlice.caseReducers.calculateStatistics(state)
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // createAgent
    builder
      .addCase(createAgent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createAgent.fulfilled, (state, action) => {
        state.loading = false
        state.agents.push(action.payload)
        agentsSlice.caseReducers.calculateStatistics(state)
      })
      .addCase(createAgent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // updateAgent
    builder
      .addCase(updateAgent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateAgent.fulfilled, (state, action) => {
        state.loading = false
        const index = state.agents.findIndex(a => String(a.id) === String(action.payload.id))
        if (index !== -1) {
          state.agents[index] = action.payload
        }
        if (state.selectedAgent?.id === action.payload.id) {
          state.selectedAgent = action.payload
        }
      })
      .addCase(updateAgent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // deleteAgent
    builder
      .addCase(deleteAgent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteAgent.fulfilled, (state, action) => {
        state.loading = false
        state.agents = state.agents.filter(a => String(a.id) !== String(action.payload))
        if (String(state.selectedAgent?.id) === String(action.payload)) {
          state.selectedAgent = null
        }
        agentsSlice.caseReducers.calculateStatistics(state)
      })
      .addCase(deleteAgent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // startAgent
    builder
      .addCase(startAgent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(startAgent.fulfilled, (state, action) => {
        state.loading = false
        const agent = state.agents.find(a => a.id === action.payload.id)
        if (agent) {
          Object.assign(agent, action.payload.agent)
        }
        agentsSlice.caseReducers.calculateStatistics(state)
      })
      .addCase(startAgent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // stopAgent
    builder
      .addCase(stopAgent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(stopAgent.fulfilled, (state, action) => {
        state.loading = false
        const agent = state.agents.find(a => a.id === action.payload.id)
        if (agent) {
          Object.assign(agent, action.payload.agent)
        }
        agentsSlice.caseReducers.calculateStatistics(state)
      })
      .addCase(stopAgent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const {
  setSelectedAgent,
  updateAgentStatus,
  updateAgentPerformance,
  clearError,
  calculateStatistics
} = agentsSlice.actions

export default agentsSlice.reducer