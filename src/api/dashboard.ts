import { getProperties } from './properties'
import { getPublishRequests } from './publish-requests'
import type { DashboardStats } from '@/types'

export async function getDashboardStats(): Promise<DashboardStats> {
  const [allProps, unreadReqs] = await Promise.all([
    getProperties({ limit: 1 }),
    getPublishRequests({ read: 'false', limit: 1 }),
  ])

  return {
    total_properties: allProps.pagination.total,
    visible_properties: 0, // not available from current endpoints
    unread_requests: unreadReqs.pagination.total,
  }
}
