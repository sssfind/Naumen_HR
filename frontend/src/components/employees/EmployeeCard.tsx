import { Mail, Phone, Users, Briefcase, Building2 } from 'lucide-react'
import type { DirectoryEmployee } from '@/types/employee'
import type { UserRole } from '@/types/user'
import { cn } from '@/lib/utils'

const roleLabels: Record<UserRole, string> = {
  ROLE_TRAINEE: 'Стажёр',
  ROLE_EMPLOYEE: 'Сотрудник',
  ROLE_HR: 'HR',
  ROLE_MENTOR: 'Наставник',
}

interface EmployeeCardProps {
  employee: DirectoryEmployee
  onClick?: () => void
  highlightTeam?: boolean
  footer?: React.ReactNode
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
  }
  return (name[0] ?? '?').toUpperCase()
}

export function EmployeeCard({
  employee,
  onClick,
  highlightTeam,
  footer,
}: EmployeeCardProps) {
  const Wrapper = onClick ? 'button' : 'div'

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex w-full flex-col rounded-xl border bg-white p-4 text-left shadow-sm transition-shadow',
        onClick && 'hover:border-orange-200 hover:shadow-md',
        highlightTeam && employee.inMyTeam
          ? 'border-orange-200 ring-1 ring-orange-100'
          : 'border-gray-200'
      )}
    >
      <div className="flex gap-3">
        {employee.photoUrl ? (
          <img
            src={employee.photoUrl}
            alt=""
            className="h-12 w-12 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-50 text-sm font-semibold text-primary">
            {initials(employee.fullName)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold text-[#1A1A2E]">{employee.fullName}</h3>
            {highlightTeam && employee.inMyTeam && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-primary">
                <Users className="h-3 w-3" />
                Моя команда
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{employee.position ?? roleLabels[employee.role]}</p>
          {employee.divisionName && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
              <Building2 className="h-3 w-3 shrink-0" />
              {employee.divisionName}
              {employee.department && employee.department !== employee.divisionName && (
                <span> · {employee.department}</span>
              )}
            </p>
          )}
        </div>
      </div>

      {employee.responsibilityZone && (
        <p className="mt-3 line-clamp-2 text-sm text-gray-600">
          <Briefcase className="mr-1 inline h-3.5 w-3.5 text-gray-400" />
          {employee.responsibilityZone}
        </p>
      )}

      <div className="mt-3 space-y-1 text-sm text-gray-600">
        <p className="flex items-center gap-2 truncate">
          <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          {employee.email}
        </p>
        {employee.phone && (
          <p className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            {employee.phone}
          </p>
        )}
        {employee.team && (
          <p className="flex items-center gap-2 text-xs text-gray-500">
            <Users className="h-3.5 w-3.5 shrink-0" />
            Команда: {employee.team}
          </p>
        )}
      </div>

      {footer && <div className="mt-3 border-t border-gray-100 pt-3">{footer}</div>}
    </Wrapper>
  )
}
