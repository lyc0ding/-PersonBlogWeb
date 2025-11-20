import axios from "axios";

const service = axios.create({
    // baseURL:import.meta.env.DEV ? '/api' : 'https://prod-api.com', // 判断为开发环境则直接使用'/api'作为基础路径
    // baseURL:'http://localhost:5959/',
    baseURL:'/api',
    timeout:10000,   //请求超时时间
    timeoutErrorMessage:'请求发送超时'   // 请求超时发送提示

})

// 配置请求拦截器
service.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }
)

// 配置响应拦截器
service.interceptors.response.use(
    response => response.data, // 直接返回响应数据
    error => {
      // 根据 HTTP 状态码提示错误
      let message = '';
      switch (error.response?.status) {
          case 401: message = '未授权'; break;
          case 404: message = '资源不存在'; break;
          case 500: message = '服务器错误'; break;
          default: message = '请求失败';
      }
      console.error(message);
      return Promise.reject(error);
    }
)

// params不传参默认为null，否则为传入参数
export function get(url,params=null) {
  return service({
    url,
    method: 'get',
    params, // GET 参数放在 params
  });
}

export function post(url,data={}) {
  return service({
    url,
    method: 'post',
    data, // GET 参数放在 params
  });
}