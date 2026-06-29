import { supabase } from '@/lib/supabase'

export interface AppNotification {
  id: string
  type: string
  title: string
  body: string
  actorName: string | null
  entityType: string | null
  entityId: string | null
  isRead: boolean
  createdAt: string
}

export async function getMyNotifications(): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return (data ?? []).map(toNotification)
}

export async function markAllAsRead(): Promise<void> {
  // RLS UPDATE policy (recipient_id = auth.uid()) scopes this to the current user only
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('is_read', false)
  if (error) throw new Error(error.message)
}

export async function markAsRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

/**
 * Fan-out a notification via the emit_notifications SECURITY DEFINER RPC.
 * - roles: notified users with these roles, actor automatically excluded
 * - userIds: notified directly (no exclusion — for self-notifications)
 * Non-fatal: a failure here never propagates to the caller.
 */
export async function emitNotifications({
  userIds = [],
  roles = [],
  type,
  title,
  body,
  actorName,
  entityType,
  entityId,
}: {
  userIds?: string[]
  roles?: string[]
  type: string
  title: string
  body: string
  actorName?: string | null
  entityType?: string | null
  entityId?: string | null
}): Promise<void> {
  const { error } = await supabase.rpc('emit_notifications', {
    p_user_ids:    userIds.length > 0 ? userIds : null,
    p_roles:       roles.length > 0   ? roles   : null,
    p_type:        type,
    p_title:       title,
    p_body:        body,
    p_actor_name:  actorName  ?? null,
    p_entity_type: entityType ?? null,
    p_entity_id:   entityId   ?? null,
  })
  if (error) console.warn('[Notifications] emit failed:', error.message)
}

function toNotification(row: Record<string, unknown>): AppNotification {
  return {
    id:          String(row.id),
    type:        String(row.type),
    title:       String(row.title),
    body:        String(row.body),
    actorName:   (row.actor_name  as string | null) ?? null,
    entityType:  (row.entity_type as string | null) ?? null,
    entityId:    (row.entity_id   as string | null) ?? null,
    isRead:      Boolean(row.is_read),
    createdAt:   String(row.created_at),
  }
}
