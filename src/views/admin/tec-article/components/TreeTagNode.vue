<template>
  <tr>
    <td>
      <div class="tag-name-cell">
        <!-- 只有一级标签才显示展开/折叠按钮 -->
        <span v-if="tag.level === 1 && tag.children && tag.children.length > 0" class="toggle-btn" @click.stop="handleToggle">
          {{ expanded ? '▼' : '▶' }}
        </span>
        <!-- 缩进 -->
        <span class="tree-indent" :style="{ width: depth * 20 + 'px' }"></span>
        <!-- 标签名称 -->
        <span class="tag-name">{{ tag.name }}</span>
      </div>
    </td>
    <td>{{ tag.level === 1 ? '一级标签' : '二级标签' }}</td>
    <td>
      <div class="tag-operation">
        <button class="edit-btn" @click.stop="handleEdit">编辑</button>
        <button class="delete-btn" @click.stop="handleDelete">删除</button>
      </div>
    </td>
  </tr>
  <!-- 递归渲染子标签 -->
  <template v-if="tag.level === 1 && tag.children && expanded">
    <TreeTagNode
      v-for="child in tag.children"
      :key="child.id"
      :tag="child"
      :depth="depth + 1"
      @toggle="handleToggle"
      @edit="handleEdit"
      @delete="handleDelete"
    />
  </template>
</template>

<script setup>
import { defineProps, computed } from 'vue';

// 定义 props
const props = defineProps({
  tag: {
    type: Object,
    required: true,
  },
  depth: {
    type: Number,
    required: true,
  },
});

// 定义 emits
const emit = defineEmits(['toggle', 'edit', 'delete']);

// 计算是否展开
const expanded = computed(() => {
  // 这里我们通过父组件传递的 expandedTagIds 来判断是否展开
  // 但在子组件中我们无法直接访问，所以通过事件通知父组件来切换状态
  // 这里的 expanded 只是用于显示展开/折叠图标
  // 实际的展开状态由父组件控制
  return props.tag.children && props.tag.children.length > 0;
});

// 处理展开/折叠
const handleToggle = () => {
  emit('toggle', props.tag.id);
};

// 处理编辑
const handleEdit = () => {
  emit('edit', props.tag);
};

// 处理删除
const handleDelete = () => {
  emit('delete', props.tag);
};
</script>

<style scoped>
.tag-name-cell {
  display: flex;
  align-items: center;
}

.toggle-btn {
  cursor: pointer;
  margin-right: 4px;
  font-size: 12px;
  color: #666;
}

.tag-name {
  flex: 1;
}

/* 其他样式继承自父组件 */
</style>