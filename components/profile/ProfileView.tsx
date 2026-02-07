import React, { useState, useEffect } from 'react';
import { Icons } from '../common/Icons';
import { UserProfile } from '../../types';
import { updateUserProfile } from '../../api'; // Direct import
import { useFeedback } from '../common/FeedbackContext';
import { useTheme } from '../common/ThemeContext';

interface ProfileViewProps {
  user: UserProfile;
  onLogout: () => void;
  onUserUpdate: (user: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user: initialUser, onLogout, onUserUpdate }) => {
  const { toast } = useFeedback();
  const { theme, toggleTheme } = useTheme(); // Use Theme Context
  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '+86 138 0000 0000',
    company: user.company
  });

  useEffect(() => {
    setUser(initialUser);
    setFormData({
      name: initialUser.name,
      email: initialUser.email,
      phone: initialUser.phone || '+86 138 0000 0000',
      company: initialUser.company
    });
  }, [initialUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateUserProfile({ ...user, ...formData });
      const updatedUser = { ...user, ...formData };
      setUser(updatedUser);
      onUserUpdate(updatedUser);
      setIsEditing(false);
      toast.success('个人信息更新成功');
    } catch (error) {
      toast.error('保存失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full animate-fade-in overflow-y-auto h-full bg-[#F0F4F8] dark:bg-slate-900 transition-colors">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">个人中心</h2>
        {isEditing ? (
          <div className="flex gap-3">
            <button onClick={() => { setIsEditing(false); setFormData({ name: user.name, email: user.email, phone: user.phone || '', company: user.company }); }} className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" disabled={isLoading}>取消</button>
            <button onClick={handleSave} className="px-6 py-2 rounded-xl bg-slate-800 dark:bg-blue-600 text-white font-bold hover:bg-slate-900 dark:hover:bg-blue-500 transition-colors shadow-lg shadow-slate-200 dark:shadow-blue-900/30" disabled={isLoading}>{isLoading ? '保存中...' : '保存修改'}</button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} className="px-6 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-gray-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">编辑资料</button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[24px] shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col items-center text-center transition-colors">
            <div className="relative mb-4 group cursor-pointer">
              <img src={user.avatar} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-700 shadow-md transition-transform group-hover:scale-105" />
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-white dark:border-slate-700 rounded-full"></div>
              {isEditing && (<div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">更换</div>)}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{user.role} @ {user.company}</p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">{user.plan} Plan</span>
              <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-full">Verified</span>
            </div>
            <button onClick={onLogout} className="mt-8 w-full py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-100 transition-colors flex items-center justify-center gap-2"><Icons.Logout /> 退出登录</button>
          </div>
        </div>
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[24px] shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
            <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-6">基本信息</h4>
            <div className="grid grid-cols-2 gap-6">
              <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase">显示名称</label><input name="name" value={formData.name} onChange={handleInputChange} readOnly={!isEditing} className={`w-full p-3 rounded-xl font-medium outline-none transition-all ${isEditing ? 'bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 focus:ring-2 focus:ring-blue-500/20 text-gray-800 dark:text-white' : 'bg-gray-50 dark:bg-slate-900 border-transparent text-gray-600 dark:text-gray-300'}`} /></div>
              <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase">电子邮箱</label><input name="email" value={formData.email} onChange={handleInputChange} readOnly={!isEditing} className={`w-full p-3 rounded-xl font-medium outline-none transition-all ${isEditing ? 'bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 focus:ring-2 focus:ring-blue-500/20 text-gray-800 dark:text-white' : 'bg-gray-50 dark:bg-slate-900 border-transparent text-gray-600 dark:text-gray-300'}`} /></div>
              <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase">所属公司</label><input name="company" value={formData.company} onChange={handleInputChange} readOnly={!isEditing} className={`w-full p-3 rounded-xl font-medium outline-none transition-all ${isEditing ? 'bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 focus:ring-2 focus:ring-blue-500/20 text-gray-800 dark:text-white' : 'bg-gray-50 dark:bg-slate-900 border-transparent text-gray-600 dark:text-gray-300'}`} /></div>
              <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase">联系电话</label><input name="phone" value={formData.phone} onChange={handleInputChange} readOnly={!isEditing} className={`w-full p-3 rounded-xl font-medium outline-none transition-all ${isEditing ? 'bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 focus:ring-2 focus:ring-blue-500/20 text-gray-800 dark:text-white' : 'bg-gray-50 dark:bg-slate-900 border-transparent text-gray-600 dark:text-gray-300'}`} /></div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[24px] shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
            <div className="flex justify-between items-center mb-6"><h4 className="text-lg font-bold text-gray-800 dark:text-white">平台偏好</h4></div>
            <div className="space-y-4">
              <div
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-900/80 transition-colors"
                onClick={toggleTheme}
              >
                <div><div className="font-semibold text-gray-800 dark:text-white text-sm">深色模式</div><div className="text-xs text-gray-500 dark:text-gray-400">将界面调整为深色主题</div></div>
                <div className={`w-10 h-6 rounded-full relative transition-colors duration-300 ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-transform duration-300 ${theme === 'dark' ? 'translate-x-5' : 'translate-x-1'}`}></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-xl"><div><div className="font-semibold text-gray-800 dark:text-white text-sm">自动保存设计</div><div className="text-xs text-gray-500 dark:text-gray-400">每隔 5 分钟自动保存草稿</div></div><div className="w-10 h-6 bg-blue-500 rounded-full relative cursor-pointer"><div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm"></div></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};