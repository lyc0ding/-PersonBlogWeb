<template>
  <section class="home-hero" aria-label="站点介绍">
    <p class="hero-line">{{ line }}</p>
  </section>
</template>

<script setup>
const line = '把握住当下，才能开辟未来'
</script>

<style scoped>
.home-hero {
  max-width: var(--blog-content-max, 960px);
  margin: 0 auto;
  padding: 28px 16px 8px;
  text-align: center;
}

.hero-line {
  margin: 0;
  font-size: 15px;
  color: var(--app-text-muted);
  letter-spacing: 0.04em;
}
</style>
