import request from '@/utils/request'

export function globalSearchService(params) {
  return request({
    url: '/search',
    method: 'get',
    params,
  })
}
