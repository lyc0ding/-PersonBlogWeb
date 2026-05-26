import request from '@/utils/request'

export function commentPageService(params) {
  return request({
    url: '/comment/page',
    method: 'get',
    params,
  })
}

export function commentSubmitService(data) {
  return request({
    url: '/comment',
    method: 'post',
    data,
  })
}

export function commentGuestbookStatsService() {
  return request({
    url: '/comment/guestbook/stats',
    method: 'get',
  })
}

export function commentAdminPageService(params) {
  return request({
    url: '/comment/admin/page',
    method: 'get',
    params,
  })
}

export function commentUpdateStatusService(id, status) {
  return request({
    url: `/comment/${id}/status`,
    method: 'patch',
    data: { status },
  })
}

export function commentDeleteService(id) {
  return request({
    url: `/comment/${id}`,
    method: 'delete',
  })
}
