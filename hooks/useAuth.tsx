'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User, AuthContextType, LoginCredentials, SignupData } from '@/types/auth'
import { validateCredentials, storeUser, getStoredUser, clearStoredUser, generateUserId } from '@/lib/auth'
import { users, getUserByEmail, getUserById } from '@/data/users'
import { ROLE_MEMBER } from '@/data/roles'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from storage on mount
  useEffect(() => {
    const storedUser = getStoredUser()
    if (storedUser) {
      // Get full user data (including password for validation)
      const fullUser = getUserById(storedUser.id)
      if (fullUser && fullUser.status !== 'suspended') {
        setUser(fullUser)
      } else {
        clearStoredUser()
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const validatedUser = validateCredentials(credentials)
    
    if (!validatedUser) {
      setIsLoading(false)
      return { success: false, error: 'Invalid email or password' }
    }

    if (validatedUser.status === 'suspended') {
      setIsLoading(false)
      return { success: false, error: 'Your account has been suspended' }
    }

    setUser(validatedUser)
    storeUser(validatedUser)
    setIsLoading(false)
    
    return { success: true }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    clearStoredUser()
  }, [])

  const signup = useCallback(async (data: SignupData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Check if email already exists
    if (getUserByEmail(data.email)) {
      setIsLoading(false)
      return { success: false, error: 'Email already registered' }
    }

    // Create new user (in real app, this would go to the backend)
    const newUser: User = {
      id: generateUserId(),
      name: data.name,
      email: data.email,
      password: data.password,
      organizationId: null,
      roleId: ROLE_MEMBER,
      status: 'active',
      joinedAt: new Date().toISOString(),
    }

    // Add to local users array (this is just for demo purposes)
    users.push(newUser)

    setUser(newUser)
    storeUser(newUser)
    setIsLoading(false)
    
    return { success: true }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
