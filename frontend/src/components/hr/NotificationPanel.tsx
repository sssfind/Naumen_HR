import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadCount,
} from '@/hooks/useNotifications'
import { traineeNotificationLink } from '@/lib/notificationLinks'
import type { Notification, NotificationType } from '@/types/notification'
import { cn } from '@/lib/utils'

interface NotificationPanelProps {
  resolveLink?: (type: NotificationType) => string | null
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function NotificationPanel({ resolveLink }: NotificationPanelProps) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const { data: notifications = [], isLoading } = useNotifications()
  const { data: unreadCount = 0 } = useUnreadCount()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  function handleNotificationClick(n: Notification) {
    if (!n.read) markRead.mutate(n.id)
    const link = resolveLink?.(n.type) ?? traineeNotificationLink(n.type)
    if (link) {
      setOpen(false)
      navigate(link)
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={panelRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen((v) => !v)}
        aria-label="Уведомления"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-96 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="font-semibold text-[#1A1A2E]">Уведомления</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Прочитать все
              </Button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading && (
              <p className="px-4 py-6 text-center text-sm text-gray-500">Загрузка…</p>
            )}
            {!isLoading && notifications.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-gray-500">Нет уведомлений</p>
            )}
            {notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                className={cn(
                  'w-full border-b border-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-50',
                  !n.read && 'bg-orange-50/50'
                )}
                onClick={() => handleNotificationClick(n)}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-[#1A1A2E]">{n.title}</p>
                  {!n.read && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
                {n.message && (
                  <p className="mt-1 line-clamp-2 text-xs text-gray-600">{n.message}</p>
                )}
                <p className="mt-1 text-[10px] text-gray-400">{formatTime(n.createdAt)}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
