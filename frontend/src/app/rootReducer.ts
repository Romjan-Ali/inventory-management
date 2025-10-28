// frontend/src/app/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit'
import { authSlice } from '../features/auth/authSlice'
import { inventoryApi } from '../features/inventory/inventoryApi'
import { itemsApi } from '../features/items/itemsApi'
import { searchApi } from '../features/search/searchApi'
import { usersApi } from '../features/users/usersApi'
import { postsApi } from '../features/posts/postsApi'
import { uiSlice } from '../features/ui/uiSlice'
import { themeSlice } from '../features/theme/themeSlice'

export const rootReducer = combineReducers({
  auth: authSlice.reducer,
  ui: uiSlice.reducer,
  theme: themeSlice.reducer,
  [inventoryApi.reducerPath]: inventoryApi.reducer,
  [itemsApi.reducerPath]: itemsApi.reducer,
  [searchApi.reducerPath]: searchApi.reducer,
  [usersApi.reducerPath]: usersApi.reducer,
  [postsApi.reducerPath]: postsApi.reducer,
})