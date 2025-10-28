// frontend/src/features/theme/themeSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type Theme = 'light' | 'dark'

interface ThemeState {
  current: Theme
}

const initialState: ThemeState = {
  current: 'light',
}

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.current = action.payload
    },
    toggleTheme: (state) => {
      state.current = state.current === 'light' ? 'dark' : 'light'
    },
  },
})

export const { setTheme, toggleTheme } = themeSlice.actions
export default themeSlice.reducer