// frontend/src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './pages/Layout'
import Home from './pages/Home/Home'
import Login from './pages/Auth/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import InventoryPage from './pages/Inventory/InventoryPage'
import ProtectedRoute from './components/common/ProtectedRoute'
import AuthSuccess from './pages/AuthSuccess'
import CreateInventory from './pages/Inventory/CreateInventory'
import EditInventory from './pages/Inventory/EditInventory'
import CreateItem from './pages/Item/CreateItem'
import EditItem from './pages/Item/EditItem'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/success" element={<AuthSuccess />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/new"
            element={
              <ProtectedRoute>
                <CreateInventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/:id"
            element={
              <ProtectedRoute>
                <InventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/:id/edit"
            element={
              <ProtectedRoute>
                <EditInventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/items/:id/edit"
            element={
              <ProtectedRoute>
                <EditItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/:id/items/new"
            element={
              <ProtectedRoute>
                <CreateItem />
              </ProtectedRoute>
            }
          />          
        </Route>
      </Routes>
    </Router>
  )
}

export default App
