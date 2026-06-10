// stores/tagStore.js
import { defineStore } from 'pinia'

export const useTagStore = defineStore('tags', {
  state: () => ({
    visitedTags: []
  }),
  
  actions: {
    // 添加标签
    addTag(route) {
      const { name, path, fullPath, meta } = route
      if (!name || path === '/') return
      
      const tag = {
        name,
        path,
        fullPath,
        title: meta.title || '未命名页面',
        affix: meta.affix || false
      }
      
      // 检查标签是否已存在
      const existingTag = this.visitedTags.find(item => item.path === path)
      if (!existingTag) {
        this.visitedTags.push(tag)
      }
    },
    
    // 删除标签
    deleteTag(tag) {
      return new Promise(resolve => {
        // 固定标签不能删除
        if (tag.affix) return
        
        const index = this.visitedTags.findIndex(item => item.path === tag.path)
        if (index > -1) {
          this.visitedTags.splice(index, 1)
        }
        resolve()
      })
    },
    
    // 删除其他标签
    deleteOtherTags(tag) {
      this.visitedTags = this.visitedTags.filter(item => 
        item.affix || item.path === tag.path
      )
    },
    
    // 删除所有标签
    deleteAllTags() {
      this.visitedTags = this.visitedTags.filter(item => item.affix)
    },
    
    // 更新标签路径（用于动态路由）
    updateTagPath(oldPath, newPath, newFullPath) {
      const tag = this.visitedTags.find(item => item.path === oldPath)
      if (tag) {
        tag.path = newPath
        tag.fullPath = newFullPath
      }
    }
  }
})
