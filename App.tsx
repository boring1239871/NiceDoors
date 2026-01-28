import React, { useState } from 'react';
import { Order, OrderItem, UserProfile } from './types';
import { NavigationRail, ViewModule } from './components/layout/NavigationRail';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { DesignerView } from './views/DesignerView';
import { OrdersView } from './views/OrdersView';
import { ProfileView } from './views/ProfileView';
import { MOCK_ORDERS as INITIAL_DATA } from './constants';

const App = () => {
  // --- Global State ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeModule, setActiveModule] = useState<ViewModule>('dashboard');
  
  // 1. STATEFUL ORDERS: Now we can add/remove/update properly
  const [orders, setOrders] = useState<Order[]>(INITIAL_DATA);

  // User Data
  const [user, setUser] = useState<UserProfile>({
    name: 'Alex Engineer',
    email: 'alex@proframe.design',
    avatar: 'https://ui-avatars.com/api/?name=Alex+Engineer&background=0D8ABC&color=fff',
    role: 'Designer',
    company: 'Future Windows Ltd.',
    plan: 'Pro'
  });

  // Designer Bridge State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(''); 

  // Order Editing State
  const [currentOrder, setCurrentOrder] = useState<Order>({
    id: '', 
    customerName: '',
    date: new Date().toISOString().slice(0,10),
    items: [],
    totalAmount: 0
  });

  // --- CRUD Actions ---

  // 1. Create New Order (Setup Draft)
  const handleCreateNewOrder = () => {
      const newId = `ORD-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`;
      setCurrentOrder({
        id: newId,
        customerName: '',
        date: new Date().toISOString().slice(0,10),
        items: [],
        totalAmount: 0,
        status: '设计中'
      });
      setActiveModule('orders'); // Switch to Editor View
  };

  // 2. Edit Existing Order
  const handleEditOrder = (order: Order) => {
      // Clone deep enough to avoid reference issues
      setCurrentOrder(JSON.parse(JSON.stringify(order)));
      setActiveModule('orders');
  };

  // 3. Delete Order (from List) - NOW REACTIVE
  const handleDeleteOrder = (orderId: string) => {
      setOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
  };

  // 4. Submit/Save Order (from Editor) - NOW REACTIVE
  const handleSubmitOrder = () => {
      if (!currentOrder.customerName) {
          alert("请输入客户名称");
          return;
      }
      if (currentOrder.items.length === 0) {
          alert("订单不能为空，请添加产品");
          return;
      }
      
      setOrders(prevOrders => {
          const existingIndex = prevOrders.findIndex(o => o.id === currentOrder.id);
          
          // If Status is still 'Draft' or 'Designing', bump it to 'Confirmed' on save
          const statusToSave = currentOrder.status === '设计中' ? '已确认' : (currentOrder.status || '已确认');
          const orderToSave = { ...currentOrder, status: statusToSave };

          if (existingIndex !== -1) {
              // Update existing
              const newOrders = [...prevOrders];
              newOrders[existingIndex] = orderToSave;
              return newOrders;
          } else {
              // Create new (Prepend to top)
              return [orderToSave, ...prevOrders];
          }
      });
      
      alert("订单保存成功！");
      setActiveModule('dashboard'); // Go back to list
  };

  // 5. Update Draft (Real-time in Editor)
  const handleUpdateDraft = (updatedOrder: Order) => {
      setCurrentOrder(updatedOrder);
  };

  // Designer Module Actions
  const handleAddToOrder = (item: OrderItem) => {
      let targetOrder = { ...currentOrder };
      
      // If we are not currently editing an order, create a temp one
      if (!targetOrder.id) {
           const newId = `ORD-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`;
           targetOrder = {
            id: newId,
            customerName: '',
            date: new Date().toISOString().slice(0,10),
            items: [],
            totalAmount: 0,
            status: '设计中'
          };
      }

      const newItems = [...targetOrder.items, item];
      const newTotal = newItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
      
      const updatedOrder = {
          ...targetOrder,
          items: newItems,
          totalAmount: parseFloat(newTotal.toFixed(2))
      };

      setCurrentOrder(updatedOrder);
      setActiveModule('orders'); // Jump to Order Editor
  };

  // --- Render ---
  if (!isAuthenticated) {
    return <LoginView onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#F0F4F8] font-sans overflow-hidden text-slate-800 selection:bg-blue-100 selection:text-blue-900">
      <NavigationRail 
        activeModule={activeModule} 
        setActiveModule={setActiveModule} 
        user={user} 
        onLogout={() => setIsAuthenticated(false)} 
      />

      <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 overflow-hidden relative">
             
             {/* Order List / Management (Main View) */}
             {activeModule === 'dashboard' && (
                <DashboardView 
                  orders={orders} // Pass the STATE, not the mock constant
                  user={user} 
                  currentOrder={currentOrder} 
                  setActiveModule={setActiveModule}
                  setSelectedTemplateId={setSelectedTemplateId}
                  onEditOrder={handleEditOrder}
                  onDeleteOrder={handleDeleteOrder}
                  onCreateNewOrder={handleCreateNewOrder}
                />
             )}

             {/* Order Editor (The "Big Head") */}
             {activeModule === 'orders' && (
                <OrdersView 
                    currentOrder={currentOrder} 
                    onUpdateDraft={handleUpdateDraft}
                    onSubmitOrder={handleSubmitOrder}
                    onBack={() => setActiveModule('dashboard')}
                />
             )}

             {/* Standalone Product Designer */}
             {activeModule === 'designer' && (
                <DesignerView 
                  initialTemplateId={selectedTemplateId} 
                  onAddToOrder={handleAddToOrder}
                />
             )}
             
             {activeModule === 'profile' && (
                <ProfileView user={user} onLogout={() => setIsAuthenticated(false)} />
             )}
          </main>
      </div>
    </div>
  );
};

export default App;