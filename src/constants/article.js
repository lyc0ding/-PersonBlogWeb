/** 文章类型 */
export const ARTICLE_TYPE = {
  ARTICLE: 'article',
  SHUOSHUO: 'shuoshuo',
}

/** 发布状态（对应 MySQL status 字段） */
export const ARTICLE_STATUS = {
  DRAFT: 0,
  PUBLISHED: 1,
  ARCHIVED: 2,
}

/** 可见范围 */
export const ARTICLE_VISIBILITY = {
  PUBLIC: 0,
  PRIVATE: 1,
  FRIENDS: 2,
}

export const ARTICLE_STATUS_LABEL = {
  [ARTICLE_STATUS.DRAFT]: '草稿',
  [ARTICLE_STATUS.PUBLISHED]: '已发布',
  [ARTICLE_STATUS.ARCHIVED]: '已归档',
}

export const ARTICLE_VISIBILITY_LABEL = {
  [ARTICLE_VISIBILITY.PUBLIC]: '全部可见',
  [ARTICLE_VISIBILITY.PRIVATE]: '仅我可见',
  [ARTICLE_VISIBILITY.FRIENDS]: '友链可见',
}

/** 代码块支持的语言（后端仅存字符串，高亮由前端决定） */
export const CODE_LANGUAGES = [
  { label: 'Plain Text', value: 'plaintext' },
  { label: 'Java', value: 'java' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'SQL', value: 'sql' },
  { label: 'JSON', value: 'json' },
  { label: 'Bash', value: 'bash' },
  { label: 'Python', value: 'python' },
]

/** 新建文章默认结构（与 Spring Boot DTO 对齐） */
export function createEmptyArticle() {
  return {
    id: null,
    title: '',
    summary: '',
    coverUrl: '',
    tagIds: [],
    categoryId: null,
    type: ARTICLE_TYPE.ARTICLE,
    status: ARTICLE_STATUS.DRAFT,
    visibility: ARTICLE_VISIBILITY.PUBLIC,
    contentHtml: '',
    contentText: '',
    contentBlocks: [createBlock('paragraph')],
  }
}

let blockSeed = 0

export function createBlock(type = 'paragraph') {
  const id = `block_${Date.now()}_${++blockSeed}`
  switch (type) {
    case 'heading':
      return { id, type: 'heading', level: 2, content: '' }
    case 'image':
      return { id, type: 'image', url: '', alt: '', caption: '' }
    case 'code':
      return { id, type: 'code', language: 'java', content: '', filename: '' }
    case 'quote':
      return { id, type: 'quote', content: '' }
    default:
      return { id, type: 'paragraph', content: '' }
  }
}
