// 配合路由守卫，设置页面顶部加载进度条
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// 基础配置（按需调整）
NProgress.configure({
  easing: "ease",       // 动画缓动效果
  speed: 500,           // 进度条递增速度(ms)
  showSpinner: false,   // 隐藏加载动画
  trickleSpeed: 200,    // 自动递增间隔(ms)
  minimum: 0.3          // 初始进度最小值
});

// 暴露方法
export const start = () => NProgress.start();
export const done = () => NProgress.done();
export const set = (n) => NProgress.set(n); // 可选：手动设置进度