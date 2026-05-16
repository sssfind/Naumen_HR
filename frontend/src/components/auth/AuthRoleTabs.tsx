import { Brain, Briefcase, User } from 'lucide-react'
import type { AuthUiRole } from '@/components/auth/authRoles'
import { AUTH_ROLE_LABELS } from '@/components/auth/authRoles'
import { cn } from '@/lib/utils'

type AuthRoleTabsProps = {
  value: AuthUiRole
  onChange: (role: AuthUiRole) => void
  className?: string
}

const topRoles: { id: AuthUiRole; icon: typeof User }[] = [
  { id: 'employee', icon: User },
  { id: 'hr', icon: Briefcase },
]

function RoleTab({
  active,
  label,
  icon: Icon,
  onClick,
  className,
}: {
  active: boolean
  label: string
  icon: typeof User
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-normal text-black transition-colors md:gap-3 md:px-5 md:text-base',
        active ? 'bg-white shadow-sm' : 'bg-transparent hover:bg-white/60',
        className
      )}
    >
      <Icon className="h-[22px] w-[22px] shrink-0 md:h-[26px] md:w-[26px]" strokeWidth={1.75} />
      <span className="whitespace-nowrap">{label}</span>
    </button>
  )
}

export function AuthRoleTabs({ value, onChange, className }: AuthRoleTabsProps) {
  return (
    <div className={cn('flex w-full flex-col overflow-hidden rounded-[15px] bg-[#EAEAEA]', className)}>
      <div className="flex items-center justify-between gap-2 px-2.5 py-2 md:gap-4 md:px-3 md:pr-8">
        {topRoles.map(({ id, icon }) => (
          <RoleTab
            key={id}
            active={value === id}
            label={AUTH_ROLE_LABELS[id]}
            icon={icon}
            onClick={() => onChange(id)}
          />
        ))}
      </div>

      <div className="flex justify-center bg-[#EAEAEA] px-3 pb-2 pt-0 md:px-5 md:pb-3">
        <RoleTab
          active={value === 'mentor'}
          label={AUTH_ROLE_LABELS.mentor}
          icon={Brain}
          onClick={() => onChange('mentor')}
          className="w-full max-w-[400px] flex-none md:min-h-[46px]"
        />
      </div>
    </div>
  )
}
