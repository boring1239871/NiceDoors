import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Order, OrderItem, UserProfile, Customer, ProductTemplate, CadModel } from './types';
import { ResponsiveNav, ViewModule } from './components/common/ResponsiveNav';
import { LoginView } from './components/auth/LoginView';
import { DashboardView } from './components/dashboard/DashboardView';
import { OrdersView } from './components/orders/OrdersView';
import { OrderListView } from './components/orders/OrderListView';
import { ProfileView } from './components/profile/ProfileView';
import { CustomersView } from './components/customers/CustomersView';
import { ProductCatalogView } from './components/products/ProductCatalogView';
import { ItemDesigner } from './components/orders/ItemDesigner';
import { FeedbackProvider, useFeedback } from './components/common/FeedbackContext';
import { ThemeProvider } from './components/common/ThemeContext';
import { calculatePrice, svgToPng } from './utils';

import {
    login,
    fetchUserProfile,
    fetchOrderList,
    fetchCustomerList,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    createOrder,
    updateOrder,
    deleteOrder,
    logout
} from './api/api';

const ROUTES = {
    LOGIN: '/login',
    OVERVIEW: '/overview',
    ORDERS: '/orders',
    PRODUCTS: '/products',
    EDITOR: '/editor',
    DESIGNER: '/designer',
    CUSTOMERS: '/customers',
    PROFILE: '/profile',
};

const moduleToRoute: Record<ViewModule, string> = {
    'overview': ROUTES.OVERVIEW,
    'orders': ROUTES.ORDERS,
    'products': ROUTES.PRODUCTS,
    'editor': ROUTES.EDITOR,
    'designer': ROUTES.DESIGNER,
    'customers': ROUTES.CUSTOMERS,
    'profile': ROUTES.PROFILE,
};

const routeToModule: Record<string, ViewModule> = {
    [ROUTES.OVERVIEW]: 'overview',
    [ROUTES.ORDERS]: 'orders',
    [ROUTES.PRODUCTS]: 'products',
    [ROUTES.EDITOR]: 'editor',
    [ROUTES.DESIGNER]: 'designer',
    [ROUTES.CUSTOMERS]: 'customers',
    [ROUTES.PROFILE]: 'profile',
};

const AppContent = () => {
    const { toast } = useFeedback();
    const navigate = useNavigate();
    const location = useLocation();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeModule, setActiveModule] = useState<ViewModule>('products');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Data State
    const [orders, setOrders] = useState<Order[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [user, setUser] = useState<UserProfile>({ name: '', email: '', avatar: '', role: 'Designer', company: '', plan: 'Free' });

    // 数据加载状态（懒加载）
    const [loadedModules, setLoadedModules] = useState<Set<string>>(new Set());

    // Draft State
    const [currentOrder, setCurrentOrder] = useState<Order>({ id: '', customerName: '', date: new Date().toISOString().slice(0, 10), items: [], totalAmount: 0, paidAmount: 0 });
    const [designingTemplate, setDesigningTemplate] = useState<ProductTemplate | null>(null);

    // 懒加载数据
    const loadModuleData = useCallback(async (module: ViewModule) => {
        if (loadedModules.has(module)) return;

        setIsLoadingData(true);
        try {
            if (module === 'overview' || module === 'orders') {
                if (!loadedModules.has('orders')) {
                    const res = await fetchOrderList();
                    if (res.code === 200) setOrders(res.data);
                }
            }

            if (module === 'customers') {
                if (!loadedModules.has('customers')) {
                    const res = await fetchCustomerList();
                    if (res.code === 200) setCustomers(res.data);
                }
            }

            if (module === 'profile') {
                if (!loadedModules.has('user')) {
                    const res = await fetchUserProfile();
                    if (res.code === 200) setUser(res.data);
                }
            }

            setLoadedModules(prev => new Set(prev).add(module));
        } catch (error) {
            console.error("Failed to load module data", error);
            toast.error("数据加载失败");
        } finally {
            setIsLoadingData(false);
        }
    }, [loadedModules, toast]);

    // 路由变化时更新 activeModule、检查登录状态并加载数据
    useEffect(() => {
        const module = routeToModule[location.pathname];
        if (module) {
            setActiveModule(module);
            // 路由跳转成功后加载对应模块的数据
            loadModuleData(module);
        }

        // 检查登录状态 - 只检查本地存储中是否有 token
        const checkAuth = () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setIsAuthenticated(false);
            } else {
                // 保持当前认证状态
                // 注意：这里只检查本地存储，不验证 token 有效性
                // 实际应用中可能需要定期验证 token
            }
        };

        checkAuth();
    }, [location.pathname, loadModuleData]);

    // --- 0. Restore Session ---
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const restore = async () => {
            try {
                const res = await fetchUserProfile();
                if (res.code === 200) {
                    setUser(res.data);
                    setIsAuthenticated(true);
                    setLoadedModules(prev => new Set(prev).add('user'));
                } else {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                }
            } catch {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            }
        };

        restore();
    }, []);

    // 点击侧边栏时导航到对应路由
    // 数据加载由路由变化的 useEffect 处理
    const handleNavigate = (module: ViewModule) => {
        navigate(moduleToRoute[module]);
    };

    const handleLogin = async (email: string, password: string) => {
        setIsLoadingData(true);
        try {
            const res = await login(email, password);
            if (res.code === 200) {
                const userRes = await fetchUserProfile();
                if (userRes.code === 200) {
                    setUser(userRes.data);
                    setLoadedModules(prev => new Set(prev).add('user').add('orders').add('customers'));
                }
                setIsAuthenticated(true);
                toast.success('登录成功');
                navigate(ROUTES.OVERVIEW);
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
        logout();
        setIsAuthenticated(false);
        setOrders([]);
        setCustomers([]);
        setUser({ name: '', email: '', avatar: '', role: 'Designer', company: '', plan: 'Free' });
        setLoadedModules(new Set());
        navigate(ROUTES.LOGIN);
    };

    // --- Customer Actions ---
    const handleAddCustomer = async (customer: Customer) => {
        try {
            const res = await createCustomer(customer);
            if (res.code === 200) setCustomers(prev => [res.data, ...prev]);
        } catch (e) { toast.error("添加客户失败"); }
    };

    const handleUpdateCustomer = async (updatedCustomer: Customer) => {
        try {
            const res = await updateCustomer(updatedCustomer.id, updatedCustomer);
            if (res.code === 200) toast.success("客户已更新");
        } catch (e) { toast.error("更新客户失败"); }
    };

    const handleDeleteCustomer = async (id: string) => {
        try {
            await deleteCustomer(id);
            setCustomers(prev => prev.filter(c => c.id !== id));
            toast.success('客户已删除');
        } catch (e) { toast.error("删除客户失败"); }
    };

    // --- Order Actions ---
    const handleCreateNewOrder = () => {
        setCurrentOrder({ id: '', customerName: '', customerPhone: '', address: '', date: new Date().toISOString().slice(0, 10), items: [], totalAmount: 0, paidAmount: 0, status: '设计中' });
        handleNavigate('editor');
    };

    const handleEditOrder = (order: Order) => {
        setCurrentOrder(JSON.parse(JSON.stringify(order)));
        handleNavigate('editor');
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
                res = await updateOrder(currentOrder.id, orderToSave);
                if (res.code === 200) {
                    setOrders(prev => {
                        const newOrders = [...prev];
                        newOrders[existingIndex] = res.data;
                        return newOrders;
                    });
                }
            } else {
                res = await createOrder(orderToSave);
                if (res.code === 200) {
                    setOrders(prev => [res.data, ...prev]);
                }
            }

            toast.success("订单已保存至历史记录！");

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

            handleNavigate('orders');

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
        handleNavigate('designer');
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
        handleNavigate('editor');
        toast.success("已加入购物车");
    };

    if (!isAuthenticated) {
        return <LoginView onLogin={handleLogin} isLoading={isLoadingData} />;
    }

    return (
        <div className="flex  h-screen w-full bg-[#F0F4F8] dark:bg-slate-900 font-sans overflow-hidden text-slate-800 dark:text-slate-200 selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300">
            <ResponsiveNav
                activeModule={activeModule}
                setActiveModule={handleNavigate}
                user={user}
                onLogout={handleLogout}
                isSidebarCollapsed={isSidebarCollapsed}
                toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                onCreateNewOrder={handleCreateNewOrder}
                cartItemCount={currentOrder.items.length}
            />
            <div className="flex-1 flex flex-col min-w-0">
                {isLoadingData && (
                    <div className="h-1 bg-blue-500 animate-pulse"></div>
                )}
                <main className="flex-1 overflow-hidden relative lg:pt-0 pt-14 pb-16 lg:pb-0">
                    {(activeModule === 'overview') && (
                        <DashboardView
                            orders={orders}
                            user={user}
                        />
                    )}

                    {activeModule === 'orders' && (
                        <OrderListView
                            orders={orders}
                            user={user}
                            onEditOrder={handleEditOrder}
                            onDeleteOrder={handleDeleteOrder}
                            onCreateNewOrder={handleCreateNewOrder}
                        />
                    )}

                    {activeModule === 'editor' && (
                        <OrdersView
                            currentOrder={currentOrder}
                            customers={customers}
                            onUpdateDraft={handleUpdateDraft}
                            onSubmitOrder={handleSubmitOrder}
                            onBack={() => { handleNavigate('products'); }}
                        />
                    )}

                    {activeModule === 'products' && (
                        <ProductCatalogView
                            onSelectProduct={handleSelectProductFromCatalog}
                            cartItemCount={currentOrder.items.length}
                            onGoToCart={() => {
                                if (!currentOrder.id) handleCreateNewOrder();
                                handleNavigate('editor');
                            }}
                        />
                    )}

                    {activeModule === 'designer' && designingTemplate && (
                        <div className="h-full w-full relative bg-white dark:bg-black">
                            <ItemDesigner
                                onCancel={() => {
                                    setDesigningTemplate(null);
                                    handleNavigate('products');
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
                <BrowserRouter>
                    <Routes>
                        <Route path="*" element={<AppContent />} />
                    </Routes>
                </BrowserRouter>
            </FeedbackProvider>
        </ThemeProvider>
    );
};
