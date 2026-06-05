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

/** PUT /system/config */
export function configSaveService(data) {
  return request({
    url: '/system/config',
    method: 'put',
    data,
  })
}

/** PUT /system/config/batch */
export function configBatchSaveService(data) {
  return request({
    url: '/system/config/batch',
    method: 'put',
    data,
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
