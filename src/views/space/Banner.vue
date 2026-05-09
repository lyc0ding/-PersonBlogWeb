<template>
    <div id="container">
        <div class="title">
            <div class="title-contents">
                <h2>碎碎念</h2>
                <p><i class='iconfont icon-yinhao'/>&nbsp;&nbsp;已在本站留下了n条小吐槽</p>
            </div>
        </div>
    </div>
</template>

<script setup>

</script>

<style scoped>
#container {
  width: 100%;
  height: 100%;
  min-width: 1500px;

  .title{
    width: 100%;
    display: flex;
    justify-content: center;
    padding-top: 50px;
    .title-contents{
        width: 85%;
        height: 150px;
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        background-color: color-mix(in srgb, var(--app-surface) 42%, transparent);
        backdrop-filter: blur(10px);                /* 背景模糊强度 */
        -webkit-backdrop-filter: blur(10px);        /* 兼容Safari */
        border-radius: 10px;
        h2{
            font-size: 35px;
        }
        p{
            font-size: 20px;
            display: flex;
            flex-direction: row;
            justify-content: center;;
        }
    }
  }
}
</style>