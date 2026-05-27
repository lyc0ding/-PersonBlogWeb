<template>
  <div
    class="tagcloud-all"
    ref="tagcloudall"
    :class="{ 'is-paused': state.isPaused }"
  >
    <a
      v-for="(item, index) in tagList"
      :key="item.name"
      :href="item.url"
      rel="external nofollow"
      :class="{ 'is-hovered': hoveredIndex === index }"
      :style="{ '--tag-color': item.color }"
      @pointerenter="handleTagEnter(index)"
      @pointerleave="handleTagLeave"
      @focus="handleTagEnter(index)"
      @blur="handleTagLeave"
    >
      <span>{{ item.name }}</span>
    </a>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, onUnmounted } from 'vue';

const tagList = ref([]);
const mcList = ref([]);
const tagcloudall = ref(null);
const hoveredIndex = ref(-1);

const state = reactive({
  radius: 96,
  d: 420,         // 加大景深，更柔和
  isPaused: false,
  lasta: 0,
  lastb: 0,
  distr: true,
  speed: 0.7,     // 更顺滑
  autoRotateSpeed: 0.13,
  howElliptical: 1,
  sa: 0, ca: 0, sb: 0, cb: 0, sc: 0, cc: 0
});

let oList = null;
let oA = null;
let animationFrame = null;
let resizeObserver = null;

const sineCosine = (a, b, c) => {
  state.sa = Math.sin(a);
  state.ca = Math.cos(a);
  state.sb = Math.sin(b);
  state.cb = Math.cos(b);
  state.sc = Math.sin(c);
  state.cc = Math.cos(c);
};

const positionAll = async () => {
  await nextTick();
  let phi = 0;
  let theta = 0;
  const max = mcList.value.length;

  for (let i = 0; i < max; i++) {
    if (state.distr) {
      phi = Math.acos(-1 + (2 * i + 1) / max);
      theta = Math.sqrt(max * Math.PI) * phi;
    } else {
      phi = Math.random() * Math.PI;
      theta = Math.random() * 2 * Math.PI;
    }

    mcList.value[i].cx = state.radius * Math.cos(theta) * Math.sin(phi);
    mcList.value[i].cy = state.radius * Math.sin(theta) * Math.sin(phi);
    mcList.value[i].cz = state.radius * Math.cos(phi);
  }

  doPosition();
  depthSort();
};

// ✅ 核心优化：平滑动画
const update = () => {
  if (state.isPaused) {
    animationFrame = requestAnimationFrame(update);
    return;
  }

  const a = state.autoRotateSpeed * 0.01;
  const b = state.autoRotateSpeed * 0.015;

  // 超丝滑缓动
  state.lasta = state.lasta * state.speed + a * (1 - state.speed);
  state.lastb = state.lastb * state.speed + b * (1 - state.speed);

  sineCosine(state.lasta, state.lastb, 0);

  for (let j = 0; j < mcList.value.length; j++) {
    const { cx, cy, cz } = mcList.value[j];

    // 旋转计算
    const ry1 = cy * state.ca + cz * -state.sa;
    const rz1 = cy * state.sa + cz * state.ca;
    const rx2 = cx * state.cb + rz1 * state.sb;
    const rz2 = cx * -state.sb + rz1 * state.cb;

    mcList.value[j].cx = rx2;
    mcList.value[j].cy = ry1;
    mcList.value[j].cz = rz2;

    // ✅ 平滑透视（不会突变）
    const per = state.d / (state.d + Math.max(-state.radius * 0.8, rz2));

    // ✅ 平滑大小：最小缩到 0.6，不会扁成一条线
    mcList.value[j].scale = 0.6 + (per - 0.7) * 1.2;
    mcList.value[j].scale = Math.min(1.2, Math.max(0.6, mcList.value[j].scale));

    // ✅ 平滑透明度：背面不会突然消失
    mcList.value[j].alpha = 0.4 + (per - 0.7) * 1.8;
    mcList.value[j].alpha = Math.min(1, Math.max(0.4, mcList.value[j].alpha));

    mcList.value[j].x = state.howElliptical * rx2 * per;
    mcList.value[j].y = ry1 * per;
  }

  doPosition();
  depthSort();
  animationFrame = requestAnimationFrame(update);
};

// ✅ 统一更新：transform + opacity + scale 全部走 transform，更流畅
const doPosition = () => {
  if (!oList || !oA) return;

  const centerX = oList.offsetWidth / 2;
  const centerY = oList.offsetHeight / 2;

  for (let i = 0; i < mcList.value.length; i++) {
    const tag = mcList.value[i];
    const el = oA[i];
    if (!el) continue;

    const x = tag.x + centerX - el.offsetWidth / 2;
    const y = tag.y + centerY - el.offsetHeight / 2;

    // ✅ 流畅关键：大小、位置、层级全部走 transform
    el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${tag.scale})`;
    el.style.opacity = tag.alpha;
  }
};

const depthSort = () => {
  if (!oA) return;

  const tags = Array.from(oA).map((el, index) => ({
    el,
    z: mcList.value[index]?.cz ?? -9999
  }));

  tags.sort((a, b) => b.z - a.z);
  tags.forEach(({ el }, i) => {
    el.style.zIndex = i;
  });

  if (hoveredIndex.value > -1 && oA[hoveredIndex.value]) {
    oA[hoveredIndex.value].style.zIndex = tags.length + 1;
  }
};

const pauseCloud = () => {
  state.isPaused = true;
};
const resumeCloud = () => {
  state.isPaused = false;
};

const handleTagEnter = (index) => {
  hoveredIndex.value = index;
  pauseCloud();
  depthSort();
};
const handleTagLeave = () => {
  hoveredIndex.value = -1;
  resumeCloud();
  depthSort();
};

const query = () => {
  let tagListOrg = [
    { name: '标签1', url: '#' },{ name: '标签2', url: '#' },{ name: '标签3', url: '#' },
    { name: '标签4', url: '#' },{ name: '标签5', url: '#' },{ name: '标签6', url: '#' },
    { name: '标签7', url: '#' },{ name: '标签8', url: '#' },{ name: '标签9', url: '#' },
    { name: '标签10', url: '#' },{ name: '标签11', url: '#' },{ name: '标签12', url: '#' },
    { name: '标签13', url: '#' },{ name: '标签14', url: '#' },{ name: '标签15', url: '#' },
    { name: '标签16', url: '#' },{ name: '标签17', url: '#' }
  ];

  const palette = ['#2563eb','#0f766e','#b45309','#be123c','#7c3aed','#0e7490','#64748b'];
  tagListOrg.forEach((item, index) => {
    item.color = palette[index % palette.length]
  })

  tagList.value = tagListOrg;
  onReady();
};

const onReady = async () => {
  await nextTick();
  oList = tagcloudall.value;
  oA = oList.getElementsByTagName('a');
  state.radius = Math.min(oList.offsetWidth, oList.offsetHeight) * 0.38;

  mcList.value = [];
  for (let i = 0; i < oA.length; i++) {
    mcList.value.push({ cx: 0, cy: 0, cz: 0, x: 0, y: 0, scale: 1, alpha: 1 });
  }

  sineCosine(0, 0, 0);
  await positionAll();

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      state.radius = Math.min(oList.offsetWidth, oList.offsetHeight) * 0.38;
      doPosition();
      depthSort();
    });
    resizeObserver.observe(oList);
  }

  animationFrame = requestAnimationFrame(update);
};

onMounted(() => {
  query();
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrame);
  resizeObserver?.disconnect();
});
</script>

<style scoped>
.tagcloud-all {
  width: 100%;
  max-width: 250px;
  aspect-ratio: 1;
  margin: 0 auto;
  position: relative;
  /* overflow: hidden; */
  /* background: var(--app-surface-muted); */
  /* border: 1px solid var(--blog-card-border); */
  border-radius: 50%;
  cursor: default;
  /* box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.08); */
  isolation: isolate;
}

.tagcloud-all::before {
  content: '';
  position: absolute;
  inset: 16px;
  /* border: 1px dashed rgba(100, 116, 139, 0.22); */
  border-radius: inherit;
  pointer-events: none;
}

.tagcloud-all::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  background: var(--blog-link);
  border-radius: 50%;
  opacity: 0.22;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.tagcloud-all a {
  position: absolute;
  top: 0;
  left: 0;
  font-weight: 400;
  text-decoration: none;
  color: var(--tag-color, var(--app-text-muted));
  outline: none;
  transform-origin: center;
  will-change: transform, opacity;
  /* ✅ 流畅关键：开启过渡 */
  transition: transform 0.2s ease-out, opacity 0.2s ease-out, z-index 0.1s;
}

.tagcloud-all a span {
  display: inline-flex;
  align-items: center;
  max-width: 112px;
  min-height: 22px;
  padding: 3px 9px;
  /* overflow: hidden; */
  color: inherit;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.78);
  /* border: 1px solid rgba(148, 163, 184, 0.22); */
  border-radius: 999px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
  transition: color 0.18s ease, background-color 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.tagcloud-all.is-paused a span {
  transition-duration: 0.14s;
}

.tagcloud-all a:hover span,
.tagcloud-all a:focus-visible span,
.tagcloud-all a.is-hovered span {
  color: #ffffff;
  background: var(--blog-link);
  border-color: var(--blog-link);
  box-shadow: 0 8px 18px rgba(43, 108, 176, 0.2);
  transform: scale(1.14);
}

.tagcloud-all a:focus-visible span {
  outline: 2px solid rgba(43, 108, 176, 0.32);
  outline-offset: 2px;
}

:global(html.dark) .tagcloud-all {
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.12);
}
:global(html.dark) .tagcloud-all::before {
  border-color: rgba(148, 163, 184, 0.18);
}
:global(html.dark) .tagcloud-all a span {
  background: rgba(30, 33, 38, 0.86);
  border-color: rgba(148, 163, 184, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16);
}
:global(html.dark) .tagcloud-all a:hover span,
:global(html.dark) .tagcloud-all a:focus-visible span,
:global(html.dark) .tagcloud-all a.is-hovered span {
  color: #0f172a;
  background: var(--blog-link-hover);
  border-color: var(--blog-link-hover);
}
</style>