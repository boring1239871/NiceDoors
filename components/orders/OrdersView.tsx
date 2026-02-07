import React, { useState } from 'react';
import { Order, OrderItem, CadModel, Customer } from '../../types';
import { calculatePrice, svgToPng } from '../../utils';
import { OrderItemsTable } from './OrderItemsTable';
import { ItemDesigner } from './ItemDesigner';
import { createPortal } from 'react-dom';

interface OrdersViewProps {
  currentOrder: Order;
  customers: Customer[]; // Receive customers
  onUpdateDraft: (order: Order) => void;
  onSubmitOrder: () => void;
  onBack: () => void; 
}

// Lightbox Component for Dark Preview
const ImageLightbox: React.FC<{ src: string; onClose: () => void }> = ({ src, onClose }) => {
    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 animate-fade-in" onClick={onClose}>
            <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors" onClick={onClose}>
                <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <div className="relative max-w-[90vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <img src={src} className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl bg-white" alt="Preview" />
            </div>
        </div>,
        document.body
    );
};

export const OrdersView: React.FC<OrdersViewProps> = ({ currentOrder, customers, onUpdateDraft, onSubmitOrder, onBack }) => {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Handler for saving a new item from the ItemDesigner
  const handleAddItem = async (template: any, width: number, height: number, panels: number, modelSnapshot: CadModel, realisticEl: HTMLElement | null, wireframeEl: HTMLElement | null) => {
     const { area, price } = calculatePrice(width, height, template.basePricePerSqM, panels);
     let thumbUrl = '', wireframeUrl = '';
     
     const capture = async (el: HTMLElement | null) => { 
         if (!el) return ''; 
         const svgEl = el.querySelector('svg'); 
         if (!svgEl) return ''; 
         try { return await svgToPng(svgEl as SVGSVGElement, 1000, 1000); } catch(e) { console.error("Thumbnail generation failed", e); return ''; } 
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
         remark: '' // Init remark
     };
     
     // Update Order State
     const newTotal = [newItem, ...currentOrder.items].reduce((acc, item) => acc + item.totalPrice, 0);
     onUpdateDraft({ ...currentOrder, items: [newItem, ...currentOrder.items], totalAmount: parseFloat(newTotal.toFixed(2)) });
     
     // Close Designer
     setIsAddingItem(false);
  };

  const handleUpdateItemQty = (itemId: string, newQty: number) => { if (newQty < 1) return; updateOrderItems(currentOrder.items.map(item => item.id === itemId ? { ...item, quantity: newQty, totalPrice: parseFloat((item.unitPrice * newQty).toFixed(2)) } : item)); };
  const handleUpdateItemPrice = (itemId: string, newPrice: number) => { if (newPrice < 0) return; updateOrderItems(currentOrder.items.map(item => item.id === itemId ? { ...item, unitPrice: newPrice, totalPrice: parseFloat((newPrice * item.quantity).toFixed(2)) } : item)); };
  const handleUpdateItemRemark = (itemId: string, remark: string) => { updateOrderItems(currentOrder.items.map(item => item.id === itemId ? { ...item, remark } : item)); };
  const handleDeleteItem = (itemId: string) => { updateOrderItems(currentOrder.items.filter(item => item.id !== itemId)); };
  
  const handleMetaChange = (key: 'customerName' | 'customerPhone' | 'address' | 'date' | 'paidAmount' | 'status', value: string | number) => { onUpdateDraft({ ...currentOrder, [key]: value }); };
  const handleBatchMetaChange = (updates: Partial<Order>) => { onUpdateDraft({ ...currentOrder, ...updates }); };
  
  const updateOrderItems = (items: OrderItem[]) => { 
      const newTotal = items.reduce((acc, item) => acc + item.totalPrice, 0); 
      onUpdateDraft({ ...currentOrder, items: items, totalAmount: parseFloat(newTotal.toFixed(2)) }); 
  };

  return (
    <div className="flex h-full w-full mx-auto animate-fade-in bg-[#f0f4f9] dark:bg-black overflow-hidden relative">
        {/* 1. Main Order List View */}
        {!isAddingItem ? (
            <OrderItemsTable 
                order={currentOrder} 
                customers={customers}
                onMetaChange={handleMetaChange} 
                onBatchMetaChange={handleBatchMetaChange}
                onUpdateQty={handleUpdateItemQty} 
                onUpdatePrice={handleUpdateItemPrice} 
                onUpdateRemark={handleUpdateItemRemark}
                onDeleteItem={handleDeleteItem} 
                onSave={onSubmitOrder} 
                onBack={onBack} 
                onAddNewItem={() => setIsAddingItem(true)}
                onPreviewImage={(url) => setPreviewImage(url)}
            />
        ) : (
            // 2. Full Screen Item Designer View
            <ItemDesigner 
                onCancel={() => setIsAddingItem(false)} 
                onSave={handleAddItem} 
            />
        )}

        {/* 3. Global Lightbox Preview */}
        {previewImage && <ImageLightbox src={previewImage} onClose={() => setPreviewImage(null)} />}
    </div>
  );
};