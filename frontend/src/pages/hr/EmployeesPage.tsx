import { useState } from 'react'
import { CheckCircle2, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmployeeDirectoryView } from '@/components/employees/EmployeeDirectoryView'
import { useEmployees } from '@/hooks/useEmployees'
import { useAssignTrainee } from '@/hooks/useTrainees'
import type { DirectoryEmployee } from '@/types/employee'

export function EmployeesPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(0)
  const [departmentId, setDepartmentId] = useState<number | null>(null)
  const storedUser = localStorage.getItem('user')
  const currentHrId = storedUser ? Number(JSON.parse(storedUser).userId) : null

  const { data, isLoading, refetch } = useEmployees(debouncedSearch, departmentId, page)
  const assign = useAssignTrainee()

  function renderCardFooter(emp: DirectoryEmployee) {
    if (emp.role === 'ROLE_HR') return null
    if (emp.hrId === currentHrId) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-primary">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Мой стажёр
        </span>
      )
    }
    if (!emp.hrId) {
      return (
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={(e) => {
            e.stopPropagation()
            assign.mutate(emp.userId)
          }}
          disabled={assign.isPending}
        >
          <UserPlus className="h-3.5 w-3.5" />
          Добавить стажёра
        </Button>
      )
    }
    return null
  }

  return (
    <EmployeeDirectoryView
      title="Справочник сотрудников"
      subtitle="Справочник сотрудников по структуре компании и назначение стажёров"
      data={data}
      isLoading={isLoading}
      search={search}
      onSearchChange={setSearch}
      onSearchSubmit={() => {
        setDebouncedSearch(search.trim())
        setPage(0)
        void refetch()
      }}
      page={page}
      onPageChange={setPage}
      departmentId={departmentId}
      onDepartmentChange={setDepartmentId}
      renderCardFooter={renderCardFooter}
    />
  )
}
