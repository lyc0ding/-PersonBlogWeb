import './assets/main.css'
import './assets/iconfont/iconfont.css'    // 引入阿里云字体图标css

import { createApp } from 'vue'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import App from './App.vue'
import router from './router'

import { createPinia } from 'pinia'
import Axios from 'axios'

// import './assets/fonts/fonts.css';//字体文件
import './assets/styles/variables.scss'
import './assets/styles/theme.scss'
import './assets/styles/global.scss'

const app = createApp(App)

app.use(router)
app.use(createPinia())
app.use(ElementPlus)


app.mount('#app')
