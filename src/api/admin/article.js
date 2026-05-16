import request from '@/utils/request'

/**
 * 文章分页列表
 * GET /article/page?pageNum=1&pageSize=10&keyword=&status=
 */
export function articlePageService(params) {
  return request({
    url: '/article/page',
    method: 'get',
    params,
  })
}

/** GET /article/{id} */
export function articleDetailService(id) {
  return request({
    url: `/article/${id}`,
    method: 'get',
  })
}

/**
 * 新增文章
 * POST /article
 * body: ArticleSaveDTO
 */
export function articleCreateService(data) {
  return request({
    url: '/article',
    method: 'post',
    data,
  })
}

/**
 * 更新文章
 * PUT /article/{id}
 */
export function articleUpdateService(id, data) {
  return request({
    url: `/article/${id}`,
    method: 'put',
    data,
  })
}

/** DELETE /article/{id} */
export function articleDeleteService(id) {
  return request({
    url: `/article/${id}`,
    method: 'delete',
  })
}

/** PATCH /article/{id}/status */
export function articleUpdateStatusService(id, status) {
  return request({
    url: `/article/${id}/status`,
    method: 'patch',
    data: { status },
  })
}

/** 保存草稿 POST /article/draft */
export function articleSaveDraftService(data) {
  return request({
    url: '/article/draft',
    method: 'post',
    data,
  })
}

/** 发布 POST /article/{id}/publish */
export function articlePublishService(id, data) {
  return request({
    url: `/article/${id}/publish`,
    method: 'post',
    data,
  })
}

/** 组装提交给后端的 DTO */
export function buildArticlePayload(form) {
  return {
    id: form.id ?? null,
    title: form.title?.trim() ?? '',
    summary: form.summary?.trim() ?? '',
    coverUrl: form.coverUrl ?? '',
    tagIds: form.tagIds ?? [],
    categoryId: form.categoryId ?? null,
    type: form.type,
    status: form.status,
    visibility: form.visibility,
    // 结构化正文，MySQL 建议 JSON 列存储
    contentBlocks: form.contentBlocks ?? [],
    // 可选：后端渲染 HTML 后回写
    contentHtml: form.contentHtml ?? null,
  }
}

/** 从后端 VO 还原编辑器表单 */
export function normalizeArticleDetail(raw) {
  const data = raw?.data ?? raw ?? {}
  return {
    id: data.id ?? null,
    title: data.title ?? '',
    summary: data.summary ?? data.abstract ?? '',
    coverUrl: data.coverUrl ?? data.coverPage ?? '',
    tagIds: data.tagIds ?? (data.tags?.map((t) => t.id) ?? []),
    categoryId: data.categoryId ?? null,
    type: data.type ?? 'article',
    status: data.status ?? 0,
    visibility: data.visibility ?? 0,
    contentBlocks: parseContentBlocks(data),
  }
}

function parseContentBlocks(data) {
  if (Array.isArray(data.contentBlocks) && data.contentBlocks.length) {
    return data.contentBlocks
  }
  if (typeof data.content === 'string' && data.content) {
    try {
      const parsed = JSON.parse(data.content)
      if (Array.isArray(parsed)) return parsed
    } catch {
      return [{ id: 'legacy_p', type: 'paragraph', content: data.content }]
    }
  }
  return [{ id: 'empty_p', type: 'paragraph', content: '' }]
}
