/**
 * API Client Wrapper
 * -----------------
 * Simulates a robust HTTP client (like axios) with interceptors and mock delays.
 */

export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

const MOCK_DELAY = 600;

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async request<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, data?: any): Promise<ApiResponse<T>> {
    console.log(`[API Mock] ${method} ${url}`, data || '');

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: data as T, // Mock: echoing data back
          message: 'Success'
        });
      }, MOCK_DELAY);
    });
  }

  get<T>(url: string, params?: any) {
    return this.request<T>('GET', url, params);
  }

  post<T>(url: string, data?: any) {
    return this.request<T>('POST', url, data);
  }

  put<T>(url: string, data?: any) {
    return this.request<T>('PUT', url, data);
  }

  delete<T>(url: string) {
    return this.request<T>('DELETE', url);
  }
}

export const client = new ApiClient();
