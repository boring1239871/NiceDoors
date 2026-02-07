import React, { useState } from 'react';
import { Customer } from '../../types';
import { useFeedback } from '../common/FeedbackContext';

interface CustomersViewProps {
  customers: Customer[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({ customers, onAddCustomer, onUpdateCustomer, onDeleteCustomer }) => {
  const { confirm, toast } = useFeedback();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Customer>>({});

  const filteredCustomers = customers.filter(c => 
     c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     c.phone.includes(searchTerm)
  );

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

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name || !formData.phone) {
          toast.error("姓名和电话不能为空");
          return;
      }

      if (editingCustomer) {
          onUpdateCustomer({ ...editingCustomer, ...formData } as Customer);
          toast.success("客户信息已更新");
      } else {
          const newCustomer: Customer = {
              id: `CUST-${Date.now()}`,
              createdAt: new Date().toISOString().slice(0,10),
              name: formData.name!,
              phone: formData.phone!,
              address: formData.address || '',
              remark: formData.remark || ''
          };
          onAddCustomer(newCustomer);
          toast.success("新客户已添加");
      }
      setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
      if (await confirm({ title: '删除客户', content: '确定要删除此客户吗？此操作无法撤销。', isDestructive: true })) {
          onDeleteCustomer(id);
          toast.success("客户已删除");
      }
  };

  return (
    <div className="flex flex-col h-full bg-[#F3F6F9] dark:bg-slate-900 animate-fade-in p-6 md:p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">客户管理</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">管理客户档案与联系信息</p>
            </div>
            <button 
                onClick={() => handleOpenModal()} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m7-7H5"/></svg>
                新增客户
            </button>
        </div>

        {/* Search */}
        <div className="mb-6">
            <div className="relative max-w-md">
                <svg className="absolute left-3 top-3 text-gray-400" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input 
                    type="text" 
                    placeholder="搜索客户姓名或电话..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                />
            </div>
        </div>

        {/* List */}
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-slate-900/50 text-xs text-gray-500 uppercase font-bold sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-4">客户姓名</th>
                            <th className="px-6 py-4">联系电话</th>
                            <th className="px-6 py-4">工程地址</th>
                            <th className="px-6 py-4">创建日期</th>
                            <th className="px-6 py-4 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {filteredCustomers.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-10 text-gray-400">暂无客户数据</td></tr>
                        ) : (
                            filteredCustomers.map(customer => (
                                <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">
                                        {customer.name}
                                        {customer.remark && <div className="text-[10px] font-normal text-gray-400 mt-0.5">{customer.remark}</div>}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-300">{customer.phone}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm max-w-xs truncate" title={customer.address}>{customer.address || '-'}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">{customer.createdAt}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleOpenModal(customer)} className="text-blue-600 hover:text-blue-800 font-bold text-xs px-2">编辑</button>
                                        <button onClick={() => handleDelete(customer.id)} className="text-red-500 hover:text-red-700 font-bold text-xs px-2">删除</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl relative z-10 p-6 animate-scale-in">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{editingCustomer ? '编辑客户' : '新增客户'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">姓名 <span className="text-red-500">*</span></label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">电话 <span className="text-red-500">*</span></label>
                                <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">工程地址</label>
                            <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="请输入详细地址" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">备注信息</label>
                            <textarea value={formData.remark} onChange={e => setFormData({...formData, remark: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 h-24 resize-none" placeholder="选填..." />
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all">取消</button>
                            <button type="submit" className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg transition-all">保存</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};