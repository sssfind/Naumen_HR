import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { queryClient } from '@/lib/queryClient'
import { HrRoute } from '@/components/HrRoute'
import { HrLayout } from '@/layouts/HrLayout'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { TraineesPage } from '@/pages/hr/TraineesPage'
import { EmployeesPage } from '@/pages/hr/EmployeesPage'
import { ProfilePage } from '@/pages/hr/ProfilePage'
import { TraineeProfilePage } from '@/pages/hr/TraineeProfilePage'
import { EditTraineePlanPage } from '@/pages/hr/EditTraineePlanPage'

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
          <Route
            path="/dashboard/hr"
            element={
              <ProtectedRoute>
                <HrRoute>
                  <HrLayout />
                </HrRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="trainees" replace />} />
            <Route path="trainees" element={<TraineesPage />} />
            <Route path="trainees/:traineeId" element={<TraineeProfilePage />} />
            <Route path="trainees/:traineeId/plan" element={<EditTraineePlanPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  )
}

