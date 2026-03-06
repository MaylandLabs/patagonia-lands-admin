import api from './client'
import type { PublishRequest } from '@/types'

export async function getPublishRequests() {
  const { data } = await api.get<PublishRequest[]>('/publish-requests')
  return data
}

export async function markAsRead(id: number, is_read: boolean) {
  const { data } = await api.patch<PublishRequest>(`/publish-requests/${id}`, { is_read })
  return data
}
