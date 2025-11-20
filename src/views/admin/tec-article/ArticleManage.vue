<template>
  <div>
    <el-table :data="tableData" border stripe hover style="width: 100%">
      <!-- 选择列 -->
      <el-table-column type="selection" width="55" />
      
      <!-- 其他列保持不变 -->
      <el-table-column label="标题" prop="title" />
      <el-table-column label="摘要" prop="abstract" />
      <el-table-column label="封面">
        <template #default="scope">
          <!-- 封面为空时显示默认文本 -->
          <span>{{ scope.row.coverPage || '无封面' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="作者" prop="author" />
      <el-table-column label="标签" prop="tag" />
      
      <!-- 状态列：将数字转为中文显示 -->
      <el-table-column label="状态" width="150">
        <template #default="scope">
          <span :class="scope.row.status === 1 ? 'text-success' : 'text-danger'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </span>
        </template>
      </el-table-column>
      
      <el-table-column label="修改时间" prop="createTime" />
      
      <!-- 操作列：核心实现 -->
      <el-table-column label="操作" align="center" width="220">
        <template #default="scope">
          <!-- 禁用/启用按钮：根据状态切换文本和样式 -->
          <el-button
            type="text"
            :class="scope.row.status === 1 ? 'text-danger' : 'text-success'"
            size="small"
            @click="handleDisable(scope.row)"
          >
            {{ scope.row.status === 1 ? '禁用' : '启用' }}
          </el-button>
          
          <!-- 删除按钮 -->
          <el-button
            type="text"
            text-color="#c80000"
            size="small"
            @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
          
          <!-- 下拉框：修改密码/修改信息 -->
          <el-dropdown size="small" @command="handleDropdownCommand(scope.row, $event)">
            
            <el-button
              type="text"
              text-color="#ff4d4f"
              size="small"
            >
              更多操作
              <el-icon><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="modifyPwd">修改密码</el-dropdown-item>
                <el-dropdown-item command="modifyInfo">修改信息</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'

// 表格数据
const tableData = ref([])

// 模拟数据加载
onMounted(() => {
  for (let i = 0; i < 20; i++) {
    tableData.value.push({
      id: i + 1, // 增加唯一ID，用于后续操作
      title: 'Linux使用技巧',
      abstract: 'Linux是一个操作系统……',
      coverPage: '',
      author: 'Tom',
      tag: '技术分析',
      status: 1, // 1-启用，0-禁用
      createTime: '2025-10-25',
    })
  }
})

/**
 * 处理禁用/启用操作
 * @param {Object} row - 当前行数据
 */
const handleDisable = (row) => {
  const newStatus = row.status === 1 ? 0 : 1
  const tip = newStatus === 1 ? '启用' : '禁用'
  
  ElMessageBox.confirm(
    `确定要${tip}该数据吗？`,
    '操作确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟接口请求：修改状态
    row.status = newStatus
    ElMessage.success(`${tip}成功！`)
  }).catch(() => {
    ElMessage.info(`已取消${tip}`)
  })
}

/**
 * 处理删除操作
 * @param {Object} row - 当前行数据
 */
const handleDelete = (row) => {
  ElMessageBox.confirm(
    '此操作将永久删除该数据，是否继续？',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }
  ).then(() => {
    // 模拟接口请求：删除数据（从数组中移除）
    tableData.value = tableData.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功！')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

/**
 * 处理下拉框命令
 * @param {Object} row - 当前行数据
 * @param {string} command - 下拉菜单项的command值（modifyPwd/modifyInfo）
 */
const handleDropdownCommand = (row, command) => {
  switch (command) {
    case 'modifyPwd':
      ElMessage(`触发修改密码操作，目标用户：${row.author}（ID：${row.id}）`)
      // 此处可跳转路由或打开弹窗：例如 router.push(`/modify-pwd/${row.id}`)
      break
    case 'modifyInfo':
      ElMessage(`触发修改信息操作，目标用户：${row.author}（ID：${row.id}）`)
      // 此处可打开修改信息弹窗：例如 openModifyInfoDialog(row)
      break
  }
}
</script>

<style scoped>
</style>