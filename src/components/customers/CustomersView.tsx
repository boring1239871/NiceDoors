import React, { useState, useEffect } from 'react';
import { Customer } from '../../types';
import { useFeedback } from '../common/FeedbackContext';

interface CustomersViewProps {
    customers: Customer[];
    onAddCustomer: (customer: Customer) => void;
    onUpdateCustomer: (customer: Customer) => void;
    onDeleteCustomer: (id: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
    customers,
    onAddCustomer,
    onUpdateCustomer,
    onDeleteCustomer
}) => {
    const { confirm, toast } = useFeedback();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
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

    // Form State
    const [formData, setFormData] = useState<Partial<Customer>>({});

    // 过滤客户列表
    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
    );

    // 打开模态框（新增或编辑）
    const handleOpenModal = (customer?: Customer) => {
        if (customer) {
            setEditingCustomer(customer);
            setFormData({ ...customer });
        } else {
            setEditingCustomer(null);
            setFormData({ name: '', phone: '', address: '', remark: '' });
        }
        setIsModalOpen(true);
    };

    // 提交表单
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone) {
            toast.error('姓名和电话不能为空');
            return;
        }

        if (editingCustomer) {
            onUpdateCustomer({ ...editingCustomer, ...formData } as Customer);
            toast.success('客户信息已更新');
        } else {
            const newCustomer: Customer = {
                id: `CUST-${Date.now()}`,
                createdAt: new Date().toISOString().slice(0, 10),
                name: formData.name!,
                phone: formData.phone!,
                address: formData.address || '',
                remark: formData.remark || ''
            };
            onAddCustomer(newCustomer);
            toast.success('新客户已添加');
        }
        setIsModalOpen(false);
    };

    // 删除客户
    const handleDelete = async (id: string) => {
        if (await confirm({ title: '删除客户', content: '确定要删除此客户吗？此操作无法撤销。', isDestructive: true })) {
            onDeleteCustomer(id);
            toast.success('客户已删除');
        }
    };

    return (
        <div className="h-full bg-[#F3F6F9] dark:bg-slate-900 animate-fade-in">
            {isMobile ? (
                /* ==================== 移动端设计 ==================== */
                <div className="h-full flex flex-col">
                    {/* 头部 - 简洁清爽 */}
                    <div className="px-4 pt-4 pb-2">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">客户</h1>
                            <button
                                onClick={() => handleOpenModal()}
                                className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center active:bg-blue-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        </div>

                        {/* 搜索框 */}
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="搜索"
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

                        {/* 总数统计 */}
                        <div className="mt-3 text-xs text-gray-500">
                            共 {filteredCustomers.length} 位客户
                        </div>
                    </div>

                    {/* 列表 - 极简卡片 */}
                    <div className="flex-1 overflow-y-auto px-4 pb-4">
                        {filteredCustomers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 mt-8 text-gray-400">
                                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <p className="text-sm">暂无客户</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredCustomers.map((customer) => (
                                    <div
                                        key={customer.id}
                                        className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3 border border-gray-100 dark:border-slate-700"
                                    >
                                        {/* 第一行：姓名 + 操作 */}
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center text-sm font-bold">
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {customer.name}
                                                </span>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleOpenModal(customer)}
                                                    className="p-2 text-gray-400 hover:text-blue-500 active:bg-gray-100 dark:active:bg-slate-700 rounded-lg transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(customer.id)}
                                                    className="p-2 text-gray-400 hover:text-red-400 active:bg-gray-100 dark:active:bg-slate-700 rounded-lg transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        {/* 第二行：电话 + 地址（两列布局） */}
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="flex items-center gap-1.5 text-gray-500">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                <span className="text-gray-600 dark:text-gray-300">{customer.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-gray-500 truncate">
                                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span className="text-gray-500 dark:text-gray-400 truncate">
                                                    {customer.address || '未填写'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* 第三行：备注 + 创建日期（两列布局） */}
                                        <div className="grid grid-cols-2 gap-2 text-xs mt-2 pt-2 border-t border-gray-50 dark:border-slate-700">
                                            <div className="flex items-center gap-1.5 text-gray-400">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                                </svg>
                                                <span className="truncate">{customer.remark || '无备注'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-gray-400">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span>{customer.createdAt}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* ==================== 桌面端设计 ==================== */
                <div className="overflow-y-auto h-full px-4 sm:px-6 md:px-8 py-8">
                    {/* 桌面端头部 */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">客户管理</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm">管理客户档案与联系信息</p>
                        </div>

                        <button
                            onClick={() => handleOpenModal()}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>新增客户</span>
                        </button>
                    </div>

                    {/* 桌面端搜索栏 */}
                    <div className="flex justify-end mb-6">
                        <div className="relative w-80">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="输入客户姓名或电话..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/30 font-medium dark:text-white placeholder:text-gray-400"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 桌面端表格 */}
                    <div className="bg-white dark:bg-slate-800 rounded-[20px] border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-slate-700">
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">客户姓名</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">联系电话</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">工程地址</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">创建日期</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                    {filteredCustomers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-12">
                                                <div className="flex flex-col items-center text-gray-400">
                                                    <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                    <p className="text-sm font-medium">暂无客户数据</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCustomers.map((customer) => (
                                            <tr key={customer.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                                                            {customer.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 dark:text-white">{customer.name}</div>
                                                            {customer.remark && (
                                                                <div className="text-xs text-gray-400 mt-0.5">{customer.remark}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-medium text-gray-600 dark:text-gray-300">{customer.phone}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate block" title={customer.address}>
                                                        {customer.address || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-400">{customer.createdAt}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-3">
                                                    <button
                                                        onClick={() => handleOpenModal(customer)}
                                                        className="text-xs font-bold text-blue-500 hover:text-blue-600 px-2 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                    >
                                                        编辑
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(customer.id)}
                                                        className="text-xs font-bold text-red-400 hover:text-red-500 px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    >
                                                        删除
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* 模态框 - 全平台统一风格 */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in">
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                            {editingCustomer ? '编辑客户' : '新增客户'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-2">
                                    姓名 <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500/30 dark:text-white"
                                    placeholder="请输入客户姓名"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-2">
                                    电话 <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500/30 dark:text-white"
                                    placeholder="请输入联系电话"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-2">
                                    工程地址
                                </label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500/30 dark:text-white"
                                    placeholder="请输入详细地址"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-2">
                                    备注
                                </label>
                                <textarea
                                    value={formData.remark}
                                    onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500/30 dark:text-white resize-none h-20"
                                    placeholder="选填..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl transition-colors"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-xl shadow-sm hover:shadow transition-all"
                                >
                                    保存
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};