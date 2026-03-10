import React, { useMemo, useState, useEffect } from 'react';
import { UserProfile, Order } from '../../types';
import { fetchOrderList, fetchUserProfile } from '../../api/api';
import { useFeedback } from '../common/FeedbackContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/index';

// 快捷操作卡片组件
const QuickActionCard = ({ title, subtitle, icon, route }: { title: string; subtitle: string; icon: React.ReactNode; route: string }) => {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate(route)}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all duration-300"
        >
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                    {icon}
                </div>
                <div className="flex-1">
                    <h3 className="font-medium text-base text-gray-900 dark:text-white mb-1">{title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
                </div>
            </div>
        </button>
    );
};

// 统计卡片组件
const StatCard = ({ title, value, subtext, icon }: any) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all duration-300">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white">{value}</h3>
                        {subtext && (
                            <span className="text-xs font-medium text-green-500">{subtext}</span>
                        )}
                    </div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                    {icon}
                </div>
            </div>
        </div>
    );
};

// 最近订单组件
const RecentOrders = ({ orders }: { orders: Order[] }) => {
    const navigate = useNavigate();

    const handleEditOrder = (order: Order) => {
        localStorage.setItem('editOrder', JSON.stringify(order));
        navigate(ROUTES.ORDERS);
    };

    if (orders.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 mx-auto mb-3">
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 7h-4V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v3H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" /><path d="M16 11h-4a2 2 0 01-2-2V7h6v2a2 2 0 01-2 2z" /></svg>
                </div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2">暂无订单</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">开始创建您的第一笔订单</p>
                <button
                    onClick={() => navigate(ROUTES.ORDERS)}
                    className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium shadow-sm transition-all text-sm"
                >
                    查看订单
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-slate-700">
                <h3 className="font-semibold text-base text-gray-900 dark:text-white">最近订单</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
                {orders.slice(0, 5).map((order) => {
                    const isPaidOff = (order.paidAmount || 0) >= order.totalAmount;
                    const currentStatus = order.status || '已确认';

                    return (
                        <div key={order.id} className="p-4 hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center text-xs font-semibold">
                                            {order.customerName.charAt(0)}
                                        </div>
                                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                            {order.customerName.split(' - ')[0]}
                                        </h4>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                        <span>订单号: {order.id}</span>
                                        <span>{order.date}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                                        ¥{order.totalAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                                        {isPaidOff && <span className="ml-2 text-green-500 text-xs">已结清</span>}
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
                            <div className="mt-3 flex justify-end">
                                <button
                                    onClick={() => handleEditOrder(order)}
                                    className="px-4 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                                >
                                    查看详情
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const DashboardView: React.FC = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [user, setUser] = useState<UserProfile>({ id: '', name: '', email: '' });
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useFeedback();
    const navigate = useNavigate();

    // 检测设备类型
    useEffect(() => {
        const checkDevice = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
            setIsTablet(width >= 768 && width < 1024);
        };
        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
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
                console.error('Failed to load dashboard data:', error);
                toast.error('数据加载失败');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();

        // 定期刷新数据，每30秒更新一次
        const intervalId = setInterval(loadData, 30000);
        return () => clearInterval(intervalId);
    }, [toast]);

    const stats = useMemo(() => {
        const totalRev = orders.reduce((acc, o) => acc + o.totalAmount, 0);
        const active = orders.filter(o => o.status === '生产中' || o.status === '已确认').length;
        const completed = orders.filter(o => o.status === '生产完成').length;
        const pending = orders.filter(o => o.status === '已确认').length;
        return { totalRevenue: totalRev, active, completed, pending, total: orders.length };
    }, [orders]);

    const formatPrice = (p: number) => p.toLocaleString('zh-CN', { minimumFractionDigits: 2 });

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center bg-[#F3F6F9] dark:bg-slate-900">
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">加载中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-[#F3F6F9] dark:bg-slate-900 animate-fade-in">
            {isMobile ? (
                /* ==================== 移动端设计 ==================== */
                <div className="h-full flex flex-col">
                    {/* 头部 */}
                    <div className="px-4 pt-4 pb-2">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">工作台</h1>
                            <button
                                onClick={() => navigate(ROUTES.ORDERS)}
                                className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center active:bg-blue-600 transition-colors"
                            >
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            </button>
                        </div>

                        {/* 欢迎信息 */}
                        <div className="mb-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">欢迎回来，{user.name}</p>
                        </div>

                        {/* 统计卡片 - 网格布局 */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all duration-300">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">本月总营收</p>
                                        <div className="flex items-baseline gap-2">
                                            <h3 className="text-xl font-medium text-gray-900 dark:text-white">¥ {formatPrice(stats.totalRevenue)}</h3>
                                            <span className="text-xs font-medium text-green-500">+12.5%</span>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all duration-300">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">活跃订单</p>
                                        <div className="flex items-baseline gap-2">
                                            <h3 className="text-xl font-medium text-gray-900 dark:text-white">{stats.active}</h3>
                                            <span className="text-xs font-medium text-green-500">进行中</span>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all duration-300">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">待排产</p>
                                        <div className="flex items-baseline gap-2">
                                            <h3 className="text-xl font-medium text-gray-900 dark:text-white">{stats.pending}</h3>
                                            <span className="text-xs font-medium text-green-500">待确认</span>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all duration-300">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">已完成</p>
                                        <div className="flex items-baseline gap-2">
                                            <h3 className="text-xl font-medium text-gray-900 dark:text-white">{stats.completed}</h3>
                                            <span className="text-xs font-medium text-green-500">本月</span>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 快捷操作 */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div
                                onClick={() => navigate(ROUTES.ORDERS)}
                                className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center"
                            >
                                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 mb-3">
                                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                </div>
                                <h3 className="font-medium text-base text-gray-900 dark:text-white">创建订单</h3>
                            </div>
                            <div
                                onClick={() => navigate(ROUTES.PRODUCTS)}
                                className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center"
                            >
                                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 mb-3">
                                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 7h-4V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v3H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" /><path d="M16 11h-4a2 2 0 01-2-2V7h6v2a2 2 0 01-2 2z" /></svg>
                                </div>
                                <h3 className="font-medium text-base text-gray-900 dark:text-white">产品商城</h3>
                            </div>
                            <div
                                onClick={() => navigate(ROUTES.CUSTOMERS)}
                                className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center"
                            >
                                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 mb-3">
                                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                </div>
                                <h3 className="font-medium text-base text-gray-900 dark:text-white">客户管理</h3>
                            </div>
                        </div>
                    </div>

                    {/* 最近订单 */}
                    <div className="flex-1 overflow-y-auto px-4 pb-4">
                        <RecentOrders orders={orders} />
                    </div>
                </div>
            ) : (
                /* ==================== 桌面端和平板端设计 ==================== */
                <div className="h-full overflow-y-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
                    {/* 桌面端头部 */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">工作台</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm">欢迎回来，{user.name}。这里是您的业务全景。</p>
                        </div>

                        <div className="mt-4 sm:mt-0">
                            <button
                                onClick={() => navigate(ROUTES.ORDERS)}
                                className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                            >
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                新建订单
                            </button>
                        </div>
                    </div>

                    {/* 统计卡片 */}
                    <div className={`grid gap-4 mb-6 ${isTablet ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                        }`}>
                        <StatCard
                            title="本月总营收"
                            value={`¥ ${formatPrice(stats.totalRevenue)}`}
                            subtext="+12.5% 较上月"
                            icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />
                        <StatCard
                            title="活跃订单"
                            value={stats.active}
                            subtext="当前正在进行中"
                            icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
                        />
                        <StatCard
                            title="待排产"
                            value={stats.pending}
                            subtext="需要尽快确认"
                            icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />
                        <StatCard
                            title="已完成订单"
                            value={stats.completed}
                            subtext="本月交付"
                            icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />
                    </div>

                    {/* 快捷操作区域 */}
                    <div className={`grid gap-4 mb-6 ${isTablet ? 'grid-cols-3' : 'grid-cols-1 sm:grid-cols-3'
                        }`}>
                        <QuickActionCard
                            title="创建订单"
                            subtitle="创建新的销售订单"
                            icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}
                            route={ROUTES.ORDERS}
                        />
                        <QuickActionCard
                            title="产品商城"
                            subtitle="浏览和管理产品"
                            icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 7h-4V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v3H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" /><path d="M16 11h-4a2 2 0 01-2-2V7h6v2a2 2 0 01-2 2z" /></svg>}
                            route={ROUTES.PRODUCTS}
                        />
                        <QuickActionCard
                            title="客户管理"
                            subtitle="查看和管理客户"
                            icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                            route={ROUTES.CUSTOMERS}
                        />
                    </div>

                    {/* 最近订单 */}
                    <RecentOrders orders={orders} />
                </div>
            )}
        </div>
    );
};