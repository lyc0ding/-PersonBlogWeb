<template>
  <div v-loading="loading" class="about-manage">
    <header class="page-head">
      <div>
        <h2>关于页面</h2>
        <p>维护前台 About 独立页内容、联系方式、技能标签与经历节点。</p>
      </div>
      <div class="head-actions">
        <el-button @click="loadAbout">刷新</el-button>
        <el-button type="primary" :loading="saving" @click="saveAbout">
          <el-icon><Check /></el-icon>
          保存
        </el-button>
      </div>
    </header>

    <div class="editor-grid">
      <section class="form-panel">
        <el-form :model="form" label-position="top">
          <div class="field-grid">
            <el-form-item label="页面标题" required>
              <el-input v-model="form.title" maxlength="120" show-word-limit placeholder="关于 Lycoding" />
            </el-form-item>
            <el-form-item label="副标题">
              <el-input v-model="form.subtitle" maxlength="255" show-word-limit placeholder="一句话说明这个博客" />
            </el-form-item>
            <el-form-item label="站长名称">
              <el-input v-model="form.ownerName" maxlength="80" placeholder="Lycoding" />
            </el-form-item>
            <el-form-item label="身份 / 职业">
              <el-input v-model="form.roleTitle" maxlength="120" placeholder="后端开发者 / 博客作者" />
            </el-form-item>
            <el-form-item label="所在地">
              <el-input v-model="form.location" maxlength="120" placeholder="中国" />
            </el-form-item>
            <el-form-item label="联系邮箱">
              <el-input v-model="form.email" maxlength="128" placeholder="admin@example.com" />
            </el-form-item>
          </div>

          <el-form-item label="个人简介">
            <el-input
              v-model="form.intro"
              type="textarea"
              :rows="4"
              maxlength="800"
              show-word-limit
              placeholder="用一小段话介绍你和这个博客"
            />
          </el-form-item>

          <div class="media-grid">
            <el-form-item label="头像">
              <ImageUploader v-model="form.avatarUrl" biz-type="avatar" :max-size-m-b="5" hint="建议 1:1 头像" />
            </el-form-item>
            <el-form-item label="封面">
              <ImageUploader v-model="form.coverUrl" biz-type="photo" :max-size-m-b="8" hint="建议横向生活照或工作台照片" />
            </el-form-item>
          </div>

          <el-form-item label="技能标签">
            <div class="tag-editor">
              <el-tag
                v-for="(skill, index) in form.skills"
                :key="`${skill}_${index}`"
                closable
                @close="removeSkill(index)"
              >
                {{ skill }}
              </el-tag>
              <el-input
                v-model="skillDraft"
                class="inline-input"
                size="small"
                maxlength="24"
                placeholder="添加标签"
                @keyup.enter="addSkill"
              />
              <el-button size="small" @click="addSkill">
                <el-icon><Plus /></el-icon>
                添加
              </el-button>
            </div>
          </el-form-item>

          <el-form-item label="联系链接">
            <div class="list-editor">
              <div v-for="(link, index) in form.links" :key="`link_${index}`" class="list-row">
                <el-input v-model="link.label" placeholder="名称，如 GitHub" />
                <el-input v-model="link.url" placeholder="链接，如 https://github.com/" />
                <el-button circle type="danger" @click="removeLink(index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <el-button @click="addLink">
                <el-icon><Plus /></el-icon>
                新增链接
              </el-button>
            </div>
          </el-form-item>

          <el-form-item label="经历节点">
            <div class="list-editor">
              <div v-for="(item, index) in form.experiences" :key="`exp_${index}`" class="experience-row">
                <el-input v-model="item.year" placeholder="时间，如 2026" />
                <el-input v-model="item.title" placeholder="标题" />
                <el-input v-model="item.description" type="textarea" :rows="2" placeholder="简短说明" />
                <el-button circle type="danger" @click="removeExperience(index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <el-button @click="addExperience">
                <el-icon><Plus /></el-icon>
                新增经历
              </el-button>
            </div>
          </el-form-item>

          <el-form-item label="正文内容">
            <RichBlogEditor
              v-model="form.contentHtml"
              placeholder="继续补充你的经历、博客理念、联系说明或常见问题。"
              @text-change="form.contentText = $event"
            />
          </el-form-item>

          <el-form-item label="展示状态">
            <el-radio-group v-model="form.status">
              <el-radio :value="1">展示</el-radio>
              <el-radio :value="0">隐藏</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </section>

      <aside class="preview-panel">
        <p class="preview-label">前台预览</p>
        <div class="about-preview">
          <img v-if="form.coverUrl" :src="form.coverUrl" alt="" class="preview-cover">
          <div class="preview-profile">
            <img v-if="form.avatarUrl" :src="form.avatarUrl" alt="" class="preview-avatar">
            <div>
              <h3>{{ form.ownerName || form.title || '关于我' }}</h3>
              <p>{{ form.roleTitle || form.subtitle || '博客作者' }}</p>
            </div>
          </div>
          <p class="preview-intro">{{ form.intro || '在这里展示你的个人介绍。' }}</p>
          <div v-if="form.skills.length" class="preview-tags">
            <span v-for="skill in form.skills" :key="skill">{{ skill }}</span>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, Delete, Plus } from '@element-plus/icons-vue'
import ImageUploader from '@/components/image/ImageUploader.vue'
import RichBlogEditor from '@/views/admin/articles/components/RichBlogEditor.vue'
import { aboutDetailService, aboutSaveService } from '@/api/admin/system'

const loading = ref(false)
const saving = ref(false)
const skillDraft = ref('')

const form = reactive({
  id: null,
  title: '关于',
  subtitle: '',
  ownerName: '',
  roleTitle: '',
  location: '',
  email: '',
  avatarUrl: '',
  coverUrl: '',
  intro: '',
  contentHtml: '',
  contentText: '',
  skills: [],
  links: [],
  experiences: [],
  status: 1,
})

function applyAbout(data = {}) {
  form.id = data.id ?? null
  form.title = data.title || '关于'
  form.subtitle = data.subtitle || ''
  form.ownerName = data.ownerName || ''
  form.roleTitle = data.roleTitle || ''
  form.location = data.location || ''
  form.email = data.email || ''
  form.avatarUrl = data.avatarUrl || ''
  form.coverUrl = data.coverUrl || ''
  form.intro = data.intro || ''
  form.contentHtml = data.contentHtml || ''
  form.contentText = data.contentText || ''
  form.skills = normalizeSkills(data.skills)
  form.links = normalizeLinks(data.links)
  form.experiences = normalizeExperiences(data.experiences)
  form.status = data.status === 0 ? 0 : 1
}

function normalizeSkills(value) {
  return Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : []
}

function normalizeLinks(value) {
  return Array.isArray(value)
    ? value.map((item) => ({
      label: item?.label || '',
      url: item?.url || '',
    }))
    : []
}

function normalizeExperiences(value) {
  return Array.isArray(value)
    ? value.map((item) => ({
      year: item?.year || '',
      title: item?.title || '',
      description: item?.description || '',
    }))
    : []
}

async function loadAbout() {
  loading.value = true
  try {
    const res = await aboutDetailService()
    applyAbout(res?.data ?? res ?? {})
  } catch (err) {
    ElMessage.error(err?.message || '关于页面加载失败')
  } finally {
    loading.value = false
  }
}

function addSkill() {
  const value = skillDraft.value.trim()
  if (!value) return
  if (!form.skills.includes(value)) {
    form.skills.push(value)
  }
  skillDraft.value = ''
}

function removeSkill(index) {
  form.skills.splice(index, 1)
}

function addLink() {
  form.links.push({ label: '', url: '' })
}

function removeLink(index) {
  form.links.splice(index, 1)
}

function addExperience() {
  form.experiences.push({ year: '', title: '', description: '' })
}

function removeExperience(index) {
  form.experiences.splice(index, 1)
}

function cleanList(list, keys) {
  return list
    .map((item) => keys.reduce((acc, key) => {
      acc[key] = String(item[key] || '').trim()
      return acc
    }, {}))
    .filter((item) => keys.some((key) => item[key]))
}

async function saveAbout() {
  if (!form.title.trim()) {
    ElMessage.warning('请填写页面标题')
    return
  }

  saving.value = true
  try {
    const payload = {
      ...form,
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      ownerName: form.ownerName.trim(),
      roleTitle: form.roleTitle.trim(),
      location: form.location.trim(),
      email: form.email.trim(),
      intro: form.intro.trim(),
      skills: normalizeSkills(form.skills),
      links: cleanList(form.links, ['label', 'url']),
      experiences: cleanList(form.experiences, ['year', 'title', 'description']),
    }
    const res = await aboutSaveService(payload)
    applyAbout(res?.data ?? res ?? {})
    ElMessage.success('关于页面已保存')
  } catch (err) {
    ElMessage.error(err?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(loadAbout)
</script>

<style scoped>
.about-manage {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 8px;
}

.page-head h2,
.page-head p {
  margin: 0;
}

.page-head p {
  margin-top: 4px;
  color: var(--app-text-muted);
}

.head-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.editor-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 16px;
  align-items: start;
}

.form-panel,
.preview-panel {
  padding: 16px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 8px;
}

.field-grid,
.media-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}

.tag-editor,
.list-editor {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.inline-input {
  width: 140px;
}

.list-row,
.experience-row {
  width: 100%;
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr) 32px;
  gap: 10px;
  align-items: center;
}

.experience-row {
  grid-template-columns: 120px 180px minmax(0, 1fr) 32px;
}

.preview-panel {
  position: sticky;
  top: 16px;
}

.preview-label {
  margin: 0 0 12px;
  color: var(--app-text-muted);
  font-size: 13px;
}

.about-preview {
  overflow: hidden;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: var(--app-surface-muted);
}

.preview-cover {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: block;
  object-fit: cover;
}

.preview-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 16px 8px;
}

.preview-avatar {
  width: 56px;
  height: 56px;
  flex: 0 0 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--app-surface);
}

.preview-profile h3 {
  margin: 0 0 4px;
  font-size: 18px;
  color: var(--app-text-primary);
}

.preview-profile p,
.preview-intro {
  margin: 0;
  color: var(--app-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.preview-intro {
  padding: 0 16px 12px;
}

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 16px 16px;
}

.preview-tags span {
  padding: 4px 8px;
  border: 1px solid var(--app-border);
  border-radius: 999px;
  background: var(--app-surface);
  color: var(--app-text-secondary);
  font-size: 12px;
}

@media (max-width: 1100px) {
  .editor-grid {
    grid-template-columns: 1fr;
  }

  .preview-panel {
    position: static;
  }
}

@media (max-width: 760px) {
  .page-head,
  .head-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .field-grid,
  .media-grid,
  .list-row,
  .experience-row {
    grid-template-columns: 1fr;
  }
}
</style>
