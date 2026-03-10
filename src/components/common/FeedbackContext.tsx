// FeedbackContext.tsx - 反馈上下文
//   - 提供全局反馈机制，如通知、消息提示
//     - 通常包含 toast 消息、加载状态等功能
//       - 使用 React Context API 实现跨组件通信

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { v4 as uuidv4 } from 'uuid';

type ToastType = 'success' | 'error' | 'info';
interface Toast { id: string; type: ToastType; message: string; }
interface DialogOptions { title: string; content: string; confirmText?: string; cancelText?: string; isDestructive?: boolean; }
interface FeedbackContextType {
  toast: { success: (msg: string) => void; error: (msg: string) => void; info: (msg: string) => void; };
  confirm: (options: DialogOptions) => Promise<boolean>;
}

// 全局 toast 函数
let globalToast: { success: (msg: string) => void; error: (msg: string) => void; info: (msg: string) => void; } | null = null;

// 导出全局 toast 函数
export const toast = {
  success: (msg: string) => globalToast?.success(msg),
  error: (msg: string) => globalToast?.error(msg),
  info: (msg: string) => globalToast?.info(msg),
};

const FeedbackContext = createContext<FeedbackContextType | null>(null);
export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error('useFeedback must be used within a FeedbackProvider');
  return context;
};

const ToastIcons = {
  success: () => <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
  error: () => <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
  info: () => <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

export const FeedbackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dialogState, setDialogState] = useState<{ isOpen: boolean; options: DialogOptions; resolve: (val: boolean) => void; } | null>(null);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = uuidv4();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const toast = {
    success: (msg: string) => addToast('success', msg),
    error: (msg: string) => addToast('error', msg),
    info: (msg: string) => addToast('info', msg),
  };

  // 设置全局 toast 函数
  useEffect(() => {
    globalToast = toast;
    return () => {
      globalToast = null;
    };
  }, [toast]);

  const confirm = useCallback((options: DialogOptions): Promise<boolean> => {
    return new Promise((resolve) => setDialogState({ isOpen: true, options, resolve }));
  }, []);

  const handleDialogClose = (result: boolean) => {
    if (dialogState) {
      dialogState.resolve(result);
      setDialogState(null);
    }
  };

  return (
    <FeedbackContext.Provider value={{ toast, confirm }}>
      {children}
      {createPortal(
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 pointer-events-none">
          {toasts.map(t => (
            <div key={t.id} className="bg-white pl-4 pr-6 py-3 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 flex items-center gap-3 animate-fade-in-down pointer-events-auto min-w-[300px]">
              {t.type === 'success' && <ToastIcons.success />}
              {t.type === 'error' && <ToastIcons.error />}
              {t.type === 'info' && <ToastIcons.info />}
              <span className="text-sm font-bold text-gray-700">{t.message}</span>
            </div>
          ))}
        </div>, document.body)}
      {dialogState && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={() => handleDialogClose(false)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative z-10 animate-scale-in">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{dialogState.options.title}</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">{dialogState.options.content}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => handleDialogClose(false)} className="px-4 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">{dialogState.options.cancelText || '取消'}</button>
              <button onClick={() => handleDialogClose(true)} className={`px-4 py-2 rounded-lg text-sm font-bold text-white shadow-lg transition-all active:scale-95 ${dialogState.options.isDestructive ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' : 'bg-slate-900 hover:bg-black shadow-slate-500/30'}`}>{dialogState.options.confirmText || '确认'}</button>
            </div>
          </div>
        </div>, document.body)}
    </FeedbackContext.Provider>
  );
};