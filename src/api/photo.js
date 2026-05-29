import request from '@/utils/request'

export function photoPageService(params) {
  return request({
    url: '/photo/page',
    method: 'get',
    params,
  })
}

export function photoAdminPageService(params) {
  return request({
    url: '/photo/admin/page',
    method: 'get',
    params,
  })
}

export function photoCreateService(data) {
  return request({
    url: '/photo',
    method: 'post',
    data,
  })
}

export function photoUpdateService(id, data) {
  return request({
    url: `/photo/${id}`,
    method: 'put',
    data,
  })
}

export function photoUpdateStatusService(id, status) {
  return request({
    url: `/photo/${id}/status`,
    method: 'patch',
    data: { status },
  })
}

export function photoDeleteService(id) {
  return request({
    url: `/photo/${id}`,
    method: 'delete',
  })
}
