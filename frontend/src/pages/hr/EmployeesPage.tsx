import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useEmployees } from '@/hooks/useEmployees'
import { useAssignTrainee } from '@/hooks/useTrainees'

const roleLabels: Record<string, string> = {
  ROLE_TRAINEE: 'Стажёр',
  ROLE_EMPLOYEE: 'Сотрудник',
  ROLE_HR: 'HR',
}

export function EmployeesPage() {
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [page, setPage] = useState(0)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const { data, isLoading, refetch } = useEmployees(debouncedSearch, department, page)
  const assign = useAssignTrainee()

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    setDebouncedSearch(search.trim())
    setPage(0)
    void refetch()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A2E]">Справочник сотрудников</h1>
      <p className="mt-1 text-sm text-gray-500">Поиск по ФИО и email, назначение стажёров</p>

      <form
        onSubmit={handleSearchSubmit}
        className="mt-6 flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
      >
        <Input
          placeholder="Поиск по имени или email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Input
          placeholder="Отдел"
          value={department}
          onChange={(e) => {
            setDepartment(e.target.value)
            setPage(0)
          }}
          className="max-w-[180px]"
        />
        <Button type="submit">Найти</Button>
      </form>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading && (
          <p className="px-6 py-8 text-center text-gray-500">Загрузка…</p>
        )}
        {!isLoading && data && data.content.length === 0 && (
          <p className="px-6 py-8 text-center text-gray-500">Сотрудники не найдены</p>
        )}
        {!isLoading && data && data.content.length > 0 && (
          <>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/80">
                <tr>
                  <th className="px-6 py-3 font-medium text-gray-600">ФИО</th>
                  <th className="px-6 py-3 font-medium text-gray-600">Email</th>
                  <th className="px-6 py-3 font-medium text-gray-600">Отдел</th>
                  <th className="px-6 py-3 font-medium text-gray-600">Роль</th>
                  <th className="px-6 py-3 font-medium text-gray-600">Куратор</th>
                  <th className="px-6 py-3 font-medium text-gray-600" />
                </tr>
              </thead>
              <tbody>
                {data.content.map((emp) => (
                  <tr key={emp.userId} className="border-b border-gray-50 last:border-0">
                    <td className="px-6 py-4 font-medium text-[#1A1A2E]">{emp.fullName}</td>
                    <td className="px-6 py-4 text-gray-600">{emp.email}</td>
                    <td className="px-6 py-4 text-gray-600">{emp.department ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-600">{roleLabels[emp.role] ?? emp.role}</td>
                    <td className="px-6 py-4 text-gray-600">{emp.hrFullName ?? '—'}</td>
                    <td className="px-6 py-4 text-right">
                      {emp.role !== 'ROLE_HR' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => assign.mutate(emp.userId)}
                          disabled={assign.isPending}
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          {emp.hrId ? 'Переназначить' : 'Взять стажёра'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
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
                  onClick={() => setPage((p) => p + 1)}
                >
                  Вперёд
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}


