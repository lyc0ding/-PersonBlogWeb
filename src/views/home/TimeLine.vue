<template>
  <section class="build-timeline" aria-label="建站时间线">
    <div class="section-heading">
      <p>SITE TIMELINE</p>
      <h2>建站时间线</h2>
    </div>

    <div class="timeline-list">
      <article
        v-for="(item, index) in items"
        :key="`${item.time}_${item.title}_${index}`"
        class="timeline-item"
      >
        <div class="timeline-marker" aria-hidden="true"></div>
        <time>{{ item.time }}</time>
        <div class="timeline-content">
          <span v-if="item.badge" class="timeline-badge">{{ item.badge }}</span>
          <h3>{{ item.title }}</h3>
          <p>{{ item.content }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})
</script>

<style scoped>
.build-timeline {
  padding-top: 34px;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.section-heading p {
  margin: 0;
  color: var(--blog-meta);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.section-heading h2 {
  margin: 0;
  color: var(--app-text-primary);
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.25;
}

.timeline-list {
  position: relative;
  display: grid;
  gap: 0;
  padding-left: 24px;
  border-top: 1px solid var(--blog-divider);
}

.timeline-list::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 28px;
  bottom: 28px;
  width: 1px;
  background: var(--blog-divider);
}

.timeline-item {
  position: relative;
  display: grid;
  grid-template-columns: 116px minmax(0, 1fr);
  gap: 22px;
  padding: 22px 0;
  border-bottom: 1px solid var(--blog-divider);
}

.timeline-marker {
  position: absolute;
  left: -23px;
  top: 28px;
  width: 13px;
  height: 13px;
  border: 3px solid var(--app-surface);
  border-radius: 50%;
  background: var(--blog-link);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--blog-link) 45%, transparent);
}

.timeline-item time {
  color: var(--blog-meta);
  font-size: 13px;
  font-weight: 650;
  line-height: 1.6;
  white-space: nowrap;
}

.timeline-content {
  min-width: 0;
}

.timeline-badge {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 3px 8px;
  margin-bottom: 8px;
  border: 1px solid var(--blog-divider);
  border-radius: 999px;
  color: var(--blog-link);
  font-size: 12px;
  font-weight: 650;
  line-height: 1.4;
}

.timeline-content h3 {
  margin: 0;
  color: var(--app-text-primary);
  font-size: 1.03rem;
  font-weight: 700;
  line-height: 1.45;
}

.timeline-content p {
  margin: 8px 0 0;
  color: var(--app-text-secondary);
  font-size: 14px;
  line-height: 1.75;
}

@media (max-width: 620px) {
  .section-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }

  .timeline-item {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .timeline-item time {
    white-space: normal;
  }
}
</style>
