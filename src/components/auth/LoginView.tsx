import React, { useState } from 'react';

interface LoginViewProps {
  onLogin: (email: string, password: string) => void;
  isLoading?: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, isLoading }) => {
  const [email, setEmail] = useState('alex@proframe.design');
  const [password, setPassword] = useState('ChangeMe123!');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 表单验证
    if (!email.trim()) {
      setError('请输入注册所用的邮箱');
      return;
    }

    if (!password) {
      setError('请输入密码');
      return;
    }

    setError('');
    onLogin(email.trim(), password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F0F4F8] font-sans p-4">
      <div className="bg-white p-6 md:p-12 rounded-[28px] shadow-lg w-full max-w-md border border-white">
        <div className="flex flex-col items-center mb-6 md:mb-8">
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-slate-300 shadow-md mb-3 md:mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">欢迎回来</h1>
          <p className="text-gray-500 mt-1 md:mt-2 text-sm">登录您的 AluMaster CAD 账户</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 pl-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              placeholder="alex@proframe.design"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all text-gray-700 font-medium text-sm md:text-base"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 pl-1">密码</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="ChangeMe123!"
                className="w-full px-4 py-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all text-gray-700 font-medium text-sm md:text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                ) : (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 md:py-3.5 rounded-xl shadow-lg shadow-slate-600/30 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-sm md:text-base"
          >
            {isLoading ? '登录中...' : '登录'}
          </button>
        </form>

        {/* <div className="my-6 md:my-8 flex items-center gap-4">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-xs text-gray-400 font-medium">或</span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div> */}


      </div>
    </div>
  );
};
