import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { DirectoryEmployee } from '@/types/employee'
import type { UserRole } from '@/types/user'

const roleLabels: Record<UserRole, string> = {
  ROLE_TRAINEE: 'Стажёр',
  ROLE_EMPLOYEE: 'Сотрудник',
  ROLE_HR: 'HR',
}

interface EmployeeDetailDialogProps {
  employee: DirectoryEmployee | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-[#1A1A2E]">{value}</dd>
    </div>
  )
}

export function EmployeeDetailDialog({
  employee,
  open,
  onOpenChange,
}: EmployeeDetailDialogProps) {
  if (!employee) return null

  const structure = [employee.divisionName, employee.department].filter(Boolean).join(' → ')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{employee.fullName}</DialogTitle>
        </DialogHeader>
        <dl className="space-y-3 text-sm">
          <Field label="Роль" value={roleLabels[employee.role]} />
          {employee.position && <Field label="Должность" value={employee.position} />}
          {structure && <Field label="Структура" value={structure} />}
          {employee.team && <Field label="Команда" value={employee.team} />}
          {employee.responsibilityZone && (
            <Field label="Зона ответственности" value={employee.responsibilityZone} />
          )}
          <div>
            <dt className="text-gray-500">Email</dt>
            <dd className="mt-0.5">
              <a href={`mailto:${employee.email}`} className="font-medium text-primary hover:underline">
                {employee.email}
              </a>
            </dd>
          </div>
          {employee.phone && (
            <div>
              <dt className="text-gray-500">Телефон</dt>
              <dd className="mt-0.5">
                <a href={`tel:${employee.phone}`} className="font-medium text-primary hover:underline">
                  {employee.phone}
                </a>
              </dd>
            </div>
          )}
          {employee.hrFullName && <Field label="Куратор / наставник" value={employee.hrFullName} />}
        </dl>
      </DialogContent>
    </Dialog>
  )
}
