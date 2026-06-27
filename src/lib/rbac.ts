import type { UserRole } from '@/types/database.types'

const PERMISSIONS = {
  viewDashboard:    ['Admin', 'Manager', 'Data Entry Operator', 'Viewer'],
  viewMembers:      ['Admin', 'Manager', 'Data Entry Operator', 'Viewer'],
  addMembers:       ['Admin', 'Manager', 'Data Entry Operator'],
  editMembers:      ['Admin', 'Manager', 'Data Entry Operator'],
  deleteMembers:    ['Admin', 'Manager'],
  importData:       ['Admin', 'Manager', 'Data Entry Operator'],
  exportData:       ['Admin', 'Manager', 'Viewer'],
  viewAnalytics:    ['Admin', 'Manager', 'Viewer'],
  viewUsers:        ['Admin', 'Manager'],
  manageUsers:      ['Admin'],
  viewActivityLogs: ['Admin', 'Manager'],
  manageSettings:   ['Admin'],
} as const satisfies Record<string, UserRole[]>

export type Permission = keyof typeof PERMISSIONS

export function can(role: UserRole | null | undefined, permission: Permission): boolean {
  if (!role) return false
  return (PERMISSIONS[permission] as readonly string[]).includes(role)
}

export const ROLE_BADGE: Record<UserRole, string> = {
  Admin:                 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  Manager:               'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400',
  'Data Entry Operator': 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  Viewer:                'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-400',
}

export function initials(name: string | null | undefined): string {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}
