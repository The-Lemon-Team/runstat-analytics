import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute, GuestRoute } from '@/features/auth/components/ProtectedRoute'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { OAuthCallbackPage } from '@/features/auth/pages/OAuthCallbackPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { VkAuthCallbackPage } from '@/features/auth/pages/VkAuthCallbackPage'
import { DashboardPage } from '@/pages/DashboardPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        <Route path="/auth/vk/callback" element={<VkAuthCallbackPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/*" element={<DashboardPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
