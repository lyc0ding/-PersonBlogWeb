<template>
  <div class="editor">
    <!-- 工具栏 -->
    <div class="toolbar" >
      <el-button plain @click="addParagraph" size="large">添加段落</el-button>
      <el-button plain @click="addImage" size="large">添加图片</el-button>
    </div>

    <!-- 编辑区域 -->
    <div class="content">
      <div
        v-for="(item, index) in content"
        :key="index"
        class="item"
      >
        <!-- 段落 -->
        <div v-if="item.type === 'paragraph'" class="paragraph">
          <el-input
            v-model="item.content"
            style="width: 100%"
            :rows="3"
            type="textarea"
            placeholder="请输入段落内容"
          />
        </div>

        <!-- 图片 -->
        <div v-if="item.type === 'image'" class="image">
          <img :src="item.src" alt="上传的图片" v-if="item.src" />
          <input
            type="file"
            accept="image/*"
            @change="handleImageUpload($event, index)"
            v-if="!item.src"
          />
          <el-input
            v-model="item.alt"
            style="width: 50%;"
            type="text"
            placeholder="请输入图片描述"
          />
        </div>

        <!-- 操作按钮 -->
        <div class="actions" style="margin-top: 10px;">
          <el-button type="warning" @click="moveUp(index)" :disabled="index === 0">上移</el-button>
          <el-button type="warning" @click="moveDown(index)" :disabled="index === content.length - 1">下移</el-button>
          <el-button type="danger" @click="removeItem(index)">删除</el-button>
        </div>
      </div>
    </div>

    <!-- 预览区域 -->
    <div class="preview">
      <h3>预览</h3>
      <div class="preview-content">
        <p v-for="(item, index) in content" :key="index">
          <span v-if="item.type === 'paragraph'">{{ item.content }}</span>
          <img
            v-if="item.type === 'image'"
            :src="item.src"
            :alt="item.alt"
            style="max-width: 100%;"
          />
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// 初始化文章内容
const content = ref([
  {
    type: "paragraph",
    content: "",
  },
]);

// 添加段落
const addParagraph = () => {
  content.value.push({
    type: "paragraph",
    content: "",
  });
};

// 添加图片
const addImage = () => {
  content.value.push({
    type: "image",
    src: "",
    alt: "",
  });
};

// 处理图片上传
const handleImageUpload = (event, index) => {
  const file = event.target.files[0];
  if (file) {
    // 这里只是简单地用 base64 展示，实际项目中应该上传到服务器
    const reader = new FileReader();
    reader.onload = (e) => {
      content.value[index].src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

// 移动元素
const moveUp = (index) => {
  if (index > 0) {
    [content.value[index], content.value[index - 1]] = [
      content.value[index - 1],
      content.value[index],
    ];
  }
};

const moveDown = (index) => {
  if (index < content.value.length - 1) {
    [content.value[index], content.value[index + 1]] = [
      content.value[index + 1],
      content.value[index],
    ];
  }
};

// 删除元素
const removeItem = (index) => {
  content.value.splice(index, 1);
};

// 保存文章
const save = () => {
  // 这里可以将 content.value 发送到后端
  console.log("保存的文章内容:", content.value);
  alert("文章已保存！");
};

defineExpose({save})
</script>

<style scoped>
.editor {
  height: 100%;
  margin: 0 auto;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 1px 4px var(--app-shadow-soft);
  background-color: var(--app-surface);
  color: var(--app-text-primary);
}

.toolbar {
  margin-bottom: 20px;
  color: var(--app-text-primary);
}

.content {
  margin-bottom: 30px;
}

.item {
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid var(--app-border);
}

.paragraph .el-input {
  padding: 10px;
  border: 1px solid var(--app-border);
}

.image input[type="file"] {
  margin-bottom: 10px;
}

.image img {
  max-width: 100%;
  margin-bottom: 10px;
}

.preview {
  padding: 20px;
  border-top: 2px solid var(--app-divider-subtle);
}
</style>