import './assets/main.css'
import './assets/iconfont/iconfont.css'    // 引入阿里云字体图标css

import { createApp } from 'vue'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import App from './App.vue'
import router from './router'

import { createPinia } from 'pinia'

// import './assets/fonts/fonts.css';//字体文件
import './assets/styles/variables.scss'
import './assets/styles/theme.scss'
import './assets/styles/light-content.scss'
import './assets/styles/global.scss'
import './assets/styles/pet-dog-sprites.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus)


app.mount('#app')
