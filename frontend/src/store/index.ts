import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import casesReducer from './slices/casesSlice'
import agentsReducer from './slices/agentsSlice'
import tasksReducer from './slices/tasksSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cases: casesReducer,
    agents: agentsReducer,
    tasks: tasksReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch