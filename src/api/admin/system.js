import request from '@/utils/request'

/** GET /system/dashboard */
export function dashboardStatsService() {
  return request({
    url: '/system/dashboard',
    method: 'get',
  })
}

/** GET /system/user/list */
export function userListService() {
  return request({
    url: '/system/user/list',
    method: 'get',
  })
}

/** GET /system/config/list?group=site */
export function configListService(group) {
  return request({
    url: '/system/config/list',
    method: 'get',
    params: group ? { group } : undefined,
  })
}

/** GET /system/about */
export function aboutDetailService() {
  return request({
    url: '/system/about',
    method: 'get',
  })
}

/** PUT /system/about */
export function aboutSaveService(data) {
  return request({
    url: '/system/about',
    method: 'put',
    data,
  })
}
