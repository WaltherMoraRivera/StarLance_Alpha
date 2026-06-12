import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import LoginPage from './pages/LoginPage'
import KidDashboard from './pages/kid/Dashboard'
import KidStars from './pages/kid/Stars'
import KidRewards from './pages/kid/Rewards'
import AdminDashboard from './pages/admin/Dashboard'
import AdminTaskCatalog from './pages/admin/TaskCatalog'
import AdminRewardsManager from './pages/admin/RewardsManager'
import AdminAdjustStars from './pages/admin/AdjustStars'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Kid routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute role="kid"><KidDashboard /></ProtectedRoute>
        } />
        <Route path="/stars" element={
          <ProtectedRoute role="kid"><KidStars /></ProtectedRoute>
        } />
        <Route path="/rewards" element={
          <ProtectedRoute role="kid"><KidRewards /></ProtectedRoute>
        } />

        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/tasks" element={
          <ProtectedRoute role="admin"><AdminTaskCatalog /></ProtectedRoute>
        } />
        <Route path="/admin/rewards" element={
          <ProtectedRoute role="admin"><AdminRewardsManager /></ProtectedRoute>
        } />
        <Route path="/admin/adjust" element={
          <ProtectedRoute role="admin"><AdminAdjustStars /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}
