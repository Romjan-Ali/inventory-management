// frontend/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider as ReduxProvider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './app/store'
import App from './App'
import './index.css'
import { ThemeProvider } from './providers/theme.provider'
import './i18n'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">          
          <App />
        </ThemeProvider>
      </PersistGate>
    </ReduxProvider>
  </React.StrictMode>
)
