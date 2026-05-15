import { RegisterForm } from '@/components/auth/RegisterForm'
import { RegisterSideBanner } from '@/components/auth/RegisterSideBanner'

export function RegisterPage() {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-[#F5F5F5]">
      <div className="hidden md:block min-h-screen">
        <RegisterSideBanner />
      </div>

      <div className="flex items-center justify-center overflow-x-hidden bg-[#F5F5F5] p-4 sm:p-6 md:p-10">
        <div className="w-full min-w-0 max-w-md">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8 md:p-10">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-[#1A1A2E] mb-1">Создать аккаунт</h2>
              <p className="text-gray-500 text-sm">
                Зарегистрируйтесь с корпоративным email Naumen
              </p>
            </div>

            <RegisterForm />
          </div>

        </div>
      </div>
    </div>
  )
}
