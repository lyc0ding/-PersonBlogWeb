<template>
  <div class="overview-container">
    <el-form
        :label-position="labelPosition"
        label-width="auto"
        :model="formLabelAlign"
        style="max-width: 600px"
    >
        <el-form-item label="Form Align" label-position="right">
        <el-radio-group v-model="labelPosition" aria-label="label position">
            <el-radio-button value="left">Left</el-radio-button>
            <el-radio-button value="right">Right</el-radio-button>
            <el-radio-button value="top">Top</el-radio-button>
        </el-radio-group>
        </el-form-item>
        <el-form-item label="Form Item Align" label-position="right">
        <el-radio-group
            v-model="itemLabelPosition"
            aria-label="item label position"
        >
            <el-radio-button value="">Empty</el-radio-button>
            <el-radio-button value="left">Left</el-radio-button>
            <el-radio-button value="right">Right</el-radio-button>
            <el-radio-button value="top">Top</el-radio-button>
        </el-radio-group>
        </el-form-item>
        <el-form-item label="Name">
            <el-input v-model="formLabelAlign.name" />
        </el-form-item>
        <el-form-item label="Activity zone">
            <el-input v-model="formLabelAlign.region" />
        </el-form-item>
        <el-form-item label="Activity form">
            <el-input v-model="formLabelAlign.type" />
        </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

const formLabelAlign = ref({
  name: '',
  region: '',
  type: '',
})
</script>

<style scoped>
.overview-container{
    background-color: white;
    width: 800px;
    height: 500px;
    margin: 0 auto;
}
</style>