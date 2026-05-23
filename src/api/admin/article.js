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
    // 富文本 HTML 可直接用于博客详情页渲染，MySQL 建议 longtext。
    contentHtml: form.contentHtml ?? '',
    // 纯文本便于搜索、摘要回退、后端缓存索引。
    contentText: form.contentText ?? '',
    // 结构化正文，MySQL 建议 JSON 列存储。
    contentBlocks: form.contentBlocks ?? [],
  }
}

/** 从后端 VO 还原编辑器表单 */
export function normalizeArticleDetail(raw) {
  const data = raw?.data ?? raw ?? {}
  const contentBlocks = parseContentBlocks(data)
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
    contentHtml: resolveContentHtml(data) || blocksToHtml(contentBlocks),
    contentText: data.contentText ?? '',
    contentBlocks,
  }
}

function resolveContentHtml(data) {
  if (typeof data.contentHtml === 'string') return data.contentHtml
  if (typeof data.html === 'string') return data.html
  if (typeof data.content === 'string') {
    try {
      const parsed = JSON.parse(data.content)
      if (Array.isArray(parsed)) return ''
    } catch {
      return data.content
    }
  }
  return ''
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

function blocksToHtml(blocks = []) {
  return blocks
    .map((block) => {
      if (block.type === 'heading') {
        const level = [2, 3, 4].includes(Number(block.level)) ? Number(block.level) : 2
        return `<h${level}>${escapeHtml(block.content ?? '')}</h${level}>`
      }
      if (block.type === 'quote') {
        return `<blockquote>${escapeHtml(block.content ?? '')}</blockquote>`
      }
      if (block.type === 'image' && block.url) {
        return [
          '<figure class="article-image">',
          `<img src="${escapeAttribute(block.url)}" alt="${escapeAttribute(block.alt ?? '')}">`,
          block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : '',
          '</figure>',
        ].join('')
      }
      if (block.type === 'code') {
        const language = block.language || 'plaintext'
        return [
          `<pre class="article-code" data-language="${escapeAttribute(language)}" data-filename="${escapeAttribute(block.filename ?? '')}">`,
          `<code class="language-${escapeAttribute(language)}">${escapeHtml(block.content ?? '')}</code>`,
          '</pre>',
        ].join('')
      }
      if (block.type === 'richText') {
        return block.content ?? ''
      }
      return `<p>${escapeHtml(block.content ?? '')}</p>`
    })
    .join('')
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#96;')
}
