
import { http } from './request';
import { UserProfile, Order, Customer } from './types';

// =============================================================================
// Auth Service
// =============================================================================
export const login = (email: string, password: string) => {
  return http.post<{ access_token: string; token_type: string; user: UserProfile }>(
    '/auth/login',
    { email, password }
  );
};

export const fetchCurrentUser = () => {
  return http.get<UserProfile>('/auth/me');
};

// =============================================================================
// User Service
// =============================================================================
export const fetchUserProfile = () => {
  return http.get<UserProfile>('/user/profile');
};

export const updateUserProfile = (data: Partial<UserProfile>) => {
  return http.put<UserProfile>('/user/profile', data);
};

// =============================================================================
// Order Service
// =============================================================================
export const fetchOrderList = () => {
  return http.get<Order[]>('/orders');
};

export const createOrder = (data: Order) => {
  return http.post<Order>('/orders', data);
};

export const updateOrder = (id: string, data: Partial<Order>) => {
  return http.put<Order>(`/orders/${id}`, data);
};

export const deleteOrder = (id: string) => {
  return http.del<void>(`/orders/${id}`);
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
  return http.put<Customer>(`/customers/${id}`, data);
};

export const deleteCustomer = (id: string) => {
  return http.del<void>(`/customers/${id}`);
};
