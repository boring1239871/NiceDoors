
export enum ProductType {
  WINDOW = 'Window',
  DOOR = 'Door'
}

export interface ValidationRule {
  min: number;
  max: number;
}

export interface ProductRules {
  width: ValidationRule;
  height: ValidationRule;
  panels: ValidationRule;
  allowTransom: boolean;
  allowMullions: boolean;
}

export type FrameMaterial = 'aluminum' | 'broken_bridge' | 'upvc' | 'wood_clad' | 'steel';
export type ProfileColor = 'dark_grey' | 'white' | 'champagne' | 'black' | 'wood';
export type GlassType = 'single' | 'double' | 'triple' | 'laminated';

export interface ProductTemplate {
  id: string;
  name: string;
  type: ProductType;
  material: FrameMaterial;
  defaultSize: { width: number; height: number };
  defaultPanels: number;
  rules: ProductRules;
  thumbnail: string;
  profileWidth: number;
  basePricePerSqM: number;
}

export type SashType = 'fixed' | 'sliding' | 'casement' | 'tilt_turn' | 'awning' | 'hopper' | 'folding';
export type SashDirection = 'left' | 'right' | 'top' | 'bottom' | 'bi_left' | 'bi_right';

export interface PanelConfig {
  id: string;
  index: number;
  type: SashType;
  direction: SashDirection;
}

export interface CadModel {
  id: string;
  templateId: string;
  width: number;
  height: number;
  panels: number;
  panelConfigs: PanelConfig[];
  transomHeight: number;
  hasThreshold: boolean;
  thresholdHeight: number;
  profileColor: ProfileColor;
  glassType: GlassType;
  glassColor: string;
  showOpeningIndicators: boolean;
  enableMullions: boolean;
}

export interface CadValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

// --- Customer System Types ---
export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  remark?: string;
  createdAt: string;
}

// --- Customer Create Request ---
export interface CustomerCreate {
  name: string;
  phone: string;
  address?: string;
  remark?: string;
  createdAt?: string;
}

// --- Customer Update Request ---
export interface CustomerUpdate {
  name?: string;
  phone?: string;
  address?: string;
  remark?: string;
  createdAt?: string;
}

// --- Order System Types ---
export interface OrderItem {
  id: string;
  model: CadModel;
  templateName: string;
  thumbnailDataUrl: string;
  wireframeDataUrl?: string;
  quantity: number;
  unitPrice: number;
  area: number;
  totalPrice: number;
  remark?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  date: string;
  items: OrderItem[];
  totalAmount: number;
  paidAmount: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  orderNo?: string;
  balance?: number;
  note?: string;
}

// --- Order Create Request ---
export interface OrderCreate {
  customerName: string;
  customerPhone: string;
  address?: string;
  date: string;
  items: OrderItem[];
  totalAmount: number;
  paidAmount: number;
  status: string;
}

// --- Order Update Request ---
export interface OrderUpdate {
  customerName?: string;
  customerPhone?: string;
  address?: string;
  date?: string;
  items?: OrderItem[];
  totalAmount?: number;
  paidAmount?: number;
  status?: string;
}

// --- User System Types ---
export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

// --- User Update Request ---
export interface UserUpdate {
  name?: string;
  email?: string;
}

// --- API Response Types ---
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// --- Token Response ---
export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  refreshToken: string;
}

// --- 登录响应类型 ---
export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  refreshToken: string;
}

// --- Refresh Token Request ---
export interface RefreshTokenRequest {
  refreshToken: string;
}

