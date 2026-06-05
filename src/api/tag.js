import request from '@/utils/request'

export function publicTagListService() {
  return request({
    url: '/tag/list',
    method: 'get',
  })
}
