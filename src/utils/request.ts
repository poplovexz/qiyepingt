import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';

const request = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  timeout: 5000
});

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      router.push('/login');
    }
    ElMessage.error(error.response.data.message || '请求失败');
    return Promise.reject(error);
  }
);

export default request;