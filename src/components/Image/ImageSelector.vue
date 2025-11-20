<template>
  <el-upload
    action="#改为你上传服务URL路径" 
    :file-list="fileList"
    :on-change="handleFileUpload"
    class="avatar-uploader"
    style="width: 100%;"
    :on-preview="handlePictureCardPreview"
    :on-remove="handleRemove"
  >
    <img v-if="imageUrl" :src="imageUrl" class="avatar" />
    <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
  </el-upload>
</template>

<script setup>
import { ref } from 'vue';
import { Plus} from '@element-plus/icons-vue'

const fileList = ref([]);
const imageUrl = ref('');

const handleFileUpload = (file, fileList) => {
  imageUrl.value = URL.createObjectURL(file.raw);
};
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #000;
  width: 150px;
  height: 150px;
  text-align: center;
}

.avatar-uploader .avatar {
  width: 150px;
  height: 150px;
  object-fit: cover;
}
</style>
