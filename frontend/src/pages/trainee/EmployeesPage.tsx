import { useState } from 'react'
import { EmployeeDirectoryView } from '@/components/employees/EmployeeDirectoryView'
import { useTraineeEmployees } from '@/hooks/useTrainee'

export function TraineeEmployeesPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(0)
  const [departmentId, setDepartmentId] = useState<number | null>(null)

  const { data, isLoading, refetch } = useTraineeEmployees(debouncedSearch, departmentId, page)

  return (
    <EmployeeDirectoryView
      title="Справочник сотрудников"
      subtitle="Справочник коллег: структура компании, контакты и зоны ответственности"
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
      highlightTeam
      groupByTeam
    />
  )
}
