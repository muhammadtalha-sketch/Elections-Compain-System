import type { UserRole } from '@/types/database.types'

// The one immutable Super Admin account. This email can never be deactivated,
// demoted, or deleted. On signup/login it is automatically assigned Super Admin.
export const SUPER_ADMIN_EMAIL = 'muhammad.talha@ingeniousc.com'

export function isSuperAdmin(email: string | null | undefined): boolean {
  return email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
}

// ─── Permissions ──────────────────────────────────────────────────────────────
// Enforcement happens INSIDE pages, not in the sidebar.
// The sidebar always renders all items for every authenticated user.

const PERMISSIONS: Record<string, UserRole[]> = {
  // Members
  viewMembers:      ['Super Admin', 'Admin', 'User'],
  addMembers:       ['Super Admin', 'Admin'],
  editMembers:      ['Super Admin', 'Admin'],
  deleteMembers:    ['Super Admin', 'Admin'],

  // Data
  importData:       ['Super Admin', 'Admin'],
  exportData:       ['Super Admin', 'Admin', 'User'],

  // Analytics
  viewAnalytics:    ['Super Admin', 'Admin', 'User'],

  // Users
  viewUsers:        ['Super Admin', 'Admin'],
  manageUsers:      ['Super Admin', 'Admin'],

  // Logs & settings
  viewActivityLogs: ['Super Admin', 'Admin'],
  manageSettings:   ['Super Admin'],
}

export type Permission = keyof typeof PERMISSIONS

export function can(role: UserRole | null | undefined, permission: Permission): boolean {
  if (!role) return false
  return PERMISSIONS[permission]?.includes(role) ?? false
}

// ─── Visual helpers ───────────────────────────────────────────────────────────

export const ROLE_BADGE: Record<UserRole, string> = {
  'Super Admin': 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  'Admin':       'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  'User':        'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-400',
}

export const ASSIGNABLE_ROLES: UserRole[] = ['Admin', 'User']

export function initials(name: string | null | undefined): string {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}
