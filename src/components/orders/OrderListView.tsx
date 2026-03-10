// OrderListView.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { Order, UserProfile } from '../../types';
import { printOrderContract, printOrderDrawings, generateBatchExportZip } from '../../utils';
import { useFeedback } from '../common/FeedbackContext';
import { createPortal } from 'react-dom';
import { Icons } from '../common/Icons';
import { fetchOrderList, deleteOrder, fetchUserProfile } from '../../api/api';
import { useNavigate } from 'react-router-dom';


// 批量导出预览弹窗组件
const BatchExportPreviewModal = ({ selectedOrders, user, onCancel, onConfirm }: any) => {
    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onCancel}></div>
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-scale-in">
                <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">批量导出预览</h3>
                        <p className="text-xs text-gray-500 mt-1">将生成 {selectedOrders.length} 个订单压缩包</p>
                    </div>
                    <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-slate-900/50">
                    <div className="space-y-3">
                        {selectedOrders.map((order: Order) => (
                            <div key={order.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                                        <Icons.Box className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-medium text-gray-900 dark:text-white">{order.customerName}</h4>
                                            <span className="text-xs text-gray-400">{order.id}</span>
                                        </div>
                                        <div className="mt-2 space-y-1 text-xs text-gray-500">
                                            <div>合同: 销售合同_{order.id}.pdf</div>
                                            <div>图纸: 生产图纸_{order.id}.pdf</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3">
                    <button onClick={onCancel} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">取消</button>
                    <button onClick={onConfirm} className="px-6 py-2.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-xl shadow-sm transition-all flex items-center gap-2">
                        确认导出 ZIP
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export const OrderListView: React.FC = () => {
    const { toast, confirm } = useFeedback();
    const [isMobile, setIsMobile] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [showCheckboxes, setShowCheckboxes] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [user, setUser] = useState<UserProfile>({ name: '', email: '', avatar: '', role: 'Designer', company: '', plan: 'Free' });
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // 检测移动端
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // 加载数据
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // 并行请求订单和用户数据
                const [ordersRes, userRes] = await Promise.all([
                    fetchOrderList(),
                    fetchUserProfile()
                ]);

                if (ordersRes.code === 200) {
                    setOrders(ordersRes.data);
                }

                if (userRes.code === 200) {
                    setUser(userRes.data);
                }
            } catch (error) {
                console.error('Failed to load order list data:', error);
                toast.error('数据加载失败');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [toast]);

    const statusOptions = ['ALL', '已确认', '生产中', '生产完成', '已结清'];

    const filteredOrders = useMemo(() => orders.filter(order => {
        const matchesSearch = order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id.toLowerCase().includes(searchQuery.toLowerCase());
        let matchesStatus = true;
        const currentStatus = order.status || '已确认';

        if (statusFilter === 'ALL') {
            matchesStatus = true;
        } else if (statusFilter === '已结清') {
            const paid = order.paidAmount || 0;
            matchesStatus = paid >= (order.totalAmount - 0.01);
        } else {
            matchesStatus = currentStatus === statusFilter;
        }

        return matchesSearch && matchesStatus;
    }), [orders, searchQuery, statusFilter]);

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
        if (selectedIds.size === 0) {
            toast.info("请选择需要导出的订单");
            setShowCheckboxes(true);
        } else {
            setIsExportModalOpen(true);
        }
    };

    useEffect(() => {
        if (selectedIds.size > 0) {
            setShowCheckboxes(true);
        }
    }, [selectedIds.size]);

    // 处理编辑订单
    const handleEditOrder = (order: Order) => {
        // 导航到编辑器页面，将订单数据存储在localStorage中
        localStorage.setItem('editOrder', JSON.stringify(order));
        navigate('/editor');
    };

    // 处理删除订单
    const handleDeleteOrder = async (orderId: number) => {
        try {
            await deleteOrder(orderId);
            setOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
            toast.success('订单已删除');
        } catch (e) {
            toast.error("删除订单失败");
        }
    };

    // 处理创建新订单
    const handleCreateNewOrder = () => {
        // 清除之前的编辑订单数据
        localStorage.removeItem('editOrder');
        navigate('/editor');
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
            try {
                // 并行删除所有选中的订单
                await Promise.all(Array.from(selectedIds).map(id => deleteOrder(Number(id))));
                setOrders(prevOrders => prevOrders.filter(o => !selectedIds.has(o.id)));
                setSelectedIds(new Set());
                toast.success(`已成功删除 ${selectedIds.size} 个订单`);
            } catch (e) {
                toast.error("批量删除订单失败");
            }
        }
    };

    const handleConfirmExport = async () => {
        setIsExportModalOpen(false);
        setIsExporting(true);
        const toastId = toast.info("正在准备生成文件...");
        const ordersToExport = orders.filter(o => selectedIds.has(o.id));
        try {
            const blob = await generateBatchExportZip(ordersToExport, user, (msg) => console.log(msg));
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `批量导出订单_${new Date().toISOString().slice(0, 10)}.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success("导出成功！");
            setSelectedIds(new Set());
        } catch (e) {
            console.error(e);
            toast.error("导出过程中发生错误");
        } finally {
            setIsExporting(false);
        }
    };

    const formatPrice = (p: number) => p.toLocaleString('zh-CN', { minimumFractionDigits: 2 });

    const handlePrintContract = async (order: Order) => {
        toast.info('正在生成 PDF，请稍候...');
        await printOrderContract(order, user);
    };

    const handlePrintDrawings = async (order: Order) => {
        toast.info('正在生成 PDF，请稍候...');
        await printOrderDrawings(order, user);
    };

    return (
        <div className="h-full bg-[#F3F6F9] dark:bg-slate-900 animate-fade-in">
            {isMobile ? (
                /* ==================== 移动端设计 ==================== */
                <div className="h-full flex flex-col">
                    {/* 加载状态 */}
                    {isExporting && (
                        <div className="fixed inset-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
                            <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                            <div className="text-sm font-medium text-gray-800 dark:text-white">正在生成 PDF...</div>
                        </div>
                    )}

                    {/* 导出预览弹窗 */}
                    {isExportModalOpen && (
                        <BatchExportPreviewModal
                            selectedOrders={orders.filter(o => selectedIds.has(o.id))}
                            user={user}
                            onCancel={() => setIsExportModalOpen(false)}
                            onConfirm={handleConfirmExport}
                        />
                    )}

                    {/* 头部 */}
                    <div className="px-4 pt-4 pb-2">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">订单</h1>
                            <button
                                onClick={handleCreateNewOrder}
                                className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center active:bg-blue-600 transition-colors"
                            >
                                <Icons.Plus className="w-5 h-5" />
                            </button>
                        </div>

                        {/* 搜索框 */}
                        <div className="relative mb-3">
                            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="搜索客户或订单号"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-9 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:text-white"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* 状态筛选标签 - 横向滚动 */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {statusOptions.map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${statusFilter === status
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700'
                                        }`}
                                >
                                    {status === 'ALL' ? '全部' : status}
                                </button>
                            ))}
                        </div>

                        {/* 批量操作栏 */}
                        {selectedIds.size > 0 && (
                            <div className="flex items-center gap-2 mt-3 animate-fade-in">
                                <button
                                    onClick={handleBatchExportClick}
                                    className="flex-1 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-center gap-2"
                                >
                                    <Icons.DocumentText className="w-4 h-4" />
                                    导出 ({selectedIds.size})
                                </button>
                                <button
                                    onClick={handleBatchDeleteClick}
                                    className="flex-1 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-xl border border-red-200 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    删除
                                </button>
                            </div>
                        )}

                        {/* 结果统计 */}
                        <div className="mt-3 text-xs text-gray-500">
                            共 {filteredOrders.length} 个订单
                        </div>
                    </div>

                    {/* 订单列表 */}
                    <div className="flex-1 overflow-y-auto px-4 pb-4">
                        {filteredOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 mt-8 text-gray-400">
                                <Icons.Box className="w-12 h-12 mb-2 opacity-30" />
                                <p className="text-sm">暂无订单</p>
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setStatusFilter('ALL');
                                    }}
                                    className="mt-3 text-xs text-blue-500"
                                >
                                    清除筛选
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredOrders.map((order) => {
                                    const isPaidOff = (order.paidAmount || 0) >= order.totalAmount;
                                    const currentStatus = order.status || '已确认';

                                    return (
                                        <div
                                            key={order.id}
                                            className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3 border border-gray-100 dark:border-slate-700"
                                        >
                                            {/* 第一行：选择框 + 客户名 + 状态 */}
                                            <div className="flex items-center gap-2 mb-2">
                                                {showCheckboxes && (
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-gray-300 text-blue-500"
                                                        checked={selectedIds.has(order.id)}
                                                        onChange={() => handleSelectOne(order.id)}
                                                    />
                                                )}
                                                <div className="flex-1 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center text-xs font-bold">
                                                            {order.customerName.charAt(0)}
                                                        </div>
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {order.customerName.split(' - ')[0]}
                                                        </span>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${currentStatus === '已确认' ? 'bg-green-100 text-green-700' :
                                                        currentStatus === '生产中' ? 'bg-purple-100 text-purple-700' :
                                                            currentStatus === '生产完成' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {currentStatus}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* 第二行：订单号 + 金额 */}
                                            <div className="flex items-center justify-between text-xs mb-2">
                                                <span className="text-gray-400 font-mono">{order.id}</span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    ¥{formatPrice(order.totalAmount)}
                                                    {isPaidOff && <span className="ml-1 text-green-500 text-[10px]">已结清</span>}
                                                </span>
                                            </div>

                                            {/* 第三行：项目数 + 日期 */}
                                            <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                                                <span>{order.items.length} 个项目</span>
                                                <span>•</span>
                                                <span>{order.date}</span>
                                            </div>

                                            {/* 第四行：客户信息 */}
                                            {(order.customerPhone || order.address) && (
                                                <div className="text-xs text-gray-500 space-y-1 mb-3">
                                                    {order.customerPhone && (
                                                        <div className="flex items-center gap-1">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                            </svg>
                                                            {order.customerPhone}
                                                        </div>
                                                    )}
                                                    {order.address && (
                                                        <div className="flex items-center gap-1 truncate">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            <span className="truncate">{order.address}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* 操作按钮组 */}
                                            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-slate-700">
                                                <button
                                                    onClick={() => handlePrintContract(order)}
                                                    className="flex-1 py-2 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg flex items-center justify-center gap-1"
                                                >
                                                    <Icons.DocumentText className="w-3.5 h-3.5" />
                                                    合同
                                                </button>
                                                <button
                                                    onClick={() => handlePrintDrawings(order)}
                                                    className="flex-1 py-2 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg flex items-center justify-center gap-1"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    图纸
                                                </button>
                                                <button
                                                    onClick={() => handleEditOrder(order)}
                                                    className="flex-1 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg"
                                                >
                                                    编辑
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        const confirmed = await confirm({
                                                            title: '删除订单',
                                                            content: `确认删除订单 ${order.id} 吗？`,
                                                            confirmText: '删除',
                                                            isDestructive: true
                                                        });
                                                        if (confirmed) handleDeleteOrder(order.id);
                                                    }}
                                                    className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-500"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* ==================== 桌面端设计 ==================== */
                <div className="h-full overflow-y-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
                    {/* 桌面端头部 */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">订单管理</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm">管理客户订单与生产进度</p>
                        </div>

                        <div className="flex items-center gap-3">
                            {selectedIds.size > 0 && (
                                <>
                                    <button
                                        onClick={handleBatchDeleteClick}
                                        className="px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        删除 ({selectedIds.size})
                                    </button>
                                    <button
                                        onClick={handleBatchExportClick}
                                        className="px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-2"
                                    >
                                        <Icons.DocumentText className="w-4 h-4" />
                                        导出 ({selectedIds.size})
                                    </button>
                                </>
                            )}
                            <button
                                onClick={handleCreateNewOrder}
                                className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                            >
                                <Icons.Plus className="w-4 h-4" />
                                新建订单
                            </button>
                        </div>
                    </div>

                    {/* 筛选栏 */}
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                        >
                            {statusOptions.map(status => (
                                <option key={status} value={status}>
                                    {status === 'ALL' ? '全部状态' : status}
                                </option>
                            ))}
                        </select>

                        <div className="relative w-80">
                            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="搜索客户或订单号..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 桌面端表格 */}
                    <div className="bg-white dark:bg-slate-800 rounded-[20px] border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-slate-700">
                                        {showCheckboxes && (
                                            <th className="px-6 py-4 w-10">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-500"
                                                    checked={filteredOrders.length > 0 && selectedIds.size === filteredOrders.length}
                                                    onChange={handleSelectAll}
                                                />
                                            </th>
                                        )}
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">序号</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">客户信息</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">项目数</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">总金额</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">日期</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">订单号</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">状态</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                    {filteredOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={showCheckboxes ? 9 : 8} className="text-center py-12">
                                                <div className="flex flex-col items-center text-gray-400">
                                                    <Icons.Box className="w-12 h-12 mb-3 opacity-30" />
                                                    <p className="text-sm font-medium">暂无订单数据</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredOrders.map((order, index) => {
                                            const isPaidOff = (order.paidAmount || 0) >= order.totalAmount;
                                            const currentStatus = order.status || '已确认';

                                            return (
                                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                                    {showCheckboxes && (
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="checkbox"
                                                                className="w-4 h-4 rounded border-gray-300 text-blue-500"
                                                                checked={selectedIds.has(order.id)}
                                                                onChange={() => handleSelectOne(order.id)}
                                                            />
                                                        </td>
                                                    )}
                                                    <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-900">{order.customerName.split(' - ')[0]}</div>
                                                        {order.customerName.split(' - ')[1] && (
                                                            <div className="text-xs text-gray-400 mt-0.5">{order.customerName.split(' - ')[1]}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-sm text-gray-600">{order.items.length} 件</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="text-sm font-medium text-gray-900">¥{formatPrice(order.totalAmount)}</div>
                                                        {isPaidOff && <div className="text-[10px] text-green-500">已结清</div>}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{order.date}</td>
                                                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{order.id}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${currentStatus === '已确认' ? 'bg-green-100 text-green-700' :
                                                            currentStatus === '生产中' ? 'bg-purple-100 text-purple-700' :
                                                                currentStatus === '生产完成' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {currentStatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button
                                                                onClick={() => handlePrintContract(order)}
                                                                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="打印合同"
                                                            >
                                                                <Icons.DocumentText className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handlePrintDrawings(order)}
                                                                className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
                                                                title="打印图纸"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleEditOrder(order)}
                                                                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="编辑"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    const confirmed = await confirm({
                                                                        title: '删除订单',
                                                                        content: `确认删除订单 ${order.id} 吗？`,
                                                                        confirmText: '删除',
                                                                        isDestructive: true
                                                                    });
                                                                    if (confirmed) handleDeleteOrder(order.id);
                                                                }}
                                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="删除"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
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
    );
};