import React from 'react';
import { Icons } from '../components/ui/Icons';
import { UserProfile } from '../types';

interface ProfileViewProps {
  user: UserProfile;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout }) => {
  return (
    <div className="p-8 max-w-5xl mx-auto w-full animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">个人中心</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Card */}
        <div className="col-span-1">
          <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <img src={user.avatar} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-white shadow-md" />
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
            <p className="text-gray-500 text-sm mt-1">{user.role} @ {user.company}</p>
            
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">{user.plan} Plan</span>
              <span className="px-3 py-1 bg-purple-50 text-purple-600 text-xs font-bold rounded-full">Verified</span>
            </div>

            <button onClick={onLogout} className="mt-8 w-full py-2.5 rounded-xl border border-gray-200 text-red-500 font-medium hover:bg-red-50 hover:border-red-100 transition-colors flex items-center justify-center gap-2">
              <Icons.Logout /> 退出登录
            </button>
          </div>
        </div>

        {/* Details & Settings */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100">
            <h4 className="text-lg font-bold text-gray-800 mb-6">基本信息</h4>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2 uppercase">显示名称</label>
                <input value={user.name} readOnly className="w-full p-3 bg-gray-50 rounded-xl text-gray-800 font-medium border-none outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2 uppercase">电子邮箱</label>
                <input value={user.email} readOnly className="w-full p-3 bg-gray-50 rounded-xl text-gray-800 font-medium border-none outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2 uppercase">所属公司</label>
                <input value={user.company} readOnly className="w-full p-3 bg-gray-50 rounded-xl text-gray-800 font-medium border-none outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2 uppercase">联系电话</label>
                <input defaultValue="+86 138 0000 0000" className="w-full p-3 bg-gray-50 rounded-xl text-gray-800 font-medium border-none outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-bold text-gray-800">平台偏好</h4>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-semibold text-gray-800 text-sm">深色模式</div>
                  <div className="text-xs text-gray-500">将界面调整为深色主题</div>
                </div>
                <div className="w-10 h-6 bg-gray-300 rounded-full relative cursor-pointer"><div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow-sm"></div></div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-semibold text-gray-800 text-sm">自动保存设计</div>
                  <div className="text-xs text-gray-500">每隔 5 分钟自动保存草稿</div>
                </div>
                <div className="w-10 h-6 bg-blue-500 rounded-full relative cursor-pointer"><div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm"></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};