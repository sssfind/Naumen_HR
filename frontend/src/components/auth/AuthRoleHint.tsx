import type { AuthUiRole } from '@/components/auth/authRoles'
import { AUTH_ROLE_HINTS, AUTH_ROLE_HINT_STYLES } from '@/components/auth/authRoles'
import { cn } from '@/lib/utils'

export function AuthRoleHint({ role }: { role: AuthUiRole }) {
  const styles = AUTH_ROLE_HINT_STYLES[role]

  return (
    <div className={cn('rounded-[12px] px-3 py-3 md:px-4 md:py-3', styles.box)}>
      <p className={cn('text-xs font-medium leading-snug md:text-sm md:leading-5', styles.text)}>
        {AUTH_ROLE_HINTS[role]}
      </p>
    </div>
  )
}
