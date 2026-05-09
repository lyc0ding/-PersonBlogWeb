import request from '@/utils/request'

//标签列表
export function tagListService() {
  return request({
    url:'/tag/list',
    method: 'get'
  });
}

//标签列表
export function tagAddService(data) {
  return request({
    url:'/tag/add',
    method: 'post',
    data:data
  });
}
