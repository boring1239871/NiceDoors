// ResponsiveNav.tsx - 响应式导航组件
//   - 提供应用的导航功能
//   - 通常包含应用的主要功能入口
//   - 可以展开或收起以节省空间

import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { UserProfile } from '../../types';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { getAvatarInitial, getAvatarStyle } from '../../utils';
import { fetchUserProfile } from '../../api/api';
import { useFeedback } from './FeedbackContext';

export type ViewModule = 'overview' | 'orders' | 'editor' | 'designer' | 'profile' | 'customers' | 'products';

interface ResponsiveNavProps {
  activeModule: ViewModule;
  setActiveModule: (module: ViewModule) => void;
  onLogout: () => void;
  isSidebarCollapsed: boolean;
  toggleCollapse: () => void;
}

const NAV_ITEMS = [
  { key: 'overview', label: '数据概览', icon: 'Dashboard', group: 'center' },
  { key: 'orders', label: '历史订单', icon: 'Order', group: 'center' },
  { key: 'customers', label: '客户库', icon: 'UserGroup', group: 'center' },
  { key: 'products', label: '产品商城', icon: 'ShoppingBag', group: 'business' },
  { key: 'editor', label: '当前订单', icon: 'Cart', group: 'business' },
] as const;

const getIcon = (iconName: string, active: boolean) => {
  const props = { active };
  switch (iconName) {
    case 'Dashboard': return <Icons.Dashboard {...props} />;
    case 'Order': return <Icons.Order {...props} />;
    case 'UserGroup': return <Icons.UserGroup />;
    case 'ShoppingBag': return <Icons.ShoppingBag {...props} />;
    case 'Cart': return <Icons.Cart />;
    default: return null;
  }
};

const Avatar = ({ name, avatar, className, onClick }: { name: string; avatar: string | null | undefined; className: string; onClick?: () => void }) => {
  if (avatar) {
    return <img src={avatar} alt="User" onClick={onClick} className={`${className} object-cover`} />;
  }
  return (
    <div
      onClick={onClick}
      className={`${className} ${getAvatarStyle()} flex items-center justify-center text-white font-bold`}
    >
      {getAvatarInitial(name)}
    </div>
  );
};

export const ResponsiveNav: React.FC<ResponsiveNavProps> = ({
  activeModule,
  setActiveModule,
  onLogout,
  isSidebarCollapsed,
  toggleCollapse
}) => {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  const { toast } = useFeedback();
  const [user, setUser] = useState<UserProfile>({ name: '用户', email: '', avatar: '', role: 'Designer', company: '', plan: 'Free' });

  // 加载用户数据
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetchUserProfile();
        if (res.code === 200) {
          setUser(res.data);
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    };

    loadUser();
  }, []);

  const handleNavClick = (module: ViewModule) => {
    setActiveModule(module);
  };

  const isActive = (key: string) => {
    return activeModule === key;
  };

  // 桌面端侧边栏
  if (isDesktop) {
    return (
      <DesktopSidebar
        activeModule={activeModule}
        onNavClick={handleNavClick}
        user={user}
        onLogout={onLogout}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={toggleCollapse}
        isActive={isActive}
      />
    );
  }

  // 平板端折叠侧边栏
  if (isTablet) {
    return (
      <DesktopSidebar
        activeModule={activeModule}
        onNavClick={handleNavClick}
        user={user}
        onLogout={onLogout}
        isCollapsed={true}
        toggleCollapse={toggleCollapse}
        isActive={isActive}
      />
    );
  }

  // 移动端底部导航（简化版）
  return (
    <>
      <MobileHeader
        user={user}
        onProfileClick={() => handleNavClick('profile')}
      />
      <MobileTabBar
        activeModule={activeModule}
        onNavClick={handleNavClick}
        isActive={isActive}
      />
    </>
  );
};

// 桌面端/平板侧边栏组件
const DesktopSidebar: React.FC<{
  activeModule: ViewModule;
  onNavClick: (m: ViewModule) => void;
  user: UserProfile;
  onLogout: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  isActive: (k: string) => boolean;
}> = ({ onNavClick, user, onLogout, isCollapsed, toggleCollapse, isActive }) => {
  const getLinkClass = (isAct: boolean) => `
    flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 select-none mb-1 mx-3 relative group
    ${isAct
      ? 'bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-600 text-white shadow-lg shadow-blue-500/25 font-semibold'
      : 'text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 font-medium'
    }
  `;

  const getIconWrapperClass = (isAct: boolean) => `
    flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200
    ${isAct
      ? 'bg-white/20 dark:bg-white/10'
      : 'bg-transparent group-hover:bg-gray-100 dark:group-hover:bg-white/5'
    }
  `;

  return (
    <nav className={`
      relative h-full flex flex-col shrink-0 z-50 transition-[width] duration-300 ease-[cubic-bezier(0.2,0,0,1)] 
      bg-white dark:bg-[#0d0d0e] border-r border-gray-200 dark:border-gray-800
      ${isCollapsed ? 'w-[72px]' : 'w-[240px]'}
    `}>
      {/* Logo */}
      <div className={`h-20 flex items-center shrink-0 ${isCollapsed ? 'justify-center' : 'px-5 gap-3'}`}>
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

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 custom-scrollbar">
        <div className="px-5 mt-6 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          {isCollapsed ? '' : '管理中心'}
        </div>
        {NAV_ITEMS.slice(0, 3).map(item => (
          <div key={item.key} onClick={() => onNavClick(item.key as ViewModule)} className={getLinkClass(isActive(item.key))} title={item.label}>
            <div className={getIconWrapperClass(isActive(item.key))}>{getIcon(item.icon, isActive(item.key))}</div>
            {!isCollapsed && <span className="text-sm whitespace-nowrap">{item.label}</span>}
          </div>
        ))}

        <div className={`h-4 mt-4 mb-2 border-t border-gray-100 dark:border-gray-800 mx-4`}></div>
        <div className="px-5 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          {isCollapsed ? '' : '业务执行'}
        </div>
        {NAV_ITEMS.slice(3).map(item => (
          <div key={item.key} onClick={() => onNavClick(item.key as ViewModule)} className={getLinkClass(isActive(item.key))} title={item.label}>
            <div className={getIconWrapperClass(isActive(item.key))}>{getIcon(item.icon, isActive(item.key))}</div>
            {!isCollapsed && <span className="text-sm whitespace-nowrap">{item.label}</span>}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="shrink-0 px-3 pb-6 space-y-2 border-t border-gray-100 dark:border-gray-800 pt-4">
        <button onClick={toggleCollapse} className={`w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-slate-600 transition-colors ${isCollapsed ? '' : 'justify-start pl-3 gap-3'}`}>
          <div className="shrink-0">{isCollapsed ? <Icons.ChevronRight /> : <Icons.ChevronLeft />}</div>
          {!isCollapsed && <span className="text-xs font-bold">收起侧边栏</span>}
        </button>
        <div className={`mt-2 flex items-center gap-3 p-1.5 rounded-xl transition-all ${isCollapsed ? 'justify-center' : 'bg-gray-50 dark:bg-white/5'}`}>
          <Avatar
            name={user.name}
            avatar={user.avatar}
            className="w-8 h-8 rounded-lg cursor-pointer hover:opacity-80 transition-opacity shrink-0 bg-gray-200"
            onClick={() => onNavClick('profile')}
          />
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0 overflow-hidden cursor-pointer" onClick={() => onNavClick('profile')}>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user.name}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.company}</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); onLogout(); }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-all">
                <Icons.Logout />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

// 移动端顶部栏
const MobileHeader: React.FC<{
  user: UserProfile;
  onProfileClick: () => void;
}> = ({ user, onProfileClick }) => (
  <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#0d0d0e] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 z-40 lg:hidden safe-area-pt">
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>
        </div>
        <span className="font-bold text-slate-900 dark:text-white text-lg">AluMaster</span>
      </div>
    </div>
    <button onClick={onProfileClick} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
      <Avatar name={user.name} avatar={user.avatar} className="w-9 h-9 rounded-lg bg-gray-200" />
    </button>
  </div>
);



// 移动端底部导航栏
const MobileTabBar: React.FC<{
  activeModule: ViewModule;
  onNavClick: (m: ViewModule) => void;
  isActive: (k: string) => boolean;
}> = ({ activeModule, onNavClick, isActive }) => {
  const tabs = [
    { key: 'overview', label: '首页', icon: 'Dashboard' },
    { key: 'orders', label: '订单', icon: 'Order' },
    { key: 'customers', label: '客户', icon: 'UserGroup' },
    { key: 'products', label: '产品', icon: 'ShoppingBag' },
    { key: 'editor', label: '购物车', icon: 'Cart' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-white dark:bg-[#0d0d0e] border-t border-gray-200 dark:border-gray-800 flex items-center justify-around px-2 z-40 lg:hidden safe-area-pb shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onNavClick(tab.key as ViewModule)}
          className={`flex flex-col items-center justify-center gap-1.5 px-3 py-3 min-w-[60px] rounded-lg transition-all ${isActive(tab.key) ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}
        >
          <div className="relative w-8 h-8 flex items-center justify-center">
            {getIcon(tab.icon, isActive(tab.key))}
          </div>
          <span className="text-xs font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};
