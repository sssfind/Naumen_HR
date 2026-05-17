import { useState } from 'react'
import { AuthPageLayout } from '@/components/auth/AuthPageLayout'
import { AuthRoleHint } from '@/components/auth/AuthRoleHint'
import { AuthRoleTabs } from '@/components/auth/AuthRoleTabs'
import type { AuthUiRole } from '@/components/auth/authRoles'
import { LoginForm } from '@/components/auth/LoginForm'

export function LoginPage() {
  const [role, setRole] = useState<AuthUiRole>('employee')

  return (
    <AuthPageLayout
      title="Вход в систему"
      subtitle="Используйте корпоративный аккаунт Naumen"
    >
      <div className="space-y-4">
        <AuthRoleTabs value={role} onChange={setRole} />
        <AuthRoleHint role={role} />
        <LoginForm />
      </div>
    </AuthPageLayout>
  )
}
