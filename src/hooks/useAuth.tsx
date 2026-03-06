import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { login as apiLogin, logout as apiLogout } from '@/api/auth'
import { getToken, setToken } from '@/api/client'
import type { LoginCredentials } from '@/types'

interface AuthContextType {
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getToken())

  const login = useCallback(async (credentials: LoginCredentials) => {
    await apiLogin(credentials)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    apiLogout()
    setToken(null)
    setIsAuthenticated(false)
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
