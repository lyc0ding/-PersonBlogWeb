<template>
  <div class="container">
    <div class="main-container">
      <div class="guestbook">
        <div class="guestbook-title">
          留言板
        </div>
        <div class="message-send">
          <div class="send-title">
            <i class="iconfont icon-liuyan"></i>
            <div class="send-title-text">留言（注意填写信息完整，否则会被当成垃圾消息）</div>
          </div>

          <div class="send-content">
            <textarea  class="input-with-text" placeholder="留言内容"></textarea>

            <div class="other-input">
              <input type="text" class="input-with-nickname" placeholder="昵称">
              <input type="text" class="input-with-email" placeholder="邮箱">
              <input type="text" class="input-with-link" placeholder="网站">
            </div>
          </div>

          <div class="guestbook-bottom">
            <el-tooltip
              class="box-item"
              effect="dark"
              content="表情"
              placement="top"
            >
              <img src="/public/static/images/emoji.png">
            </el-tooltip>
            <el-button type="primary" plain size="large">提交</el-button>
          </div>
        </div>
      </div> 

      <div class="latest-guestbook">
        <div class="latest-guestbook-title">
          最新留言（68条）
        </div>

        <div class="latest-guestbook-content">
          <div class="latest-guestbook-content-item" v-for="message in messageContents" :key="message.id">
            <div class="building-owner" style="flex: 1;width: 100%;padding: 10px 0 0 20px;display: flex;">
              <div class="left">
                <el-avatar size="large"> {{ message.nickname }} </el-avatar>
              </div>
              <div class="middle" style="width: 80%;height: 100%;padding: 0px 10px;display: flex;flex-direction: column;gap: 10px;">
                <div class="nickname msg-muted">{{ message.nickname }}</div>
                <div class="content msg-body">{{ message.content }}</div>
                <div class="ip msg-ip">
                  <i class="iconfont icon-xiazai19"></i>
                  {{ message.ip }}
                  <span class="reply-action">回复</span>
                </div>
              </div>
              <div class="right" style="flex: 1;text-align: end;padding: 20px 30px;">
                {{ message.publishTime }}天前
                <!-- 展开/收起按钮 -->
                <div v-if="message.replyList && message.replyList.length > 0" class="toggle-reply-btn" style="margin-top: 8px;">
                  <el-button 
                    @click="toggleReply(message.id)" 
                    link 
                    size="small"
                    :icon="message.isExpanded ? 'ArrowUp' : 'ArrowDown'"
                  >
                    {{ message.isExpanded ? '收起回复' : `展开回复(${message.replyList.length})` }}
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 回复内容区域 - 默认折叠 -->
            <div 
              v-for="reply in message.replyList" 
              :key="reply.id"
              v-show="message.isExpanded"
              class="reply" 
              style="flex: 1;width: 100%;padding: 30px 0 0 50px;display: flex;transition: all 0.3s ease;"
            >
              <div class="left">
                <el-avatar size="large"> 
                  {{ reply.nickname }}
                </el-avatar>
              </div>
              <div class="middle" style="width: 80%;height: 100%;padding: 0px 10px;display: flex;flex-direction: column;gap: 10px;">
                <div class="nickname msg-muted">
                  {{ reply.nickname }}
                  <i class="iconfont icon-tubiaozhizuo-"/>
                  {{ reply.target }}
                </div>
                <div class="content msg-body">{{ reply.content }}</div>
                <div class="ip msg-ip">
                  <i class="iconfont icon-xiazai19"></i>
                  {{ reply.ip }}
                  <span class="reply-action">回复</span>
                </div>
              </div>
              <div class="right" style="flex: 1;text-align: end;padding: 20px 30px;">
                {{ reply.publishTime }}天前
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
    <PersonBox></PersonBox>
  </div>
</template>

<script setup>
import PersonBox from '../../components/sider/Introduction.vue'
import { ref , onMounted} from 'vue';

const commentSend = ref({
  content: '',
  nickname: '',
  email:''
})

const messageContents = ref([
  {
    id:1,
    nickname: '小鱼',
    avatar: '',
    ip: '桂林',
    content: '请问右侧的工具栏怎么实现的',
    publishTime: '23',
    replyList: [
      {
        id:2,
        nickname: 'TenDa',
        avatar: '',
        ip: '南宁',
        content: '自己去找',
        publishTime: '22',
        target:'小鱼'
      },
      {
        id:3,
        nickname: '小鱼',
        avatar: '',
        ip: '南宁',
        content: '我真服了',
        publishTime: '22',
        target:'TenDa'
      }
    ]
  },
  {
    id:4,
    nickname: '小鱼',
    avatar: '',
    ip: '桂林',
    content: '请问右侧的工具栏怎么实现的,请问右侧的工具栏怎么实现的,请问右侧的工具栏怎么实现的,请问右侧的工具栏怎么实现的,',
    publishTime: '23',
    replyList: [
      {
        id:5,
        nickname: 'TenDa',
        avatar: '',
        ip: '南宁',
        content: '自己去找',
        publishTime: '22',
        target:'小鱼'
      },
      {
        id:6,
        nickname: '小鱼',
        avatar: '',
        ip: '南宁',
        content: '我真服了',
        publishTime: '22',
        target:'TenDa'
      }
    ]
  }
])

// 切换回复展开状态
const toggleReply = (messageId) => {
  const message = messageContents.value.find(m => m.id === messageId)
  if (message) {
    message.isExpanded = !message.isExpanded
  }
}

// 初始化消息数据，为每条消息添加isExpanded属性
onMounted(() => {
  messageContents.value = messageContents.value.map(message => ({
    ...message,
    isExpanded: false
  }))
})
</script>

<style scoped>
.reply-action {
  margin-left: 30px;
  font-size: 15px;
  color: var(--app-text-primary);
}

.msg-muted {
  color: var(--app-text-muted);
}

.msg-body {
  font-size: 20px;
  color: var(--app-text-secondary);
}

.msg-ip {
  padding: 0 20px;
  color: var(--app-text-muted);
  user-select: none;
}

.container{ 
  display: flex;
  gap: 10px;
}

.main-container{
  flex: 1;
}

.guestbook {
  width: 100%;
  background-color: var(--app-surface);
  border: 1px solid var(--blog-card-border);
  padding: 20px 0;
  display: flex;
  flex-direction: column;

  .guestbook-title{
    width: 100%;
    font-size: 28px;
    text-align: center;
    font-weight: 800;
  }

  .message-send{
    flex: 1;
    padding: 10px 20px;
    font-size: 25px;

    .send-title{
      display: flex;
      font-size: 20px;
      gap: 5px;
      align-items: center;

      .iconfont{
        font-size: 20px;
      }
    }

    .send-content{
      display: flex;
      flex-direction: column;
      gap: 15px;
      padding: 30px;

      .input-with-text {
        width: 100%;
        border: 1px solid var(--blog-input-border);
        box-shadow: none;
        padding: 10px 14px;
        /* 固定高度 */
        height: 150px;
        /* 禁用拉伸功能 */
        resize: none;
        /* 内容溢出时显示滚动条 */
        overflow: auto;

        &:focus{
          outline: none;
        }
      }

      .other-input{
        width: 100%;
        display: flex;
        height: 50px;
        flex-direction: row;
        gap: 10px;

        & > input {
          outline: none;
          flex: 1;
          border: 1px solid var(--blog-input-border);
          box-shadow: none;
          
          background-repeat: no-repeat;
          background-size: 20px;
          background-position: 10px center; /* 调整图标位置 */
          padding-left: 40px; /* 为图标留出空间，防止文字重叠 */
        }

        .input-with-nickname{
          background-image: url('/public/static/images/nickname.png');
        }
        .input-with-email{
          background-image: url('/public/static/images/email.png');
        }
        .input-with-link{
          background-image: url('/public/static/images/link.png');
        }
      }
    }

    .guestbook-bottom{
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-end;
      gap: 20px;

      img{
        width: 30px;
        height: 30px;
      }
    }
  }
}

.latest-guestbook {
  width: 100%;
  margin-top: 16px;
  background-color: var(--app-surface);
  border: 1px solid var(--blog-card-border);
  padding: 20px 0;
  display: flex;
  flex-direction: column;

  .latest-guestbook-title{
    width: 100%;
    font-size: 28px;
    text-align: center;
    font-weight: 800;
  }

  .latest-guestbook-content{
    flex: 1;

    .latest-guestbook-content-item {
      width: 100%;
      padding: 16px 16px;
      display: flex;
      flex-direction: column;
      border-bottom: 1px solid var(--blog-divider);
      box-shadow: none;
    }
  }
}

/* 可选：添加折叠动画效果 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
