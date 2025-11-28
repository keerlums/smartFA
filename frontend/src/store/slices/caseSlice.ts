import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { message } from 'antd'
import { caseApi } from '../../services/api'

interface FailureCase {
  id: number
  caseNumber: string
  title: string
  description: string
  productName: string
  productModel: string
  failureDate: string
  failureLocation: string
  failureMode: string
  failureMechanism: string
  severityLevel: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CLOSED'
  creatorId: number
  assigneeId: number
  createTime: string
  updateTime: string
  creator?: {
    id: number
    realName: string
  }
  assignee?: {
    id: number
    realName: string
  }
}

interface CaseState {
  cases: FailureCase[]
  currentCase: FailureCase | null
  loading: boolean
  total: number
  currentPage: number
  pageSize: number
  statistics: {
    totalCount: number
    todayCount: number
    monthCount: number
    statusStats: Array<{ name: string; value: number }>
    modeStats: Array<{ name: string; value: number }>
  } | null
}

const initialState: CaseState = {
  cases: [],
  currentCase: null,
  loading: false,
  total: 0,
  currentPage: 1,
  pageSize: 10,
  statistics: null
}

// 异步actions
export const fetchCases = createAsyncThunk(
  'case/fetchCases',
  async (params: {
    page?: number
    size?: number
    title?: string
    status?: string
    creatorId?: number
    assigneeId?: number
    startDate?: string
    endDate?: string
  }) => {
    const response = await caseApi.getCases(params)
    return response.data
  }
)

export const fetchCaseById = createAsyncThunk(
  'case/fetchCaseById',
  async (id: number) => {
    const response = await caseApi.getCaseById(id)
    return response.data
  }
)

export const createCase = createAsyncThunk(
  'case/createCase',
  async (caseData: Partial<FailureCase>) => {
    const response = await caseApi.createCase(caseData)
    return response.data
  }
)

export const updateCase = createAsyncThunk(
  'case/updateCase',
  async ({ id, caseData }: { id: number; caseData: Partial<FailureCase> }) => {
    const response = await caseApi.updateCase(id, caseData)
    return response.data
  }
)

export const deleteCase = createAsyncThunk(
  'case/deleteCase',
  async (id: number) => {
    await caseApi.deleteCase(id)
    return id
  }
)

export const assignCase = createAsyncThunk(
  'case/assignCase',
  async ({ id, assigneeId }: { id: number; assigneeId: number }) => {
    await caseApi.assignCase(id, assigneeId)
    return { id, assigneeId }
  }
)

export const updateCaseStatus = createAsyncThunk(
  'case/updateCaseStatus',
  async ({ id, status }: { id: number; status: string }) => {
    await caseApi.updateCaseStatus(id, status)
    return { id, status }
  }
)

export const fetchCaseStatistics = createAsyncThunk(
  'case/fetchCaseStatistics',
  async () => {
    const response = await caseApi.getStatistics()
    return response.data
  }
)

export const fetchRecentCases = createAsyncThunk(
  'case/fetchRecentCases',
  async (limit: number = 5) => {
    const response = await caseApi.getRecentCases(limit)
    return response.data
  }
)

const caseSlice = createSlice({
  name: 'case',
  initialState,
  reducers: {
    setCurrentCase: (state, action: PayloadAction<FailureCase | null>) => {
      state.currentCase = action.payload
    },
    clearCases: (state) => {
      state.cases = []
      state.total = 0
      state.currentPage = 1
    },
    setPage: (state, action: PayloadAction<{ page: number; size: number }>) => {
      state.currentPage = action.payload.page
      state.pageSize = action.payload.size
    }
  },
  extraReducers: (builder) => {
    // 获取案例列表
    builder
      .addCase(fetchCases.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchCases.fulfilled, (state, action) => {
        state.loading = false
        state.cases = action.payload.records || []
        state.total = action.payload.total || 0
        state.currentPage = action.payload.current || 1
        state.pageSize = action.payload.size || 10
      })
      .addCase(fetchCases.rejected, (state) => {
        state.loading = false
        message.error('获取案例列表失败')
      })

    // 获取案例详情
    builder
      .addCase(fetchCaseById.fulfilled, (state, action) => {
        state.currentCase = action.payload
      })
      .addCase(fetchCaseById.rejected, () => {
        message.error('获取案例详情失败')
      })

    // 创建案例
    builder
      .addCase(createCase.pending, (state) => {
        state.loading = true
      })
      .addCase(createCase.fulfilled, (state, action) => {
        state.loading = false
        state.cases.unshift(action.payload)
        state.total += 1
        message.success('案例创建成功')
      })
      .addCase(createCase.rejected, (state) => {
        state.loading = false
        message.error('案例创建失败')
      })

    // 更新案例
    builder
      .addCase(updateCase.fulfilled, (state, action) => {
        const index = state.cases.findIndex(c => c.id === action.payload.id)
        if (index !== -1) {
          state.cases[index] = action.payload
        }
        if (state.currentCase?.id === action.payload.id) {
          state.currentCase = action.payload
        }
        message.success('案例更新成功')
      })
      .addCase(updateCase.rejected, () => {
        message.error('案例更新失败')
      })

    // 删除案例
    builder
      .addCase(deleteCase.fulfilled, (state, action) => {
        state.cases = state.cases.filter(c => c.id !== action.payload)
        state.total -= 1
        if (state.currentCase?.id === action.payload) {
          state.currentCase = null
        }
        message.success('案例删除成功')
      })
      .addCase(deleteCase.rejected, () => {
        message.error('案例删除失败')
      })

    // 分配案例
    builder
      .addCase(assignCase.fulfilled, (state, action) => {
        const { id, assigneeId } = action.payload
        const caseIndex = state.cases.findIndex(c => c.id === id)
        if (caseIndex !== -1) {
          state.cases[caseIndex].assigneeId = assigneeId
          state.cases[caseIndex].status = 'PROCESSING'
        }
        message.success('案例分配成功')
      })
      .addCase(assignCase.rejected, () => {
        message.error('案例分配失败')
      })

    // 更新案例状态
    builder
      .addCase(updateCaseStatus.fulfilled, (state, action) => {
        const { id, status } = action.payload
        const caseIndex = state.cases.findIndex(c => c.id === id)
        if (caseIndex !== -1) {
          state.cases[caseIndex].status = status as any
        }
        if (state.currentCase?.id === id) {
          state.currentCase.status = status as any
        }
        message.success('案例状态更新成功')
      })
      .addCase(updateCaseStatus.rejected, () => {
        message.error('案例状态更新失败')
      })

    // 获取统计信息
    builder
      .addCase(fetchCaseStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload
      })
      .addCase(fetchCaseStatistics.rejected, () => {
        message.error('获取统计信息失败')
      })

    // 获取最近案例
    builder
      .addCase(fetchRecentCases.fulfilled, (state, action) => {
        // 可以存储到单独的字段或合并到cases中
        console.log('最近案例:', action.payload)
      })
      .addCase(fetchRecentCases.rejected, () => {
        message.error('获取最近案例失败')
      })
  }
})

export const { setCurrentCase, clearCases, setPage } = caseSlice.actions
export default caseSlice.reducer