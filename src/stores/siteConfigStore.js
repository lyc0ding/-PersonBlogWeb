import { defineStore } from 'pinia'
import { siteConfigListService } from '@/api/site'

export const DEFAULT_BUILD_TIMELINE = [
  {
    time: '2026.05',
    title: '站点框架上线',
    content: '完成 Vue 前台、Spring Boot 管理端和基础内容模块，博客开始作为长期记录入口运行。',
    badge: 'Foundation',
    visible: true,
  },
  {
    time: '2026.05',
    title: '内容管理完善',
    content: '接入文章、标签、照片、留言和关于页管理，让主要内容都可以从后台维护。',
    badge: 'CMS',
    visible: true,
  },
  {
    time: '2026.06',
    title: '首页体验重构',
    content: '将首页底部快捷入口调整为建站时间线，用来记录站点每次重要迭代。',
    badge: 'Update',
    visible: true,
  },
]

export const DEFAULT_SITE_CONFIG = {
  'site.title': 'PersonBlog',
  'site.owner': 'Lycoding',
  'site.description': '开发笔记、嵌入式实践和生活片段。',
  'site.tagline': 'Move It . Live For Youself .',
  'site.avatarUrl': '/logo.png',
  'site.roleTitle': '后端开发者 / 博客作者',
  'site.buildYear': '2026',
  'site.profileBio': '记录 Java、Spring Boot、数据库实践，也收藏一些生活里的灵感与照片。',
  'site.profileStatus': '正在整理 Vue 博客前台体验',
  'site.profileTags': '["Java","Spring Boot","Vue","MySQL"]',
  'site.profileLinks': '[{"label":"关于我","path":"/about","icon":"icon-shuohuaren"},{"label":"文章归档","path":"/articles","icon":"icon-wenjian"},{"label":"留言交流","path":"/comments","icon":"icon-liuyan"}]',
  'site.navItems': '[{"label":"首页","path":"/","visible":true},{"label":"朋友圈","path":"/space","visible":true},{"label":"文章","path":"/articles","visible":true},{"label":"留言板","path":"/comments","visible":true},{"label":"照片","path":"/photos","visible":true},{"label":"关于","path":"/about","visible":true}]',
  'home.heroEyebrow': 'PERSONAL BLOG',
  'home.heroTitle': 'Lycoding',
  'home.heroSubtitle': '记录代码、生活和持续折腾的个人博客。把问题写清楚，把经验留下来。',
  'home.heroCoverUrl': '/img/bac2.jpg',
  'home.heroTags': '["Java / Vue","嵌入式","生活记录"]',
  'home.heroPrimaryText': '阅读文章',
  'home.heroPrimaryPath': '/articles',
  'home.heroSecondaryText': '看看朋友圈',
  'home.heroSecondaryPath': '/space',
  'home.nowItems': '["整理 Vue 博客前台的阅读体验","补齐嵌入式开发过程中的问题记录","把日常想法沉淀成可以回看的文字"]',
  'home.quickLinks': '[{"title":"文章","desc":"技术笔记与经验整理","path":"/articles"},{"title":"朋友圈","desc":"图片、文字和近期动态","path":"/space"},{"title":"留言板","desc":"留下想法或交流问题","path":"/comments"},{"title":"关于","desc":"了解这个博客和博主","path":"/about"}]',
  'home.buildTimeline': JSON.stringify(DEFAULT_BUILD_TIMELINE),
  'live.title': '关于我',
  'live.subtitle': 'About Me',
  'live.contentHtml': '<p>这里是关于我的详细介绍内容，可在后台系统设置中维护。</p><p>你可以补充个人经历、项目、联系方式和近期状态。</p>',
  'live.images': '[{"url":"/img/bac1.jpg","alt":"生活照片 1"},{"url":"/img/bac2.jpg","alt":"生活照片 2"}]',
}

let pendingRequest = null

export const useSiteConfigStore = defineStore('siteConfig', {
  state: () => ({
    configs: { ...DEFAULT_SITE_CONFIG },
    loading: false,
    loaded: false,
    error: '',
  }),

  actions: {
    async loadConfigs(force = false) {
      if (this.loaded && !force) {
        return this.configs
      }
      if (pendingRequest) {
        return pendingRequest
      }

      this.loading = true
      this.error = ''
      pendingRequest = siteConfigListService()
        .then((res) => {
          const list = res?.data ?? res ?? []
          const next = { ...DEFAULT_SITE_CONFIG }
          if (Array.isArray(list)) {
            list.forEach((item) => {
              if (item?.configKey) {
                next[item.configKey] = item.configValue ?? ''
              }
            })
          }
          this.configs = next
          this.loaded = true
          document.title = this.value('site.title', 'PersonBlog')
          return this.configs
        })
        .catch((err) => {
          this.error = err?.message || '站点配置加载失败'
          this.configs = { ...DEFAULT_SITE_CONFIG }
          this.loaded = true
          return this.configs
        })
        .finally(() => {
          this.loading = false
          pendingRequest = null
        })

      return pendingRequest
    },

    value(key, fallback = '') {
      const value = this.configs[key]
      return value == null || value === '' ? fallback : value
    },

    json(key, fallback = []) {
      const value = this.value(key, '')
      if (!value) {
        return fallback
      }
      try {
        const parsed = JSON.parse(value)
        return parsed == null ? fallback : parsed
      } catch {
        return fallback
      }
    },
  },
})
