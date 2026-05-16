<template>
  <div class="image-uploader">
    <el-upload
      class="uploader"
      :show-file-list="false"
      :http-request="handleUpload"
      :before-upload="beforeUpload"
      accept="image/jpeg,image/png,image/gif,image/webp"
      drag
    >
      <div v-if="modelValue" class="preview-box">
        <img :src="modelValue" alt="预览" class="preview-img">
        <div class="preview-mask">
          <span>点击或拖拽替换</span>
        </div>
      </div>
      <div v-else class="upload-placeholder">
        <el-icon class="upload-icon"><Plus /></el-icon>
        <p>{{ uploading ? '上传中…' : '拖拽图片到此处，或点击上传' }}</p>
        <p class="hint">{{ hint }}</p>
      </div>
    </el-upload>

    <div v-if="modelValue" class="uploader-actions">
      <el-input
        :model-value="modelValue"
        readonly
        size="small"
        placeholder="图片 URL"
      >
        <template #append>
          <el-button @click="clearImage">清除</el-button>
        </template>
      </el-input>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { uploadImageService, resolveUploadUrl } from '@/api/admin/upload'

const props = defineProps({
  modelValue: { type: String, default: '' },
  bizType: { type: String, default: 'content' },
  maxSizeMB: { type: Number, default: 5 },
  hint: { type: String, default: '支持 JPG / PNG / GIF / WebP' },
})

const emit = defineEmits(['update:modelValue', 'uploaded'])

const uploading = ref(false)

function beforeUpload(file) {
  const isImage = /^image\//.test(file.type)
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  const limit = props.maxSizeMB * 1024 * 1024
  if (file.size > limit) {
    ElMessage.error(`图片大小不能超过 ${props.maxSizeMB}MB`)
    return false
  }
  return true
}

async function handleUpload(options) {
  const { file } = options
  uploading.value = true
  try {
    const res = await uploadImageService(file, props.bizType)
    const url = resolveUploadUrl(res)
    if (!url) throw new Error('未返回图片地址')
    emit('update:modelValue', url)
    emit('uploaded', { url, file })
    ElMessage.success('上传成功')
    options.onSuccess?.(res)
  } catch (err) {
    console.warn('[upload] 后端上传失败，使用本地预览', err)
    const localUrl = URL.createObjectURL(file)
    emit('update:modelValue', localUrl)
    emit('uploaded', { url: localUrl, file, local: true })
    ElMessage.warning('后端未就绪，已使用本地预览（联调后请重新上传）')
    options.onSuccess?.({ url: localUrl })
  } finally {
    uploading.value = false
  }
}

function clearImage() {
  emit('update:modelValue', '')
}
</script>

<style scoped>
.image-uploader {
  width: 100%;
}

.uploader :deep(.el-upload) {
  width: 100%;
}

.uploader :deep(.el-upload-dragger) {
  width: 100%;
  padding: 0;
  border-radius: 8px;
  overflow: hidden;
  background: var(--app-surface-muted);
}

.upload-placeholder {
  padding: 28px 16px;
  text-align: center;
  color: var(--app-text-muted);
}

.upload-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.hint {
  margin-top: 6px;
  font-size: 12px;
}

.preview-box {
  position: relative;
  width: 100%;
  min-height: 160px;
  max-height: 320px;
  overflow: hidden;
}

.preview-img {
  width: 100%;
  max-height: 320px;
  object-fit: contain;
  display: block;
  background: var(--app-media-letterbox);
}

.preview-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  opacity: 0;
  transition: opacity 0.2s ease;
  font-size: 14px;
}

.preview-box:hover .preview-mask {
  opacity: 1;
}

.uploader-actions {
  margin-top: 8px;
}
</style>
