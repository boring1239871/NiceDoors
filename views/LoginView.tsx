import React from 'react';
import { Icons } from '../components/ui/Icons';

interface LoginViewProps {
  onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F0F4F8] font-sans">
      <div className="bg-white p-8 md:p-12 rounded-[28px] shadow-lg w-full max-w-md border border-white">
        <div className="flex flex-col items-center mb-8">
          {/* Logo Updated */}
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-slate-300 shadow-md mb-4">A</div>
          <h1 className="text-2xl font-bold text-gray-800">欢迎回来</h1>
          <p className="text-gray-500 mt-2 text-sm">登录您的 AluMaster CAD 账户</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 pl-1">邮箱</label>
            <input type="email" defaultValue="admin@alumaster.com" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all text-gray-700 font-medium" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 pl-1">密码</label>
            <input type="password" defaultValue="password" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all text-gray-700 font-medium" />
          </div>
          <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-slate-600/30 transition-all active:scale-[0.98]">
            登录
          </button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-xs text-gray-400 font-medium">或</span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        <button className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
          <Icons.Google />
          <span className="text-sm">使用 Google 账号登录</span>
        </button>
      </div>
    </div>
  );
};