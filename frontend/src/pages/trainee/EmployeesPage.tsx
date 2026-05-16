import { useState } from 'react'
import { Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTraineeEmployees } from '@/hooks/useTrainee'

const roleLabels: Record<string, string> = {
  ROLE_TRAINEE: 'Стажёр',
  ROLE_EMPLOYEE: 'Сотрудник',
  ROLE_HR: 'HR',
}

export function TraineeEmployeesPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(0)

  const { data, isLoading, refetch } = useTraineeEmployees(debouncedSearch, page)

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    setDebouncedSearch(search.trim())
    setPage(0)
    void refetch()
  }

  const teamMembers = data?.content.filter((e) => e.inMyTeam) ?? []
  const others = data?.content.filter((e) => !e.inMyTeam) ?? []

  function renderTable(rows: typeof teamMembers, showTeamBadge: boolean) {
    if (rows.length === 0) return null
    return (
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-100 bg-gray-50/80">
          <tr>
            <th className="px-6 py-3 font-medium text-gray-600">ФИО</th>
            <th className="px-6 py-3 font-medium text-gray-600">Email</th>
            <th className="px-6 py-3 font-medium text-gray-600">Отдел</th>
            <th className="px-6 py-3 font-medium text-gray-600">Роль</th>
            {showTeamBadge && <th className="px-6 py-3 font-medium text-gray-600" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((emp) => (
            <tr key={emp.userId} className="border-b border-gray-50 last:border-0">
              <td className="px-6 py-4 font-medium text-[#1A1A2E]">{emp.fullName}</td>
              <td className="px-6 py-4 text-gray-600">{emp.email}</td>
              <td className="px-6 py-4 text-gray-600">{emp.department ?? '—'}</td>
              <td className="px-6 py-4 text-gray-600">{roleLabels[emp.role] ?? emp.role}</td>
              {showTeamBadge && (
                <td className="px-6 py-4">
                  {emp.inMyTeam && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-primary">
                      <Users className="h-3 w-3" />
                      Моя команда
                    </span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A2E]">Сотрудники</h1>
      <p className="mt-1 text-sm text-gray-500">
        Сначала коллеги из вашей команды, затем остальные сотрудники
      </p>

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
        <Button type="submit">Найти</Button>
      </form>

      <div className="mt-6 space-y-6">
        {isLoading && (
          <p className="rounded-xl border border-gray-200 bg-white px-6 py-8 text-center text-gray-500">
            Загрузка…
          </p>
        )}

        {!isLoading && data && data.content.length === 0 && (
          <p className="rounded-xl border border-gray-200 bg-white px-6 py-8 text-center text-gray-500">
            Сотрудники не найдены
          </p>
        )}

        {!isLoading && teamMembers.length > 0 && (
          <section className="overflow-hidden rounded-xl border border-orange-200 bg-white shadow-sm">
            <div className="border-b border-orange-100 bg-orange-50/60 px-6 py-3">
              <h2 className="text-sm font-semibold text-primary">Моя команда</h2>
            </div>
            {renderTable(teamMembers, true)}
          </section>
        )}

        {!isLoading && others.length > 0 && (
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {teamMembers.length > 0 && (
              <div className="border-b border-gray-100 bg-gray-50/80 px-6 py-3">
                <h2 className="text-sm font-semibold text-gray-600">Остальные сотрудники</h2>
              </div>
            )}
            {renderTable(others, false)}
          </section>
        )}

        {!isLoading && data && data.totalPages > 1 && (
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-6 py-3 shadow-sm">
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
      </div>
    </div>
  )
}
