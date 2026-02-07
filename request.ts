import { ApiResponse } from './types';

// =============================================================================
// 配置
// =============================================================================
const BASE_URL = 'http://localhost:8000'; // Python FastAPI 后端地址
const USE_MOCK = false; // 设置为 true 使用 Mock 数据，false 使用真实后端

// =============================================================================
// Mock 数据（仅在 USE_MOCK=true 时使用）
// =============================================================================
let dbOrders: any[] = [];
let dbCustomers: any[] = [];
let dbUser: any = {};

if (USE_MOCK) {
  const { MOCK_ORDERS, MOCK_CUSTOMERS, MOCK_USER } = require('./constants');
  dbOrders = [...MOCK_ORDERS];
  dbCustomers = [...MOCK_CUSTOMERS];
  dbUser = { ...MOCK_USER };
}

// =============================================================================
// HTTP 请求配置
// =============================================================================
interface RequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  params?: any;
}

const getAuthToken = (): string | null => {
  return typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
};

/**
 * 真实 HTTP 请求处理器
 */
const realRequest = async <T>(config: RequestConfig): Promise<ApiResponse<T>> => {
  const { url, method, data } = config;

  console.log(`%c[${method}] ${BASE_URL}${url}`, 'color: #10b981; font-weight: bold;', data || '');

  try {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}${url}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          code: 401,
          message: 'Unauthorized',
          data: null as any
        };
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result as ApiResponse<T>;
  } catch (error) {
    console.error('Request failed:', error);
    return {
      code: 500,
      message: error instanceof Error ? error.message : 'Network Error',
      data: null as any
    };
  }
};

/**
 * Mock 请求处理器（模拟后端）
 */
const mockRequest = async <T>(config: RequestConfig): Promise<ApiResponse<T>> => {
  const { url, method, data } = config;

  console.log(`%c[MOCK ${method}] ${url}`, 'color: #f59e0b; font-weight: bold;', data || '');

  // 模拟网络延迟
  const delay = Math.floor(Math.random() * 400) + 200;
  await new Promise((resolve) => setTimeout(resolve, delay));

  return new Promise((resolve, reject) => {
    try {
      let responseData: any = null;

      // --- ROUTER: USER ---
      if (url === '/user/profile') {
        if (method === 'GET') responseData = dbUser;
        else if (method === 'PUT') {
          dbUser = { ...dbUser, ...data };
          responseData = dbUser;
        }
      }

      // --- ROUTER: ORDERS ---
      else if (url === '/orders') {
        if (method === 'GET') responseData = [...dbOrders];
        else if (method === 'POST') {
          const newOrder = { ...data, id: data.id || `ORD-${Date.now()}` };
          dbOrders.unshift(newOrder);
          responseData = newOrder;
        }
      }
      else if (url.match(/^\/orders\/.+/)) {
        const id = url.split('/')[2];
        if (method === 'PUT') {
          dbOrders = dbOrders.map(o => o.id === id ? { ...o, ...data } : o);
          responseData = dbOrders.find(o => o.id === id);
        }
        else if (method === 'DELETE') {
          dbOrders = dbOrders.filter(o => o.id !== id);
          responseData = { success: true };
        }
      }

      // --- ROUTER: CUSTOMERS ---
      else if (url === '/customers') {
        if (method === 'GET') responseData = [...dbCustomers];
        else if (method === 'POST') {
          const newCustomer = { ...data, id: data.id || `CUST-${Date.now()}` };
          dbCustomers.unshift(newCustomer);
          responseData = newCustomer;
        }
      }
      else if (url.match(/^\/customers\/.+/)) {
        const id = url.split('/')[2];
        if (method === 'PUT') {
          dbCustomers = dbCustomers.map(c => c.id === id ? { ...c, ...data } : c);
          responseData = dbCustomers.find(c => c.id === id);
        }
        else if (method === 'DELETE') {
          dbCustomers = dbCustomers.filter(c => c.id !== id);
          responseData = { success: true };
        }
      }

      resolve({
        code: 200,
        data: responseData as T,
        message: 'Success'
      });

    } catch (error) {
      reject({ code: 500, message: 'Server Error', data: null });
    }
  });
};

/**
 * 核心请求处理器（自动选择 Mock 或真实请求）
 */
const service = async <T>(config: RequestConfig): Promise<ApiResponse<T>> => {
  return USE_MOCK ? mockRequest<T>(config) : realRequest<T>(config);
};

// =============================================================================
// Exposed HTTP Methods (Axios-like Interface)
// =============================================================================
export const http = {
  get: <T>(url: string, params?: any) =>
    service<T>({ url, method: 'GET', params }),

  post: <T>(url: string, data?: any) =>
    service<T>({ url, method: 'POST', data }),

  put: <T>(url: string, data?: any) =>
    service<T>({ url, method: 'PUT', data }),

  del: <T>(url: string) =>
    service<T>({ url, method: 'DELETE' }),
};