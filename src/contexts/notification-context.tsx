"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "./auth-context"
import {
  getMyNotifications,
  markAllAsRead as svcMarkAllRead,
  markAsRead as svcMarkRead,
  type AppNotification,
} from "@/services/notificationService"

interface NotificationContextType {
  notifications: AppNotification[]
  unreadCount:   number
  loading:       boolean
  markAllRead:   () => Promise<void>
  markRead:      (id: string) => Promise<void>
  refresh:       () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!user) { setNotifications([]); return }
    setLoading(true)
    try {
      setNotifications(await getMyNotifications())
    } catch {
      // non-critical — silently ignore
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { refresh() }, [refresh])

  // Realtime: prepend new notifications as they arrive
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'notifications',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>
          setNotifications((prev) => [
            {
              id:         String(row.id),
              type:       String(row.type),
              title:      String(row.title),
              body:       String(row.body),
              actorName:  (row.actor_name  as string | null) ?? null,
              entityType: (row.entity_type as string | null) ?? null,
              entityId:   (row.entity_id   as string | null) ?? null,
              isRead:     Boolean(row.is_read),
              createdAt:  String(row.created_at),
            },
            ...prev.slice(0, 49),  // keep at most 50 in memory
          ])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  const handleMarkAllRead = useCallback(async () => {
    await svcMarkAllRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }, [])

  const handleMarkRead = useCallback(async (id: string) => {
    await svcMarkRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }, [])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      markAllRead: handleMarkAllRead,
      markRead:    handleMarkRead,
      refresh,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications(): NotificationContextType {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationProvider>')
  return ctx
}
