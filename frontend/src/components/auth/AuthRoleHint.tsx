import type { AuthUiRole } from '@/components/auth/authRoles'
import { AUTH_ROLE_HINTS } from '@/components/auth/authRoles'

export function AuthRoleHint({ role }: { role: AuthUiRole }) {
  return (
    <div className="rounded-[15px] bg-[#EFF6FF] px-4 py-4 md:px-6 md:py-4">
      <p className="text-sm font-medium leading-snug text-[#12407B] md:text-2xl md:leading-[30px]">
        {AUTH_ROLE_HINTS[role]}
      </p>
    </div>
  )
}
