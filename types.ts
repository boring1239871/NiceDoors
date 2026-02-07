
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

// 新增：材质枚举
export type FrameMaterial = 'aluminum' | 'broken_bridge' | 'upvc' | 'wood_clad' | 'steel';

// 新增：型材颜色
export type ProfileColor = 'dark_grey' | 'white' | 'champagne' | 'black' | 'wood';

// 新增：玻璃类型
export type GlassType = 'single' | 'double' | 'triple' | 'laminated';

export interface ProductTemplate {
  id: string;
  name: string;
  type: ProductType;
  material: FrameMaterial; // 默认材质
  defaultSize: { width: number; height: number };
  defaultPanels: number;
  rules: ProductRules;
  thumbnail: string;
  profileWidth: number;
  basePricePerSqM: number; // 新增：每平米基础价格
}

// 扩展：增加折叠等类型
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

  // 新增外观属性
  profileColor: ProfileColor;
  glassType: GlassType;
  glassColor: string;
  
  showOpeningIndicators: boolean;
  
  // New property for toggling mullions
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

// --- Order System Types ---

export interface OrderItem {
  id: string;
  model: CadModel;
  templateName: string;
  thumbnailDataUrl: string; // Base64 image (Realistic)
  wireframeDataUrl?: string; // Base64 image (Wireframe) - NEW
  quantity: number;
  unitPrice: number;
  area: number; // m2
  totalPrice: number;
  remark?: string; // New: Item specific remark
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone?: string; // New
  address?: string; // New
  date: string;
  items: OrderItem[];
  totalAmount: number;
  paidAmount?: number; // New: Track payments
  status?: string; // '已确认' | '生产中' | '生产完成'
}

// --- User System Types ---
export interface UserProfile {
  name: string;
  email: string;
  phone?: string; // Added phone field
  avatar: string;
  role: 'Designer' | 'Admin';
  company: string;
  plan: 'Pro' | 'Enterprise' | 'Free';
}

// --- API Response Types ---
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}