import React, { useState } from 'react';
import { UserProfile, Order } from '../types';
import { ViewModule } from '../components/layout/NavigationRail';
import { printOrderContract, printOrderDrawings } from '../services/exportService';

interface DashboardViewProps {
  orders: Order[]; // CHANGED: Receive orders from parent state
  user: UserProfile;
  currentOrder: Order;
  setActiveModule: (module: ViewModule) => void;
  setSelectedTemplateId: (id: string) => void;
  // New props for CRUD
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
  onCreateNewOrder: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  orders, user, setActiveModule, onEditOrder, onDeleteOrder, onCreateNewOrder 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter Logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatPrice = (p: number) => p.toLocaleString('zh-CN', { minimumFractionDigits: 2 });

  return (
    <div className="p-8 max-w-[1920px] mx-auto w-full h-full flex flex-col animate-fade-in">
      
      {/* Header & Actions */}
      <div className="flex justify-between items-end mb-8 shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">订单管理</h2>
          <p className="text-gray-500 mt-1">管理所有客户订单、报价与生产进度。</p>
        </div>
        <div className="flex gap-4">
             {/* Search Bar */}
             <div className="relative group">
                <svg className="absolute left-3 top-3.5 text-gray-400" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input 
                  type="text" 
                  placeholder="搜索客户或单号..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl w-64 text-sm font-bold focus:w-80 transition-all outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                />
             </div>
             
             <button 
               onClick={onCreateNewOrder}
               className="bg-black text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-gray-200 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
             >
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m7-7H5"/></svg>
               新建订单
             </button>
        </div>
      </div>

      {/* Tabs / Filters */}
      <div className="flex gap-2 mb-6 shrink-0 overflow-x-auto">
        {['ALL', '设计中', '已确认', '生产中', '已完成'].map(status => (
          <button 
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${statusFilter === status ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
          >
            {status === 'ALL' ? '全部订单' : status}
          </button>
        ))}
      </div>

      {/* Order Table */}
      <div className="flex-1 bg-white rounded-[24px] shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold sticky top-0 z-10">
              <tr>
                <th className="p-5 pl-8">订单号 / 日期</th>
                <th className="p-5">客户信息</th>
                <th className="p-5 text-center">项目数</th>
                <th className="p-5 text-right">总金额</th>
                <th className="p-5 text-center">状态</th>
                <th className="p-5 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-400">
                    <div className="text-4xl mb-2">🔍</div>
                    没有找到符合条件的订单
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-5 pl-8">
                      <div className="font-mono font-bold text-gray-900">{order.id}</div>
                      <div className="text-xs text-gray-400 mt-1">{order.date}</div>
                    </td>
                    <td className="p-5">
                      <div className="font-bold text-gray-800">{order.customerName.split(' - ')[0]}</div>
                      <div className="text-xs text-gray-400 mt-1">{order.customerName.split(' - ')[1] || '无备注'}</div>
                    </td>
                    <td className="p-5 text-center">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">{order.items.length} 件</span>
                    </td>
                    <td className="p-5 text-right font-mono font-bold text-gray-900">
                      ¥ {formatPrice(order.totalAmount)}
                    </td>
                    <td className="p-5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        order.status === '已确认' ? 'bg-green-100 text-green-700 border-green-200' :
                        order.status === '生产中' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                        'bg-blue-100 text-blue-700 border-blue-200'
                      }`}>
                        {order.status || '设计中'}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-center gap-1 opacity-100">
                        {/* Contract Button - Now passes 'user' */}
                        <button 
                          onClick={() => printOrderContract(order, user)}
                          className="p-2 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all" 
                          title="打印合同/报价单"
                        >
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        </button>
                        
                        {/* Drawings Button - Now passes 'user' */}
                        <button 
                          onClick={() => printOrderDrawings(order, user)}
                          className="p-2 text-gray-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all" 
                          title="打印图纸附录"
                        >
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        </button>
                        
                        <div className="w-px h-4 bg-gray-300 mx-2"></div>

                        {/* Edit Button */}
                        <button 
                          onClick={() => onEditOrder(order)}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                          title="编辑详情"
                        >
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>

                        {/* Delete Button - ENSURING IT IS HERE */}
                        <button 
                          onClick={() => {
                              if (window.confirm(`确认要永久删除订单 ${order.id} 吗？\n此操作无法撤销。`)) {
                                  onDeleteOrder(order.id);
                              }
                          }}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="删除订单"
                        >
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></