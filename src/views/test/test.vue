<template>
  <div class="editor-container" style="display: flex;flex-direction: row;">
    <div class="article-editor">
      <div class="editor-header">
        <input 
          v-model="title" 
          type="text" 
          placeholder="请输入文章标题" 
          class="title-input"
        >
        <button @click="addTextBlock" class="btn">添加文本段落</button>
        <button @click="addImageBlock" class="btn">添加图片段落</button>
        <button @click="publishArticle" class="btn primary">发布文章</button>
      </div>

      <div class="content-blocks">
        <div 
          v-for="(block, index) in contentBlocks" 
          :key="index" 
          class="content-block"
        >
          <!-- 文本段落 -->
          <div v-if="block.type === 'text'" class="text-block">
            <textarea 
              v-model="block.content" 
              placeholder="请输入文本内容"
              class="text-area"
            ></textarea>
            <button @click="removeBlock(index)" class="remove-btn">删除</button>
          </div>

          <!-- 图片段落 -->
          <div v-else-if="block.type === 'image'" class="image-block">
            <div v-if="!block.content" class="image-upload">
              <input 
                type="file" 
                @change="handleImageUpload($event, index)"
                accept="image/*"
                class="file-input"
              >
              <span>点击上传图片</span>
            </div>
            <div v-else class="image-preview">
              <img :src="block.content" alt="预览">
              <button @click="removeBlock(index)" class="remove-btn">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="article-editor">
      
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// import { articleApi } from '@/api/article'

const title = ref('')
const contentBlocks = ref([])

// 添加文本段落
const addTextBlock = () => {
  contentBlocks.value.push({
    type: 'text',
    content: ''
  })
}

// 添加图片段落
const addImageBlock = () => {
  contentBlocks.value.push({
    type: 'image',
    content: ''
  })
}

// 处理图片上传
const handleImageUpload = (event, index) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      contentBlocks.value[index].content = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// 删除段落
const removeBlock = (index) => {
  contentBlocks.value.splice(index, 1)
}

// 发布文章
const publishArticle = async () => {
  if (!title.value.trim()) {
    alert('请输入文章标题')
    return
  }

  if (contentBlocks.value.length === 0) {
    alert('请添加文章内容')
    return
  }

  try {
    const formData = new FormData()
    formData.append('title', title.value)
    
    // 构建内容数据
    const contentData = contentBlocks.value.map(block => {
      if (block.type === 'text') {
        return {
          type: 'text',
          content: block.content
        }
      } else {
        return {
          type: 'image',
          content: block.content // base64 图片数据
        }
      }
    })
    
    formData.append('content', JSON.stringify(contentData))
    
    await articleApi.publishArticle(formData)
    alert('文章发布成功！')
    // 清空编辑器
    title.value = ''
    contentBlocks.value = []
  } catch (error) {
    console.error('发布失败:', error)
    alert('文章发布失败')
  }
}
</script>

<style scoped>
.article-editor {
  max-width: 800px;
  padding: 20px;
  background-color: var(--app-surface-muted);
  color: var(--app-text-primary);
}

.overview-editor{

}

.editor-header {
  margin-bottom: 20px;
}

.title-input {
  width: 100%;
  padding: 12px;
  font-size: 18px;
  border: 1px solid var(--app-border);
  border-radius: 4px;
  margin-bottom: 15px;
  background: var(--app-surface);
  color: var(--app-text-primary);
}

.btn {
  padding: 8px 16px;
  margin-right: 10px;
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  color: var(--app-text-primary);
  border-radius: 4px;
  cursor: pointer;
}

.btn.primary {
  background: var(--el-color-primary);
  color: var(--el-color-white);
  border-color: var(--el-color-primary);
}

.content-block {
  margin-bottom: 20px;
  border: 1px solid var(--app-divider-subtle);
  border-radius: 4px;
  padding: 15px;
  background: var(--app-surface);
}

.text-area {
  width: 100%;
  min-height: 120px;
  padding: 10px;
  border: 1px solid var(--app-border);
  border-radius: 4px;
  resize: vertical;
  background: var(--app-surface);
  color: var(--app-text-primary);
}

.image-upload {
  border: 2px dashed var(--app-border);
  padding: 40px;
  text-align: center;
  cursor: pointer;
}

.file-input {
  display: none;
}

.image-preview img {
  max-width: 100%;
  max-height: 400px;
  display: block;
  margin-bottom: 10px;
}

.remove-btn {
  background: var(--app-danger);
  color: var(--app-on-media);
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}
</style>