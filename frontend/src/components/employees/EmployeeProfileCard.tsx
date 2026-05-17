import { Mail, Phone } from 'lucide-react'
import type { DirectoryEmployee } from '@/types/employee'
import type { UserRole } from '@/types/user'
import { cn } from '@/lib/utils'

const roleLabels: Record<UserRole, string> = {
  ROLE_TRAINEE: 'Стажёр',
  ROLE_EMPLOYEE: 'Сотрудник',
  ROLE_HR: 'HR',
  ROLE_MENTOR: 'Наставник',
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
  }
  return (name[0] ?? '?').toUpperCase()
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-1 text-[15px] font-medium leading-snug text-[#1A1A2E]">{value}</dd>
    </div>
  )
}

type EmployeeProfileCardProps = {
  employee: DirectoryEmployee
  className?: string
  hideHrField?: boolean
}

export function EmployeeProfileCard({
  employee,
  className,
  hideHrField = false,
}: EmployeeProfileCardProps) {
  const structure = [employee.divisionName, employee.department].filter(Boolean).join(' → ')
  const subtitle = employee.position ?? roleLabels[employee.role]

  return (
    <article
      className={cn(
        'overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm',
        className
      )}
    >
      <header className="border-b border-gray-100 bg-gray-50/50 px-6 py-5">
        <div className="flex items-center gap-4">
          {employee.photoUrl ? (
            <img
              src={employee.photoUrl}
              alt=""
              className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-white"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-100 text-lg font-semibold text-primary ring-2 ring-white">
              {initials(employee.fullName)}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-xl font-semibold text-[#1A1A2E]">{employee.fullName}</h3>
            <p className="mt-0.5 text-sm text-gray-600">{subtitle}</p>
          </div>
        </div>
      </header>

      <div className="space-y-4 px-6 py-5">
        <dl className="space-y-4">
          <Field label="Роль" value={roleLabels[employee.role]} />
          {employee.position && <Field label="Должность" value={employee.position} />}
          {structure && <Field label="Структура" value={structure} />}
          {employee.team && <Field label="Команда" value={employee.team} />}
          {employee.responsibilityZone && (
            <Field label="Зона ответственности" value={employee.responsibilityZone} />
          )}
          {!hideHrField && employee.hrFullName && (
            <Field label="Куратор / наставник" value={employee.hrFullName} />
          )}
        </dl>

        <div className="border-t border-gray-100 pt-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
            Контакты
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <a
                href={`mailto:${employee.email}`}
                className="text-[15px] font-medium text-primary hover:underline"
              >
                {employee.email}
              </a>
            </li>
            {employee.phone && (
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                <a
                  href={`tel:${employee.phone}`}
                  className="text-[15px] font-medium text-primary hover:underline"
                >
                  {employee.phone}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
    </article>
  )
}
