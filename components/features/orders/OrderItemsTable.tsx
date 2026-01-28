import React, { useState } from 'react';
import { Order } from '../../../types';
import { Icons } from '../../ui/Icons';

interface OrderItemsTableProps {
  order: Order;
  onMetaChange: (key: 'customerName' | 'date', value: string) => void;
  onUpdateQty: (itemId: string, qty: number) => void;
  onUpdatePrice: (itemId: string, price: number) => void; // Added prop
  onDeleteItem: (itemId: string) => void;
  onSave: () => void;
  onBack: () => void;
}

export const OrderItemsTable: React.FC<OrderItemsTableProps> = ({ 
    order, onMetaChange, onUpdateQty, onUpdatePrice, onDeleteItem, onSave, onBack 
}) => {
    
  const formatPrice = (p: number) => p.toLocaleString('zh-CN', { minimumFractionDigits: 2 });
  
  // We'll store a set of IDs that are currently showing wireframe
  const [wireframeIds, setWireframeIds] = useState<Set<string>>(new Set());

  const toggleView = (id: string) => {
      const newSet = new Set(wireframeIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setWireframeIds(newSet);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* 1. Header Area */}
        <div className="p-8 pb-4 shrink-0 flex justify-between items-start">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <button onClick={onBack} className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 transition-all">
                        <Icons.Back />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">
                        {order.id.includes('ORD-') ? '编辑订单' : '创建新订单'}
                    </h1>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <span className="font-mono text-gray-500 bg-gray-200/50 px-2 py-0.5 rounded">{order.id}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${order.status === '已确认' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                        {order.status || '设计中'}
                    </span>
                </div>
            </div>

            <div className="flex gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-200">
                <div className="px-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">客户名称 <span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        value={order.customerName} 
                        onChange={(e) => onMetaChange('customerName', e.target.value)}
                        placeholder="输入客户姓名..."
                        className="w-48 bg-gray-50 border-none rounded-lg px-3 py-1.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
                <div className="w-px bg-gray-100 my-1"></div>
                <div className="px-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">日期</label>
                    <input 
                        type="date" 
                        value={order.date} 
                        onChange={(e) => onMetaChange('date', e.target.value)}
                        className="bg-gray-50 border-none rounded-lg px-3 py-1.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
            </div>
        </div>

        {/* 2. Main Table Area (The "Important" Part) */}
        <div className="flex-1 px-8 pb-4 overflow-hidden">
            <div className="w-full h-full bg-white rounded-[24px] shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        订单清单 ({order.items.length})
                    </h3>
                </div>

                <div className="flex-1 overflow-auto">
                    {order.items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-40">
                            <div className="text-6xl mb-4 grayscale">🏗️</div>
                            <p className="font-bold text-gray-500 text-lg">暂无产品</p>
                            <p className="text-sm text-gray-400 mt-2">请在左侧选型库配置产品并点击“加入清单”</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white sticky top-0 z-10 shadow-sm">
                                <tr className="text-xs text-gray-400 uppercase font-bold border-b border-gray-100">
                                    <th className="p-4 pl-6">缩略图</th>
                                    <th className="p-4">产品详情</th>
                                    <th className="p-4 text-center">尺寸 (mm)</th>
                                    <th className="p-4 text-center">配置</th>
                                    <th className="p-4 text-center">单价 (元)</th> {/* Added Header */}
                                    <th className="p-4 text-center">数量</th>
                                    <th className="p-4 text-right">小计</th>
                                    <th className="p-4 text-center w-16">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {order.items.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="p-4 pl-6 w-32">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-24 h-24 bg-white border border-gray-200 rounded-xl flex items-center justify-center overflow-hidden p-1 relative">
                                                    {item.thumbnailDataUrl ? (
                                                        <img 
                                                            src={wireframeIds.has(item.id) ? (item.wireframeDataUrl || item.thumbnailDataUrl) : item.thumbnailDataUrl} 
                                                            className="w-full h-full object-contain" 
                                                        />
                                                    ) : '🖼️'}
                                                </div>
                                                {item.wireframeDataUrl && (
                                                    <button 
                                                        onClick={() => toggleView(item.id)}
                                                        className="text-[10px] font-bold text-gray-400 hover:text-blue-600 border border-gray-200 rounded px-2 py-0.5 hover:bg-white transition-all"
                                                    >
                                                        {wireframeIds.has(item.id) ? '看效果图' : '看线稿'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-gray-800 text-base">{item.templateName}</div>
                                            <div className="text-xs text-gray-400 mt-1 font-mono">{item.id.split('-').pop()}</div>
                                        </td>
                                        <td className="p-4 text-center font-mono font-medium text-gray-600 bg-gray-50/50 rounded-lg mx-2">
                                            {item.model.width} x {item.model.height}
                                            <div className="text-[10px] text-gray-400 mt-0.5">{item.area} m²</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                                                {item.model.profileColor === 'white' ? '白色' : 
                                                 item.model.profileColor === 'black' ? '黑色' : 
                                                 item.model.profileColor === 'dark_grey' ? '深灰' : '其他'}
                                            </span>
                                        </td>
                                        
                                        {/* Editable Price Column */}
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center relative">
                                                <span className="absolute left-1 text-gray-400 text-xs font-bold">¥</span>
                                                <input 
                                                    type="number" 
                                                    min="0"
                                                    step="0.01"
                                                    value={item.unitPrice} 
                                                    onChange={(e) => onUpdatePrice(item.id, parseFloat(e.target.value) || 0)}
                                                    className="w-24 bg-white border border-gray-200 rounded-lg pl-5 pr-2 py-1 text-center font-bold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                                />
                                            </div>
                                        </td>

                                        <td className="p-4 text-center">
                                            <input 
                                                type="number" 
                                                min="1" 
                                                value={item.quantity} 
                                                onChange={(e) => onUpdateQty(item.id, parseInt(e.target.value))}
                                                className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1 text-center font-bold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                            />
                                        </td>
                                        <td className="p-4 text-right font-bold text-gray-900 text-base">
                                            ¥ {formatPrice(item.totalPrice)}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation(); // CRITICAL: Stop bubble
                                                    if(window.confirm('确认删除此项吗？')) {
                                                        onDeleteItem(item.id);
                                                    }
                                                }}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-white hover:bg-red-500 transition-all"
                                                title="删除"
                                            >
                                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>

        {/* 3. Footer Actions */}
        <div className="px-8 pb-8 shrink-0">
             <div className="bg-white rounded-[20px] shadow-lg shadow-gray-200/50 border border-gray-200 p-4 flex justify-between items-center">
                 <div className="flex items-center gap-6 px-4">
                     <div>
                         <div className="text-xs font-bold text-gray-400 uppercase">总数量</div>
                         <div className="text-xl font-bold text-gray-800">{order.items.reduce((a,c) => a + c.quantity, 0)} 套</div>
                     </div>
                     <div className="w-px h-8 bg-gray-100"></div>
                     <div>
                         <div className="text-xs font-bold text-gray-400 uppercase">订单总额</div>
                         <div className="text-3xl font-bold text-blue-600">¥ {formatPrice(order.totalAmount)}</div>
                     </div>
                 </div>

                 <div className="flex gap-3">
                     <button onClick={onBack} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all">
                         取消
                     </button>
                     <button 
                        onClick={onSave}
                        disabled={order.items.length === 0 || !order.customerName}
                        className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2 ${order.items.length > 0 && order.customerName ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30 active:scale-95' : 'bg-gray-300 cursor-not-allowed'}`}
                     >
                         <span>保存并确认订单</span>
                         <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                     </button>
                 </div>
             </div>
        </div>
    </div>
  );
};