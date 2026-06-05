import request from '@/utils/request'

export function siteConfigListService(group) {
  return request({
    url: '/system/config/list',
    method: 'get',
    params: group ? { group } : undefined,
  })
}

export function publicDashboardStatsService() {
  return request({
    url: '/system/dashboard',
    method: 'get',
  })
}
