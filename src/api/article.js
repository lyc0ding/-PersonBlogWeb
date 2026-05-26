import request from '@/utils/request'

export function publicArticlePageService(params) {
  return request({
    url: '/article/public/page',
    method: 'get',
    params,
  })
}

export function publicArticleDetailService(id) {
  return request({
    url: `/article/public/${id}`,
    method: 'get',
  })
}
