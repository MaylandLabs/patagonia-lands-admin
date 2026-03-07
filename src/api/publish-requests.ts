import api from './client'
import type { PublishRequest } from '@/types'

interface PaginatedResponse {
  data: PublishRequest[]
  pagination: { total: number; page: number; limit: number; pages: number }
}

export async function getPublishRequests(params?: { read?: string; page?: number; limit?: number }) {
  const { data } = await api.get<PaginatedResponse>('/publish-requests/admin', { params })
  return data
}

export async function markAsRead(id: number) {
  const { data } = await api.patch<PublishRequest>(`/publish-requests/admin/${id}/read`)
  return data
}
