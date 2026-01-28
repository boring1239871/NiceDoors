
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
}

export interface Order {
  id: string;
  customerName: string;
  date: string;
  items: OrderItem[];
  totalAmount: number;
  status?: string;
}

// --- User System Types ---
export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  role: 'Designer' | 'Admin';
  company: string;
  plan: 'Pro' | 'Enterprise' | 'Free';
}