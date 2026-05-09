// 持久化导航栏活动状态
import { defineStore } from 'pinia'
import { ref } from 'vue'

// 定义并导出导航存储
export const useNavStore = defineStore('nav', () => {
    // 初始值改为null，表示未初始化
    const activeNavIndex = ref(null)

    // 设置激活的导航索引
    const setActiveNavIndex = (index) => {
        activeNavIndex.value = index
    }

    // 获取激活的导航索引
    const getActiveNavIndex = () => {
        return activeNavIndex.value
    }

    return {
        activeNavIndex,
        setActiveNavIndex,
        getActiveNavIndex
    }
}, {
    // 开启持久化存储
    persist: {
        enabled: true,
        strategies: [
            {
                key: 'nav_active_index',
                storage: localStorage,
                paths: ['activeNavIndex']
            }
        ]
    }
})