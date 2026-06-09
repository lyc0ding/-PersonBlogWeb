<template>
  <div class="rich-blog-editor">
    <div class="editor-toolbar" @mousedown.prevent>
      <el-select
        v-model="blockFormat"
        size="small"
        class="format-select"
        @change="applyBlockFormat"
      >
        <el-option label="正文" value="p" />
        <el-option label="二级标题" value="h2" />
        <el-option label="三级标题" value="h3" />
        <el-option label="引用" value="blockquote" />
      </el-select>

      <el-divider direction="vertical" />

      <el-tooltip content="加粗" placement="top">
        <el-button size="small" :type="commandStates.bold ? 'primary' : 'default'" @click="runCommand('bold')">
          B
        </el-button>
      </el-tooltip>
      <el-tooltip content="斜体" placement="top">
        <el-button size="small" :type="commandStates.italic ? 'primary' : 'default'" @click="runCommand('italic')">
          I
        </el-button>
      </el-tooltip>
      <el-tooltip content="下划线" placement="top">
        <el-button size="small" :type="commandStates.underline ? 'primary' : 'default'" @click="runCommand('underline')">
          U
        </el-button>
      </el-tooltip>
      <el-tooltip content="删除线" placement="top">
        <el-button size="small" :type="commandStates.strikeThrough ? 'primary' : 'default'" @click="runCommand('strikeThrough')">
          S
        </el-button>
      </el-tooltip>
      <el-tooltip content="重点高亮" placement="top">
        <el-button size="small" @click="highlightSelection">高亮</el-button>
      </el-tooltip>
      <el-tooltip content="清除格式" placement="top">
        <el-button size="small" @click="runCommand('removeFormat')">
          <el-icon><Delete /></el-icon>
        </el-button>
      </el-tooltip>

      <el-divider direction="vertical" />

      <el-popover width="260" trigger="click" @show="saveSelection">
        <template #reference>
          <el-button size="small">
            <el-icon><Sunny /></el-icon>
            表情
          </el-button>
        </template>
        <div class="emoji-grid">
          <button
            v-for="emoji in emojis"
            :key="emoji"
            type="button"
            class="emoji-btn"
            @click="insertEmoji(emoji)"
          >
            {{ emoji }}
          </button>
        </div>
      </el-popover>

      <el-button size="small" :loading="uploading" @click="triggerImageUpload">
        <el-icon><Picture /></el-icon>
        图片
      </el-button>
      <el-button size="small" type="primary" plain @click="openCodeDialog">
        <el-icon><Tickets /></el-icon>
        代码块
      </el-button>
      <el-button size="small" @click="runCommand('insertUnorderedList')">列表</el-button>
      <el-button size="small" @click="runCommand('undo')">撤销</el-button>
      <el-button size="small" @click="runCommand('redo')">重做</el-button>

      <input
        ref="imageInputRef"
        class="hidden-file"
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        @change="handleImageFile"
      >
    </div>

    <div
      ref="editorRef"
      class="editor-content"
      contenteditable="true"
      :data-placeholder="placeholder"
      @focus="saveSelection"
      @keyup="handleSelectionChange"
      @mouseup="handleSelectionChange"
      @input="syncEditor"
      @paste="handlePaste"
    />

    <div class="editor-footer">
      <span>正文 {{ plainText.length }} 字</span>
      <span>支持 HTML、表情、图片、代码块与常用文字格式</span>
    </div>

    <el-dialog v-model="codeDialogVisible" title="插入代码块" width="680px" @closed="clearInsertionMarker">
      <el-form label-position="top">
        <div class="code-form-row">
          <el-form-item label="语言">
            <el-select v-model="codeForm.language" filterable>
              <el-option
                v-for="item in CODE_LANGUAGES"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="文件名">
            <el-input v-model="codeForm.filename" placeholder="可选，如 app.py" />
          </el-form-item>
        </div>
        <el-form-item label="代码">
          <el-input
            v-model="codeForm.content"
            type="textarea"
            :rows="12"
            resize="vertical"
            placeholder="粘贴 bash、java、python 等代码"
            spellcheck="false"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="codeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="insertCodeBlock">插入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Picture, Sunny, Tickets } from '@element-plus/icons-vue'
import { CODE_LANGUAGES } from '@/constants/article'
import { resolveUploadUrl, uploadImageService } from '@/api/admin/upload'
import {
  getCodeTitle,
  normalizeArticleHtml,
  readCodeLanguage,
  sanitizeClassToken,
} from '@/utils/articleContent'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '在这里开始写作。选中文本后可设置高亮、下划线、删除线，也可以在光标位置插入图片和代码块。' },
})

const emit = defineEmits(['update:modelValue', 'text-change', 'blocks-change'])

const editorRef = ref(null)
const imageInputRef = ref(null)
const savedRange = ref(null)
const insertionMarkerRef = ref(null)
const blockFormat = ref('p')
const plainText = ref('')
const uploading = ref(false)
const codeDialogVisible = ref(false)
const isApplyingExternalValue = ref(false)

const commandStates = reactive({
  bold: false,
  italic: false,
  underline: false,
  strikeThrough: false,
})

const codeForm = reactive({
  language: 'java',
  filename: '',
  content: '',
})

const emojis = [
  '😀', '😄', '😊', '😂', '😍', '😎', '🤔', '😭',
  '👍', '👏', '🙏', '🔥', '✨', '🎉', '🚀', '💡',
  '❤️', '💻', '📌', '📚', '☕', '🌙', '⭐', '✅',
]

onMounted(() => {
  setEditorHtml(props.modelValue || '', true)
  document.addEventListener('selectionchange', handleSelectionChange)
})

onBeforeUnmount(() => {
  document.removeEventListener('selectionchange', handleSelectionChange)
})

watch(
  () => props.modelValue,
  (value) => {
    if (!editorRef.value || isApplyingExternalValue.value) return
    if (value !== editorRef.value.innerHTML) {
      setEditorHtml(value || '', true)
    }
  }
)

function setEditorHtml(html, shouldEmit = false) {
  if (!editorRef.value) return
  editorRef.value.innerHTML = normalizeArticleHtml(sanitizeHtml(html))
  updateDerivedState(shouldEmit)
}

function syncEditor() {
  updateDerivedState(true)
}

function updateDerivedState(shouldEmit) {
  if (!editorRef.value) return
  const html = normalizeArticleHtml(sanitizeHtml(editorRef.value.innerHTML))
  const text = extractPlainText(html)
  plainText.value = text
  if (!shouldEmit) return
  isApplyingExternalValue.value = true
  emit('update:modelValue', html)
  emit('text-change', text)
  emit('blocks-change', htmlToBlocks(html))
  nextTick(() => {
    isApplyingExternalValue.value = false
  })
}

function saveSelection() {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return
  const range = selection.getRangeAt(0)
  if (!editorRef.value?.contains(range.commonAncestorContainer)) return
  savedRange.value = range.cloneRange()
}

function restoreSelection() {
  editorRef.value?.focus()
  const selection = window.getSelection()
  if (!selection) return
  selection.removeAllRanges()
  if (savedRange.value) {
    selection.addRange(savedRange.value)
    return
  }
  const range = document.createRange()
  range.selectNodeContents(editorRef.value)
  range.collapse(false)
  selection.addRange(range)
}

function handleSelectionChange() {
  if (!editorRef.value) return
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return
  const range = selection.getRangeAt(0)
  if (!editorRef.value.contains(range.commonAncestorContainer)) return
  saveSelection()
  updateCommandStates()
}

function updateCommandStates() {
  Object.keys(commandStates).forEach((command) => {
    commandStates[command] = document.queryCommandState(command)
  })
}

function runCommand(command, value = null) {
  restoreSelection()
  document.execCommand(command, false, value)
  saveSelection()
  updateCommandStates()
  syncEditor()
}

function applyBlockFormat(tag) {
  restoreSelection()
  document.execCommand('formatBlock', false, tag)
  saveSelection()
  syncEditor()
}

function highlightSelection() {
  runCommand('hiliteColor', '#fff3a3')
}

function insertEmoji(emoji) {
  restoreSelection()
  document.execCommand('insertText', false, emoji)
  saveSelection()
  syncEditor()
}

function triggerImageUpload() {
  saveSelection()
  imageInputRef.value?.click()
}

async function handleImageFile(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  if (!/^image\//.test(file.type)) {
    ElMessage.error('只能上传图片文件')
    return
  }

  uploading.value = true
  try {
    const res = await uploadImageService(file, 'photo')
    const url = resolveUploadUrl(res)
    if (!url) throw new Error('empty upload url')
    insertImage(url, file.name)
    ElMessage.success('图片已插入')
  } catch (err) {
    console.warn('[article-editor] 图片上传失败，使用本地预览', err)
    const localUrl = URL.createObjectURL(file)
    insertImage(localUrl, file.name)
    ElMessage.warning('后端上传接口未就绪，已使用本地预览')
  } finally {
    uploading.value = false
  }
}

function insertImage(url, alt = '') {
  const figure = document.createElement('figure')
  figure.className = 'article-image'

  const img = document.createElement('img')
  img.src = url
  img.alt = alt
  figure.appendChild(img)

  const caption = document.createElement('figcaption')
  caption.textContent = '图片说明'
  figure.appendChild(caption)

  insertBlockNodes([figure])
}

function openCodeDialog() {
  placeInsertionMarker()
  codeDialogVisible.value = true
}

function insertCodeBlock() {
  if (!codeForm.content.trim()) {
    ElMessage.warning('请填写代码内容')
    return
  }
  const language = codeForm.language || 'plaintext'
  const filename = codeForm.filename.trim()
  const title = getCodeTitle(language, filename)

  const pre = document.createElement('pre')
  pre.className = 'article-code'
  pre.dataset.language = language
  pre.dataset.filename = filename
  pre.dataset.title = title

  const code = document.createElement('code')
  code.className = `language-${sanitizeClassToken(language)}`
  code.textContent = codeForm.content
  pre.appendChild(code)

  insertBlockNodes([pre])
  codeDialogVisible.value = false
  codeForm.filename = ''
  codeForm.content = ''
}

function handlePaste(event) {
  event.preventDefault()
  restoreSelection()
  const data = event.clipboardData
  const html = data?.getData('text/html')
  const text = data?.getData('text/plain')
  if (html) {
    document.execCommand('insertHTML', false, normalizeArticleHtml(sanitizeHtml(html)))
  } else if (text) {
    document.execCommand('insertText', false, text)
  }
  saveSelection()
  syncEditor()
}

function insertBlockNodes(nodes) {
  const editor = editorRef.value
  if (!editor) return

  let marker = getInsertionMarker()

  if (!marker) {
    restoreSelection()
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    let range = selection.getRangeAt(0)
    if (!editor.contains(range.commonAncestorContainer)) {
      range = document.createRange()
      range.selectNodeContents(editor)
      range.collapse(false)
    }

    range.deleteContents()
    marker = createInsertionMarker()
    range.insertNode(marker)
  }

  const trailingParagraph = createEmptyParagraph()
  let caretTarget = trailingParagraph
  let caretAtStart = false
  const embeddedBlock = findEmbeddedBlock(marker)

  if (embeddedBlock) {
    const parent = embeddedBlock.parentNode
    if (!parent) return
    marker.remove()
    const referenceNode = embeddedBlock.nextSibling
    nodes.forEach((node) => parent.insertBefore(node, referenceNode))
    parent.insertBefore(trailingParagraph, referenceNode)
    placeCaretInBlock(caretTarget, caretAtStart)
    saveSelection()
    syncEditor()
    return
  }

  const block = findEditableBlock(marker)
  if (block?.tagName?.toLowerCase() === 'li') {
    const result = insertBlocksAroundListItem(block, marker, nodes, trailingParagraph)
    if (result) {
      placeCaretInBlock(result.caretTarget, result.caretAtStart)
      saveSelection()
      syncEditor()
      return
    }
  }

  if (block && block !== editor) {
    const beforeBlock = cloneBlockAroundMarker(block, marker, 'before')
    const afterBlock = cloneBlockAroundMarker(block, marker, 'after')
    const parent = block.parentNode
    if (!parent) return

    if (beforeBlock) parent.insertBefore(beforeBlock, block)
    nodes.forEach((node) => parent.insertBefore(node, block))
    if (afterBlock) {
      parent.insertBefore(afterBlock, block)
      caretTarget = afterBlock
      caretAtStart = true
    } else {
      parent.insertBefore(trailingParagraph, block)
    }
    block.remove()
  } else {
    const topLevelParts = splitTopLevelAroundMarker(editor, marker)
    if (topLevelParts.before) editor.insertBefore(topLevelParts.before, marker)
    nodes.forEach((node) => editor.insertBefore(node, marker))
    if (topLevelParts.after) {
      editor.insertBefore(topLevelParts.after, marker)
      caretTarget = topLevelParts.after
      caretAtStart = true
    } else {
      editor.insertBefore(trailingParagraph, marker)
    }
    marker.remove()
  }

  placeCaretInBlock(caretTarget, caretAtStart)
  saveSelection()
  insertionMarkerRef.value = null
  syncEditor()
}

function placeInsertionMarker() {
  const editor = editorRef.value
  if (!editor) return

  clearInsertionMarker()
  restoreSelection()
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return

  let range = selection.getRangeAt(0)
  if (!editor.contains(range.commonAncestorContainer)) {
    range = document.createRange()
    range.selectNodeContents(editor)
    range.collapse(false)
  }

  const markerRange = range.cloneRange()
  markerRange.collapse(false)
  const marker = createInsertionMarker()
  markerRange.insertNode(marker)
  insertionMarkerRef.value = marker
}

function createInsertionMarker() {
  const marker = document.createElement('span')
  marker.dataset.editorInsertMarker = 'true'
  marker.style.display = 'none'
  return marker
}

function getInsertionMarker() {
  const marker = insertionMarkerRef.value
  if (marker && editorRef.value?.contains(marker)) {
    insertionMarkerRef.value = null
    return marker
  }
  insertionMarkerRef.value = null
  return null
}

function clearInsertionMarker() {
  const marker = insertionMarkerRef.value
  if (marker?.parentNode) {
    const parent = marker.parentNode
    marker.remove()
    parent.normalize?.()
  }
  insertionMarkerRef.value = null
}

function findEmbeddedBlock(node) {
  let current = node.parentNode
  while (current && current !== editorRef.value) {
    if (
      current.nodeType === Node.ELEMENT_NODE &&
      current.matches('figure.article-image,pre.article-code')
    ) {
      return current
    }
    current = current.parentNode
  }
  return null
}

function findEditableBlock(node) {
  let current = node.parentNode
  while (current && current !== editorRef.value) {
    if (
      current.nodeType === Node.ELEMENT_NODE &&
      current.matches('p,h2,h3,h4,blockquote,li,div')
    ) {
      return current
    }
    current = current.parentNode
  }
  return null
}

function cloneBlockAroundMarker(block, marker, side) {
  const range = document.createRange()
  range.selectNodeContents(block)
  if (side === 'before') {
    range.setEndBefore(marker)
  } else {
    range.setStartAfter(marker)
  }
  const fragment = range.cloneContents()
  if (!hasMeaningfulContent(fragment)) return null
  const clone = block.cloneNode(false)
  clone.appendChild(fragment)
  return clone
}

function insertBlocksAroundListItem(listItem, marker, nodes, trailingParagraph) {
  const list = listItem.parentNode
  const parent = list?.parentNode
  const listTag = list?.tagName?.toLowerCase()
  if (!parent || !['ul', 'ol'].includes(listTag)) return null

  const beforeItem = cloneBlockAroundMarker(listItem, marker, 'before')
  const afterItem = cloneBlockAroundMarker(listItem, marker, 'after')
  const beforeList = list.cloneNode(false)
  const afterList = list.cloneNode(false)

  while (list.firstChild && list.firstChild !== listItem) {
    beforeList.appendChild(list.firstChild)
  }
  if (beforeItem) beforeList.appendChild(beforeItem)
  if (afterItem) afterList.appendChild(afterItem)

  let current = listItem.nextSibling
  while (current) {
    const next = current.nextSibling
    afterList.appendChild(current)
    current = next
  }

  listItem.remove()
  if (hasMeaningfulContent(beforeList)) parent.insertBefore(beforeList, list)
  nodes.forEach((node) => parent.insertBefore(node, list))

  if (hasMeaningfulContent(afterList)) {
    parent.insertBefore(afterList, list)
    list.remove()
    return {
      caretTarget: afterItem || afterList.querySelector('li'),
      caretAtStart: true,
    }
  }

  parent.insertBefore(trailingParagraph, list)
  list.remove()
  return {
    caretTarget: trailingParagraph,
    caretAtStart: false,
  }
}

function createEmptyParagraph() {
  const paragraph = document.createElement('p')
  paragraph.appendChild(document.createElement('br'))
  return paragraph
}

function splitTopLevelAroundMarker(editor, marker) {
  const before = document.createElement('p')
  const after = document.createElement('p')

  let current = marker.previousSibling
  while (current && isInlineTopLevelNode(current)) {
    const previous = current.previousSibling
    before.insertBefore(current, before.firstChild)
    current = previous
  }

  current = marker.nextSibling
  while (current && isInlineTopLevelNode(current)) {
    const next = current.nextSibling
    after.appendChild(current)
    current = next
  }

  return {
    before: hasMeaningfulContent(before) ? before : null,
    after: hasMeaningfulContent(after) ? after : null,
  }
}

function isInlineTopLevelNode(node) {
  return node.nodeType === Node.TEXT_NODE || node.nodeName === 'BR' || node.nodeName === 'SPAN'
}

function placeCaretInBlock(block, atStart = false) {
  if (!block) return
  const range = document.createRange()
  range.selectNodeContents(block)
  range.collapse(atStart)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
}

function hasMeaningfulContent(node) {
  if (!node) return false
  if ((node.textContent || '').replace(/\u200B/g, '').trim()) return true
  return Array.from(node.childNodes || []).some((child) => {
    if (child.nodeType !== Node.ELEMENT_NODE) return false
    const tag = child.tagName.toLowerCase()
    return ['img', 'pre', 'figure', 'hr'].includes(tag) || hasMeaningfulContent(child)
  })
}

function sanitizeHtml(html) {
  if (!html) return ''
  const template = document.createElement('template')
  template.innerHTML = html
  const output = document.createElement('div')
  template.content.childNodes.forEach((node) => {
    output.appendChild(cleanNode(node))
  })
  return output.innerHTML
}

function cleanNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return document.createTextNode(node.textContent || '')
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return document.createTextNode('')
  }

  const tag = node.tagName.toLowerCase()
  if (node.dataset?.editorInsertMarker) {
    return document.createTextNode('')
  }
  const allowedTags = new Set([
    'a', 'b', 'blockquote', 'br', 'code', 'del', 'div', 'em', 'figcaption',
    'figure', 'h2', 'h3', 'h4', 'hr', 'i', 'img', 'li', 'mark', 'ol', 'p',
    'pre', 's', 'span', 'strike', 'strong', 'u', 'ul',
  ])

  if (!allowedTags.has(tag)) {
    const fragment = document.createDocumentFragment()
    node.childNodes.forEach((child) => fragment.appendChild(cleanNode(child)))
    return fragment
  }

  const clean = document.createElement(tag)
  copySafeAttributes(node, clean)
  node.childNodes.forEach((child) => clean.appendChild(cleanNode(child)))
  return clean
}

function copySafeAttributes(source, target) {
  const tag = target.tagName.toLowerCase()
  Array.from(source.attributes || []).forEach((attr) => {
    const name = attr.name.toLowerCase()
    const value = attr.value
    if (name.startsWith('on')) return
    if (name === 'style') {
      const style = filterStyle(value)
      if (style) target.setAttribute('style', style)
      return
    }
    if (name === 'class' && ['code', 'div', 'figure', 'p', 'pre', 'span'].includes(tag)) {
      const className = filterClassNames(value)
      if (className) target.setAttribute('class', className)
      return
    }
    if (name.startsWith('data-') && tag === 'pre') {
      target.setAttribute(name, value)
      return
    }
    if (tag === 'a' && name === 'href' && isSafeUrl(value)) {
      target.setAttribute('href', value)
      target.setAttribute('target', '_blank')
      target.setAttribute('rel', 'noopener noreferrer')
      return
    }
    if (tag === 'img' && ['src', 'alt', 'title'].includes(name)) {
      if (name === 'src' && !isSafeUrl(value)) return
      target.setAttribute(name, value)
    }
  })
}

function filterStyle(styleText) {
  const allowed = new Set(['background-color', 'color', 'font-style', 'font-weight', 'text-decoration'])
  return styleText
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((rule) => {
      const [rawProp, ...rawValue] = rule.split(':')
      const prop = rawProp?.trim().toLowerCase()
      const value = rawValue.join(':').trim()
      if (!allowed.has(prop) || /url\s*\(|expression\s*\(/i.test(value)) return ''
      return `${prop}: ${value}`
    })
    .filter(Boolean)
    .join('; ')
}

function isSafeUrl(value) {
  return /^(https?:|blob:|data:image\/|\/|\.)/i.test(value)
}

function extractPlainText(html) {
  const container = document.createElement('div')
  container.innerHTML = html
  return (container.textContent || '').trim()
}

function htmlToBlocks(html) {
  const container = document.createElement('div')
  container.innerHTML = html
  const blocks = []

  Array.from(container.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim()
      if (text) blocks.push({ id: createBlockId(), type: 'paragraph', content: text })
      return
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return
    const element = node
    const tag = element.tagName.toLowerCase()
    const text = (element.textContent || '').trim()

    if (tag === 'figure') {
      const img = element.querySelector('img')
      if (img) {
        blocks.push({
          id: createBlockId(),
          type: 'image',
          url: img.getAttribute('src') || '',
          alt: img.getAttribute('alt') || '',
          caption: element.querySelector('figcaption')?.textContent?.trim() || '',
        })
      }
      return
    }

    if (tag === 'img') {
      blocks.push({
        id: createBlockId(),
        type: 'image',
        url: element.getAttribute('src') || '',
        alt: element.getAttribute('alt') || '',
        caption: '',
      })
      return
    }

    if (tag === 'pre') {
      const code = element.querySelector('code')
      blocks.push({
        id: createBlockId(),
        type: 'code',
        language: element.dataset.language || readCodeLanguage(code) || 'plaintext',
        filename: element.dataset.filename || '',
        content: code?.textContent || element.textContent || '',
      })
      return
    }

    if (/^h[2-4]$/.test(tag)) {
      blocks.push({ id: createBlockId(), type: 'heading', level: Number(tag.slice(1)), content: text })
      return
    }

    if (tag === 'blockquote') {
      blocks.push({ id: createBlockId(), type: 'quote', content: text })
      return
    }

    if (text || element.querySelector('img,pre')) {
      blocks.push({
        id: createBlockId(),
        type: 'richText',
        content: element.outerHTML,
        text,
      })
    }
  })

  return blocks.length ? blocks : [{ id: createBlockId(), type: 'paragraph', content: '' }]
}

function filterClassNames(value) {
  const allowed = new Set(['article-code', 'article-image', 'code-caption'])
  return String(value || '')
    .split(/\s+/)
    .filter((item) => /^[\w-]+$/.test(item) && (allowed.has(item) || item.startsWith('language-')))
    .join(' ')
}

function createBlockId() {
  return `rich_${Date.now()}_${Math.random().toString(16).slice(2)}`
}
</script>

<style scoped>
.rich-blog-editor {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--app-shadow-card, 0 10px 28px rgba(15, 23, 42, 0.05));
}

.editor-toolbar {
  position: sticky;
  top: 0;
  z-index: 3;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--app-surface-muted);
  border-bottom: 1px solid var(--app-border);
}

.format-select {
  width: 120px;
}

.hidden-file {
  display: none;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
}

.emoji-btn {
  width: 26px;
  height: 26px;
  border: 1px solid var(--app-border);
  border-radius: 4px;
  background: var(--app-surface);
  cursor: pointer;
  line-height: 1;
}

.emoji-btn:hover {
  border-color: var(--blog-link);
}

.editor-content {
  min-height: 560px;
  padding: 28px clamp(18px, 4vw, 42px);
  outline: none;
  color: var(--app-text-primary);
  font-size: 16px;
  line-height: 1.85;
  background:
    linear-gradient(90deg, transparent, color-mix(in srgb, var(--blog-link) 4%, transparent), transparent),
    var(--app-surface);
}

.editor-content:empty::before {
  content: attr(data-placeholder);
  color: var(--app-text-muted);
}

.editor-content :deep(p) {
  margin: 0 0 1em;
}

.editor-content :deep(h2),
.editor-content :deep(h3),
.editor-content :deep(h4) {
  margin: 1.4em 0 0.7em;
  line-height: 1.45;
  color: var(--app-text-primary);
}

.editor-content :deep(blockquote) {
  margin: 1.2em 0;
  padding: 12px 16px;
  border-left: 4px solid var(--blog-link);
  border-radius: 0 6px 6px 0;
  background: var(--app-surface-muted);
  color: var(--app-text-secondary);
}

.editor-content :deep(figure.article-image) {
  margin: 22px 0;
  padding: 10px;
  background: var(--app-surface-muted);
  border: 1px solid var(--app-border);
  border-radius: 8px;
}

.editor-content :deep(figure.article-image img) {
  max-width: 100%;
  border-radius: 6px;
  display: block;
  margin: 0 auto;
}

.editor-content :deep(figcaption) {
  margin-top: 8px;
  color: var(--app-text-muted);
  font-size: 13px;
  text-align: center;
}

.editor-content :deep(pre.article-code) {
  position: relative;
  margin: 22px 0;
  padding: 44px 16px 16px;
  border: 1px solid #263244;
  border-radius: 8px;
  overflow: auto;
  background: #111827;
  color: #f8fafc;
  font-family: Consolas, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre;
  tab-size: 2;
}

.editor-content :deep(pre.article-code::before) {
  content: attr(data-title);
  position: absolute;
  inset: 0 0 auto;
  height: 30px;
  padding: 7px 12px;
  background: #1f2937;
  color: #cbd5e1;
  font-family: Arial, "Microsoft YaHei", sans-serif;
  font-size: 12px;
  line-height: 16px;
}

.editor-content :deep(pre.article-code code) {
  display: block;
  min-width: max-content;
}

.editor-content :deep(.code-caption) {
  margin: -12px 0 18px;
  color: var(--app-text-muted);
  font-size: 12px;
  text-align: center;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  border-top: 1px solid var(--app-border);
  color: var(--app-text-muted);
  font-size: 12px;
}

.code-form-row {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 12px;
}

@media (max-width: 720px) {
  .editor-content {
    min-height: 420px;
    padding: 18px;
  }

  .editor-footer {
    flex-direction: column;
  }

  .code-form-row {
    grid-template-columns: 1fr;
  }
}
</style>
