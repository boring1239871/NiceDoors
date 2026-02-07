import React, { useState, useRef, useEffect } from 'react';
import { Order, Customer } from '../../types';
import { Icons } from '../common/Icons';
import { useFeedback } from '../common/FeedbackContext';

interface OrderItemsTableProps {
  order: Order;
  customers: Customer[]; // Receive available customers
  onMetaChange: (key: 'customerName' | 'customerPhone' | 'address' | 'date' | 'paidAmount' | 'status', value: string | number) => void;
  onBatchMetaChange: (updates: Partial<Order>) => void; // New prop for batch updates
  onUpdateQty: (itemId: string, qty: number) => void;
  onUpdatePrice: (itemId: string, price: number) => void;
  onUpdateRemark: (itemId: string, remark: string) => void;
  onDeleteItem: (itemId: string) => void;
  onSave: () => void;
  onBack: () => void;
  onAddNewItem: () => void;
  onPreviewImage: (url: string) => void;
}

export const OrderItemsTable: React.FC<OrderItemsTableProps> = ({ order, customers, onMetaChange, onBatchMetaChange, onUpdateQty, onUpdatePrice, onUpdateRemark, onDeleteItem, onSave, onBack, onAddNewItem, onPreviewImage }) => {
  const { confirm } = useFeedback();  
  const formatPrice = (p: number) => p.toLocaleString('zh-CN', { minimumFractionDigits: 2 });
  const [wireframeIds, setWireframeIds] = useState<Set<string>>(new Set());
  
  // Combobox State
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const comboRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (comboRef.current && !comboRef.current.contains(event.target as Node)) {
              setIsCustomerOpen(false);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Toggle between realistic and wireframe thumbnail logic
  const toggleView = (e: React.MouseEvent, id: string) => { 
      e.stopPropagation();
      const newSet = new Set(wireframeIds); 
      if (newSet.has(id)) newSet.delete(id); 
      else newSet.add(id); 
      setWireframeIds(newSet); 
  };

  const handleCustomerSelect = (customer: Customer) => {
      // Fix: Use batch update to ensure all fields are reflected in input boxes
      onBatchMetaChange({
          customerName: customer.name,
          customerPhone: customer.phone,
          address: customer.address
      });
      setIsCustomerOpen(false);
      setCustomerSearch(''); // Reset search
  };

  const filteredCustomers = customers.filter(c => 
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
      c.phone.includes(customerSearch)
  );

  const paid = order.paidAmount || 0;
  const isSettled = paid >= order.totalAmount;
  const remaining = order.totalAmount - paid;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#F3F6F9] dark:bg-black">
        
        {/* 1. Top Navigation Bar */}
        <div className="h-16 px-8 flex items-center justify-between bg-white dark:bg-[#1e1f20] border-b border-gray-200 dark:border-gray-800 shrink-0 z-20 shadow-sm">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                    <Icons.Back />
                    <span className="text-sm font-bold">返回列表</span>
                </button>
                <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
                <div className="text-sm font-bold text-gray-800 dark:text-white">
                    订单详情
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                 <div className="text-right hidden sm:block">
                     <span className="text-xs font-bold text-gray-400 uppercase mr-2">当前总额</span>
                     <span className="text-xl font-bold text-gray-900 dark:text-white font-mono">¥ {formatPrice(order.totalAmount)}</span>
                 </div>
            </div>
        </div>

        {/* 2. Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
            {/* Added extra generous padding-bottom (pb-48) to ensure the floating bar never covers the last item */}
            <div className="max-w-6xl mx-auto p-6 md:p-8 pb-48 space-y-6">
                
                {/* A. Customer Information & Status Card */}
                <div className="bg-white dark:bg-[#1e1f20] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 animate-slide-in-up overflow-visible">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                        <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <Icons.DocumentText /> 订单基础信息
                        </h2>
                        <div className="flex items-center gap-4">
                            {/* Professional Combobox for Customer Select */}
                            <div className="relative" ref={comboRef}>
                                <button 
                                    onClick={() => setIsCustomerOpen(!isCustomerOpen)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-100 dark:border-blue-800"
                                >
                                    <Icons.UserGroup />
                                    <span className="text-xs font-bold">从客户库选择</span>
                                    <svg className={`w-3 h-3 transition-transform ${isCustomerOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                </button>

                                {isCustomerOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#2c2c2e] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-fade-in-down">
                                        <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                                            <div className="relative">
                                                <div className="absolute left-2.5 top-2.5 text-gray-400"><Icons.Search /></div>
                                                <input 
                                                    type="text" 
                                                    autoFocus
                                                    placeholder="搜索姓名或电话..." 
                                                    value={customerSearch}
                                                    onChange={(e) => setCustomerSearch(e.target.value)}
                                                    className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-[#1e1f20] border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500/50 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                                            {filteredCustomers.length === 0 ? (
                                                <div className="p-4 text-center text-xs text-gray-400">未找到相关客户</div>
                                            ) : (
                                                filteredCustomers.map(c => (
                                                    <button 
                                                        key={c.id} 
                                                        onClick={() => handleCustomerSelect(c)}
                                                        className="w-full text-left px-3 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors group"
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <div className="font-bold text-sm text-gray-800 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300">{c.name}</div>
                                                            <div className="text-[10px] text-gray-400 font-mono">{c.phone}</div>
                                                        </div>
                                                        <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">{c.address}</div>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-[#2c2c2e] rounded-lg border border-gray-200 dark:border-gray-700">
                                <span className="text-xs text-gray-500">编号:</span>
                                <span className="font-mono text-xs font-bold text-gray-700 dark:text-gray-300">{order.id}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Customer Name */}
                        <div className="space-y-2 md:col-span-1">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">客户名称 <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                value={order.customerName} 
                                onChange={(e) => onMetaChange('customerName', e.target.value)} 
                                placeholder="输入客户姓名..." 
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#2c2c2e] border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>

                         {/* Customer Phone */}
                         <div className="space-y-2 md:col-span-1">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">联系电话</label>
                            <input 
                                type="text" 
                                value={order.customerPhone || ''} 
                                onChange={(e) => onMetaChange('customerPhone', e.target.value)} 
                                placeholder="输入联系方式..." 
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#2c2c2e] border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>

                        {/* Status (Select) */}
                        <div className="space-y-2 md:col-span-1">
                             <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">生产状态</label>
                             <div className="relative">
                                 <select 
                                    value={order.status || '已确认'}
                                    onChange={(e) => onMetaChange('status', e.target.value)}
                                    className="w-full appearance-none px-4 py-3 bg-gray-50 dark:bg-[#2c2c2e] border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                 >
                                     <option value="已确认">已确认 (Confirmed)</option>
                                     <option value="生产中">生产中 (In Production)</option>
                                     <option value="生产完成">生产完成 (Completed)</option>
                                     <option value="已结清">已结清 (Settled)</option>
                                 </select>
                                 <div className="absolute right-3 top-3.5 pointer-events-none text-gray-500">
                                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
                                 </div>
                             </div>
                        </div>

                        {/* Payment (Input) */}
                        <div className="space-y-2 md:col-span-1">
                             <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">已收款金额</label>
                             <div className="relative">
                                 <span className="absolute left-4 top-3 text-gray-500 font-bold">¥</span>
                                 <input 
                                    type="number" 
                                    value={paid}
                                    onChange={(e) => onMetaChange('paidAmount', parseFloat(e.target.value) || 0)}
                                    className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-[#2c2c2e] border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                 />
                             </div>
                        </div>
                        
                        {/* Address (Full Width) */}
                        <div className="space-y-2 md:col-span-3">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">工程地址</label>
                            <input 
                                type="text" 
                                value={order.address || ''} 
                                onChange={(e) => onMetaChange('address', e.target.value)} 
                                placeholder="输入详细安装地址..." 
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#2c2c2e] border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>

                        {/* Summary Display */}
                        <div className="md:col-span-1 flex flex-col justify-end">
                            <div className={`h-[48px] px-4 rounded-xl border flex items-center justify-between font-bold text-sm ${isSettled ? 'bg-green-50 dark:bg-green-900/20 border-green-200 text-green-700' : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 text-orange-700'}`}>
                                <span>{isSettled ? '✅ 已结清' : '⏳ 未结清'}</span>
                                {!isSettled && <span>欠: ¥{formatPrice(remaining)}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* B. Order Items List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <Icons.Box /> 产品清单 ({order.items.length})
                        </h2>
                    </div>

                    {order.items.map((item, index) => (
                        <div key={item.id} className="group flex flex-col md:flex-row gap-6 p-6 bg-white dark:bg-[#1e1f20] rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg transition-all animate-fade-in-up">
                            
                            {/* Left: Thumbnail & Basic Info */}
                            <div className="flex gap-5 flex-1 min-w-0">
                                <div 
                                    className="relative w-32 h-32 bg-[#f8fafc] dark:bg-[#2c2c2e] rounded-xl border border-gray-100 dark:border-gray-700 p-2 shrink-0 overflow-hidden cursor-zoom-in group-hover:border-blue-200 transition-colors" 
                                    onClick={() => onPreviewImage(wireframeIds.has(item.id) ? (item.wireframeDataUrl || item.thumbnailDataUrl) : item.thumbnailDataUrl)}
                                >
                                    {item.thumbnailDataUrl ? (
                                        <img src={wireframeIds.has(item.id) ? (item.wireframeDataUrl || item.thumbnailDataUrl) : item.thumbnailDataUrl} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                                    ) : <span className="text-3xl flex items-center justify-center h-full text-gray-300"><Icons.Box /></span>}
                                    <div className="absolute bottom-2 right-2">
                                        <button 
                                            onClick={(e) => toggleView(e, item.id)}
                                            className="px-2 py-1 bg-black/60 hover:bg-black/80 text-white text-[10px] font-bold rounded backdrop-blur-sm transition-opacity"
                                        >
                                            {wireframeIds.has(item.id) ? '看效果' : '看线稿'}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col flex-1 min-w-0 justify-between py-1">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <div className="font-bold text-gray-800 dark:text-white text-lg truncate pr-4">{item.templateName}</div>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); confirm({ title: '删除', content: '确定移除此项？', isDestructive: true }).then(ok => ok && onDeleteItem(item.id)); }} 
                                                className="text-gray-300 hover:text-red-500 transition-colors"
                                            >
                                                <Icons.Logout />
                                            </button>
                                        </div>
                                        <div className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-1">
                                            {item.model.width}mm × {item.model.height}mm · {item.area}m² · {item.model.panels}扇
                                        </div>
                                        <div className="mt-2 flex gap-2 flex-wrap">
                                            <span className="inline-block px-2 py-1 rounded text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                                {item.model.profileColor === 'white' ? '⚪ 白色' : item.model.profileColor === 'black' ? '⚫ 黑色' : item.model.profileColor === 'champagne' ? '🟡 香槟' : item.model.profileColor === 'wood' ? '🟤 木纹' : '🌑 深灰'}
                                            </span>
                                            <span className="inline-block px-2 py-1 rounded text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                                {item.model.glassType === 'single' ? '单玻' : item.model.glassType === 'double' ? '双玻' : item.model.glassType === 'triple' ? '三玻' : '夹胶'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Remarks Input */}
                                    <div className="mt-3">
                                        <input 
                                            type="text" 
                                            placeholder="添加备注 (例如: 卧室窗户, 需要加急...)" 
                                            value={item.remark || ''}
                                            onChange={(e) => onUpdateRemark(item.id, e.target.value)}
                                            className="w-full bg-yellow-50 dark:bg-yellow-900/10 border-b border-yellow-200 dark:border-yellow-800/30 text-xs text-gray-600 dark:text-gray-300 py-1 px-2 focus:outline-none focus:border-yellow-400 transition-colors placeholder:text-gray-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right: Friendly Edit Zone (Qty & Price) */}
                            <div className="w-full md:w-64 shrink-0 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 pt-4 md:pt-0 md:pl-6 gap-5">
                                
                                {/* 1. Quantity Control */}
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-400 uppercase">数量</label>
                                    <div className="flex items-center bg-gray-50 dark:bg-[#2c2c2e] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                                        <button onClick={() => onUpdateQty(item.id, item.quantity - 1)} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-white dark:hover:bg-gray-600 hover:text-blue-600 transition-colors active:scale-95 text-lg font-bold">-</button>
                                        <input type="number" value={item.quantity} onChange={(e) => onUpdateQty(item.id, parseInt(e.target.value))} className="w-12 text-center bg-transparent text-base font-bold outline-none appearance-none m-0 text-gray-800 dark:text-white" />
                                        <button onClick={() => onUpdateQty(item.id, item.quantity + 1)} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-white dark:hover:bg-gray-600 hover:text-blue-600 transition-colors active:scale-95 text-lg font-bold">+</button>
                                    </div>
                                </div>

                                {/* 2. Unit Price Control */}
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-400 uppercase">单价</label>
                                    <div className="flex items-center gap-1 group/price">
                                        <span className="text-gray-400 font-medium">¥</span>
                                        <input 
                                            type="number" 
                                            value={item.unitPrice} 
                                            onChange={(e) => onUpdatePrice(item.id, parseFloat(e.target.value))} 
                                            className="w-24 text-right bg-transparent border-b border-dashed border-gray-300 dark:border-gray-600 focus:border-blue-500 font-bold text-lg text-gray-700 dark:text-gray-300 outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* 3. Subtotal */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <label className="text-xs font-bold text-gray-400 uppercase">小计</label>
                                    <span className="text-xl font-bold text-gray-900 dark:text-white">¥ {formatPrice(item.totalPrice)}</span>
                                </div>

                            </div>

                        </div>
                    ))}
                    
                    {/* Add Product Button */}
                    <button 
                        onClick={onAddNewItem}
                        className="w-full py-6 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-400 dark:hover:border-blue-600 transition-all group flex flex-col items-center justify-center gap-2 cursor-pointer mt-4"
                    >
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-[#2c2c2e] shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-400 group-hover:text-blue-500 group-hover:scale-110 transition-all">
                            <Icons.Plus />
                        </div>
                        <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400">添加新产品</span>
                    </button>
                </div>
            </div>
        </div>

        {/* 3. Floating Bottom Action Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-4xl px-4">
             <div className="bg-white/90 dark:bg-[#1e1f20]/90 backdrop-blur-md rounded-full shadow-[0_8px_40px_rgba(0,0,0,0.15)] border border-gray-200 dark:border-gray-700 p-2 pl-8 flex justify-between items-center">
                 <div className="flex items-center gap-8">
                     <div className="hidden sm:flex flex-col">
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">总数量</span>
                         <span className="text-lg font-bold text-gray-800 dark:text-white leading-none">{order.items.reduce((a,c) => a + c.quantity, 0)} <span className="text-xs font-normal text-gray-500">套</span></span>
                     </div>
                     <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                     <div className="flex flex-col">
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">订单总额</span>
                         <span className="text-xl font-bold text-[#0b57d0] dark:text-[#a8c7fa] leading-none">¥ {formatPrice(order.totalAmount)}</span>
                     </div>
                 </div>
                 <div className="flex gap-2">
                     <button onClick={onBack} className="px-6 py-3 rounded-full font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] transition-all text-sm">取消</button>
                     <button 
                        onClick={onSave} 
                        disabled={order.items.length === 0 || !order.customerName} 
                        className={`px-8 py-3 rounded-full font-bold text-white shadow-lg transition-all flex items-center gap-2 text-sm ${order.items.length > 0 && order.customerName ? 'bg-[#0b57d0] hover:bg-[#0842a0] dark:bg-[#a8c7fa] dark:hover:bg-[#8ab4f8] dark:text-[#0b57d0] shadow-blue-500/30 active:scale-95' : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'}`}
                    >
                        <span>保存订单</span>
                        <Icons.Check />
                    </button>
                 </div>
             </div>
        </div>
    </div>
  );
};