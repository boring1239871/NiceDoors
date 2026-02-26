import React, { useMemo, useState, useEffect } from 'react';
import { UserProfile, Order } from '../../types';

interface DashboardViewProps {
    orders: Order[];
    user: UserProfile;
}

const StatCard = ({ title, value, subtext, icon, color }: any) => (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-[20px] border border-gray-100 dark:border-slate-700 shadow-sm flex items-start justify-between group hover:shadow-md transition-all cursor-default">
        <div>
            <div className="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-1">{title}</div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
            <div className={`text-xs font-medium ${subtext.includes('+') ? 'text-green-500' : 'text-gray-400 dark:text-slate-500'}`}>{subtext}</div>
        </div>
        <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-xl flex items-center justify-center ${color} text-white shadow-lg opacity-90 group-hover:scale-110 transition-transform shrink-0`}>
            {icon}
        </div>
    </div>
);

const TrendChart = () => (
    <div className="w-full h-full flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
                <h4 className="font-bold text-gray-800 dark:text-white text-base sm:text-lg">销售趋势</h4>
                <p className="text-xs text-gray-400 dark:text-gray-500">近 6 个月业绩走势 (万元)</p>
            </div>
            <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-bold">实际营收</span>
            </div>
        </div>
        <div className="flex-1 relative w-full">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <line x1="0" y1="150" x2="500" y2="150" stroke="currentColor" className="text-slate-100 dark:text-slate-700" strokeWidth="1" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="currentColor" className="text-slate-100 dark:text-slate-700" strokeWidth="1" />
                <line x1="0" y1="50" x2="500" y2="50" stroke="currentColor" className="text-slate-100 dark:text-slate-700" strokeWidth="1" />
                <path d="M0,160 C50,150 50,120 100,130 C150,140 150,80 200,90 C250,100 250,60 300,50 C350,40 350,70 400,60 C450,50 450,20 500,10" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" className="drop-shadow-lg" />
                <path d="M0,160 C50,150 50,120 100,130 C150,140 150,80 200,90 C250,100 250,60 300,50 C350,40 350,70 400,60 C450,50 450,20 500,10 V200 H0 Z" fill="url(#gradientBlue)" opacity="0.1" />
                <defs>
                    <linearGradient id="gradientBlue" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                </defs>
                {[160, 130, 90, 50, 60, 10].map((y, i) => (
                    <g key={i} className="group">
                        <circle cx={i * 100} cy={y} r="4" fill="white" stroke="#3b82f6" strokeWidth="2" className="cursor-pointer hover:r-6 transition-all" />
                        <rect x={i * 100 - 20} y={y - 30} width="40" height="20" rx="4" fill="#1e293b" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        <text x={i * 100} y={y - 16} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" className="opacity-0 group-hover:opacity-100 transition-opacity">¥{20 - i * 2}w</text>
                    </g>
                ))}
            </svg>
        </div>
        <div className="flex justify-between text-xs font-bold text-gray-400 dark:text-gray-500 mt-2 px-1">
            <span>8月</span><span>9月</span><span>10月</span><span>11月</span><span>12月</span><span>1月</span>
        </div>
    </div>
);

const OrderDistribution = ({ stats }: { stats: any }) => (
    <div className="h-full flex flex-col min-w-0">
        <h4 className="font-bold text-gray-800 dark:text-white text-base sm:text-lg mb-4 sm:mb-6">订单状态分布</h4>
        <div className="flex items-center gap-4 sm:gap-6 xl:gap-8 h-full">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 xl:w-32 xl:h-32 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-700" strokeWidth="12" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="12" strokeDasharray="180 251" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="50 251" strokeDashoffset="-180" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg sm:text-xl xl:text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</span>
                    <span className="text-[10px] text-gray-400 uppercase">总计</span>
                </div>
            </div>
            <div className="flex-1 space-y-3 min-w-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate">设计/生产</span>
                    </div>
                    <span className="text-xs font-bold text-gray-800 dark:text-white">{stats.active}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate">已交付</span>
                    </div>
                    <span className="text-xs font-bold text-gray-800 dark:text-white">{stats.completed}</span>
                </div>
            </div>
        </div>
    </div>
);

export const DashboardView: React.FC<DashboardViewProps> = ({ orders, user }) => {
    const [isMobile, setIsMobile] = useState(false);

    // 检测移动端
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const stats = useMemo(() => {
        const totalRev = orders.reduce((acc, o) => acc + o.totalAmount, 0);
        const active = orders.filter(o => o.status === '生产中' || o.status === '已确认').length;
        const completed = orders.filter(o => o.status === '生产完成').length;
        return { totalRevenue: totalRev, active, completed, total: orders.length };
    }, [orders]);

    const formatPrice = (p: number) => p.toLocaleString('zh-CN', { minimumFractionDigits: 2 });

    return (
        <div className="h-full bg-[#F3F6F9] dark:bg-slate-900 animate-fade-in">
            {/* 移除overflow-hidden，让内容自然滚动 */}
            <div className="h-full overflow-y-auto">
                {/* 使用不同的padding来适应移动端和桌面端 */}
                <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
                    {/* 头部 - 响应式设计，移动端和桌面端统一但自适应 */}
                    <div className="mb-6 sm:mb-8 animate-fade-in animate-slide-up">
                        {/* 移动端显示方式 */}
                        <div className="sm:hidden">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                工作台
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
                                欢迎回来，{user.name}
                            </p>
                        </div>

                        {/* 桌面端显示方式 */}
                        <div className="hidden sm:block">
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                工作台
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm md:text-base">
                                欢迎回来，{user.name}。这里是您的业务全景。
                            </p>
                        </div>
                    </div>

                    {/* 主要内容区域 */}
                    <div className="space-y-4 sm:space-y-6 animate-scale-in">
                        {/* 统计卡片 - 移动端：2列网格 */}
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                            <StatCard
                                title="本月总营收"
                                value={`¥ ${formatPrice(stats.totalRevenue)}`}
                                subtext="+12.5% 较上月"
                                color="bg-blue-500"
                                icon={<svg width={isMobile ? "18" : "20"} height={isMobile ? "18" : "20"} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            />
                            <StatCard
                                title="活跃订单"
                                value={stats.active}
                                subtext="当前正在进行中"
                                color="bg-violet-500"
                                icon={<svg width={isMobile ? "18" : "20"} height={isMobile ? "18" : "20"} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
                            />
                            <StatCard
                                title="待排产"
                                value="3"
                                subtext="需要尽快确认"
                                color="bg-orange-500"
                                icon={<svg width={isMobile ? "18" : "20"} height={isMobile ? "18" : "20"} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            />
                            <StatCard
                                title="交付完成率"
                                value="98.2%"
                                subtext="高于行业平均"
                                color="bg-emerald-500"
                                icon={<svg width={isMobile ? "18" : "20"} height={isMobile ? "18" : "20"} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            />
                        </div>

                        {/* 图表区域 - 响应式布局 */}
                        <div className="space-y-4 sm:space-y-6">
                            {/* 移动端：垂直堆叠 */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-[20px] shadow-sm border border-gray-100 dark:border-slate-700 min-h-[280px] sm:min-h-[320px]">
                                    <TrendChart />
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-[20px] shadow-sm border border-gray-100 dark:border-slate-700 min-h-[280px] sm:min-h-[320px]">
                                    <OrderDistribution stats={stats} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};