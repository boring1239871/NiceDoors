import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ResponsiveNav, ViewModule } from './components/common/ResponsiveNav';
import { LoginView } from './components/auth/LoginView';
import { DashboardView } from './components/dashboard/DashboardView';
import { OrdersView } from './components/orders/OrdersView';
import { OrderListView } from './components/orders/OrderListView';
import { ProfileView } from './components/profile/ProfileView';
import { CustomersView } from './components/customers/CustomersView';
import { ProductCatalogView } from './components/products/ProductCatalogView';
import { FeedbackProvider, useFeedback } from './components/common/FeedbackContext';
import { ThemeProvider } from './components/common/ThemeContext';

import {
    login,
    logout
} from './api/api';

import { ROUTES } from './constants/index';

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



    // 路由变化时更新 activeModule 和检查登录状态
    useEffect(() => {
        const module = routeToModule[location.pathname];
        if (module) {
            setActiveModule(module);
        }

        // 检查登录状态 - 只检查本地存储中是否有 token
        const checkAuth = () => {
            const token = localStorage.getItem('accessToken');
            setIsAuthenticated(!!token);
        };

        checkAuth();
    }, [location.pathname]);

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
        navigate(ROUTES.LOGIN);
    };

    // 处理产品选择，跳转到编辑器页面
    const handleSelectProduct = (template: any) => {
        // 可以在这里存储选中的产品模板
        localStorage.setItem('selectedProductTemplate', JSON.stringify(template));
        // 导航到编辑器页面
        navigate(ROUTES.EDITOR);
    };

    // 处理购物车跳转
    const handleGoToCart = () => {
        // 导航到订单页面
        navigate(ROUTES.ORDERS);
    };

    if (!isAuthenticated) {
        return <LoginView onLogin={handleLogin} isLoading={isLoadingData} />;
    }

    return (
        <div className="flex  h-screen w-full bg-[#F0F4F8] dark:bg-slate-900 font-sans overflow-hidden text-slate-800 dark:text-slate-200 selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300">
            <ResponsiveNav
                activeModule={activeModule}
                setActiveModule={handleNavigate}
                onLogout={handleLogout}
                isSidebarCollapsed={isSidebarCollapsed}
                toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
            <div className="flex-1 flex flex-col min-w-0">
                {isLoadingData && (
                    <div className="h-1 bg-blue-500 animate-pulse"></div>
                )}
                <main className="flex-1 overflow-hidden relative lg:pt-0 pt-14 pb-16 lg:pb-0">
                    {(activeModule === 'overview') && (
                        <DashboardView />
                    )}

                    {activeModule === 'orders' && (
                        <OrderListView />
                    )}

                    {activeModule === 'editor' && (
                        <OrdersView />
                    )}

                    {activeModule === 'products' && (
                        <ProductCatalogView
                            onSelectProduct={handleSelectProduct}
                            cartItemCount={0}
                            onGoToCart={handleGoToCart}
                        />
                    )}



                    {activeModule === 'customers' && (
                        <CustomersView />
                    )}
                    {activeModule === 'profile' && (
                        <ProfileView />
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
