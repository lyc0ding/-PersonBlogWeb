import request from '@/utils/request'

/**
 * 上传图片（对接 Spring Boot MultipartFile）
 * POST /upload/image
 * @param {File} file
 * @param {'photo'|'avatar'} [bizType]
 */
export function uploadImageService(file, bizType = 'photo') {
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
export function uploadImagesService(files, bizType = 'photo') {
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
  const data = res.data ?? res
  if (typeof data === 'string') return data
  return data.url
    || data.imageUrl
    || data.fileUrl
    || data.path
    || data.src
    || data.data?.url
    || data.data?.imageUrl
    || data.data?.fileUrl
    || data.data?.path
    || data.data?.src
    || ''
}
