import { supabase } from '@/lib/supabase'

export interface ActivityLogEntry {
  id?: string
  action: string
  description: string
  userId: string
  userName: string
  userRole: string
  entityType?: 'member' | 'user'
  entityId?: string
  timestamp?: string
}

const ACTION_LABELS: Record<string, string> = {
  LOGIN:         'User Login',
  LOGOUT:        'User Logout',
  CREATE_MEMBER: 'Member Added',
  UPDATE_MEMBER: 'Member Updated',
  DELETE_MEMBER: 'Member Deleted',
  IMPORT_EXCEL:  'Import Completed',
  EXPORT_DATA:   'Export Generated',
}

export async function getActivityLogs(n = 50): Promise<ActivityLogEntry[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('id, action, description, created_at, user_id')
    .order('created_at', { ascending: false })
    .limit(n)

  if (error) throw new Error(error.message)
  if (!data?.length) return []

  // Fetch profiles for all unique user_ids in one query
  const userIds = [...new Set(data.map((r) => r.user_id).filter(Boolean))] as string[]
  const profileMap: Record<string, { full_name: string | null; role: string }> = {}

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .in('id', userIds)

    ;(profiles ?? []).forEach((p) => {
      profileMap[p.id] = { full_name: p.full_name, role: p.role }
    })
  }

  return data.map((row) => {
    const profile = row.user_id ? profileMap[row.user_id] : undefined
    return {
      id:          row.id,
      action:      ACTION_LABELS[row.action] ?? row.action,
      description: row.description ?? '',
      userId:      row.user_id ?? '',
      userName:    profile?.full_name ?? 'System',
      userRole:    profile?.role ?? 'System',
      timestamp:   row.created_at,
    }
  })
}

export async function logActivity(
  _entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>
): Promise<void> {
  // Actual logging is done server-side via the DB trigger on members table.
  // Client-initiated logs (login, export) can be added here if needed.
}
