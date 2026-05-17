import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function DashboardLogoutButton() {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={handleLogout}
      className="fixed bottom-4 left-4 z-[100] h-11 gap-2 rounded-lg border border-gray-200 bg-white px-4 shadow-md hover:bg-gray-50 md:bottom-6 md:left-6"
    >
      <LogOut className="h-4 w-4 shrink-0" />
      Выйти
    </Button>
  )
}
