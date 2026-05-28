import request from '@/utils/request'

/**
 * 上传图片（对接 Spring Boot MultipartFile）
 * POST /upload/image
 * @param {File} file
 * @param {'cover'|'content'|'avatar'} [bizType]
 */
export function uploadImageService(file, bizType = 'content') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('bizType', bizType)
  return request({
    url: '/upload/image',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  })
}

/**
 * 批量上传（可选）
 * POST /upload/images
 */
export function uploadImagesService(files, bizType = 'content') {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  formData.append('bizType', bizType)
  return request({
    url: '/upload/images',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  })
}

/** 从统一响应体解析） */
export function resolveUploadUrl(res) {
  if (!res) return ''
  if (typeof res === 'string') return res
  return res.url || res.data?.url || res.data || ''
}
