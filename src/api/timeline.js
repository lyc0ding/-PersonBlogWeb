import request from '@/utils/request'

export function timelinePageService(params) {
  return request({
    url: '/timeline/page',
    method: 'get',
    params,
  })
}

export function timelineAdminPageService(params) {
  return request({
    url: '/timeline/admin/page',
    method: 'get',
    params,
  })
}

export function timelineDetailService(id) {
  return request({
    url: `/timeline/${id}`,
    method: 'get',
  })
}

export function timelineCreateService(data) {
  return request({
    url: '/timeline',
    method: 'post',
    data,
  })
}

export function timelineUpdateService(id, data) {
  return request({
    url: `/timeline/${id}`,
    method: 'put',
    data,
  })
}

export function timelineUpdateStatusService(id, status) {
  return request({
    url: `/timeline/${id}/status`,
    method: 'patch',
    data: { status },
  })
}

export function timelineDeleteService(id) {
  return request({
    url: `/timeline/${id}`,
    method: 'delete',
  })
}
