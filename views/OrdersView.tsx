import React from 'react';
import { Order, OrderItem, CadModel } from '../types';
import { calculatePrice, svgToPng } from '../services/exportService';
import { OrderEditorSidebar } from '../components/features/orders/OrderEditorSidebar';
import { OrderItemsTable } from '../components/features/orders/OrderItemsTable';

interface OrdersViewProps {
  currentOrder: Order;
  onUpdateDraft: (order: Order) => void;
  onSubmitOrder: () => void;
  onBack: () => void; 
}

export const OrdersView: React.FC<OrdersViewProps> = ({ currentOrder, onUpdateDraft, onSubmitOrder, onBack }) => {
  
  // --- Actions ---

  // 1. Add New Item (Called from Sidebar)
  const handleAddItem = async (
      template: any, 
      width: number, 
      height: number, 
      panels: number, 
      modelSnapshot: CadModel, 
      realisticEl: HTMLElement | null,
      wireframeEl: HTMLElement | null
  ) => {
     // Calculate Price
     const { area, price } = calculatePrice(width, height, template.basePricePerSqM, panels);

     // Generate Thumbnails
     let thumbUrl = '';
     let wireframeUrl = '';

     const capture = async (el: HTMLElement | null) => {
         if (!el) return '';
         const svgEl = el.querySelector('svg');
         if (!svgEl) return '';
         try {
             return await svgToPng(svgEl as SVGSVGElement, 1000, 1000);
         } catch(e) {
             console.error("Thumbnail generation failed", e);
             return '';
         }
     };

     // Capture both concurrently
     [thumbUrl, wireframeUrl] = await Promise.all([
         capture(realisticEl),
         capture(wireframeEl)
     ]);

     const newItem: OrderItem = {
         id: `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Robust ID
         model: { ...modelSnapshot, id: `CAD-${Date.now()}` },
         templateName: template.name,
         thumbnailDataUrl: thumbUrl,
         wireframeDataUrl: wireframeUrl, // Store Wireframe
         quantity: 1,
         unitPrice: price,
         area: area,
         totalPrice: price
     };

     const updatedItems = [newItem, ...currentOrder.items];
     recalculateAndSave(updatedItems);
  };

  // 2. Update Item Quantity (Called from Table)
  const handleUpdateItemQty = (itemId: string, newQty: number) => {
    if (newQty < 1) return;
    const updatedItems = currentOrder.items.map(item => {
      if (item.id === itemId) {
        return { 
          ...item, 
          quantity: newQty, 
          totalPrice: parseFloat((item.unitPrice * newQty).toFixed(2))
        };
      }
      return item;
    });
    recalculateAndSave(updatedItems);
  };

  // 3. Update Item Price (NEW)
  const handleUpdateItemPrice = (itemId: string, newPrice: number) => {
    if (newPrice < 0) return;
    const updatedItems = currentOrder.items.map(item => {
      if (item.id === itemId) {
        return { 
          ...item, 
          unitPrice: newPrice,
          totalPrice: parseFloat((newPrice * item.quantity).toFixed(2))
        };
      }
      return item;
    });
    recalculateAndSave(updatedItems);
  };

  // 4. Delete Item (Called from Table)
  const handleDeleteItem = (itemId: string) => {
    // Filter out the item with the matching ID
    const updatedItems = currentOrder.items.filter(item => item.id !== itemId);
    recalculateAndSave(updatedItems);
  };

  // 5. Update Header Info (Customer/Date)
  const handleMetaChange = (key: 'customerName' | 'date', value: string) => {
      onUpdateDraft({ ...currentOrder, [key]: value });
  };

  // Helper to calc total and update parent state
  const recalculateAndSave = (items: OrderItem[]) => {
      const newTotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
      onUpdateDraft({ 
          ...currentOrder, 
          items: items, 
          totalAmount: parseFloat(newTotal.toFixed(2)) 
      });
  };

  return (
    <div className="flex h-full w-full max-w-[1920px] mx-auto animate-fade-in bg-[#F0F4F8] overflow-hidden">
        
        {/* LEFT: Combined Sidebar (Catalog + Configurator) */}
        <OrderEditorSidebar 
            onAddItem={handleAddItem}
        />

        {/* RIGHT: Main Content (Order List Table) */}
        <OrderItemsTable 
            order={currentOrder}
            onMetaChange={handleMetaChange}
            onUpdateQty={handleUpdateItemQty}
            onUpdatePrice={handleUpdateItemPrice} 
            onDeleteItem={handleDeleteItem}
            onSave={onSubmitOrder}
            onBack={onBack}
        />

    </div>
  );
};