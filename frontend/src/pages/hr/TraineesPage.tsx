import { Link } from 'react-router-dom'
import { UserMinus, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStaffDashboard } from '@/hooks/useStaffDashboard'
import { useMyTrainees, useUnassignTrainee } from '@/hooks/useTrainees'

const roleLabels: Record<string, string> = {
  ROLE_TRAINEE: 'Стажёр',
  ROLE_EMPLOYEE: 'Сотрудник',
  ROLE_HR: 'HR',
  ROLE_MENTOR: 'Наставник',
}

export function TraineesPage() {
  const { basePath, canManageTrainees } = useStaffDashboard()
  const { data: trainees = [], isLoading } = useMyTrainees()
  const unassign = useUnassignTrainee()

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A2E]">Стажёры</h1>
      <p className="mt-1 text-sm text-gray-500">
        {canManageTrainees
          ? 'Все стажёры в программе адаптации. Назначить новых и наставника — в справочнике и профиле стажёра.'
          : 'Все стажёры в программе адаптации. Назначение в программу и наставника выполняет HR.'}
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading && (
          <p className="px-6 py-8 text-center text-gray-500">Загрузка…</p>
        )}
        {!isLoading && trainees.length === 0 && (
          <p className="px-6 py-8 text-center text-gray-500">
            У вас пока нет закреплённых стажёров
          </p>
        )}
        {!isLoading && trainees.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/80">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-600">ФИО</th>
                <th className="px-6 py-3 font-medium text-gray-600">Email</th>
                <th className="px-6 py-3 font-medium text-gray-600">Отдел</th>
                <th className="px-6 py-3 font-medium text-gray-600">Роль</th>
                <th className="px-6 py-3 font-medium text-gray-600" />
              </tr>
            </thead>
            <tbody>
              {trainees.map((t) => (
                <tr key={t.userId} className="border-b border-gray-50 last:border-0">
                  <td className="px-6 py-4 font-medium text-[#1A1A2E]">{t.fullName}</td>
                  <td className="px-6 py-4 text-gray-600">{t.email}</td>
                  <td className="px-6 py-4 text-gray-600">{t.department ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{roleLabels[t.role] ?? t.role}</td>
                  <td className="px-6 py-4 text-right">
                    <Button asChild variant="ghost" size="sm" className="mr-2 gap-1">
                      <Link to={`${basePath}/trainees/${t.userId}`}>
                        <UserRound className="h-3.5 w-3.5" />
                        Профиль
                      </Link>
                    </Button>
                    {canManageTrainees && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => unassign.mutate(t.userId)}
                        disabled={unassign.isPending}
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                        Снять наставника
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
