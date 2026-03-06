import api, { setToken } from './client'
import type { LoginCredentials, AuthResponse } from '@/types'

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', credentials)
  setToken(data.token)
  return data
}

export function logout() {
  setToken(null)
}
