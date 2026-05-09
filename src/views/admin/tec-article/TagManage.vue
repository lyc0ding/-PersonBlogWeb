<template>
  <div class="dept-container">
    <div class="header">
      <el-button type="warning" @click="toggleExpandAll" size="small">
        {{ isExpandAll ? '全部收起' : '全部展开' }}
      </el-button>
      
      <el-button type="primary" @click="dialogVisible = true" :icon="Plus" size="small">
        新增标签
      </el-button>

      <i class="iconfont icon-zhongzhi" @click="fresh()"></i>
    </div>

    <el-table
      ref="tableRef"
      :data="tagList"
      row-key="id"
      :tree-props="{ children: 'children' }"
      style="width: 100%"
      v-loading="loading"
    >
      <el-table-column prop="name" label="标签名称" width="200">
        <template #default="scope">
          <span v-if="scope.row.level === 1" style="font-weight: bold;">
            {{ scope.row.name }}
          </span>
          <span v-else style="padding-left: 20px;">
            └─ {{ scope.row.name }}
          </span>
        </template>
      </el-table-column>

      <el-table-column :formatter="levelFormatter" label="标签级别" width="200" />
      
      <el-table-column prop="createTime" label="创建时间" width="300" />
      
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 1" type="success">正常</el-tag>
          <el-tag v-else type="danger">停用</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="300">
        <template #default="scope">
          <el-button 
            link 
            type="primary" 
            size="small"
            @click="handleSonAdd(scope.row)"
            v-if="scope.row.level === 1"
          >
            新增子标签
          </el-button>
          <el-button 
            link 
            type="primary" 
            size="small"
            @click="handleEdit(scope.row)"
          >
            编辑
          </el-button>
          <el-button 
            link 
            type="danger" 
            size="small"
            @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog 
      v-model="dialogVisible"
      width="800"
      draggable
      :close-on-click-modal="false"
      @closed="handleClosed">
      <template #header>
        新增标签
      </template>

      <template #default>
        <el-form :model="insertForm" label-width="auto" style="max-width: 600px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="标签名称">
                <el-input v-model="insertForm.name" placeholder="请输入标签名" />
              </el-form-item>
            </el-col>
            <el-col :span="3">
            </el-col>
            <el-col :span="9">
              <el-form-item label="标签级别">
                <el-select v-model="insertForm.level" placeholder="请选择标签级别" @change="changLevel">
                  <el-option
                    v-for="item in levelOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="9">
              <el-form-item label="父级标签" v-if="insertForm.level == 2">
                <el-select v-model="insertForm.parent" placeholder="请选择父级标签">
                  <el-option
                    v-for="item in tagList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="5">
            </el-col> 
            <el-col :span="9">
              <el-form-item label="状态">
                <el-select v-model="insertForm.status" placeholder="请选择标签状态">
                  <el-option
                    v-for="item in statusOption"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </template>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false,handleClosed">取消</el-button>
          <el-button type="primary" @click="submit">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { tagListService , tagAddService} from '@/api/admin/tag'

const dialogVisible = ref(false)

// 部门数据
const tagList = ref([])
const loading = ref(false)
const isExpandAll = ref(false)
const tableRef = ref() // 添加表格引用

const getInitialForm = () =>({
  name: '',
  level: null,
  parent: 0,
  status:1
})

const levelFormatter = (row) => {
  const level = row.level
  if (level == 1) {
    return '一级标签'
  } else {
    return '二级标签'
  }
}

const insertForm = ref(getInitialForm())

const levelOptions = [
  {
    value: 1,
    label: '一级',
  },
  {
    value: 2,
    label: '二级',
  }
]

const statusOption = [
  {
    value: 1,
    label: '正常',
  },
  {
    value: 0,
    label: '待启用',
  }
]

// 切换全部展开/收起
const toggleExpandAll = () => {
  if (!tableRef.value) return
  
  // 使用表格实例的方法控制展开/收起
  if (isExpandAll.value) {
    // 收起所有行
    tagList.value.forEach(row => {
      tableRef.value.toggleRowExpansion(row, false)
    })
  } else {
    // 展开所有行
    tagList.value.forEach(row => {
      tableRef.value.toggleRowExpansion(row, true)
    })
  }
  
  isExpandAll.value = !isExpandAll.value
}

// 标签列表
const getTagList = () => {
  tagListService().then(res => {
    if (res.success) {
      tagList.value = res.data
    }
  })
}

// 新增标签
const handleSonAdd = (row) => {
  insertForm.value.parent = row.id
  insertForm.value.level = 2
  insertForm.value.status = 1
  dialogVisible.value = true
}

// 编辑部门
const handleEdit = (row) => {
  ElMessage.info(`编辑部门: ${row.name}`)
  // 这里可以打开编辑对话框
  console.log('编辑部门:', row)
}

// 删除部门
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除部门"${row.name}"吗？此操作不可恢复。`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    // 模拟删除操作
    if (row.level === 1 && row.children && row.children.length > 0) {
      ElMessage.warning('该部门下存在子部门，无法删除')
      return
    }
    
    ElMessage.success('删除成功')
    // 实际项目中这里应该调用API删除
    console.log('删除部门:', row.id)
    
  } catch (error) {
    // 用户取消删除
    console.log('取消删除')
  }
}

const submit = () => {
  const data = insertForm.value
  tagAddService(data)
  handleClosed()
  dialogVisible.value = false
}

// 清空弹窗数据
const handleClosed = () => {
  Object.assign(insertForm.value, getInitialForm())
}

const fresh = () => {
  getTagList()
  ElMessage.success('刷新成功')
}

// 组件挂载时加载数据
onMounted(() => {
  getTagList()
  console.log("tagList数据："+JSON.stringify(tagList.value))
})

</script>

<style scoped>
.dept-container {
  padding: 20px;
  background: var(--app-surface);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 var(--app-shadow-soft);
  color: var(--app-text-primary);
}

.header {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;

  .iconfont{
    margin-left: 20px;
  }
}

:deep(.el-table .el-table__row) {
  cursor: pointer;
}

:deep(.el-table .el-table__row--level-1) {
  background-color: var(--app-bg-secondary);
}

:deep(.el-table .el-table__row--level-2) {
  background-color: var(--app-surface);
}
</style>