'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { SUPER_ADMIN_EMAIL, isSuperAdmin } from '@/lib/rbac'
import type { Profile, UserRole } from '@/types/database.types'

interface AuthContextType {
  user:            User | null
  profile:         Profile | null
  role:            UserRole | null
  loading:         boolean
  signOut:         () => Promise<void>
  refreshProfile:  () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (authUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      let prof = data as Profile | null

      // Super Admin always gets their role enforced, regardless of any SELECT error.
      // We return early here so the error-check below cannot override a successful
      // Super Admin recovery (e.g. when an RLS hiccup makes the initial read fail).
      if (isSuperAdmin(authUser.email)) {
        if (!prof || prof.role !== 'Super Admin') {
          const upsertData = {
            id:        authUser.id,
            email:     SUPER_ADMIN_EMAIL,
            full_name: prof?.full_name ?? 'Super Admin',
            role:      'Super Admin' as UserRole,
            is_active: true,
          }
          const { data: updated } = await supabase
            .from('profiles')
            .upsert(upsertData, { onConflict: 'id' })
            .select()
            .single()
          prof = (updated ?? { ...upsertData, phone: null, avatar_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }) as Profile
        }
        setProfile(prof)
        return
      }

      // Ignore "no rows" error (first sign-in before profile is created)
      if (error && error.code !== 'PGRST116') {
        setProfile(null)
      } else {
        setProfile(prof)
      }
    } catch {
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user).finally(() => { if (mounted) setLoading(false) })
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user)
  }, [user, loadProfile])

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      role: profile?.role ?? null,
      loading,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
