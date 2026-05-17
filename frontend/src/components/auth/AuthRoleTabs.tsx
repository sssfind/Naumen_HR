import { Brain, Briefcase, User } from 'lucide-react'
import type { AuthUiRole } from '@/components/auth/authRoles'
import { AUTH_ROLE_HINT_STYLES, AUTH_ROLE_LABELS } from '@/components/auth/authRoles'
import { cn } from '@/lib/utils'

type AuthRoleTabsProps = {
  value: AuthUiRole | null
  onChange: (role: AuthUiRole) => void
  className?: string
  showError?: boolean
}

const topRoles: { id: AuthUiRole; icon: typeof User }[] = [
  { id: 'employee', icon: User },
  { id: 'hr', icon: Briefcase },
]

function RoleTab({
  roleId,
  active,
  label,
  icon: Icon,
  onClick,
  className,
}: {
  roleId: AuthUiRole
  active: boolean
  label: string
  icon: typeof User
  onClick: () => void
  className?: string
}) {
  const styles = AUTH_ROLE_HINT_STYLES[roleId]

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-[40px] flex-1 items-center justify-center gap-2 rounded-full px-3 py-1.5 text-sm font-normal transition-colors md:min-h-[42px] md:px-4',
        active
          ? cn(styles.box, styles.text, 'shadow-sm')
          : 'bg-transparent text-black hover:bg-white/60',
        className
      )}
    >
      <Icon className="h-5 w-5 shrink-0 md:h-[22px] md:w-[22px]" strokeWidth={1.75} />
      <span className="whitespace-nowrap">{label}</span>
    </button>
  )
}

export function AuthRoleTabs({ value, onChange, className, showError }: AuthRoleTabsProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col overflow-hidden rounded-[12px] bg-[#EAEAEA]',
        showError && 'ring-2 ring-red-500 ring-offset-1',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 px-2 py-1.5 md:gap-3 md:px-2.5 md:pr-6">
        {topRoles.map(({ id, icon }) => (
          <RoleTab
            key={id}
            roleId={id}
            active={value === id}
            label={AUTH_ROLE_LABELS[id]}
            icon={icon}
            onClick={() => onChange(id)}
          />
        ))}
      </div>

      <div className="flex justify-center bg-[#EAEAEA] px-2 pb-1.5 pt-0 md:px-3 md:pb-2">
        <RoleTab
          roleId="mentor"
          active={value === 'mentor'}
          label={AUTH_ROLE_LABELS.mentor}
          icon={Brain}
          onClick={() => onChange('mentor')}
          className="w-full max-w-[320px] flex-none"
        />
      </div>
    </div>
  )
}
