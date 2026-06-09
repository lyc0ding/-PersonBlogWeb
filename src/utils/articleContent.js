import { CODE_LANGUAGES } from '@/constants/article'

export function blocksToHtml(blocks = []) {
  if (!Array.isArray(blocks) || !blocks.length) return ''
  return blocks
    .map((block) => {
      if (block.type === 'heading') {
        if (!String(block.content ?? '').trim()) return ''
        const level = [2, 3, 4].includes(Number(block.level)) ? Number(block.level) : 2
        return `<h${level}>${escapeHtml(block.content ?? '')}</h${level}>`
      }
      if (block.type === 'quote') {
        if (!String(block.content ?? '').trim()) return ''
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
        if (!String(block.content ?? '').trim()) return ''
        const language = block.language || 'plaintext'
        const filename = block.filename || ''
        const title = getCodeTitle(language, filename)
        return [
          `<pre class="article-code" data-language="${escapeAttribute(language)}" data-filename="${escapeAttribute(filename)}" data-title="${escapeAttribute(title)}">`,
          `<code class="language-${escapeAttribute(sanitizeClassToken(language))}">${escapeHtml(block.content ?? '')}</code>`,
          '</pre>',
        ].join('')
      }
      if (block.type === 'richText') {
        return normalizeArticleHtml(block.content ?? '')
      }
      if (!String(block.content ?? '').trim()) return ''
      return `<p>${escapeHtml(block.content ?? '')}</p>`
    })
    .filter(Boolean)
    .join('')
}

export function normalizeArticleHtml(html) {
  if (!html || typeof document === 'undefined') return html || ''
  const container = document.createElement('div')
  container.innerHTML = html
  container.querySelectorAll('pre').forEach((pre) => {
    pre.classList.add('article-code')
    const code = pre.querySelector('code')
    const language = pre.dataset.language || readCodeLanguage(code) || 'plaintext'
    const filename = pre.dataset.filename || ''
    pre.dataset.language = language
    pre.dataset.title = pre.dataset.title || getCodeTitle(language, filename)
    if (code && !code.className.split(/\s+/).some((item) => item.startsWith('language-'))) {
      code.classList.add(`language-${sanitizeClassToken(language)}`)
    }
  })
  return container.innerHTML
}

export function textToHtml(text = '') {
  return String(text)
    .split(/\n+/)
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join('')
}

export function getCodeTitle(language = 'plaintext', filename = '') {
  const label = getLanguageLabel(language)
  return filename ? `${filename} · ${label}` : label
}

export function getLanguageLabel(value) {
  return CODE_LANGUAGES.find((item) => item.value === value)?.label || value || 'Plain Text'
}

export function readCodeLanguage(codeNode) {
  const className = codeNode?.getAttribute('class') || ''
  return className.split(/\s+/).find((item) => item.startsWith('language-'))?.replace('language-', '')
}

export function sanitizeClassToken(value) {
  return String(value || 'plaintext').replace(/[^\w-]/g, '') || 'plaintext'
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#96;')
}
