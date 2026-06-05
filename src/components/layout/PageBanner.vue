<template>
  <section class="feature-banner" :class="`feature-banner--${variant}`" :aria-labelledby="headingId">
    <div class="feature-banner__copy">
      <p class="feature-banner__eyebrow">
        <span class="feature-banner__mark" aria-hidden="true"></span>
        <span>{{ eyebrow }}</span>
      </p>
      <h1 :id="headingId">{{ title }}</h1>
      <p class="feature-banner__subtitle">{{ subtitle }}</p>
      <div v-if="chips.length" class="feature-banner__chips" aria-label="页面关键词">
        <span v-for="chip in chips" :key="chip">{{ chip }}</span>
      </div>
    </div>

    <div class="feature-banner__visual" aria-hidden="true">
      <div class="feature-banner__sheet">
        <div class="feature-banner__author">
          <img :src="avatarUrl" :alt="ownerName">
          <div>
            <strong>{{ ownerName }}</strong>
            <span>{{ tagline }}</span>
          </div>
        </div>

        <div class="feature-banner__tracks">
          <span
            v-for="(width, index) in trackWidths"
            :key="`${variant}-${index}`"
            :style="{ width }"
          ></span>
        </div>

        <div class="feature-banner__footer">
          <span>{{ visualLabel }}</span>
          <strong>{{ visualValue }}</strong>
        </div>
      </div>

      <div class="feature-banner__axis">
        <span v-for="index in 4" :key="index"></span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useSiteConfigStore } from '@/stores/siteConfigStore'

const props = defineProps({
  variant: {
    type: String,
    default: 'articles',
  },
  eyebrow: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  chips: {
    type: Array,
    default: () => [],
  },
  visualLabel: {
    type: String,
    default: 'journal.log',
  },
  visualValue: {
    type: String,
    default: '持续更新',
  },
})

const siteConfigStore = useSiteConfigStore()

const headingId = computed(() => `page-banner-${props.variant}`)
const ownerName = computed(() => siteConfigStore.value('site.owner', 'Lycoding'))
const tagline = computed(() => siteConfigStore.value('site.tagline', 'Move It . Live For Youself .'))
const avatarUrl = computed(() => siteConfigStore.value('site.avatarUrl', '/logo.png'))
const trackWidths = computed(() => (
  props.variant === 'space'
    ? ['82%', '54%', '68%', '42%']
    : ['62%', '88%', '48%', '72%']
))

onMounted(() => {
  siteConfigStore.loadConfigs()
})
</script>

<style scoped>
.feature-banner {
  --banner-accent: var(--blog-link);
  --banner-warm: #b67a3c;
  --banner-line: color-mix(in srgb, var(--banner-accent) 15%, var(--blog-divider));
  --banner-panel: color-mix(in srgb, var(--app-surface) 92%, var(--banner-accent));

  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(250px, 320px);
  gap: 32px;
  align-items: center;
  min-height: 188px;
  padding: 28px 0 26px;
  overflow: hidden;
  border-top: 1px solid color-mix(in srgb, var(--blog-divider) 72%, transparent);
  border-bottom: 1px solid var(--blog-divider);
}

.feature-banner--space {
  --banner-accent: #218c72;
  --banner-warm: #c08a3e;
}

.feature-banner::before {
  position: absolute;
  inset: 0;
  content: '';
  background:
    linear-gradient(110deg, color-mix(in srgb, var(--banner-accent) 10%, transparent), transparent 38%),
    linear-gradient(280deg, color-mix(in srgb, var(--banner-warm) 10%, transparent), transparent 42%),
    repeating-linear-gradient(
      90deg,
      transparent 0,
      transparent 76px,
      color-mix(in srgb, var(--blog-divider) 38%, transparent) 77px,
      transparent 78px
    );
  pointer-events: none;
}

.feature-banner__copy,
.feature-banner__visual {
  position: relative;
  z-index: 1;
  min-width: 0;
}

.feature-banner__eyebrow {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 12px;
  color: var(--banner-accent);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0;
}

.feature-banner__mark {
  width: 26px;
  height: 2px;
  flex: 0 0 26px;
  background: linear-gradient(90deg, var(--banner-accent), var(--banner-warm));
}

.feature-banner h1 {
  margin: 0;
  color: var(--app-text-primary);
  font-size: 2rem;
  font-weight: 780;
  line-height: 1.22;
  letter-spacing: 0;
}

.feature-banner__subtitle {
  max-width: 640px;
  margin: 12px 0 0;
  color: var(--app-text-secondary);
  font-size: 15px;
  line-height: 1.8;
}

.feature-banner__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.feature-banner__chips span {
  padding: 6px 10px;
  color: var(--app-text-secondary);
  background: color-mix(in srgb, var(--app-surface) 70%, transparent);
  border: 1px solid color-mix(in srgb, var(--banner-accent) 18%, var(--blog-card-border));
  border-radius: 6px;
  font-size: 12px;
  font-weight: 650;
  line-height: 1;
}

.feature-banner__visual {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 26px;
  gap: 12px;
  align-items: stretch;
}

.feature-banner__sheet {
  min-width: 0;
  padding: 14px;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--banner-accent) 10%, transparent), transparent 48%),
    var(--banner-panel);
  border: 1px solid color-mix(in srgb, var(--banner-accent) 22%, var(--blog-card-border));
  border-radius: 8px;
  box-shadow: var(--app-shadow-card, 0 8px 24px rgba(15, 23, 42, 0.06));
}

.feature-banner__author {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
}

.feature-banner__author img {
  display: block;
  width: 42px;
  height: 42px;
  object-fit: cover;
  background: var(--app-surface-muted);
  border: 1px solid var(--blog-card-border);
  border-radius: 8px;
}

.feature-banner__author strong,
.feature-banner__footer strong {
  display: block;
  overflow: hidden;
  color: var(--app-text-primary);
  font-weight: 750;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.feature-banner__author span {
  display: block;
  overflow: hidden;
  margin-top: 3px;
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.feature-banner__tracks {
  display: grid;
  gap: 8px;
  margin: 16px 0 14px;
}

.feature-banner__tracks span {
  height: 6px;
  border-radius: 6px;
  background: linear-gradient(90deg, var(--banner-accent), color-mix(in srgb, var(--banner-warm) 78%, var(--app-surface)));
  opacity: 0.72;
}

.feature-banner__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-top: 11px;
  border-top: 1px solid color-mix(in srgb, var(--banner-accent) 16%, var(--blog-divider));
}

.feature-banner__footer span {
  overflow: hidden;
  color: var(--app-text-muted);
  font-size: 12px;
  font-weight: 650;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.feature-banner__axis {
  display: grid;
  align-content: space-between;
  justify-items: center;
  padding: 7px 0;
}

.feature-banner__axis span {
  width: 8px;
  height: 8px;
  border: 2px solid color-mix(in srgb, var(--banner-accent) 58%, var(--blog-divider));
  border-radius: 50%;
  background: var(--app-bg-primary);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--banner-accent) 10%, transparent);
}

:global(html.dark) .feature-banner {
  --banner-warm: #d6a55f;
  --banner-panel: color-mix(in srgb, var(--app-surface) 88%, var(--banner-accent));
}

@media (max-width: 760px) {
  .feature-banner {
    grid-template-columns: 1fr;
    gap: 22px;
    padding: 24px 0;
  }

  .feature-banner__visual {
    max-width: 360px;
  }
}

@media (max-width: 520px) {
  .feature-banner h1 {
    font-size: 1.62rem;
  }

  .feature-banner__subtitle {
    font-size: 14px;
  }

  .feature-banner__visual {
    grid-template-columns: 1fr;
  }

  .feature-banner__axis {
    display: none;
  }
}
</style>
