import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DepartmentTreeSidebar } from '@/components/employees/DepartmentTreeSidebar'
import { EmployeeCard } from '@/components/employees/EmployeeCard'
import { EmployeeDetailDialog } from '@/components/employees/EmployeeDetailDialog'
import { useDepartmentTree } from '@/hooks/useDepartments'
import type { DirectoryEmployee, PagedDirectoryEmployees } from '@/types/employee'

interface EmployeeDirectoryViewProps {
  title: string
  subtitle: string
  data: PagedDirectoryEmployees | undefined
  isLoading: boolean
  search: string
  onSearchChange: (value: string) => void
  onSearchSubmit: () => void
  page: number
  onPageChange: (page: number) => void
  departmentId: number | null
  onDepartmentChange: (id: number | null) => void
  highlightTeam?: boolean
  groupByTeam?: boolean
  renderCardFooter?: (employee: DirectoryEmployee) => React.ReactNode
}

export function EmployeeDirectoryView({
  title,
  subtitle,
  data,
  isLoading,
  search,
  onSearchChange,
  onSearchSubmit,
  page,
  onPageChange,
  departmentId,
  onDepartmentChange,
  highlightTeam = false,
  groupByTeam = false,
  renderCardFooter,
}: EmployeeDirectoryViewProps) {
  const { data: tree, isLoading: treeLoading } = useDepartmentTree()
  const [selectedEmployee, setSelectedEmployee] = useState<DirectoryEmployee | null>(null)

  const teamMembers = groupByTeam ? (data?.content.filter((e) => e.inMyTeam) ?? []) : []
  const others = groupByTeam
    ? (data?.content.filter((e) => !e.inMyTeam) ?? [])
    : (data?.content ?? [])

  function renderGrid(employees: DirectoryEmployee[], sectionTitle?: string) {
    if (employees.length === 0) return null
    return (
      <section className="space-y-3">
        {sectionTitle && (
          <h2 className="text-sm font-semibold text-gray-600">{sectionTitle}</h2>
        )}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {employees.map((emp) => (
            <EmployeeCard
              key={emp.userId}
              employee={emp}
              highlightTeam={highlightTeam}
              onClick={() => setSelectedEmployee(emp)}
              footer={renderCardFooter?.(emp)}
            />
          ))}
        </div>
      </section>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A2E]">{title}</h1>
      <p className="mt-1 text-sm text-gray-500">{subtitle}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSearchSubmit()
        }}
        className="mt-6 flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
      >
        <Input
          placeholder="Поиск по имени или email"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-xs"
        />
        <Button type="submit">Найти</Button>
      </form>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <DepartmentTreeSidebar
          tree={tree ?? []}
          selectedId={departmentId}
          onSelect={(id) => {
            onDepartmentChange(id)
            onPageChange(0)
          }}
          isLoading={treeLoading}
        />

        <div className="space-y-6">
          {isLoading && (
            <p className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center text-gray-500">
              Загрузка…
            </p>
          )}

          {!isLoading && data && data.content.length === 0 && (
            <p className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center text-gray-500">
              Сотрудники не найдены
            </p>
          )}

          {!isLoading && groupByTeam && renderGrid(teamMembers, 'Моя команда')}
          {!isLoading && renderGrid(
            others,
            groupByTeam && teamMembers.length > 0 ? 'Остальные сотрудники' : undefined
          )}

          {!isLoading && data && data.totalPages > 1 && (
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-6 py-3 shadow-sm">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => onPageChange(page - 1)}
              >
                Назад
              </Button>
              <span className="text-sm text-gray-500">
                Страница {page + 1} из {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.totalPages - 1}
                onClick={() => onPageChange(page + 1)}
              >
                Вперёд
              </Button>
            </div>
          )}
        </div>
      </div>

      <EmployeeDetailDialog
        employee={selectedEmployee}
        open={selectedEmployee !== null}
        onOpenChange={(open) => !open && setSelectedEmployee(null)}
      />
    </div>
  )
}
