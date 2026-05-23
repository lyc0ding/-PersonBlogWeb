<template>
  <div class="tag-manage">
    <div class="toolbar">
      <el-button type="primary" @click="dialogVisible = true">
        <el-icon><Plus /></el-icon>
        新增标签
      </el-button>
      <el-button @click="loadTags">刷新</el-button>
    </div>

    <el-table v-loading="loading" :data="tagList" row-key="id" border :tree-props="{ children: 'children' }">
      <el-table-column prop="name" label="标签名称" min-width="220" />
      <el-table-column label="级别" width="120">
        <template #default="{ row }">
          {{ row.level === 2 ? '二级标签' : '一级标签' }}
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" min-width="180" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 0 ? 'info' : 'success'">
            {{ row.status === 0 ? '停用' : '正常' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" title="新增标签" width="520px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="标签名称">
          <el-input v-model="form.name" placeholder="请输入标签名称" />
        </el-form-item>
        <el-form-item label="标签级别">
          <el-select v-model="form.level" placeholder="请选择">
            <el-option label="一级标签" :value="1" />
            <el-option label="二级标签" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.level === 2" label="父级标签">
          <el-select v-model="form.parent" placeholder="请选择父级标签">
            <el-option v-for="tag in parentTags" :key="tag.id" :label="tag.name" :value="tag.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { tagAddService, tagListService } from '@/api/admin/tag'

const loading = ref(false)
const dialogVisible = ref(false)
const tagList = ref([])

const form = reactive({
  name: '',
  level: 1,
  parent: 0,
  status: 1,
})

const parentTags = computed(() => tagList.value.filter((item) => item.level !== 2))

function resetForm() {
  form.name = ''
  form.level = 1
  form.parent = 0
  form.status = 1
}

async function loadTags() {
  loading.value = true
  try {
    const res = await tagListService()
    tagList.value = res?.data ?? res ?? []
  } catch {
    tagList.value = [
      { id: 1, name: 'Java', level: 1, status: 1, createTime: '2026-05-17 12:00:00' },
      { id: 2, name: 'Spring Boot', level: 2, parent: 1, status: 1, createTime: '2026-05-17 12:00:00' },
      { id: 3, name: '生活记录', level: 1, status: 1, createTime: '2026-05-17 12:00:00' },
    ]
  } finally {
    loading.value = false
  }
}

async function submit() {
  if (!form.name.trim()) {
    ElMessage.warning('请填写标签名称')
    return
  }
  try {
    await tagAddService({ ...form, parent: form.level === 1 ? 0 : form.parent })
    ElMessage.success('标签已保存')
    dialogVisible.value = false
    resetForm()
    loadTags()
  } catch {
    const id = Date.now()
    tagList.value.push({ id, ...form, createTime: new Date().toLocaleString('zh-CN', { hour12: false }) })
    ElMessage.warning('后端未就绪，已添加到本地演示列表')
    dialogVisible.value = false
    resetForm()
  }
}

onMounted(loadTags)
</script>

<style scoped>
.tag-manage {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 8px;
}

.toolbar {
  display: flex;
  gap: 10px;
}
</style>
