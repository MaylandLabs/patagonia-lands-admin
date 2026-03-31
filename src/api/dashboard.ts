import { getProperties } from './properties'
import { getPublishRequests } from './publish-requests'
import type { DashboardStats } from '@/types'

export async function getDashboardStats(): Promise<DashboardStats> {
  const [allProps, visibleProps, unreadReqs] = await Promise.all([
    getProperties({ limit: 1 }),
    getProperties({ limit: 1, visible: true }),
    getPublishRequests({ read: 'false', limit: 1 }),
  ])

  return {
    total_properties: allProps.pagination.total,
    visible_properties: visibleProps.pagination.total,
    unread_requests: unreadReqs.pagination.total,
  }
}
