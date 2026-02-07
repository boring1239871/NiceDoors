import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { UserProfile } from '../../types';
import { useFeedback } from './FeedbackContext';

export type ViewModule = 'overview' | 'orders' | 'editor' | 'designer' | 'profile' | 'customers' | 'products';

interface NavigationRailProps {
  activeModule: ViewModule;
  setActiveModule: (module: ViewModule) => void;
  user: UserProfile;
  onLogout: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  onCreateNewOrder: () => void;
  cartItemCount: number; 
}

export const NavigationRail: React.FC<NavigationRailProps> = ({ 
  activeModule, setActiveModule, user, onLogout, isCollapsed, toggleCollapse, onCreateNewOrder, cartItemCount 
}) => {
  
  // Navigation Item Style
  const getLinkClass = (isActive: boolean) => `
    flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 select-none mb-1 mx-3 relative group
    ${isActive 
      ? 'bg-slate-900 text-white dark:bg-blue-600 shadow-md shadow-slate-200 dark:shadow-blue-900/20 font-semibold' 
      : 'text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 font-medium'
    }
  `;

  const GroupLabel = ({ label }: { label: string }) => (
    !isCollapsed ? (
      <div className="px-5 mt-6 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        {label}
      </div>
    ) : (
      <div className="h-4 mt-4 mb-2 border-t border-gray-100 dark:border-gray-800 mx-4"></div>
    )
  );

  return (
    <nav 
        className={`
            relative h-full flex flex-col 
            bg-white dark:bg-[#0d0d0e] 
            shrink-0 z-50 
            transition-[width] duration-300 ease-[cubic-bezier(0.2,0,0,1)] 
            border-r border-gray-200 dark:border-gray-800
            ${isCollapsed ? 'w-[72px]' : 'w-[240px]'}
        `}
    >
      
      {/* 1. Header Area: Logo */}
      <div className={`h-20 flex items-center shrink-0 ${isCollapsed ? 'justify-center' : 'px-5 gap-3'}`}>
         {/* Logo Icon */}
         <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>
         </div>
         
         {!isCollapsed && (
             <div className="flex flex-col animate-fade-in overflow-hidden">
                <span className="font-sans font-bold text-lg text-slate-900 dark:text-white tracking-tight leading-none">AluMaster</span>
                <span className="text-[10px] text-slate-400 font-bold tracking-wide mt-0.5">CAD SYSTEM PRO</span>
             </div>
         )}
      </div>

      {/* 2. Main Navigation List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 custom-scrollbar">
        
        {/* GROUP 1: Management Center */}
        <GroupLabel label="管理中心" />

        {/* Dashboard */}
        <div 
            onClick={() => setActiveModule('overview')} 
            className={getLinkClass(activeModule === 'overview')}
            title="数据概览"
        >
          <div className="shrink-0"><Icons.Dashboard active={activeModule === 'overview'} /></div>
          {!isCollapsed && <span className="text-sm whitespace-nowrap">数据概览</span>}
        </div>

        {/* Order History */}
        <div 
            onClick={() => setActiveModule('orders')} 
            className={getLinkClass(activeModule === 'orders')}
            title="历史订单"
        >
            <div className="shrink-0"><Icons.Order active={activeModule === 'orders'} /></div>
            {!isCollapsed && <span className="text-sm whitespace-nowrap">历史订单</span>}
        </div>

        {/* Customers */}
        <div 
            onClick={() => setActiveModule('customers')} 
            className={getLinkClass(activeModule === 'customers')}
            title="客户管理"
        >
          <div className="shrink-0"><Icons.UserGroup /></div>
          {!isCollapsed && <span className="text-sm whitespace-nowrap">客户库</span>}
        </div>

        {/* GROUP 2: Business Operation */}
        <GroupLabel label="业务执行" />

        {/* Mall Home (Product Catalog) */}
        <div 
            onClick={() => setActiveModule('products')} 
            className={getLinkClass(activeModule === 'products' || activeModule === 'designer')}
            title="产品商城"
        >
          <div className="shrink-0"><Icons.ShoppingBag active={activeModule === 'products'} /></div>
          {!isCollapsed && <span className="text-sm whitespace-nowrap">产品商城</span>}
        </div>

        {/* Current Cart (The Draft Order) */}
        <div 
            onClick={() => {
                if (cartItemCount === 0) onCreateNewOrder(); 
                else setActiveModule('editor');
            }} 
            className={getLinkClass(activeModule === 'editor')}
            title="购物车"
        >
            <div className="shrink-0 relative">
                <Icons.Cart />
                {cartItemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white dark:border-[#0d0d0e]">
                        {cartItemCount}
                    </span>
                )}
            </div>
            {!isCollapsed && (
                <div className="flex justify-between flex-1">
                    <span className="text-sm whitespace-nowrap">当前订单</span>
                    {cartItemCount > 0 && <span className="text-xs opacity-60 font-mono">{cartItemCount}</span>}
                </div>
            )}
        </div>

      </div>

      {/* 3. Bottom Footer Area */}
      <div className="shrink-0 px-3 pb-6 space-y-2 border-t border-gray-100 dark:border-gray-800 pt-4">
         
         {/* Collapse Button */}
         <button 
            onClick={toggleCollapse}
            className={`w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-slate-600 transition-colors ${isCollapsed ? '' : 'justify-start pl-3 gap-3'}`}
            title={isCollapsed ? "展开菜单" : "收起菜单"}
         >
            <div className="shrink-0">{isCollapsed ? <Icons.ChevronRight /> : <Icons.ChevronLeft />}</div>
            {!isCollapsed && <span className="text-xs font-bold">收起侧边栏</span>}
         </button>

         {/* Profile Card */}
         <div className={`mt-2 flex items-center gap-3 p-1.5 rounded-xl transition-all ${isCollapsed ? 'justify-center' : 'bg-gray-50 dark:bg-white/5'}`}>
            <img 
                src={user.avatar} 
                alt="User" 
                onClick={() => setActiveModule('profile')}
                className="w-8 h-8 rounded-lg cursor-pointer hover:opacity-80 transition-opacity shrink-0 bg-gray-200" 
            />
            
            {!isCollapsed && (
                <div className="flex-1 min-w-0 overflow-hidden cursor-pointer" onClick={() => setActiveModule('profile')}>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.company}</div>
                </div>
            )}

            {!isCollapsed && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onLogout(); }}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-all"
                    title="退出登录"
                >
                    <Icons.Logout />
                </button>
            )}
         </div>

      </div>

    </nav>
  );
};