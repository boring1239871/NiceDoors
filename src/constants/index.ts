import { ProductTemplate, ProductType } from '../types';

export const FRAME_PROFILE_WIDTH = 50; // mm
export const MULLION_WIDTH = 40; // mm
export const GLASS_PADDING = 5; // mm

const DEFAULT_THUMBNAIL = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzQ3NTU2OSIgc3Ryb2tlLXdpZHRoPSIxIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIyIiBmaWxsPSIjZjFmNWY5Ii8+PHBhdGggZD0iTTMgMTJoMThNMTIgM3YxOCIgc3Ryb2tlPSIjOTRhM2I4Ii8+PHBhdGggZD0iTTUgNWg1djVINXpNMTQgNWg1djVIMTR6TTUgMTRoNXY1SDV6TTE0IDE0aDV2NUgxNHoiIGZpbGw9IiNlMmU4ZjAiIG9wYWNpdHk9IjAuNSIvPjwvc3ZnPg==`;

export const ROUTES = {
  LOGIN: '/login',
  OVERVIEW: '/overview',
  ORDERS: '/orders',
  PRODUCTS: '/products',
  EDITOR: '/editor',
  DESIGNER: '/designer',
  CUSTOMERS: '/customers',
  PROFILE: '/profile',
};

export const PRODUCT_TEMPLATES: ProductTemplate[] = [
  // ======================
  // 窗类 (Windows)
  // ======================
  {
    id: 'win-system-75',
    name: '75系列 系统窗 (内开内倒)',
    type: ProductType.WINDOW,
    material: 'broken_bridge',
    profileWidth: 75,
    defaultSize: { width: 900, height: 1500 },
    defaultPanels: 1,
    rules: { width: { min: 600, max: 1800 }, height: { min: 800, max: 2400 }, panels: { min: 1, max: 2 }, allowTransom: true, allowMullions: true },
    thumbnail: DEFAULT_THUMBNAIL,
    basePricePerSqM: 1200
  },
  {
    id: 'win-casement-65',
    name: '65系列 断桥外开窗',
    type: ProductType.WINDOW,
    material: 'broken_bridge',
    profileWidth: 65,
    defaultSize: { width: 1200, height: 1400 },
    defaultPanels: 2,
    rules: { width: { min: 600, max: 2400 }, height: { min: 600, max: 2000 }, panels: { min: 1, max: 3 }, allowTransom: true, allowMullions: true },
    thumbnail: DEFAULT_THUMBNAIL,
    basePricePerSqM: 980
  },
  {
    id: 'win-upvc-60',
    name: '60系列 塑钢平开窗 (白色)',
    type: ProductType.WINDOW,
    material: 'upvc',
    profileWidth: 60,
    defaultSize: { width: 1200, height: 1400 },
    defaultPanels: 2,
    rules: { width: { min: 600, max: 2400 }, height: { min: 600, max: 2000 }, panels: { min: 1, max: 3 }, allowTransom: true, allowMullions: true },
    thumbnail: DEFAULT_THUMBNAIL,
    basePricePerSqM: 680
  },
  {
    id: 'win-sliding-80',
    name: '80系列 普铝推拉窗',
    type: ProductType.WINDOW,
    material: 'aluminum',
    profileWidth: 80,
    defaultSize: { width: 1500, height: 1200 },
    defaultPanels: 2,
    rules: { width: { min: 1000, max: 3000 }, height: { min: 800, max: 1800 }, panels: { min: 2, max: 4 }, allowTransom: true, allowMullions: false },
    thumbnail: DEFAULT_THUMBNAIL,
    basePricePerSqM: 800
  },
  {
    id: 'win-awning',
    name: '50系列 上悬窗 (Top Hung)',
    type: ProductType.WINDOW,
    material: 'aluminum',
    profileWidth: 50,
    defaultSize: { width: 800, height: 800 },
    defaultPanels: 1,
    rules: { width: { min: 500, max: 1500 }, height: { min: 500, max: 1200 }, panels: { min: 1, max: 1 }, allowTransom: false, allowMullions: false },
    thumbnail: DEFAULT_THUMBNAIL,
    basePricePerSqM: 950
  },
  {
    id: 'win-folding',
    name: '85系列 折叠窗 (全开启)',
    type: ProductType.WINDOW,
    material: 'broken_bridge',
    profileWidth: 85,
    defaultSize: { width: 2400, height: 1500 },
    defaultPanels: 3,
    rules: { width: { min: 1500, max: 4000 }, height: { min: 1000, max: 1800 }, panels: { min: 3, max: 6 }, allowTransom: false, allowMullions: false },
    thumbnail: DEFAULT_THUMBNAIL,
    basePricePerSqM: 1800
  },

  // ======================
  // 门类 (Doors)
  // ======================
  {
    id: 'door-sliding-120',
    name: '120系列 重型推拉门',
    type: ProductType.DOOR,
    material: 'aluminum',
    profileWidth: 120,
    defaultSize: { width: 2400, height: 2200 },
    defaultPanels: 2,
    rules: { width: { min: 1600, max: 6000 }, height: { min: 1900, max: 3000 }, panels: { min: 2, max: 4 }, allowTransom: true, allowMullions: false },
    thumbnail: DEFAULT_THUMBNAIL,
    basePricePerSqM: 1500
  },
  {
    id: 'door-lift-sliding',
    name: '150系列 提升推拉门 (高端)',
    type: ProductType.DOOR,
    material: 'broken_bridge',
    profileWidth: 150,
    defaultSize: { width: 3000, height: 2400 },
    defaultPanels: 2,
    rules: { width: { min: 2000, max: 6000 }, height: { min: 2000, max: 3000 }, panels: { min: 2, max: 2 }, allowTransom: false, allowMullions: false },
    thumbnail: DEFAULT_THUMBNAIL,
    basePricePerSqM: 2800
  },
  {
    id: 'door-casement-45',
    name: '45系列 极简平开门',
    type: ProductType.DOOR,
    material: 'aluminum',
    profileWidth: 45,
    defaultSize: { width: 800, height: 2100 },
    defaultPanels: 1,
    rules: { width: { min: 600, max: 1000 }, height: { min: 1900, max: 2400 }, panels: { min: 1, max: 1 }, allowTransom: true, allowMullions: false },
    thumbnail: DEFAULT_THUMBNAIL,
    basePricePerSqM: 1100
  },
  {
    id: 'door-folding-75',
    name: '75系列 折叠门',
    type: ProductType.DOOR,
    material: 'broken_bridge',
    profileWidth: 75,
    defaultSize: { width: 3000, height: 2400 },
    defaultPanels: 3,
    rules: { width: { min: 1800, max: 8000 }, height: { min: 2000, max: 3000 }, panels: { min: 3, max: 8 }, allowTransom: true, allowMullions: false },
    thumbnail: DEFAULT_THUMBNAIL,
    basePricePerSqM: 2200
  },
  {
    id: 'door-entry',
    name: '100系列 铝木装甲门',
    type: ProductType.DOOR,
    material: 'wood_clad',
    profileWidth: 100,
    defaultSize: { width: 1000, height: 2200 },
    defaultPanels: 1,
    rules: { width: { min: 900, max: 1200 }, height: { min: 2000, max: 2600 }, panels: { min: 1, max: 1 }, allowTransom: true, allowMullions: false },
    thumbnail: DEFAULT_THUMBNAIL,
    basePricePerSqM: 3500
  }
];
