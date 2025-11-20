import './assets/main.css'
import './assets/iconfont/iconfont.css'    // 引入阿里云字体图标css

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import Axios from 'axios'

// import './assets/fonts/fonts.css';//字体文件

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)


app.mount('#app')
