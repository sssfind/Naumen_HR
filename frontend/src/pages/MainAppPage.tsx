import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { EmployeeProfileCard } from '@/components/profile/EmployeeProfileCard'
import { AIChatView } from '@/components/views/AIChatView'
import { ExpertSearchView } from '@/components/views/ExpertSearchView'
import { HrEventsView } from '@/components/views/HrEventsView'
import type { AppNavView } from '@/components/layout/appNav'
import { api } from '@/lib/api'
import type { StoredUser } from '@/types/auth'

export function MainAppPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeView, setActiveView] = useState<AppNavView>('ai')
  const [profileCardOpen, setProfileCardOpen] = useState(false)

  const handleLogout = () => {
    void api.post('/auth/logout').finally(() => {
      queryClient.clear()
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setProfileCardOpen(false)
      navigate('/', { replace: true })
    })
  }

  const storedUserRaw = localStorage.getItem('user')
  let storedUser: StoredUser | null = null

  try {
    storedUser = storedUserRaw ? (JSON.parse(storedUserRaw) as StoredUser) : null
  } catch {
    storedUser = null
  }

  const userFullName = storedUser?.fullName?.trim() || 'Пользователь'
  const userName = userFullName.split(/\s+/)[0] || 'Иван'
  const userRoleLabel = storedUser?.role === 'ROLE_HR' ? 'HR-специалист' : 'Сотрудник'
  const isHrMode = storedUser?.role === 'ROLE_HR'

  return (
    <>
      <AppLayout
        activeView={activeView}
        onNavigate={setActiveView}
        userFullName={userFullName}
        userRoleLabel={userRoleLabel}
        onOpenUserProfile={() => setProfileCardOpen(true)}
        onLogout={handleLogout}
      >
        {activeView === 'ai' && <AIChatView userName={userName} />}
        {activeView === 'search' && (
          <ExpertSearchView
            isHrMode={isHrMode}
            onOpenEvents={() => setActiveView('events')}
          />
        )}
        {activeView === 'events' && (
          <HrEventsView
            isHrMode={isHrMode}
            onOpenSearch={() => setActiveView('search')}
          />
        )}
      </AppLayout>
      <EmployeeProfileCard
        open={profileCardOpen}
        onOpenChange={setProfileCardOpen}
        onLogout={handleLogout}
      />
    </>
  )
}
