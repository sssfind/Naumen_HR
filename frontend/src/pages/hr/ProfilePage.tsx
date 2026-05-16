import { Link } from 'react-router-dom'
import { Briefcase, Mail, Pencil, Phone, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProfile } from '@/hooks/useProfile'

function initials(fullName: string) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'HR'
}

export function ProfilePage() {
  const { data: profile, isLoading } = useProfile()

  if (isLoading) {
    return <p className="text-gray-500">Загрузка профиля…</p>
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Мой профиль</h1>
        <p className="mt-1 text-sm text-gray-500">Личные данные и рабочая информация</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            {profile?.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={profile.fullName}
                className="h-32 w-32 rounded-full object-cover ring-4 ring-orange-50"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-orange-50 text-3xl font-bold text-primary ring-4 ring-orange-100">
                {initials(profile?.fullName ?? '')}
              </div>
            )}
            <h2 className="mt-5 text-2xl font-bold text-[#1A1A2E]">{profile?.fullName}</h2>
            <p className="mt-1 text-sm text-gray-500">{profile?.position ?? 'Должность не указана'}</p>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-gray-600">Отдел:</span>
              <span className="ml-auto font-medium text-[#1A1A2E]">{profile?.department ?? '—'}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <span className="text-gray-600">Должность:</span>
              <span className="ml-auto font-medium text-[#1A1A2E]">{profile?.position ?? '—'}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
              <Mail className="h-4 w-4 text-primary" />
              <span className="text-gray-600">Почта:</span>
              <span className="ml-auto font-medium text-[#1A1A2E]">{profile?.email}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
              <Phone className="h-4 w-4 text-primary" />
              <span className="text-gray-600">Телефон:</span>
              <span className="ml-auto font-medium text-[#1A1A2E]">{profile?.phone ?? '—'}</span>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-6 flex justify-end">
        <Button asChild className="gap-2">
          <Link to="/dashboard/hr/profile/edit">
            <Pencil className="h-4 w-4" />
            Редактировать данные
          </Link>
        </Button>
      </div>
    </div>
  )
}

