import { ProductTemplate, ProductType, Order, OrderItem, CadModel, Customer, UserProfile } from './types';

export const FRAME_PROFILE_WIDTH = 50; // mm
export const MULLION_WIDTH = 40; // mm
export const GLASS_PADDING = 5; // mm

// A simple placeholder SVG converted to Data URI for mock demonstration
const MOCK_THUMBNAIL = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzQ3NTU2OSIgc3Ryb2tlLXdpZHRoPSIxIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIyIiBmaWxsPSIjZjFmNWY5Ii8+PHBhdGggZD0iTTMgMTJoMThNMTIgM3YxOCIgc3Ryb2tlPSIjOTRhM2I4Ii8+PHBhdGggZD0iTTUgNWg1djVINXpNMTQgNWg1djVIMTR6TTUgMTRoNXY1SDV6TTE0IDE0aDV2NUgxNHoiIGZpbGw9IiNlMmU4ZjAiIG9wYWNpdHk9IjAuNSIvPjwvc3ZnPg==`;

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
    thumbnail: MOCK_THUMBNAIL,
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
    thumbnail: MOCK_THUMBNAIL,
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
    thumbnail: MOCK_THUMBNAIL,
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
    thumbnail: MOCK_THUMBNAIL,
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
    thumbnail: MOCK_THUMBNAIL,
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
    thumbnail: MOCK_THUMBNAIL,
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
    thumbnail: MOCK_THUMBNAIL,
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
    thumbnail: MOCK_THUMBNAIL,
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
    thumbnail: MOCK_THUMBNAIL,
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
    thumbnail: MOCK_THUMBNAIL,
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
    thumbnail: MOCK_THUMBNAIL,
    basePricePerSqM: 3500
  }
];

// Mock Helper to create a CadModel easily
const createMockModel = (tmplId: string, w: number, h: number, p: number, price: number): OrderItem => {
  const tmpl = PRODUCT_TEMPLATES.find(t => t.id === tmplId) || PRODUCT_TEMPLATES[0];
  const model: CadModel = {
    id: `m-${Math.random()}`,
    templateId: tmplId,
    width: w, height: h, panels: p,
    panelConfigs: Array(p).fill(null).map((_, i) => ({ id: `p${i}`, index: i, type: 'fixed', direction: 'left' })),
    transomHeight: 0, hasThreshold: true, thresholdHeight: 20,
    profileColor: 'dark_grey', glassType: 'double', glassColor: 'clear',
    showOpeningIndicators: true, enableMullions: true
  };
  return {
    id: `item-${Math.random()}`,
    model,
    templateName: tmpl.name,
    thumbnailDataUrl: MOCK_THUMBNAIL,
    quantity: 1,
    unitPrice: price,
    area: parseFloat(((w * h) / 1000000).toFixed(2)),
    totalPrice: price,
    remark: ''
  };
};

export const MOCK_USER: UserProfile = {
  name: 'Alex Engineer',
  email: 'alex@proframe.design',
  phone: '+86 138 1234 5678',
  avatar: 'https://ui-avatars.com/api/?name=Alex+Engineer&background=0D8ABC&color=fff',
  role: 'Designer',
  company: 'Future Windows Ltd.',
  plan: 'Pro'
};

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'CUST-001', name: '王先生', phone: '13812345678', address: '杭州市滨江区滨江壹号 3-1-1202', createdAt: '2023-12-01', remark: '老客户，喜欢深色' },
  { id: 'CUST-002', name: '李女士', phone: '13987654321', address: '北京市朝阳区阳光花园 8-201', createdAt: '2024-01-15', remark: '要求工期快' },
  { id: 'CUST-003', name: '张总', phone: '15000000000', address: '上海市浦东新区陆家嘴办公楼 18F', createdAt: '2024-01-20', remark: '企业客户' },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'd2b93e1b-2a8b-4c66-9f41-2e99b5f21c1f',
    customerName: '王先生',
    customerPhone: '13812345678',
    address: '杭州市滨江区滨江壹号 3-1-1202',
    date: '2024-01-25',
    items: [
      createMockModel('win-system-75', 1800, 1800, 2, 8500),
      createMockModel('door-sliding-120', 3600, 2400, 2, 12000)
    ],
    totalAmount: 20500,
    paidAmount: 5000,
    status: '生产中'
  },
  {
    id: 'b8e6d8d9-8b3c-4f6a-9a3f-0f4f0b2d6f1a',
    customerName: '李女士',
    customerPhone: '13987654321',
    address: '北京市朝阳区阳光花园 8-201',
    date: '2024-01-24',
    items: [
      createMockModel('win-upvc-60', 1200, 1400, 2, 2400),
      createMockModel('win-upvc-60', 1200, 1400, 2, 2400),
      createMockModel('door-casement-45', 800, 2100, 1, 1800)
    ],
    totalAmount: 6600,
    paidAmount: 6600, // Fully paid
    status: '已确认'
  },
  {
    id: '6f4ad8a2-1f6a-4d6c-8a7c-9b2f3c5d1e0f',
    customerName: '张总',
    customerPhone: '15000000000',
    address: '上海市浦东新区陆家嘴办公楼 18F',
    date: '2024-01-23',
    items: [
      createMockModel('door-entry', 1000, 2200, 1, 3500)
    ],
    totalAmount: 3500,
    paidAmount: 3500, // Fully paid
    status: '生产完成'
  }
];