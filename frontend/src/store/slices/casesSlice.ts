import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Case {
  id: string
  caseNumber: string
  title: string
  description: string
  failureType: string
  severityLevel: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'processing' | 'completed' | 'closed'
  assignedAgent?: string
  createdAt: string
  updatedAt: string
  progress: number
  tags: string[]
  attachments: number
}

interface CasesState {
  cases: Case[]
  selectedCase: Case | null
  loading: boolean
  error: string | null
  filters: {
    search: string
    failureType: string
    severityLevel: string
    status: string
  }
}

const initialState: CasesState = {
  cases: [],
  selectedCase: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    failureType: '',
    severityLevel: '',
    status: '',
  },
}

const casesSlice = createSlice({
  name: 'cases',
  initialState,
  reducers: {
    setCases: (state, action: PayloadAction<Case[]>) => {
      state.cases = action.payload
    },
    setSelectedCase: (state, action: PayloadAction<Case | null>) => {
      state.selectedCase = action.payload
    },
    addCase: (state, action: PayloadAction<Case>) => {
      state.cases.push(action.payload)
    },
    updateCase: (state, action: PayloadAction<Case>) => {
      const index = state.cases.findIndex(c => c.id === action.payload.id)
      if (index !== -1) {
        state.cases[index] = action.payload
      }
    },
    deleteCase: (state, action: PayloadAction<string>) => {
      state.cases = state.cases.filter(c => c.id !== action.payload)
    },
    setFilters: (state, action: PayloadAction<Partial<CasesState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setCases,
  setSelectedCase,
  addCase,
  updateCase,
  deleteCase,
  setFilters,
  setLoading,
  setError,
} = casesSlice.actions

export default casesSlice.reducer