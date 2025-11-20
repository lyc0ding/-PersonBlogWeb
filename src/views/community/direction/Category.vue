<template>
  <div class="container">
    <div class="right-nav">
        <div class="categories">
            <div class="famous-remark">
                <div class="title">片刻</div>
                <div class="content">欲买桂花同载酒，终不似，少年游</div>
            </div>
            <div class="nav-all">
              <div class="nav-item" v-for="item in categoryList" @click="changeActive(item.id)" :class="{'active':item.id == activeItem}">
                <div class="left">
                  <i class="iconfont" :class="item.icon"></i>
                  {{ item.label }}
                </div>
                <div class="right">10</div>
              </div>
            </div>
        </div>

        <div class="label-container">
          <div class="label-title">标签</div>
          <div class="label-content" >
            <span class="label-text" v-for="label in labelList" @click="chooseLabel(label)">
              {{ label }}
            </span>
          </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const activeItem = ref(null)

const labelList = ref([
  '前端开发','Vue3',,'JavaScript','CSS布局','响应式设计','TypeScript','HTML5','前端工程化', '性能优化', '跨端开发'
]);

onMounted(() => {
  for (var i = 0; i < 10; i++){
    labelList.value.push('java')
  }
})

const changeActive = (index) => {
  activeItem.value = index
}

const categoryList = ref([
  {
    id:1,
    icon:'icon-wentijieda',
    label: '问题'
  },
  {
    id:2,
    icon:'icon-xiangmu',
    label: '项目'
  },
  {
    id:3,
    icon:'icon-guidang',
    label: '归档'
  },
  {
    id:4,
    icon:'icon-xietanxintanhua',
    label: '杂谈'
  }
])

const chooseLabel = (label) => {
  alert(`选中了 ${label} 标签`)
}
</script>

<style scoped>
.categories {
  width: 250px;
  height: 300px;
  background-color: white;
  transition: all 0.3s ease-out;
  position: relative;
  /* border-radius: 10px; */
  display: flex;
  flex-direction: column;
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.3); /* 右下阴影 */

  .famous-remark{
    width: 100%;
    height: 40%;
    /* border-radius: 10px 10px 0 0; */
    background: linear-gradient(135deg, #bebaba 0%, #474b4b 100%);
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;

    .title{
      text-align: center;
      font-size: 25px;
    }
    
    .content{
      margin-top: 5px ;
      width: 90%;
      flex: 1;
      font-size: 18px;
    }
  }


  .nav-all {
    flex: 1;
    display: flex;          /* 启用 Flex 布局 */
    flex-direction: column; /* 子项垂直排列 */  
    width: 100%;            /* 宽度占满父容器 */
  }

  .nav-item {
    flex: 1;                /* 均分剩余高度 */
    width: 100%;            /* 宽度占满父容器 */
    padding: 8px 10px;
    display: flex;
    justify-content: space-between;
    
    /* &:last-child{
      border-radius: 0 0 10px 10px;
    } */

    &:hover{
      background-color: rgb(171, 171, 171);
      padding: 8px 15px;
      transition: all 0.2s ease;
    }

    .left{
      .iconfont{
        font-size: 15px;
        margin-right: 10px; 
      }
    }
  }

  .active{
    background-color: rgb(145, 145, 145);
    padding: 8px 15px;
    transition: all 0.2s ease;
  }

}

.label-container{
    width: 250px;
    height: 400px;
    display: flex;
    flex-direction: column;
    background-color: white;
    margin-top: 10px;


    .label-title{
      text-align: center;
      line-height: 50px;
      font-size: 20px;
      background-color: #c3c1c1;
    }

    .label-content{
      display: flex;
      flex-wrap: wrap; /* 超出宽度自动换行 */
      gap: 12px; /* 标签之间的间距 */
      row-gap: 10px; /*行之间的间距*/
      overflow: hidden;
      justify-content: center;
      padding: 10px 0;

      .label-text{
        font-size: 15px;
        user-select: none;

        &:hover{
          color: aquamarine;
        }
      }
    }

}

</style>