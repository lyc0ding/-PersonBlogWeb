<template>
  <div class="setting-container">
    <el-scrollbar >
        <el-form :model="form" label-width="auto" size="large">
        <el-form-item>
            <span slot="label" class="setting-label">
                <span style="font-weight: bold;">文章标题</span>
                
                <el-tooltip placement="top">
                    <template #content> 
                        文章标题
                    </template>
                    <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
            </span>

            <el-input
                v-model="form.title"
                style="width: 60%"
                :rows="6"
                type="text"
                placeholder="请输入文章标题"
            />
        </el-form-item>

        <el-form-item>
            <span slot="label" class="setting-label">
                <span style="font-weight: bold;">文章标签</span>
                
                <el-tooltip placement="top">
                    <template #content> 文章头部位置展示
                        设置合适的标签，能方便分类检索
                        推荐给需要的人，获取更多曝光 
                    </template>
                    <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
            </span>

            <!-- <Tag></Tag> -->
        </el-form-item>

        <el-form-item>
            <span slot="label" class="setting-label">
                <span style="font-weight: bold;">文章封面</span>
                
                <el-tooltip placement="top">
                    <template #content> 设置封面图，获取更多流量
                        正文图：自动提取文章正文图片。如果未选择封面图则以默认封面图兜底。
                        本地上传：支持上传JPG,JPEG,PNG,GIF。最大5MB
                    </template>
                    <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
            </span>

            <ImageSelector></ImageSelector>
            
        </el-form-item>

        <el-form-item>
            <span slot="label" class="setting-label">
                <span style="font-weight: bold;">文章摘要</span>
                
                <el-tooltip placement="top">
                    <template #content> 
                        介绍文章大致
                    </template>
                    <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
            </span>

            <el-input
                v-model="form.abstract"
                style="width: 100%"
                :rows="3"
                type="textarea"
                placeholder="请输入文章摘要"
            />
        </el-form-item>

        <el-form-item>
            <span slot="label" class="setting-label">
                <span style="font-weight: bold;">可见范围</span>
            </span>

            <el-radio-group v-model="radio" style="width: 100%;">
                <el-radio :value="3">全部可见</el-radio>
                <el-radio :value="6">仅我可见</el-radio>
                <el-radio :value="9">友链可见</el-radio>
            </el-radio-group>
        </el-form-item>
    </el-form>

    <div class="foorter">
        <el-button plain @click="addParagraph" size="large">存草稿</el-button>
        <el-button type="primary" @click="publish" size="large">发布文章</el-button>
    </div>
    </el-scrollbar>
    
  </div>
</template>

<script setup>
import { ref, reactive, toRefs, onMounted} from 'vue'
import { QuestionFilled ,Plus} from '@element-plus/icons-vue'
import ImageSelector from '@/components/Image/ImageSelector.vue'

const form = reactive({
  title: '',
  tag: [],
  abstract:'', //摘要
  date1: '',
  date2: '',
  delivery: false,
  type: [],
  resource: '',
  desc: '',
})

const radio = ref(3)
    const emit = defineEmits(['handlePublish']);
// 发布文章
const publish = ()=>{
    emit('handlePublish');
}

</script>

<style scoped>
.setting-container{
    width: 100%;
    height: 100%;
    background-color: var(--app-surface);
    border-radius: 5px;
    box-shadow: 0 1px 4px var(--app-shadow-soft);
    color: var(--app-text-secondary);
    padding: 20px;
}

.setting-label{
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
}

.foorter{
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
}
</style>