import { MobileBottomNav } from './MobileBottomNav'
import { Sidebar } from './Sidebar'
import type { AppNavView } from './appNav'

interface AppLayoutProps {
  children: React.ReactNode
  activeView: AppNavView
  onNavigate: (view: AppNavView) => void
  userFullName: string
  userRoleLabel: string
  onOpenUserProfile?: () => void
  onLogout?: () => void
}

export function AppLayout({
  children,
  activeView,
  onNavigate,
  userFullName,
  userRoleLabel,
  onOpenUserProfile,
  onLogout,
}: AppLayoutProps) {
  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-[#F5F5F5] lg:flex-row lg:bg-transparent">
      <Sidebar
        activeView={activeView}
        onNavigate={onNavigate}
        userFullName={userFullName}
        userRoleLabel={userRoleLabel}
        onOpenUserProfile={onOpenUserProfile}
        onLogout={onLogout}
      />
      <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">
        {children}
      </main>
      <MobileBottomNav
        activeView={activeView}
        onNavigate={onNavigate}
        userFullName={userFullName}
        onOpenUserProfile={onOpenUserProfile}
        onLogout={onLogout}
      />
    </div>
  )
}
