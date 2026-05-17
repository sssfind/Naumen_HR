import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserRound, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmployeeDetailDialog } from '@/components/employees/EmployeeDetailDialog'
import { useStaffDashboard } from '@/hooks/useStaffDashboard'
import { useMentors, useMyTrainees } from '@/hooks/useTrainees'
import type { DirectoryEmployee } from '@/types/employee'
import type { Employee } from '@/types/user'

function toDirectoryEmployee(employee: Employee): DirectoryEmployee {
  return {
    userId: employee.userId,
    email: employee.email,
    fullName: employee.fullName,
    role: employee.role,
    departmentId: employee.departmentId,
    department: employee.department,
    parentDepartmentName: employee.parentDepartmentName,
    divisionName: employee.divisionName,
    responsibilityZone: employee.responsibilityZone,
    phone: employee.phone,
    position: employee.position,
    photoUrl: employee.photoUrl,
    team: employee.team ?? null,
    hrId: employee.hrId,
    hrFullName: employee.hrFullName,
  }
}

export function TraineesPage() {
  const { basePath, canManageTrainees, isHr } = useStaffDashboard()
  const { data: trainees = [], isLoading } = useMyTrainees()
  const { data: mentors = [] } = useMentors(isHr)
  const [selectedMentor, setSelectedMentor] = useState<DirectoryEmployee | null>(null)

  const mentorsById = useMemo(
    () => new Map(mentors.map((m) => [m.userId, toDirectoryEmployee(m)])),
    [mentors]
  )

  function openMentorProfile(mentorId: number) {
    const mentor = mentorsById.get(mentorId)
    if (mentor) setSelectedMentor(mentor)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A2E]">
        {isHr ? 'Стажёры и наставники' : 'Стажёры'}
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        {canManageTrainees
          ? 'Стажёры в программе адаптации. Назначить наставника можно в профиле стажёра.'
          : 'Стажёры в программе адаптации. Назначение наставника выполняет HR в профиле стажёра.'}
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading && (
          <p className="px-6 py-8 text-center text-gray-500">Загрузка…</p>
        )}
        {!isLoading && trainees.length === 0 && (
          <p className="px-6 py-8 text-center text-gray-500">
            Пока нет стажёров в программе адаптации
          </p>
        )}
        {!isLoading && trainees.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/80">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-600">ФИО</th>
                <th className="px-6 py-3 font-medium text-gray-600">Email</th>
                <th className="px-6 py-3 font-medium text-gray-600">Отдел</th>
                <th className="px-6 py-3 font-medium text-gray-600">Наставник</th>
                <th className="px-6 py-3 font-medium text-gray-600" />
              </tr>
            </thead>
            <tbody>
              {trainees.map((t) => (
                <tr key={t.userId} className="border-b border-gray-50 last:border-0">
                  <td className="px-6 py-4 font-medium text-[#1A1A2E]">{t.fullName}</td>
                  <td className="px-6 py-4 text-gray-600">{t.email}</td>
                  <td className="px-6 py-4 text-gray-600">{t.department ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{t.hrFullName ?? '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <Button asChild variant="ghost" size="sm" className="mr-2 gap-1">
                      <Link to={`${basePath}/trainees/${t.userId}`}>
                        <UserRound className="h-3.5 w-3.5" />
                        Профиль стажёра
                      </Link>
                    </Button>
                    {canManageTrainees && t.hrId ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => openMentorProfile(t.hrId!)}
                        disabled={!mentorsById.has(t.hrId)}
                      >
                        <Users className="h-3.5 w-3.5" />
                        Профиль наставника
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <EmployeeDetailDialog
        employee={selectedMentor}
        open={selectedMentor !== null}
        onOpenChange={(open) => !open && setSelectedMentor(null)}
      />
    </div>
  )
}
