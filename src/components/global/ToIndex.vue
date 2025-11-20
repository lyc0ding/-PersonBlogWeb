<template>
    <div id="container">
        <p @click="toIndex()">
            <i class="icon iconfont icon-fanhui"/>首页
        </p>
    </div>
</template>

<script setup>
import { ref, reactive, toRefs, onMounted} from 'vue'
import { useRouter } from 'vue-router';

const router = useRouter()

const toIndex = ()=>{
    router.push('/')
}

</script>

<style scoped>
#container{
    position: fixed;
    top: 30px;
    left: 30px;
    z-index: 9999;
    font-size: 20px;

    .icon{
        font-size: 20px;
    }
}

p:hover{
    color: rgb(0, 0, 0);
    user-select: none;
}
</style>