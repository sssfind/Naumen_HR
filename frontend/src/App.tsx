import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { queryClient } from '@/lib/queryClient'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppShell() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] p-8">
      <div className="mx-auto max-w-lg rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Naumen HR</h1>
        <p className="mt-2 text-gray-500">Вы успешно вошли в систему.</p>
      </div>
    </div>
  )
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  )
}
