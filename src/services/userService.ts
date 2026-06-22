import { supabase } from '@/lib/supabase'
import type { ProfileUpdate, UserRole } from '@/types/database.types'

export interface FirestoreUser {
  id?: string
  name: string
  email: string
  phone: string
  role: UserRole
  status: 'Active' | 'Inactive'
  lastLogin?: string
  createdAt?: unknown
  updatedAt?: unknown
}

// ─── Read ────────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<FirestoreUser[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map((p) => ({
    id:         p.id,
    name:       p.full_name ?? 'Unknown',
    email:      p.email ?? '',
    phone:      p.phone ?? '',
    role:       p.role,
    status:     p.is_active ? 'Active' : 'Inactive',
    createdAt:  p.created_at,
    updatedAt:  p.updated_at,
  }))
}

export async function getUserById(id: string): Promise<FirestoreUser | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null

  return {
    id:        data.id,
    name:      data.full_name ?? 'Unknown',
    email:     data.email ?? '',
    phone:     data.phone ?? '',
    role:      data.role,
    status:    data.is_active ? 'Active' : 'Inactive',
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

// ─── Write ───────────────────────────────────────────────────────────────────

export async function createUserProfile(
  uid: string,
  profile: Omit<FirestoreUser, 'id' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  const { error } = await supabase.from('profiles').upsert({
    id:        uid,
    full_name: profile.name,
    email:     profile.email,
    phone:     profile.phone || null,
    role:      profile.role,
    is_active: profile.status === 'Active',
  })
  if (error) throw new Error(error.message)
}

export async function updateUserProfile(
  id: string,
  updates: Partial<FirestoreUser>
): Promise<void> {
  const patch: ProfileUpdate = {}
  if (updates.name !== undefined)   patch.full_name = updates.name
  if (updates.email !== undefined)  patch.email = updates.email
  if (updates.phone !== undefined)  patch.phone = updates.phone || null
  if (updates.role !== undefined)   patch.role = updates.role
  if (updates.status !== undefined) patch.is_active = updates.status === 'Active'

  const { error } = await supabase.from('profiles').update(patch).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function getUserByEmail(email: string): Promise<FirestoreUser | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .maybeSingle()

  if (error || !data) return null

  return {
    id:        data.id,
    name:      data.full_name ?? 'Unknown',
    email:     data.email ?? '',
    phone:     data.phone ?? '',
    role:      data.role,
    status:    data.is_active ? 'Active' : 'Inactive',
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}
