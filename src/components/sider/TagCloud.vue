<template>
  <div class="tagcloud-all" ref="tagcloudall">
    <a
      v-for="item in tagList"
      :href="item.url"
      rel="external nofollow"
      :style="`color:${item.color};top:0;left:0;`"
    >
      {{ item.name }}
    </a>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, onUnmounted } from 'vue';

// 响应式数据
const tagList = ref([]);
const mcList = ref([]);
const tagcloudall = ref(null);

const state = reactive({
  radius: 100,
  dtr: Math.PI / 180,
  d: 350,
  active: false,
  lasta: 0,
  lastb: 0,
  distr: true,
  // 平滑速度系数
  speed: 0.6,
  mouseSpeed: 0.03, // 鼠标控制灵敏度
  autoRotateSpeed: 0.2, // 自动转动速率
  size: 250,
  mouseX: 0,
  mouseY: 0,
  howElliptical: 1,
  sa: 0, ca: 0, sb: 0, cb: 0, sc: 0, cc: 0
});

let oList = null;
let oA = null;
let animationFrame = null;

// 三角函数计算
const sineCosine = (a, b, c) => {
  state.sa = Math.sin(a);
  state.ca = Math.cos(a);
  state.sb = Math.sin(b);
  state.cb = Math.cos(b);
  state.sc = Math.sin(c);
  state.cc = Math.cos(c);
};

// 初始定位
const positionAll = async () => {
  await nextTick();
  let phi = 0;
  let theta = 0;
  const max = mcList.value.length;

  // 均匀球体分布算法
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

// 平滑更新坐标（核心优化）
const update = () => {
  let a, b;

  if (state.active) {
    // 鼠标控制 - 平滑线性
    a = (-state.mouseY / state.radius) * state.mouseSpeed;
    b = (state.mouseX / state.radius) * state.mouseSpeed;
  } else {
    // 自动旋转 - 匀速线性
    a = state.autoRotateSpeed * 0.01;
    b = state.autoRotateSpeed * 0.015;
  }

  // 缓动平滑算法（让旋转丝滑不抖动）
  state.lasta = state.lasta * state.speed + a * (1 - state.speed);
  state.lastb = state.lastb * state.speed + b * (1 - state.speed);

  sineCosine(state.lasta, state.lastb, 0);

  // 3D坐标变换
  for (let j = 0; j < mcList.value.length; j++) {
    const cx = mcList.value[j].cx;
    const cy = mcList.value[j].cy;
    const cz = mcList.value[j].cz;

    // X 轴旋转
    let ry1 = cy * state.ca + cz * -state.sa;
    let rz1 = cy * state.sa + cz * state.ca;

    // Y 轴旋转
    let rx2 = cx * state.cb + rz1 * state.sb;
    let rz2 = cx * -state.sb + rz1 * state.cb;

    mcList.value[j].cx = rx2;
    mcList.value[j].cy = ry1;
    mcList.value[j].cz = rz2;

    // 透视计算
    const per = state.d / (state.d + rz2);
    mcList.value[j].x = state.howElliptical * rx2 * per;
    mcList.value[j].y = ry1 * per;
    mcList.value[j].scale = per;
    mcList.value[j].alpha = (per - 0.6) * 2;
  }

  doPosition();
  depthSort();

  // 持续流畅动画
  animationFrame = requestAnimationFrame(update);
};

// 更新标签位置与样式
const doPosition = () => {
  const centerX = oList.offsetWidth / 2;
  const centerY = oList.offsetHeight / 2;

  for (let i = 0; i < mcList.value.length; i++) {
    const tag = mcList.value[i];
    const el = oA[i];
    if (!el) continue;

    const x = tag.x + centerX - el.offsetWidth / 2;
    const y = tag.y + centerY - el.offsetHeight / 2;
    el.style.transform = `translate(${x}px, ${y}px)`;
    el.style.fontSize = `${Math.ceil(12 * tag.scale + 8)}px`;
    el.style.opacity = Math.max(0.3, tag.alpha);
  }
};

// 深度排序
const depthSort = () => {
  const tags = Array.from(oA);
  tags.sort((a, b) => {
    const az = mcList.value[tags.indexOf(a)].cz;
    const bz = mcList.value[tags.indexOf(b)].cz;
    return bz - az;
  });
  tags.forEach((el, i) => el.style.zIndex = i);
};

// 模拟数据
const query = () => {
  let tagListOrg = [
    { name: '标签1', url: '#' },{ name: '标签2', url: '#' },{ name: '标签3', url: '#' },
    { name: '标签4', url: '#' },{ name: '标签5', url: '#' },{ name: '标签6', url: '#' },
    { name: '标签7', url: '#' },{ name: '标签8', url: '#' },{ name: '标签9', url: '#' },
    { name: '标签10', url: '#' },{ name: '标签11', url: '#' },{ name: '标签12', url: '#' },
    { name: '标签13', url: '#' },{ name: '标签14', url: '#' },{ name: '标签15', url: '#' },
    { name: '标签16', url: '#' },{ name: '标签17', url: '#' }
  ];

  const muted =
    typeof document !== 'undefined'
      ? getComputedStyle(document.documentElement).getPropertyValue('--app-text-muted').trim() ||
        '#64748b'
      : '#64748b'
  tagListOrg.forEach((item) => {
    item.color = muted
  })

  tagList.value = tagListOrg;
  onReady();
};

// 初始化
const onReady = async () => {
  await nextTick();
  oList = tagcloudall.value;
  oA = oList.getElementsByTagName('a');

  mcList.value = [];
  for (let i = 0; i < oA.length; i++) {
    mcList.value.push({
      cx: 0, cy: 0, cz: 0,
      x: 0, y: 0, scale: 1, alpha: 1
    });
  }

  sineCosine(0, 0, 0);
  positionAll();

  // 鼠标事件
  oList.onmouseenter = () => state.active = true;
  oList.onmouseleave = () => state.active = false;
  oList.onmousemove = (e) => {
    const rect = oList.getBoundingClientRect();
    state.mouseX = e.clientX - rect.left - rect.width / 2;
    state.mouseY = e.clientY - rect.top - rect.height / 2;
  };

  // 启动流畅动画
  animationFrame = requestAnimationFrame(update);
};

onMounted(() => {
  query();
});

// 销毁动画
onUnmounted(() => {
  cancelAnimationFrame(animationFrame);
});
</script>

<style scoped>
.tagcloud-all {
  width: 100%;
  max-width: 250px;
  height: 240px;
  margin: 0 auto;
  position: relative;
  background: var(--app-surface-muted);
  border: 1px solid var(--blog-card-border);
  cursor: pointer;
}
.tagcloud-all a {
  position: absolute;
  font-weight: 400;
  text-decoration: none;
  transition: color 0.2s ease;
}
.tagcloud-all a:hover {
  color: var(--app-danger) !important;
  font-weight: bold;
}
</style>