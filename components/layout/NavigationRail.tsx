import React from 'react';
import { Icons } from '../ui/Icons';
import { UserProfile } from '../../types';

export type ViewModule = 'dashboard' | 'designer' | 'orders' | 'profile';

interface NavigationRailProps {
  activeModule: ViewModule;
  setActiveModule: (module: ViewModule) => void;
  user: UserProfile;
  onLogout: () => void;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({ activeModule, setActiveModule, user, onLogout }) => {
  const navItems = [
    { id: 'dashboard', icon: Icons.Order, label: '订单管理' }, // Was Dashboard, now Main Order List
    { id: 'orders', icon: Icons.Dashboard, label: '新建/编辑' }, // The Editor View (hidden logic handled in App)
    { id: 'designer', icon: Icons.Design, label: '产品设计' }, // Was Designer
    { id: 'profile', icon: Icons.Profile, label: '我的账户' },
  ];

  // Filter out 'orders' from the rail if it's not the active one, 
  // or keep it but make it clear it's the "Drafting" area.
  // For better UX, we only show 3 main tabs. 'orders' view is accessed via 'dashboard'.
  // However, to satisfy the prop type, we map over a filtered list or just show the main 3.
  const visibleNavItems = navItems.filter(item => item.id !== 'orders' || activeModule === 'orders');

  return (
    <nav className="w-[88px] bg-white flex flex-col items-center py-6 shrink-0 z-50 border-r border-gray-200/60">
      {/* Updated Logo: A for AluMaster, Dark Slate color for professionalism */}
      <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-slate-300 mb-10 cursor-default">A</div>
      
      <div className="flex flex-col gap-6 w-full px-3">
        {navItems.map(item => {
          // Special handling: Hide 'orders' from main rail unless active (it's a sub-view of Order Mgmt technically)
          if (item.id === 'orders' && activeModule !== 'orders') return null;

          const isActive = activeModule === item.id;
          return (
            <button 
              key={item.id}
              onClick={() => setActiveModule(item.id as ViewModule)}
              className="group flex flex-col items-center gap-1.5 relative"
            >
              <div className={`w-12 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-slate-100 text-slate-900' : 'text-gray-500 group-hover:bg-gray-100 group-hover:text-gray-900'}`}>
                <item.icon active={isActive} />
              </div>
              <span className={`text-[10px] font-bold transition-colors ${isActive ? 'text-slate-900' : 'text-gray-500'}`}>{item.label}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-auto flex flex-col items-center gap-6">
        <button onClick={onLogout} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="退出">
            <Icons.Logout />
        </button>
        <img 
            src={user.avatar} 
            alt="User" 
            className="w-8 h-8 rounded-full border border-gray-200 cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-slate-500 transition-all" 
            onClick={() => setActiveModule('profile')} 
        />
      </div>
    </nav>
  );
};