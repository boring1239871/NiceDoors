import React, { useState, useEffect } from 'react';
import { Icons } from '../common/Icons';
import { UserProfile } from '../../types';
import { updateUserProfile, fetchUserProfile, logout } from '../../api/api';
import { useFeedback } from '../common/FeedbackContext';
import { useTheme } from '../common/ThemeContext';
import { getAvatarInitial, getAvatarStyle } from '../../utils';
import { useNavigate } from 'react-router-dom';

interface ProfileViewProps {
  // 不再需要从父组件接收数据
}

export const ProfileView: React.FC<ProfileViewProps> = () => {
  const { toast } = useFeedback();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<UserProfile>({ name: '', email: '', avatar: '', role: 'Designer', company: '', plan: 'Free' });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 加载用户数据
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        const res = await fetchUserProfile();
        if (res.code === 200) {
          setUser(res.data);
          setFormData({
            name: res.data.name,
            email: res.data.email,
            phone: res.data.phone || '+86 138 0000 0000',
            company: res.data.company
          });
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
        toast.error('数据加载失败');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [toast]);

  const avatarInitial = getAvatarInitial(user.name);
  const avatarBgClass = getAvatarStyle();

  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '+86 138 0000 0000',
    company: user.company
  });

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
      setIsEditing(false);
      toast.success('个人信息更新成功');
    } catch (error) {
      toast.error('保存失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 移动端布局 - 自然流畅的设计
  if (isMobile) {
    return (
      <div className="h-full bg-[#F0F4F8] dark:bg-slate-900 overflow-y-auto">
        {/* 背景渐变装饰 */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-900/10 dark:to-transparent pointer-events-none"></div>

        <div className="relative px-4 pt-8 pb-8 space-y-4">
          {/* 头像区域 - 居中显示 */}
          <div className="flex flex-col items-center">
            <div className="relative mb-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full border-4 border-white dark:border-slate-700 shadow-lg"
                />
              ) : (
                <div className={`w-20 h-20 rounded-full border-4 border-white dark:border-slate-700 shadow-lg flex items-center justify-center text-white text-2xl font-bold ${avatarBgClass}`}>
                  {avatarInitial}
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-700 rounded-full"></div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{user.role}</p>
            <div className="flex gap-2 mt-2">
              <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
                {user.plan}
              </span>
              <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-medium rounded-full">
                已认证
              </span>
            </div>
          </div>

          {/* 编辑资料按钮 - 融入内容流 */}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full py-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Icons.Edit className="w-4 h-4" />
              编辑资料
            </button>
          )}

          {/* 编辑表单 */}
          {isEditing && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">编辑个人信息</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">姓名</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-white"
                    placeholder="请输入姓名"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">邮箱</label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-white"
                    placeholder="请输入邮箱"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">公司</label>
                  <input
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-white"
                    placeholder="请输入公司名称"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">电话</label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-white"
                    placeholder="请输入联系电话"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user.name,
                      email: user.email,
                      phone: user.phone || '',
                      company: user.company
                    });
                  }}
                  className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium text-sm"
                  disabled={isLoading}
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 bg-slate-800 dark:bg-blue-600 text-white rounded-xl font-medium text-sm disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          )}

          {/* 信息卡片 - 非编辑状态显示 */}
          {!isEditing && (
            <>
              {/* 基本信息卡片 */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-800 dark:text-white">基本信息</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">姓名</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">邮箱</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">公司</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{user.company}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">电话</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{user.phone || '未设置'}</span>
                  </div>
                </div>
              </div>

              {/* 偏好设置卡片 */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-3">偏好设置</h3>
                <div className="space-y-2">
                  {/* 深色模式 - 使用 Settings 或 Theme 相关图标 */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300">
                        <Icons.Settings />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white text-sm">深色模式</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">切换界面主题</div>
                      </div>
                    </div>
                    <div className={`w-10 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-1'}`}></div>
                    </div>
                  </div>

                  {/* 自动保存 - 使用 DocumentText 或 Save 相关图标 */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300">
                        <Icons.DocumentText />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white text-sm">自动保存</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">每5分钟自动保存草稿</div>
                      </div>
                    </div>
                    <div className="w-10 h-6 bg-blue-500 rounded-full relative">
                      <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 退出登录按钮 - 温和的红色 */}
              <button
                onClick={handleLogout}
                className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-red-500 font-medium bg-white dark:bg-slate-800 flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
              >
                <Icons.Logout className="w-4 h-4" />
                退出登录
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // 桌面端布局（保持不变）
  return (
    <div className="p-8 max-w-5xl mx-auto w-full animate-fade-in overflow-y-auto h-full bg-[#F0F4F8] dark:bg-slate-900 transition-colors">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">个人中心</h2>
        {isEditing ? (
          <div className="flex gap-3">
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  name: user.name,
                  email: user.email,
                  phone: user.phone || '',
                  company: user.company
                });
              }}
              className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              disabled={isLoading}
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-slate-800 dark:bg-blue-600 text-white font-bold hover:bg-slate-900 dark:hover:bg-blue-500 transition-colors shadow-lg shadow-slate-200 dark:shadow-blue-900/30"
              disabled={isLoading}
            >
              {isLoading ? '保存中...' : '保存修改'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-gray-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            编辑资料
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[24px] shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col items-center text-center transition-colors">
            <div className="relative mb-4 group cursor-pointer">
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-700 shadow-md transition-transform group-hover:scale-105" />
              ) : (
                <div className={`w-24 h-24 rounded-full border-4 border-white dark:border-slate-700 shadow-md transition-transform group-hover:scale-105 flex items-center justify-center text-white text-3xl font-bold ${avatarBgClass}`}>
                  {avatarInitial}
                </div>
              )}
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-white dark:border-slate-700 rounded-full"></div>
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  更换
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{user.role} @ {user.company}</p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">{user.plan} Plan</span>
              <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-full">Verified</span>
            </div>
            <button
              onClick={handleLogout}
              className="mt-8 w-full py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-100 transition-colors flex items-center justify-center gap-2"
            >
              <Icons.Logout /> 退出登录
            </button>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[24px] shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
            <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-6">基本信息</h4>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase">显示名称</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className={`w-full p-3 rounded-xl font-medium outline-none transition-all ${isEditing
                    ? 'bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 focus:ring-2 focus:ring-blue-500/20 text-gray-800 dark:text-white'
                    : 'bg-gray-50 dark:bg-slate-900 border-transparent text-gray-600 dark:text-gray-300'
                    }`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase">电子邮箱</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className={`w-full p-3 rounded-xl font-medium outline-none transition-all ${isEditing
                    ? 'bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 focus:ring-2 focus:ring-blue-500/20 text-gray-800 dark:text-white'
                    : 'bg-gray-50 dark:bg-slate-900 border-transparent text-gray-600 dark:text-gray-300'
                    }`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase">所属公司</label>
                <input
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className={`w-full p-3 rounded-xl font-medium outline-none transition-all ${isEditing
                    ? 'bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 focus:ring-2 focus:ring-blue-500/20 text-gray-800 dark:text-white'
                    : 'bg-gray-50 dark:bg-slate-900 border-transparent text-gray-600 dark:text-gray-300'
                    }`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase">联系电话</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className={`w-full p-3 rounded-xl font-medium outline-none transition-all ${isEditing
                    ? 'bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 focus:ring-2 focus:ring-blue-500/20 text-gray-800 dark:text-white'
                    : 'bg-gray-50 dark:bg-slate-900 border-transparent text-gray-600 dark:text-gray-300'
                    }`}
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-[24px] shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-bold text-gray-800 dark:text-white">平台偏好</h4>
            </div>
            <div className="space-y-4">
              <div
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-900/80 transition-colors"
                onClick={toggleTheme}
              >
                <div>
                  <div className="font-semibold text-gray-800 dark:text-white text-sm">深色模式</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">将界面调整为深色主题</div>
                </div>
                <div className={`w-10 h-6 rounded-full relative transition-colors duration-300 ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-transform duration-300 ${theme === 'dark' ? 'translate-x-5' : 'translate-x-1'}`}></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-xl">
                <div>
                  <div className="font-semibold text-gray-800 dark:text-white text-sm">自动保存设计</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">每隔 5 分钟自动保存草稿</div>
                </div>
                <div className="w-10 h-6 bg-blue-500 rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};