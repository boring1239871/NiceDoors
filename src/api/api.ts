
import { http, setTokens, clearTokens } from './request';
import { UserProfile, Order, Customer, OrderItem } from '../types';

// =============================================================================
// Auth Service
// =============================================================================
interface LoginResponse {
  accessToken: string;
  tokenType: string;
  refreshToken: string;
}

interface RefreshResponse {
  accessToken: string;
  tokenType: string;
  refreshToken: null;
}

export const login = async (email: string, password: string) => {
  const response = await http.post<LoginResponse>('/auth/login', { email, password });

  if (response.code === 200 && response.data) {
    setTokens(response.data.accessToken, response.data.refreshToken);
  }

  return response;
};

export const logout = () => {
  clearTokens();
};

export const refreshToken = async (refreshTokenVal: string) => {
  return http.post<RefreshResponse>('/auth/refresh', { refreshToken: refreshTokenVal });
};

// =============================================================================
// User Service (包含获取和更新用户资料)
// =============================================================================
export const fetchUserProfile = () => {
  return http.get<UserProfile>('/user/profile');
};

export const updateUserProfile = (data: Partial<UserProfile>) => {
  return http.put<{ success: boolean }>('/user/profile', data);
};

// =============================================================================
// Order Service
// =============================================================================

// 解析订单 items 字段（后端返回的是 JSON 字符串）
const parseOrderItems = (itemsStr: string): OrderItem[] => {
  if (!itemsStr) return [];
  try {
    return JSON.parse(itemsStr);
  } catch {
    return [];
  }
};

// 序列化订单 items 字段（发送到后端需要 JSON 字符串）
const serializeOrderItems = (items: OrderItem[]): string => {
  return JSON.stringify(items);
};

export const fetchOrderList = async () => {
  const response = await http.get<Order[]>('/orders');

  if (response.code === 200 && response.data) {
    response.data = response.data.map(order => ({
      ...order,
      items: typeof order.items === 'string' ? parseOrderItems(order.items as unknown as string) : order.items
    }));
  }

  return response;
};

export const createOrder = async (data: Order) => {
  const orderData = {
    ...data,
    items: serializeOrderItems(data.items)
  };
  return http.post<Order>('/orders', orderData);
};

export const updateOrder = async (id: string, data: Partial<Order>) => {
  const orderData = {
    ...data,
    items: data.items ? serializeOrderItems(data.items) : undefined
  };
  return http.put<Order>(`/orders/${id}`, orderData);
};

export const deleteOrder = (id: string) => {
  return http.del<null>(`/orders/${id}`);
};

// =============================================================================
// Customer Service
// =============================================================================
export const fetchCustomerList = () => {
  return http.get<Customer[]>('/customers');
};

export const createCustomer = (data: Customer) => {
  return http.post<Customer>('/customers', data);
};

export const updateCustomer = (id: string, data: Partial<Customer>) => {
  return http.put<{ success: boolean }>(`/customers/${id}`, data);
};

export const deleteCustomer = (id: string) => {
  return http.del<{ success: boolean }>(`/customers/${id}`);
};
