'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User, AuthContextType, LoginCredentials, SignupData } from '@/types/auth'
import { storeUser, getStoredUser, clearStoredUser } from '@/lib/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = getStoredUser()
    if (storedUser) setUser(storedUser as User)
    setIsLoading(false)
  }, [])

  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.user) {
      setIsLoading(false)
      return { success: false, error: data.error || 'Invalid email or password' }
    }
    setUser(data.user)
    storeUser(data.user)
    setIsLoading(false)
    return { success: true }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    clearStoredUser()
  }, [])

  const signup = useCallback(async (_data: SignupData): Promise<{ success: boolean; error?: string }> => {
    return { success: false, error: 'Signup is not enabled yet. Ask admin to create user.' }
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
