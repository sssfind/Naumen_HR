import { useState } from 'react'
import { AuthPageLayout } from '@/components/auth/AuthPageLayout'
import { AuthRoleHint } from '@/components/auth/AuthRoleHint'
import { AuthRoleTabs } from '@/components/auth/AuthRoleTabs'
import type { AuthUiRole } from '@/components/auth/authRoles'
import { RegisterForm } from '@/components/auth/RegisterForm'

export function RegisterPage() {
  const [role, setRole] = useState<AuthUiRole>('employee')

  return (
    <AuthPageLayout
      title="Создать аккаунт"
      subtitle="Зарегистрируйтесь с корпоративным email Naumen"
    >
      <div className="space-y-5 md:space-y-6">
        <AuthRoleTabs value={role} onChange={setRole} />
        <AuthRoleHint role={role} />
        <RegisterForm uiRole={role} />
      </div>
    </AuthPageLayout>
  )
}
