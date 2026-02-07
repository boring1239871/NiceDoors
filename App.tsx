import React, { useState, useEffect } from 'react';
import { Order, OrderItem, UserProfile, Customer, ProductTemplate, CadModel } from './types';
import { NavigationRail, ViewModule } from './components/common/NavigationRail';
import { LoginView } from './components/auth/LoginView';
import { DashboardView } from './components/dashboard/DashboardView';
import { OrdersView } from './components/orders/OrdersView';
import { ProfileView } from './components/profile/ProfileView';
import { CustomersView } from './components/customers/CustomersView';
import { ProductCatalogView } from './components/products/ProductCatalogView';
import { ItemDesigner } from './components/orders/ItemDesigner';
import { FeedbackProvider, useFeedback } from './components/common/FeedbackContext';
import { ThemeProvider } from './components/common/ThemeContext';
import { calculatePrice, svgToPng } from './utils';

// Import named API functions (Vue/Tree-shaking friendly style)
import {
    login,
    fetchCurrentUser,
    fetchUserProfile,
    fetchOrderList,
    fetchCustomerList,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    createOrder,
    updateOrder,
    deleteOrder
} from './api';

const AppContent = () => {
    const { toast } = useFeedback();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeModule, setActiveModule] = useState<ViewModule>('products');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Data State
    const [orders, setOrders] = useState<Order[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [user, setUser] = useState<UserProfile>({ name: '', email: '', avatar: '', role: 'Designer', company: '', plan: 'Free' });

    // Draft State
    const [currentOrder, setCurrentOrder] = useState<Order>({ id: '', customerName: '', date: new Date().toISOString().slice(0, 10), items: [], totalAmount: 0, paidAmount: 0 });
    const [designingTemplate, setDesigningTemplate] = useState<ProductTemplate | null>(null);

    // --- 0. Restore Session ---
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        const restore = async () => {
            try {
                const res = await fetchCurrentUser();
                if (res.code === 200) {
                    setUser(res.data);
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem('auth_token');
                }
            } catch {
                localStorage.removeItem('auth_token');
            }
        };

        restore();
    }, []);

    // --- 1. Data Loading Effect ---
    useEffect(() => {
        if (isAuthenticated) {
            const loadInitialData = async () => {
                setIsLoadingData(true);
                try {
                    // Parallel data fetching
                    const [userData, ordersData, customersData] = await Promise.all([
                        fetchUserProfile(),
                        fetchOrderList(),
                        fetchCustomerList()
                    ]);

                    if (userData.code === 200) setUser(userData.data);
                    if (ordersData.code === 200) setOrders(ordersData.data);
                    if (customersData.code === 200) setCustomers(customersData.data);

                } catch (error) {
                    console.error("Failed to load data", error);
                    toast.error("数据加载失败，请检查网络连接");
                } finally {
                    setIsLoadingData(false);
                }
            };

            loadInitialData();
        }
    }, [isAuthenticated]);

    const handleLogin = async (email: string, password: string) => {
        setIsLoadingData(true);
        try {
            const res = await login(email, password);
            if (res.code === 200) {
                localStorage.setItem('auth_token', res.data.access_token);
                setUser(res.data.user);
                setIsAuthenticated(true);
                toast.success('登录成功');
            } else {
                toast.error(res.message || '登录失败');
            }
        } catch (e) {
            toast.error('登录失败，请稍后重试');
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        setIsAuthenticated(false);
        setOrders([]);
        setCustomers([]);
        setUser({ name: '', email: '', avatar: '', role: 'Designer', company: '', plan: 'Free' });
    };


    // --- 2. Customer Actions ---
    const handleAddCustomer = async (customer: Customer) => {
        try {
            const res = await createCustomer(customer);
            if (res.code === 200) setCustomers(prev => [res.data, ...prev]);
        } catch (e) { toast.error("添加客户失败"); }
    };

    const handleUpdateCustomer = async (updatedCustomer: Customer) => {
        try {
            const res = await updateCustomer(updatedCustomer.id, updatedCustomer);
            if (res.code === 200) setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? res.data : c));
        } catch (e) { toast.error("更新客户失败"); }
    };

    const handleDeleteCustomer = async (id: string) => {
        try {
            await deleteCustomer(id);
            setCustomers(prev => prev.filter(c => c.id !== id));
        } catch (e) { toast.error("删除客户失败"); }
    };


    // --- 3. Order Actions ---
    const handleCreateNewOrder = () => {
        setCurrentOrder({ id: '', customerName: '', customerPhone: '', address: '', date: new Date().toISOString().slice(0, 10), items: [], totalAmount: 0, paidAmount: 0, status: '设计中' });
        setActiveModule('editor');
    };

    const handleEditOrder = (order: Order) => {
        setCurrentOrder(JSON.parse(JSON.stringify(order)));
        setActiveModule('editor');
    };

    const handleDeleteOrder = async (orderId: string) => {
        try {
            await deleteOrder(orderId);
            setOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
            toast.success('订单已删除');
        } catch (e) { toast.error("删除订单失败"); }
    };

    const handleSubmitOrder = async () => {
        if (!currentOrder.customerName) { toast.error("请输入客户名称"); return; }
        if (currentOrder.items.length === 0) { toast.error("订单不能为空，请添加产品"); return; }

        const statusToSave = currentOrder.status === '设计中' ? '已确认' : (currentOrder.status || '已确认');
        const orderToSave = { ...currentOrder, status: statusToSave };

        try {
            const existingIndex = orders.findIndex(o => o.id === currentOrder.id);
            let res;

            if (existingIndex !== -1) {
                // Update existing
                res = await updateOrder(currentOrder.id, orderToSave);
                if (res.code === 200) {
                    setOrders(prev => {
                        const newOrders = [...prev];
                        newOrders[existingIndex] = res.data;
                        return newOrders;
                    });
                }
            } else {
                // Create new
                res = await createOrder(orderToSave);
                if (res.code === 200) {
                    setOrders(prev => [res.data, ...prev]);
                }
            }

            toast.success("订单已保存至历史记录！");

            // Reset Draft
            setCurrentOrder({
                id: '',
                customerName: '',
                customerPhone: '',
                address: '',
                date: new Date().toISOString().slice(0, 10),
                items: [],
                totalAmount: 0,
                paidAmount: 0,
                status: '设计中'
            });

            setActiveModule('orders');

        } catch (e) {
            toast.error("保存订单失败");
        }
    };

    const handleUpdateDraft = (updatedOrder: Order) => { setCurrentOrder(updatedOrder); };

    // Product Catalog Actions
    const handleSelectProductFromCatalog = (template: ProductTemplate) => {
        if (!currentOrder.id) {
            const newId = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
            setCurrentOrder(prev => ({ ...prev, id: newId, status: '设计中' }));
        }
        setDesigningTemplate(template);
        setActiveModule('designer');
    };

    const handleSaveDesignedItem = async (template: any, width: number, height: number, panels: number, modelSnapshot: CadModel, realisticEl: HTMLElement | null, wireframeEl: HTMLElement | null) => {
        const { area, price } = calculatePrice(width, height, template.basePricePerSqM, panels);
        let thumbUrl = '', wireframeUrl = '';

        const capture = async (el: HTMLElement | null) => {
            if (!el) return '';
            const svgEl = el.querySelector('svg');
            if (!svgEl) return '';
            try { return await svgToPng(svgEl as SVGSVGElement, 1000, 1000); } catch (e) { console.error("Thumbnail generation failed", e); return ''; }
        };

        [thumbUrl, wireframeUrl] = await Promise.all([capture(realisticEl), capture(wireframeEl)]);

        const newItem: OrderItem = {
            id: `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            model: { ...modelSnapshot, id: `CAD-${Date.now()}` },
            templateName: template.name,
            thumbnailDataUrl: thumbUrl,
            wireframeDataUrl: wireframeUrl,
            quantity: 1,
            unitPrice: price,
            area: area,
            totalPrice: price,
            remark: ''
        };

        const newItems = [newItem, ...currentOrder.items];
        const newTotal = newItems.reduce((acc, item) => acc + item.totalPrice, 0);
        handleUpdateDraft({ ...currentOrder, items: newItems, totalAmount: parseFloat(newTotal.toFixed(2)) });

        setDesigningTemplate(null);
        setActiveModule('editor');
        toast.success("已加入购物车");
    };

    if (!isAuthenticated) return <LoginView onLogin={handleLogin} isLoading={isLoadingData} />;

    if (isLoadingData && orders.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#F0F4F8] dark:bg-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-gray-500 font-bold">正在同步业务数据...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-[#F0F4F8] dark:bg-slate-900 font-sans overflow-hidden text-slate-800 dark:text-slate-200 selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300">
            <NavigationRail
                activeModule={activeModule}
                setActiveModule={setActiveModule}
                user={user}
                onLogout={handleLogout}
                isCollapsed={isSidebarCollapsed}
                toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                onCreateNewOrder={handleCreateNewOrder}
                cartItemCount={currentOrder.items.length}
            />
            <div className="flex-1 flex flex-col min-w-0">
                <main className="flex-1 overflow-hidden relative">
                    {(activeModule === 'overview' || activeModule === 'orders') && (
                        <DashboardView
                            orders={orders}
                            user={user}
                            viewMode={activeModule === 'overview' ? 'overview' : 'list'}
                            onEditOrder={handleEditOrder}
                            onDeleteOrder={handleDeleteOrder}
                            onCreateNewOrder={handleCreateNewOrder}
                            onSwitchToOrders={() => setActiveModule('orders')}
                        />
                    )}

                    {/* Shopping Cart (Editor) */}
                    {activeModule === 'editor' && (
                        <OrdersView
                            currentOrder={currentOrder}
                            customers={customers}
                            onUpdateDraft={handleUpdateDraft}
                            onSubmitOrder={handleSubmitOrder}
                            onBack={() => { setActiveModule('products'); }}
                        />
                    )}

                    {/* Product Catalog (Storefront) */}
                    {activeModule === 'products' && (
                        <ProductCatalogView
                            onSelectProduct={handleSelectProductFromCatalog}
                            cartItemCount={currentOrder.items.length}
                            onGoToCart={() => {
                                if (!currentOrder.id) handleCreateNewOrder();
                                setActiveModule('editor');
                            }}
                        />
                    )}

                    {activeModule === 'designer' && designingTemplate && (
                        <div className="h-full w-full relative bg-white dark:bg-black">
                            <ItemDesigner
                                onCancel={() => {
                                    setDesigningTemplate(null);
                                    setActiveModule('products'); // Back to store
                                }}
                                onSave={handleSaveDesignedItem}
                            />
                        </div>
                    )}

                    {activeModule === 'customers' && (
                        <CustomersView
                            customers={customers}
                            onAddCustomer={handleAddCustomer}
                            onUpdateCustomer={handleUpdateCustomer}
                            onDeleteCustomer={handleDeleteCustomer}
                        />
                    )}
                    {activeModule === 'profile' && (
                        <ProfileView
                            user={user}
                            onLogout={handleLogout}
                            onUserUpdate={setUser}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

export const App = () => {
    return (
        <ThemeProvider>
            <FeedbackProvider>
                <AppContent />
            </FeedbackProvider>
        </ThemeProvider>
    );
};