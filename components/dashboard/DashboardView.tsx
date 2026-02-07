import React, { useMemo, useState } from 'react';
import { UserProfile, Order } from '../../types';
import { printOrderContract, printOrderDrawings, generateBatchExportZip } from '../../utils';
import { useFeedback } from '../common/FeedbackContext';
import { createPortal } from 'react-dom';
import { Icons } from '../common/Icons';

interface DashboardViewProps {
  orders: Order[]; 
  user: UserProfile; 
  viewMode: 'overview' | 'list'; 
  onEditOrder: (order: Order) => void; 
  onDeleteOrder: (orderId: string) => void; 
  onCreateNewOrder: () => void;
  onSwitchToOrders: () => void;
}

// --- Internal Components (StatCard, TrendChart, OrderDistribution, BatchExportPreviewModal) ---
// (Keeping these component definitions same as before for brevity, but they are included in the full file content below)

const StatCard = ({ title, value, subtext, icon, color }: any) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-[20px] border border-gray-100 dark:border-slate-700 shadow-sm flex items-start justify-between group hover:shadow-md transition-all cursor-default">
    <div>
      <div className="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
      <div className={`text-xs font-medium ${subtext.includes('+') ? 'text-green-500' : 'text-gray-400 dark:text-slate-500'}`}>{subtext}</div>
    </div>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} text-white shadow-lg opacity-90 group-hover:scale-110 transition-transform shrink-0`}>
      {icon}
    </div>
  </div>
);

const TrendChart = () => (
  <div className="w-full h-full flex flex-col min-w-0">
      <div className="flex items-center justify-between mb-6">
          <div><h4 className="font-bold text-gray-800 dark:text-white text-lg">销售趋势</h4><p className="text-xs text-gray-400 dark:text-gray-500">近 6 个月业绩走势 (万元)</p></div>
          <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-xs text-gray-500 dark:text-gray-400 font-bold">实际营收</span></div>
      </div>
      <div className="flex-1 relative w-full">
        <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <line x1="0" y1="150" x2="500" y2="150" stroke="currentColor" className="text-slate-100 dark:text-slate-700" strokeWidth="1" />
            <line x1="0" y1="100" x2="500" y2="100" stroke="currentColor" className="text-slate-100 dark:text-slate-700" strokeWidth="1" />
            <line x1="0" y1="50" x2="500" y2="50" stroke="currentColor" className="text-slate-100 dark:text-slate-700" strokeWidth="1" />
            <path d="M0,160 C50,150 50,120 100,130 C150,140 150,80 200,90 C250,100 250,60 300,50 C350,40 350,70 400,60 C450,50 450,20 500,10" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" className="drop-shadow-lg" />
            <path d="M0,160 C50,150 50,120 100,130 C150,140 150,80 200,90 C250,100 250,60 300,50 C350,40 350,70 400,60 C450,50 450,20 500,10 V200 H0 Z" fill="url(#gradientBlue)" opacity="0.1" />
            <defs><linearGradient id="gradientBlue" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="transparent" /></linearGradient></defs>
            {[160, 130, 90, 50, 60, 10].map((y, i) => (
                <g key={i} className="group">
                    <circle cx={i * 100} cy={y} r="4" fill="white" stroke="#3b82f6" strokeWidth="2" className="cursor-pointer hover:r-6 transition-all" />
                    <rect x={i*100 - 20} y={y - 30} width="40" height="20" rx="4" fill="#1e293b" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    <text x={i*100} y={y - 16} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" className="opacity-0 group-hover:opacity-100 transition-opacity">¥{20-i*2}w</text>
                </g>
            ))}
        </svg>
      </div>
      <div className="flex justify-between text-xs font-bold text-gray-400 dark:text-gray-500 mt-2 px-1"><span>8月</span><span>9月</span><span>10月</span><span>11月</span><span>12月</span><span>1月</span></div>
  </div>
);

const OrderDistribution = ({ stats }: { stats: any }) => (
    <div className="h-full flex flex-col min-w-0">
        <h4 className="font-bold text-gray-800 dark:text-white text-lg mb-6">订单状态分布</h4>
        <div className="flex items-center gap-4 xl:gap-8 h-full">
            <div className="relative w-24 h-24 xl:w-32 xl:h-32 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-700" strokeWidth="12" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="12" strokeDasharray="180 251" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="50 251" strokeDashoffset="-180" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl xl:text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</span>
                    <span className="text-[10px] text-gray-400 uppercase">Total</span>
                </div>
            </div>
            <div className="flex-1 space-y-3 min-w-0">
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full"></div><span className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate">设计/生产</span></div><span className="text-xs font-bold text-gray-800 dark:text-white">{stats.active}</span></div>
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div><span className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate">已交付</span></div><span className="text-xs font-bold text-gray-800 dark:text-white">{stats.completed}</span></div>
            </div>
        </div>
    </div>
);

const BatchExportPreviewModal = ({ selectedOrders, user, onCancel, onConfirm }: any) => {
    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCancel}></div>
             <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col relative z-10 animate-scale-in">
                 <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                     <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">批量导出预览</h3>
                        <p className="text-sm text-gray-500 mt-1">将生成 {selectedOrders.length} 个订单压缩包</p>
                     </div>
                     <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                         <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                     </button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-slate-900/50">
                     <div className="space-y-3">
                         {selectedOrders.map((order: Order) => (
                             <div key={order.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 flex items-start gap-4">
                                 <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-gray-600 dark:text-blue-300">
                                     <Icons.Box />
                                 </div>
                                 <div className="flex-1">
                                     <div className="flex justify-between">
                                         <h4 className="font-bold text-gray-800 dark:text-white">{order.customerName}</h4>
                                         <span className="text-xs font-mono text-gray-500">{order.id}</span>
                                     </div>
                                     <div className="mt-2 pl-4 border-l-2 border-gray-100 dark:border-slate-700 space-y-1">
                                         <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                             <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                             <span>销售合同_{order.id}.pdf</span>
                                         </div>
                                         <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                             <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                             <span>生产图纸_{order.id}.pdf</span>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
                 <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3">
                     <button onClick={onCancel} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all">取消</button>
                     <button onClick={onConfirm} className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2">
                         <span>确认导出 ZIP</span>
                     </button>
                 </div>
             </div>
        </div>,
        document.body
    );
};

// --- Main View Component ---

export const DashboardView: React.FC<DashboardViewProps> = ({ orders, user, viewMode, onEditOrder, onDeleteOrder, onCreateNewOrder, onSwitchToOrders }) => {
  const { toast, confirm } = useFeedback();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const statusOptions = ['ALL', '已确认', '生产中', '生产完成', '已结清'];

  // --- REVISED FILTER LOGIC ---
  const filteredOrders = useMemo(() => orders.filter(order => {
    // 1. Search Filter
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Status Filter
    let matchesStatus = true;
    const currentStatus = order.status || '已确认'; // Default undefined to '已确认'

    if (statusFilter === 'ALL') {
        matchesStatus = true;
    } 
    else if (statusFilter === '已结清') {
        // Special case: Computed property based on payment
        const paid = order.paidAmount || 0;
        // Float precision safe comparison
        matchesStatus = paid >= (order.totalAmount - 0.01);
    } 
    else {
        // Strict string match for '已确认', '生产中', '生产完成'
        matchesStatus = currentStatus === statusFilter;
    }
    
    return matchesSearch && matchesStatus;
  }), [orders, searchTerm, statusFilter]);

  const stats = useMemo(() => {
      const totalRev = orders.reduce((acc, o) => acc + o.totalAmount, 0);
      const active = orders.filter(o => o.status === '生产中' || o.status === '已确认').length;
      const completed = orders.filter(o => o.status === '生产完成').length;
      return { totalRevenue: totalRev, active, completed, total: orders.length };
  }, [orders]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) setSelectedIds(new Set(filteredOrders.map(o => o.id)));
      else setSelectedIds(new Set());
  };
  
  const handleSelectOne = (id: string) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedIds(newSet);
  };

  const handleBatchExportClick = () => {
      if (selectedIds.size === 0) { toast.error("请先勾选需要导出的订单"); return; }
      setIsExportModalOpen(true);
  };
  
  const handleBatchDeleteClick = async () => {
      if (selectedIds.size === 0) return;
      
      const confirmed = await confirm({
          title: '批量删除订单',
          content: `确定要永久删除选中的 ${selectedIds.size} 个订单吗？此操作无法撤销。`,
          confirmText: `删除 ${selectedIds.size} 个订单`,
          isDestructive: true
      });
      
      if (confirmed) {
          // Iterate and delete each
          selectedIds.forEach(id => onDeleteOrder(id));
          setSelectedIds(new Set());
          toast.success(`已成功删除 ${selectedIds.size} 个订单`);
      }
  };

  const handleConfirmExport = async () => {
      setIsExportModalOpen(false); setIsExporting(true);
      const toastId = toast.info("正在准备生成文件...");
      const ordersToExport = orders.filter(o => selectedIds.has(o.id));
      try {
          const blob = await generateBatchExportZip(ordersToExport, user, (msg) => console.log(msg));
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = `批量导出订单_${new Date().toISOString().slice(0,10)}.zip`;
          document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url); document.body.removeChild(a);
          toast.success("导出成功！"); setSelectedIds(new Set());
      } catch (e) { console.error(e); toast.error("导出过程中发生错误"); } finally { setIsExporting(false); }
  };

  const formatPrice = (p: number) => p.toLocaleString('zh-CN', { minimumFractionDigits: 2 });
  const handlePrintContract = async (order: Order) => { toast.info('正在生成 PDF，请稍候...'); await printOrderContract(order, user); };
  const handlePrintDrawings = async (order: Order) => { toast.info('正在生成 PDF，请稍候...'); await printOrderDrawings(order, user); };

  return (
    <div className="flex flex-col h-full bg-[#F3F6F9] dark:bg-slate-900 animate-fade-in relative overflow-hidden transition-colors duration-300">
      
      {isExporting && (
          <div className="absolute inset-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <div className="text-lg font-bold text-gray-800 dark:text-white">正在生成 PDF 并压缩打包...</div>
          </div>
      )}

      {isExportModalOpen && (<BatchExportPreviewModal selectedOrders={orders.filter(o => selectedIds.has(o.id))} user={user} onCancel={() => setIsExportModalOpen(false)} onConfirm={handleConfirmExport} />)}

      {/* Top Header */}
      <div className="px-6 md:px-8 pt-8 pb-6 shrink-0 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{viewMode === 'overview' ? '工作台' : '订单列表'}</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm">{viewMode === 'overview' ? `欢迎回来，${user.name}。这里是您的业务全景。` : '管理所有客户订单与生产进度。'}</p>
          </div>
          {viewMode === 'list' && (
             <div className="flex gap-2">
                 {selectedIds.size > 0 && (
                     <button onClick={handleBatchDeleteClick} className="px-4 py-3 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 border bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 active:scale-95 animate-fade-in">
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        <span>删除 ({selectedIds.size})</span>
                     </button>
                 )}
                 <button onClick={handleBatchExportClick} className={`px-4 py-3 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 border ${selectedIds.size > 0 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100' : 'bg-white dark:bg-slate-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-slate-700 cursor-not-allowed'}`}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg> 批量导出 {selectedIds.size > 0 && <span className="ml-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{selectedIds.size}</span>}
                 </button>
                 <button onClick={onCreateNewOrder} className="bg-slate-900 dark:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-slate-300 dark:shadow-blue-900/50 hover:bg-black dark:hover:bg-blue-500 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m7-7H5"/></svg>新建订单
                 </button>
             </div>
          )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-8 custom-scrollbar">
        {viewMode === 'overview' ? (
            <div className="space-y-6 animate-scale-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="本月总营收" value={`¥ ${formatPrice(stats.totalRevenue)}`} subtext="+12.5% 较上月" color="bg-blue-500" icon={<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} />
                    <StatCard title="活跃订单" value={stats.active} subtext="当前正在进行中" color="bg-violet-500" icon={<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>} />
                    <StatCard title="待排产" value="3" subtext="需要尽快确认" color="bg-orange-500" icon={<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} />
                    <StatCard title="交付完成率" value="98.2%" subtext="高于行业平均" color="bg-emerald-500" icon={<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-slate-700 min-h-[320px]"><TrendChart /></div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-slate-700 min-h-[320px]"><OrderDistribution stats={stats} /></div>
                </div>
            </div>
        ) : (
            <div className="flex flex-col h-full animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
                        {statusOptions.map(status => (
                            <button key={status} onClick={() => setStatusFilter(status)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${statusFilter === status ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-100 dark:border-slate-700'}`}>{status === 'ALL' ? '全部状态' : status}</button>
                        ))}
                    </div>
                    <div className="relative group w-full sm:w-auto">
                        <svg className="absolute left-3 top-3 text-gray-400" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        <input type="text" placeholder="搜索订单..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl w-full sm:w-64 text-sm font-bold focus:w-80 transition-all outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm dark:text-white" />
                    </div>
                </div>
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-[24px] shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 dark:bg-slate-900/50 text-xs text-gray-500 dark:text-gray-400 uppercase font-bold sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="p-5 pl-8 w-10"><input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={filteredOrders.length > 0 && selectedIds.size === filteredOrders.length} onChange={handleSelectAll} /></th>
                                    <th className="p-5">订单号 / 日期</th>
                                    <th className="p-5">客户信息</th>
                                    <th className="p-5 text-center">项目数</th>
                                    <th className="p-5 text-right">总金额</th>
                                    <th className="p-5 text-center">状态</th>
                                    <th className="p-5 text-center">操作</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-gray-100 dark:divide-slate-700">
                            {filteredOrders.length === 0 ? (<tr><td colSpan={7} className="p-12 text-center text-gray-400 dark:text-slate-500"><div className="text-4xl mb-2">🔍</div>没有找到符合条件的订单</td></tr>) : (
                                filteredOrders.map((order) => {
                                    // Visual indicator calculation
                                    const isPaidOff = (order.paidAmount || 0) >= order.totalAmount;
                                    const currentStatus = order.status || '已确认';
                                    
                                    return (
                                        <tr key={order.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                                            <td className="p-5 pl-8"><input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={selectedIds.has(order.id)} onChange={() => handleSelectOne(order.id)} /></td>
                                            <td className="p-5">
                                                <div className="font-mono font-bold text-gray-900 dark:text-gray-200">{order.id}</div>
                                                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{order.date}</div>
                                            </td>
                                            <td className="p-5">
                                                <div className="font-bold text-gray-800 dark:text-gray-300">{order.customerName.split(' - ')[0]}</div>
                                                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{order.customerName.split(' - ')[1] || '无备注'}</div>
                                            </td>
                                            <td className="p-5 text-center"><span className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-xs font-bold">{order.items.length} 件</span></td>
                                            <td className="p-5 text-right">
                                                <div className="font-mono font-bold text-gray-900 dark:text-white">¥ {formatPrice(order.totalAmount)}</div>
                                                {isPaidOff && <div className="text-[10px] text-green-500 font-bold mt-0.5">已结清</div>}
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${currentStatus === '已确认' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' : currentStatus === '生产中' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'}`}>
                                                    {currentStatus}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                            <div className="flex items-center justify-center gap-1 opacity-100">
                                                <button onClick={() => handlePrintContract(order)} className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all" title="打印合同/报价单"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></button>
                                                <button onClick={() => handlePrintDrawings(order)} className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all" title="打印图纸附录"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></button>
                                                <div className="w-px h-4 bg-gray-300 dark:bg-slate-600 mx-2"></div>
                                                <button onClick={() => onEditOrder(order)} className="p-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all" title="编辑详情"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                                                <button onClick={async () => { const isConfirmed = await confirm({ title: '删除订单', content: `确认要永久删除订单 ${order.id} 吗？此操作无法撤销。`, confirmText: '确认删除', isDestructive: true }); if (isConfirmed) onDeleteOrder(order.id); }} className="p-2 text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="删除订单"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                                            </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};