// frontend/src/features/ui/uiSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  isLoading: boolean
  notification: {
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
  } | null
  sidebarOpen: boolean
}

const initialState: UIState = {
  isLoading: false,
  notification: null,
  sidebarOpen: false,
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setNotification: (state, action: PayloadAction<UIState['notification']>) => {
      state.notification = action.payload
    },
    clearNotification: (state) => {
      state.notification = null
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebar: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
  },
})

export const { setLoading, setNotification, clearNotification, toggleSidebar, setSidebar } = uiSlice.actions
export default uiSlice.reducer