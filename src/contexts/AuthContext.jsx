import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState(null)
  const mountedRef = useRef(true)

  async function loadProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) throw error
      if (!mountedRef.current) return

      if (!data) {
        console.warn('[Auth] Ingen profil hittades för användare', userId)
        setProfile(null)
        setProfileError('Ingen profil hittades. Kontakta support.')
      } else {
        setProfile(data)
        setProfileError(null)
      }
    } catch (err) {
      console.error('[Auth] Kunde inte ladda profil:', err)
      if (!mountedRef.current) return
      setProfile(null)
      setProfileError(err.message ?? 'Kunde inte ladda profil')
    }
  }

  useEffect(() => {
    mountedRef.current = true

    // 1. Hämta initial session
  supabase.auth.getSession()
    .then(({ data: { session: initial } }) => {
      if (!mountedRef.current) return
      setSession(initial)
      if (initial?.user) {
        // Defer även här för att vara konsekvent
        setTimeout(() => {
          if (mountedRef.current) {
            loadProfile(initial.user.id).finally(() => {
              if (mountedRef.current) setLoading(false)
            })
          }
        }, 0)
      } else {
        setLoading(false)
      }
    })
    .catch(err => {
      console.error('[Auth] getSession fel:', err)
      if (mountedRef.current) setLoading(false)
    })

    // 2. Lyssna på framtida ändringar
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, newSession) => {
      if (!mountedRef.current) return
      console.log('[Auth] event:', event)
      setSession(newSession)

      if (event === 'SIGNED_OUT' || !newSession) {
        setProfile(null)
        setProfileError(null)
        return
      }

      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        // VIKTIGT: defer till nästa tick för att undvika deadlock
        // i Supabase auth-klientens interna lås
        setTimeout(() => {
          if (mountedRef.current) loadProfile(newSession.user.id)
        }, 0)
      }
    }
  )

    return () => {
      mountedRef.current = false
      subscription.unsubscribe()
    }
  }, [])

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) console.error('[Auth] signIn fel:', error)
    return { data, error }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('[Auth] signOut fel:', error)
    return { error }
  }

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    profileError,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth måste användas inom AuthProvider')
  return ctx
}