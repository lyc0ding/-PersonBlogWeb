import request from '@/utils/request'

export function publicAboutService() {
  return request({
    url: '/system/about/public',
    method: 'get',
  })
}
