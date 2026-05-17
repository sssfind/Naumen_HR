import { useState } from 'react'
import { AuthPageLayout } from '@/components/auth/AuthPageLayout'
import { AuthRoleHint } from '@/components/auth/AuthRoleHint'
import { AuthRoleTabs } from '@/components/auth/AuthRoleTabs'
import type { AuthUiRole } from '@/components/auth/authRoles'
import { RegisterForm } from '@/components/auth/RegisterForm'

export function RegisterPage() {
  const [role, setRole] = useState<AuthUiRole | null>(null)
  const [roleError, setRoleError] = useState(false)

  const handleRoleChange = (next: AuthUiRole) => {
    setRole(next)
    setRoleError(false)
  }

  return (
    <AuthPageLayout
      size="compact"
      title="Создать аккаунт"
      subtitle="Зарегистрируйтесь с корпоративным email Naumen"
    >
      <div className="space-y-3 md:space-y-4">
        <div className="space-y-1.5">
          <AuthRoleTabs value={role} onChange={handleRoleChange} showError={roleError} />
          {roleError && (
            <p className="text-xs text-red-500" role="alert">
              Выберите роль для регистрации
            </p>
          )}
        </div>
        {role && <AuthRoleHint role={role} />}
        <RegisterForm uiRole={role} onMissingRole={() => setRoleError(true)} />
      </div>
    </AuthPageLayout>
  )
}
