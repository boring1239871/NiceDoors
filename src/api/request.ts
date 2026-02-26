import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse } from '../types';

// =============================================================================
// 配置
// =============================================================================
// const BASE_URL = 'http://localhost:8000'; // 开发环境
const BASE_URL = ''; // 生产环境

// =============================================================================
// 创建 axios 实例
// =============================================================================
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =============================================================================
// Token 存储键名
// =============================================================================
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// =============================================================================
// Token 存取方法
// =============================================================================
const getAccessToken = (): string | null => {
  return typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
};

const getRefreshToken = (): string | null => {
  return typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
};

export const setTokens = (accessToken: string, refreshTokenVal: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshTokenVal);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

// =============================================================================
// 刷新 Token 方法
// =============================================================================
const refreshToken = async (): Promise<boolean> => {
  const refreshTokenVal = getRefreshToken();
  if (!refreshTokenVal) return false;

  try {
    const response = await axios.post(`${BASE_URL}/auth/refresh`, {
      refreshToken: refreshTokenVal
    });

    if (response.data.code === 200 && response.data.data.accessToken) {
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      setTokens(accessToken, newRefreshToken);
      return true;
    }
  } catch (error) {
    console.log('%cToken 刷新失败，请重新登录', 'color: #ef4444; font-weight: bold;');
  }
  return false;
};

// =============================================================================
// 请求拦截器 - 自动添加 Token
// =============================================================================
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`%c[${config.method?.toUpperCase()}] ${config.baseURL}${config.url}`, 'color: #10b981; font-weight: bold;', config.data || '');
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =============================================================================
// 响应拦截器 - 统一处理错误
// =============================================================================
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`%c[${response.config.method?.toUpperCase()}] ${response.config.baseURL}${response.config.url} =>`, 'color: #10b981; font-weight: bold;', response.data);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // 401 或 403 错误，尝试刷新 Token
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      console.log('%cToken 过期，尝试刷新...', 'color: #f59e0b; font-weight: bold;');

      const success = await refreshToken();
      if (success) {
        // 重试原请求
        const token = getAccessToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      }
    }

    console.error(`%c[${originalRequest.method?.toUpperCase()}] ${originalRequest.baseURL}${originalRequest.url} => ERROR:`, 'color: #ef4444; font-weight: bold;', error.message);

    return Promise.reject(error);
  }
);

// =============================================================================
// HTTP 请求封装
// =============================================================================
const service = async <T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  try {
    const response = await axiosInstance(config);
    return response.data as ApiResponse<T>;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        return axiosError.response.data as ApiResponse<T>;
      } else if (axiosError.request) {
        return {
          code: 500,
          message: '网络连接失败，请检查网络',
          data: null as any
        };
      }
    }

    return {
      code: 500,
      message: error instanceof Error ? error.message : '未知错误',
      data: null as any
    };
  }
};

// =============================================================================
// 导出 HTTP 方法
// =============================================================================
export const http = {
  get: <T>(url: string, params?: any) =>
    service<T>({ method: 'GET', url, params }),

  post: <T>(url: string, data?: any) =>
    service<T>({ method: 'POST', url, data }),

  put: <T>(url: string, data?: any) =>
    service<T>({ method: 'PUT', url, data }),

  del: <T>(url: string) =>
    service<T>({ method: 'DELETE', url }),
};
