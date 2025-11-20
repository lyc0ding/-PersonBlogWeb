<template>
  <div class="tag-manager">
    <!-- 顶部操作栏 -->
    <div class="toolbar">
      <div class="actions">
        <button class="btn btn-primary" @click="showAddModal">
          <i class="fas fa-plus"></i> 添加标签
        </button>
        <button class="btn btn-outline" @click="toggleExpandAll">
          <i class="fas" :class="isExpandAll ? 'fa-compress' : 'fa-expand'"></i> 
          {{ isExpandAll ? '收起全部' : '展开全部' }}
        </button>
      </div>
    </div>

    <!-- 标签表格 -->
    <div class="card">
      <div class="card-header">
        <h2><i class="fas fa-list"></i> 标签列表</h2>
      </div>
      <div class="card-body">
        <table>
          <thead>
            <tr>
              <th>标签名称</th>
              <th>标签级别</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="tag in tags" :key="tag.id">
              <tr class="tag-row level-1" @click="toggleExpand(tag.id)">
                <td>
                  <i class="fas fa-folder tag-icon"></i>
                  {{ tag.name }}
                  <i class="fas expand-icon" :class="expandedTags.includes(tag.id) ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
                </td>
                <td>一级标签</td>
                <td>{{ tag.createTime }}</td>
                <td class="actions">
                  <button class="btn btn-outline" @click.stop="editTag(tag)">
                    <i class="fas fa-edit"></i> 编辑
                  </button>
                  <button class="btn btn-danger" @click.stop="deleteTag(tag.id)">
                    <i class="fas fa-trash"></i> 删除
                  </button>
                </td>
              </tr>
              <template v-if="expandedTags.includes(tag.id)">
                <tr v-for="child in tag.children" :key="child.id" class="tag-row level-2">
                  <td>
                    <i class="fas fa-tag tag-icon"></i>
                    {{ child.name }}
                  </td>
                  <td>二级标签</td>
                  <td>{{ child.createTime }}</td>
                  <td class="actions">
                    <button class="btn btn-outline" @click="editTag(child)">
                      <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="btn btn-danger" @click="deleteTag(child.id)">
                      <i class="fas fa-trash"></i> 删除
                    </button>
                  </td>
                </tr>
                <tr v-if="tag.children.length === 0" class="level-2">
                  <td colspan="4" class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>该标签下暂无二级标签</p>
                  </td>
                </tr>
              </template>
            </template>
            <tr v-if="tags.length === 0">
              <td colspan="4" class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>暂无标签数据</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 添加/编辑标签模态框 -->
    <div class="modal" v-if="showModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingTag ? '编辑标签' : '添加标签' }}</h3>
          <button class="btn btn-outline" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="tagName">标签名称</label>
            <input type="text" id="tagName" v-model="tagForm.name" placeholder="请输入标签名称">
          </div>
          <div class="form-group">
            <label for="tagLevel">标签级别</label>
            <select id="tagLevel" v-model="tagForm.level">
              <option value="1">一级标签</option>
              <option value="2">二级标签</option>
            </select>
          </div>
          <div class="form-group" v-if="tagForm.level === '2'">
            <label for="parentTag">所属一级标签</label>
            <select id="parentTag" v-model="tagForm.parentId">
              <option v-for="tag in tags" :key="tag.id" :value="tag.id">{{ tag.name }}</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="saveTag">
            {{ editingTag ? '更新' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

// 响应式数据
const isExpandAll = ref(true)
const tags = ref([
  {
    id: 1,
    name: '技术标签',
    level: 1,
    createTime: '2023-01-15',
    children: [
      { id: 11, name: '前端开发', level: 2, parentId: 1, createTime: '2023-01-20' },
      { id: 12, name: '后端开发', level: 2, parentId: 1, createTime: '2023-01-22' },
      { id: 13, name: '数据库', level: 2, parentId: 1, createTime: '2023-01-25' }
    ]
  },
  {
    id: 2,
    name: '产品标签',
    level: 1,
    createTime: '2023-02-10',
    children: [
      { id: 21, name: 'UI设计', level: 2, parentId: 2, createTime: '2023-02-15' },
      { id: 22, name: '用户体验', level: 2, parentId: 2, createTime: '2023-02-18' }
    ]
  },
  {
    id: 3,
    name: '运营标签',
    level: 1,
    createTime: '2023-03-05',
    children: []
  }
])

// 展开的标签ID列表
const expandedTags = ref([1, 2])

// 模态框状态
const showModal = ref(false)
const editingTag = ref(null)

// 标签表单
const tagForm = reactive({
  name: '',
  level: '1',
  parentId: null
})

// 方法 - 切换标签展开状态
const toggleExpand = (tagId) => {
  const index = expandedTags.value.indexOf(tagId)
  if (index > -1) {
    expandedTags.value.splice(index, 1)
  } else {
    expandedTags.value.push(tagId)
  }
}

// 方法 - 切换全部展开/收起
const toggleExpandAll = () => {
  isExpandAll.value = !isExpandAll.value
  if (isExpandAll.value) {
    // 展开所有一级标签
    expandedTags.value = tags.value.map(tag => tag.id)
  } else {
    // 收起所有标签
    expandedTags.value = []
  }
}

// 方法 - 显示添加标签模态框
const showAddModal = () => {
  editingTag.value = null
  resetForm()
  showModal.value = true
}

// 方法 - 编辑标签
const editTag = (tag) => {
  editingTag.value = tag
  tagForm.name = tag.name
  tagForm.level = tag.level.toString()
  tagForm.parentId = tag.parentId || null
  showModal.value = true
}

// 方法 - 删除标签
const deleteTag = (tagId) => {
  if (confirm('确定要删除这个标签吗？')) {
    // 查找并删除标签
    for (let i = 0; i < tags.value.length; i++) {
      const tag = tags.value[i]
      // 如果是删除一级标签
      if (tag.id === tagId) {
        tags.value.splice(i, 1)
        // 从展开列表中移除
        const expandedIndex = expandedTags.value.indexOf(tagId)
        if (expandedIndex > -1) {
          expandedTags.value.splice(expandedIndex, 1)
        }
        return
      }
      
      // 如果是删除二级标签
      const childIndex = tag.children.findIndex(child => child.id === tagId)
      if (childIndex > -1) {
        tag.children.splice(childIndex, 1)
        return
      }
    }
  }
}

// 方法 - 保存标签
const saveTag = () => {
  if (!tagForm.name.trim()) {
    alert('请输入标签名称')
    return
  }
  
  if (tagForm.level === '2' && !tagForm.parentId) {
    alert('请选择所属一级标签')
    return
  }
  
  if (editingTag.value) {
    // 更新标签
    editingTag.value.name = tagForm.name
    if (tagForm.level === '1') {
      editingTag.value.level = 1
      delete editingTag.value.parentId
    } else {
      editingTag.value.level = 2
      editingTag.value.parentId = tagForm.parentId
    }
  } else {
    // 添加新标签
    const newId = Date.now()
    if (tagForm.level === '1') {
      tags.value.push({
        id: newId,
        name: tagForm.name,
        level: 1,
        createTime: new Date().toISOString().split('T')[0],
        children: []
      })
    } else {
      // 添加到对应的一级标签下
      const parentTag = tags.value.find(tag => tag.id === tagForm.parentId)
      if (parentTag) {
        parentTag.children.push({
          id: newId,
          name: tagForm.name,
          level: 2,
          parentId: tagForm.parentId,
          createTime: new Date().toISOString().split('T')[0]
        })
        
        // 确保父标签是展开状态
        if (!expandedTags.value.includes(tagForm.parentId)) {
          expandedTags.value.push(tagForm.parentId)
        }
      }
    }
  }
  
  closeModal()
}

// 方法 - 关闭模态框
const closeModal = () => {
  showModal.value = false
  resetForm()
}

// 方法 - 重置表单
const resetForm = () => {
  tagForm.name = ''
  tagForm.level = '1'
  tagForm.parentId = null
}

// 初始化
onMounted(() => {
  // 可以在这里添加从API加载数据的逻辑
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.tag-manager {
  background-color: #f5f7fa;
  color: #333;
  line-height: 1.6;
  min-height: 100vh;
  padding: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e1e5eb;
}

.toolbar h1 {
  color: #2c3e50;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 10px;
}

.card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 20px;
}

.card-header {
  padding: 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e1e5eb;
}

.card-body {
  padding: 0;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #e1e5eb;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

tr:hover {
  background-color: #f8f9fa;
}

.tag-row {
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-row:hover {
  background-color: #f0f2f5;
}

.tag-row.level-1 {
  background-color: #f8f9fa;
  font-weight: 600;
}

.tag-row.level-2 {
  background-color: white;
}

.tag-row.level-2 td:first-child {
  padding-left: 40px;
}

.tag-icon {
  margin-right: 10px;
  color: #6c757d;
}

.expand-icon {
  margin-left: 10px;
  color: #6c757d;
  font-size: 0.9em;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background-color: #c0392b;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid #dee2e6;
  color: #6c757d;
}

.btn-outline:hover {
  background-color: #f8f9fa;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 10px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e1e5eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

input, select {
  width: 100%;
  padding: 10px;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  font-size: 16px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e1e5eb;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 15px;
  color: #dee2e6;
}
</style>