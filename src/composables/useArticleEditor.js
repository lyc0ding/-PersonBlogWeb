import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import {
  createEmptyArticle,
  ARTICLE_STATUS,
} from '@/constants/article'
import {
  articleDetailService,
  articleCreateService,
  articleUpdateService,
  articleSaveDraftService,
  articlePublishService,
  buildArticlePayload,
  normalizeArticleDetail,
} from '@/api/admin/article'

const DRAFT_KEY_PREFIX = 'personblog_article_draft_'

export function useArticleEditor(getArticleId, options = {}) {
  const resolveId = () => (typeof getArticleId === 'function' ? getArticleId() : getArticleId)
  const { onSaved } = options

  const loading = ref(false)
  const saving = ref(false)
  const form = ref(createEmptyArticle())
  const lastSavedAt = ref(null)
  const isEditMode = computed(() => Boolean(form.value.id ?? resolveId()))

  const draftStorageKey = computed(() => {
    const id = form.value.id ?? resolveId() ?? 'new'
    return `${DRAFT_KEY_PREFIX}${id}`
  })

  const wordCount = computed(() => {
    return form.value.contentBlocks.reduce((sum, block) => {
      if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'quote') {
        return sum + (block.content?.length ?? 0)
      }
      if (block.type === 'code') {
        return sum + (block.content?.length ?? 0)
      }
      return sum
    }, 0)
  })

  async function loadArticle(id) {
    if (!id) {
      restoreLocalDraft()
      return
    }
    loading.value = true
    try {
      const res = await articleDetailService(id)
      form.value = normalizeArticleDetail(res)
      restoreLocalDraft()
    } catch (err) {
      console.warn('[article] 加载失败，尝试本地草稿', err)
      restoreLocalDraft()
      if (!form.value.title) {
        ElMessage.warning('无法连接后端，已尝试加载本地草稿')
      }
    } finally {
      loading.value = false
    }
  }

  function restoreLocalDraft() {
    try {
      const raw = localStorage.getItem(draftStorageKey.value)
      if (!raw) return
      const draft = JSON.parse(raw)
      if (draft?.form) {
        form.value = { ...form.value, ...draft.form }
        lastSavedAt.value = draft.savedAt ?? null
      }
    } catch {
      /* ignore */
    }
  }

  function persistLocalDraft() {
    try {
      const payload = {
        form: form.value,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(draftStorageKey.value, JSON.stringify(payload))
      lastSavedAt.value = payload.savedAt
    } catch {
      /* ignore */
    }
  }

  function clearLocalDraft() {
    localStorage.removeItem(draftStorageKey.value)
  }

  let autoSaveTimer = null
  function startAutoSave(intervalMs = 30000) {
    stopAutoSave()
    autoSaveTimer = window.setInterval(() => {
      if (form.value.title || hasBlockContent()) {
        persistLocalDraft()
      }
    }, intervalMs)
  }

  function stopAutoSave() {
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer)
      autoSaveTimer = null
    }
  }

  function hasBlockContent() {
    return form.value.contentBlocks.some((b) => {
      if (b.type === 'image') return Boolean(b.url)
      return Boolean(b.content?.trim?.())
    })
  }

  function validate(publish = false) {
    if (!form.value.title?.trim()) {
      ElMessage.warning('请填写文章标题')
      return false
    }
    if (publish && !hasBlockContent()) {
      ElMessage.warning('正文不能为空')
      return false
    }
    return true
  }

  async function saveDraft() {
    if (!validate(false)) return false
    saving.value = true
    form.value.status = ARTICLE_STATUS.DRAFT
    const payload = buildArticlePayload(form.value)

    try {
      let res
      if (form.value.id) {
        res = await articleUpdateService(form.value.id, payload)
      } else {
        res = await articleSaveDraftService(payload)
      }
      const id = res?.data?.id ?? res?.id ?? form.value.id
      if (id) form.value.id = id
      persistLocalDraft()
      ElMessage.success('草稿已保存')
      onSaved?.(form.value)
      return true
    } catch (err) {
      console.warn('[article] 草稿保存到后端失败，已写入本地', err)
      persistLocalDraft()
      ElMessage.success('后端未就绪，草稿已保存到浏览器本地')
      return true
    } finally {
      saving.value = false
    }
  }

  async function publish() {
    if (!validate(true)) return false
    saving.value = true
    form.value.status = ARTICLE_STATUS.PUBLISHED
    const payload = buildArticlePayload(form.value)

    try {
      let id = form.value.id
      if (id) {
        await articleUpdateService(id, payload)
        await articlePublishService(id, payload)
      } else {
        const res = await articleCreateService({ ...payload, status: ARTICLE_STATUS.PUBLISHED })
        id = res?.data?.id ?? res?.id
        if (id) form.value.id = id
      }
      clearLocalDraft()
      ElMessage.success('文章发布成功')
      onSaved?.(form.value)
      return true
    } catch (err) {
      console.warn('[article] 发布失败', err)
      persistLocalDraft()
      ElMessage.error('发布失败，内容已保存到本地草稿，请检查后端接口')
      return false
    } finally {
      saving.value = false
    }
  }

  watch(
    form,
    () => {
      persistLocalDraft()
    },
    { deep: true }
  )

  onMounted(() => {
    loadArticle(resolveId())
    startAutoSave()
  })

  onBeforeUnmount(() => {
    stopAutoSave()
  })

  return {
    loading,
    saving,
    form,
    lastSavedAt,
    isEditMode,
    wordCount,
    loadArticle,
    saveDraft,
    publish,
    persistLocalDraft,
    clearLocalDraft,
  }
}
