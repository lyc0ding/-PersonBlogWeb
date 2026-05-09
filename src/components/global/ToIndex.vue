<template>
    <div id="container">
        <p @click="toIndex()">
            <i class="icon iconfont icon-fanhui"/>返回
        </p>
    </div>
</template>

<script setup>
const toIndex = ()=>{
    // 调用浏览器的历史记录返回方法
    window.history.back();
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