import { get } from '@/utils/request';

export const test = {
  // GET 请求示例：获取用户信息
    getUserInfo() {
        return get('/test/get'); // 参数通过 params 传递
    }
};