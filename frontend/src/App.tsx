import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { queryClient } from '@/lib/queryClient'
import { HrRoute } from '@/components/HrRoute'
import { MentorRoute } from '@/components/MentorRoute'
import { TraineeRoute } from '@/components/TraineeRoute'
import { HrLayout } from '@/layouts/HrLayout'
import { MentorLayout } from '@/layouts/MentorLayout'
import { TraineeLayout } from '@/layouts/TraineeLayout'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ChatPage } from '@/pages/ChatPage'
import { TraineesPage } from '@/pages/hr/TraineesPage'
import { EmployeesPage } from '@/pages/hr/EmployeesPage'
import { ProfilePage } from '@/pages/hr/ProfilePage'
import { TraineeProfilePage as HrTraineeProfilePage } from '@/pages/hr/TraineeProfilePage'
import { EditTraineePlanPage } from '@/pages/hr/EditTraineePlanPage'
import { PlanTemplateDetailPage } from '@/pages/hr/PlanTemplateDetailPage'
import { PlanTemplatesPage } from '@/pages/hr/PlanTemplatesPage'
import { ProfileEditPage } from '@/pages/ProfileEditPage'
import { TraineeBlockTasksPage } from '@/pages/trainee/BlockTasksPage'
import { TraineeCalendarPage } from '@/pages/trainee/CalendarPage'
import { TraineeDashboardPage } from '@/pages/trainee/DashboardPage'
import { TraineeEmployeesPage } from '@/pages/trainee/EmployeesPage'
import { TraineeProfilePage } from '@/pages/trainee/ProfilePage'
import { TraineeFeedbackPage } from '@/pages/trainee/FeedbackPage'
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppShell() {
  const stored = localStorage.getItem('user')
  const user = stored ? JSON.parse(stored) : null

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-8">
      <div className="mx-auto max-w-lg rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">NAU-START</h1>
        <p className="mt-2 text-gray-500">Вы успешно вошли в систему.</p>
        {user?.role === 'ROLE_EMPLOYEE' && (
          <p className="mt-4 text-sm text-gray-600">
            Это кабинет сотрудника без программы адаптации. Если вы стажёр, зарегистрируйтесь с ролью
            «Стажёр» или попросите HR назначить вас стажёром и войдите снова.
          </p>
        )}
        <div className="mt-6">
          <Link
            to="/"
            className="text-sm font-medium text-primary hover:underline"
            onClick={() => {
              localStorage.removeItem('token')
              localStorage.removeItem('user')
            }}
          >
            Выйти и войти снова
          </Link>
        </div>
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
            <Route path="plan-templates/:templateId" element={<PlanTemplateDetailPage />} />
            <Route path="plan-templates" element={<PlanTemplatesPage />} />
            <Route path="trainees/:traineeId/plan" element={<EditTraineePlanPage />} />
            <Route path="trainees/:traineeId" element={<HrTraineeProfilePage />} />
            <Route path="trainees" element={<TraineesPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="profile/edit" element={<ProfileEditPage backTo="/dashboard/hr/profile" />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route
            path="/dashboard/mentor"
            element={
              <ProtectedRoute>
                <MentorRoute>
                  <MentorLayout />
                </MentorRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="trainees" replace />} />
            <Route path="plan-templates/:templateId" element={<PlanTemplateDetailPage />} />
            <Route path="plan-templates" element={<PlanTemplatesPage />} />
            <Route path="trainees/:traineeId/plan" element={<EditTraineePlanPage />} />
            <Route path="trainees/:traineeId" element={<HrTraineeProfilePage />} />
            <Route path="trainees" element={<TraineesPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="profile/edit" element={<ProfileEditPage backTo="/dashboard/mentor/profile" />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route
            path="/dashboard/trainee"
            element={
              <ProtectedRoute>
                <TraineeRoute>
                  <TraineeLayout />
                </TraineeRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<TraineeDashboardPage />} />
            <Route path="calendar" element={<TraineeCalendarPage />} />
            <Route path="blocks/:blockId" element={<TraineeBlockTasksPage />} />
            <Route path="feedback" element={<TraineeFeedbackPage />} />
            <Route path="employees" element={<TraineeEmployeesPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="profile/edit" element={<ProfileEditPage backTo="/dashboard/trainee/profile" />} />
            <Route path="profile" element={<TraineeProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  )
}

