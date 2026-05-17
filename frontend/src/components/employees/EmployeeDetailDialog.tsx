import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog'
import { EmployeeProfileCard } from '@/components/employees/EmployeeProfileCard'
import type { DirectoryEmployee } from '@/types/employee'

interface EmployeeDetailDialogProps {
  employee: DirectoryEmployee | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmployeeDetailDialog({
  employee,
  open,
  onOpenChange,
}: EmployeeDetailDialogProps) {
  if (!employee) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden p-0" onClose={() => onOpenChange(false)}>
        <DialogHeader className="sr-only">Карточка сотрудника</DialogHeader>
        <DialogBody className="p-0">
          <EmployeeProfileCard employee={employee} className="border-0 shadow-none" />
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
