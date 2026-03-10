
import { http, setTokens, clearTokens } from './request';
import { UserProfile, Order, Customer, OrderItem, LoginResponse, TokenResponse, UserUpdate, OrderCreate, OrderUpdate, CustomerCreate, CustomerUpdate } from '../types';

// API 缓存机制
interface CacheItem {
  data: any;
  timestamp: number;
}

const cache: Record<string, CacheItem> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 检查缓存是否有效
const isCacheValid = (key: string): boolean => {
  const item = cache[key];
  if (!item) return false;
  return Date.now() - item.timestamp < CACHE_DURATION;
};

// 获取缓存数据
const getCache = (key: string): any => {
  if (isCacheValid(key)) {
    return cache[key].data;
  }
  // 缓存过期，删除
  delete cache[key];
  return null;
};

// 设置缓存数据
const setCache = (key: string, data: any): void => {
  cache[key] = {
    data,
    timestamp: Date.now()
  };
};

// 清除缓存
const clearCache = (key?: string): void => {
  if (key) {
    delete cache[key];
  } else {
    // 清除所有缓存
    Object.keys(cache).forEach(k => delete cache[k]);
  }
};

// 清除相关缓存
const clearRelatedCache = (relatedKeys: string[]): void => {
  relatedKeys.forEach(key => delete cache[key]);
};

// =============================================================================
// Auth Service
// =============================================================================
// app调用
export const login = async (email: string, password: string) => {
  const response = await http.post<LoginResponse>('/auth/login', { email, password });

  if (response.code === 200 && response.data) {
    setTokens(response.data.accessToken, response.data.refreshToken);
  }

  return response;
};
// app调用
export const logout = () => {
  clearTokens();
};
// app调用
export const refreshToken = async (refreshTokenVal: string) => {
  return http.post<TokenResponse>('/auth/refresh', { refreshToken: refreshTokenVal });
};

// =============================================================================
// User Service (包含获取和更新用户资料)
// =============================================================================
// app调用
export const fetchUserProfile = async () => {
  const CACHE_KEY = 'user/profile';

  // 检查缓存
  const cachedData = getCache(CACHE_KEY);
  if (cachedData) {
    return cachedData;
  }

  const response = await http.get<UserProfile>('/user/profile');

  // 设置缓存
  if (response.code === 200) {
    setCache(CACHE_KEY, response);
  }

  return response;
};
// ProfileVuew页面调用
export const updateUserProfile = async (data: UserUpdate) => {
  const response = await http.put<{ success: boolean }>('/user/profile', data);

  // 更新成功后清除用户资料缓存
  if (response.code === 200) {
    clearCache('user/profile');
  }

  return response;
};

// =============================================================================
// Order Service
// =============================================================================

//辅助函数： 解析订单 items 字段（后端返回的是 JSON 字符串）
const parseOrderItems = (itemsStr: string): OrderItem[] => {
  if (!itemsStr) return [];
  try {
    return JSON.parse(itemsStr);
  } catch {
    return [];
  }
};

//辅助函数： 序列化订单 items 字段（发送到后端需要 JSON 字符串）
const serializeOrderItems = (items: OrderItem[]): string => {
  return JSON.stringify(items);
};

//app调用
export const fetchOrderList = async () => {
  const CACHE_KEY = 'orders';

  // 检查缓存
  const cachedData = getCache(CACHE_KEY);
  if (cachedData) {
    return cachedData;
  }

  const response = await http.get<Order[]>('/orders');

  if (response.code === 200 && response.data) {
    response.data = response.data.map(order => ({
      ...order,
      items: typeof order.items === 'string' ? parseOrderItems(order.items as unknown as string) : order.items
    }));

    // 设置缓存
    setCache(CACHE_KEY, response);
  }

  return response;
};

//app调用
export const createOrder = async (data: OrderCreate) => {
  const orderData = {
    ...data,
    items: serializeOrderItems(data.items)
  };
  const response = await http.post<Order>('/orders', orderData);

  // 创建成功后清除订单列表缓存
  if (response.code === 200) {
    clearCache('orders');
  }

  return response;
};
//app调用
export const updateOrder = async (id: string, data: OrderUpdate) => {
  const orderData = {
    ...data,
    items: data.items ? serializeOrderItems(data.items) : undefined
  };
  const response = await http.put<Order>(`/orders/${id}`, orderData);

  // 更新成功后清除订单列表缓存
  if (response.code === 200) {
    clearCache('orders');
  }

  return response;
};
//app调用
export const deleteOrder = async (id: number) => {
  const response = await http.del<null>(`/orders/${id}`);

  // 删除成功后清除订单列表缓存
  if (response.code === 200) {
    clearCache('orders');
  }

  return response;
};

// =============================================================================
// Customer Service
// =============================================================================
//app调用
export const fetchCustomerList = async () => {
  const CACHE_KEY = 'customers';

  // 检查缓存
  const cachedData = getCache(CACHE_KEY);
  if (cachedData) {
    return cachedData;
  }

  const response = await http.get<Customer[]>('/customers');

  // 设置缓存
  if (response.code === 200) {
    setCache(CACHE_KEY, response);
  }

  return response;
};
//app调用
export const createCustomer = async (data: CustomerCreate) => {
  const response = await http.post<Customer>('/customers', data);

  // 创建成功后清除客户列表缓存
  if (response.code === 200) {
    clearCache('customers');
  }

  return response;
};
//app调用
export const updateCustomer = async (id: string, data: CustomerUpdate) => {
  const response = await http.put<{ success: boolean }>(`/customers/${id}`, data);

  // 更新成功后清除客户列表缓存
  if (response.code === 200) {
    clearCache('customers');
  }

  return response;
};
//app调用
export const deleteCustomer = async (id: string) => {
  const response = await http.del<{ success: boolean }>(`/customers/${id}`);

  // 删除成功后清除客户列表缓存
  if (response.code === 200) {
    clearCache('customers');
  }

  return response;
};

//app调用
export const checkCustomerExists = async (phone: string) => {
  return http.get<{ exists: boolean }>(`/customers/exists/${phone}`);
};
