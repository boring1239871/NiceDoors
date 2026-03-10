import React, { useState, useEffect } from 'react';
import { Order, OrderItem, CadModel, Customer } from '../../types';
import { calculatePrice, svgToPng } from '../../utils';
import { OrderItemsTable } from './OrderItemsTable';
import { ItemDesigner } from './ItemDesigner';
import { createPortal } from 'react-dom';
import { fetchCustomerList, createOrder, updateOrder, checkCustomerExists, createCustomer } from '../../api/api';
import { useFeedback } from '../common/FeedbackContext';
import { useNavigate } from 'react-router-dom';



// Lightbox Component for Dark Preview
const ImageLightbox: React.FC<{ src: string; onClose: () => void }> = ({ src, onClose }) => {
    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 animate-fade-in" onClick={onClose}>
            <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors" onClick={onClose}>
                <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="relative max-w-[90vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <img src={src} className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl bg-white" alt="Preview" />
            </div>
        </div>,
        document.body
    );
};

export const OrdersView: React.FC = () => {
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [currentOrder, setCurrentOrder] = useState<Order>({
        id: `ORDER-${Date.now()}`,
        createdAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
        orderNo: `ORD${Date.now()}`,
        customerName: '',
        customerPhone: '',
        address: '',
        date: new Date().toISOString().slice(0, 10),
        status: '已确认',
        items: [],
        totalAmount: 0,
        paidAmount: 0,
        balance: 0,
        note: ''
    });
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useFeedback();
    const navigate = useNavigate();

    // 加载数据
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // 加载客户数据
                const customersRes = await fetchCustomerList();
                if (customersRes.code === 200) {
                    setCustomers(customersRes.data);
                }

                // 从localStorage获取编辑的订单
                const editOrder = localStorage.getItem('editOrder');
                if (editOrder) {
                    setCurrentOrder(JSON.parse(editOrder));
                }

                // 检查是否有从产品商城选择的产品
                const selectedProductTemplate = localStorage.getItem('selectedProductTemplate');
                if (selectedProductTemplate) {
                    // 清除选中的产品模板，避免重复处理
                    const template = JSON.parse(selectedProductTemplate);
                    localStorage.removeItem('selectedProductTemplate');
                    // 存储选中的模板ID
                    localStorage.setItem('selectedTemplateId', template.id);
                    // 自动打开产品设计器
                    setIsAddingItem(true);
                }
            } catch (error) {
                console.error('Failed to load order editor data:', error);
                toast.error('数据加载失败');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [toast]);

    // Handler for saving a new item from the ItemDesigner
    const handleAddItem = async (template: any, width: number, height: number, panels: number, modelSnapshot: CadModel, realisticEl: HTMLElement | null, wireframeEl: HTMLElement | null) => {
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
            remark: '' // Init remark
        };

        // Update Order State
        const newTotal = [newItem, ...currentOrder.items].reduce((acc, item) => acc + item.totalPrice, 0);
        setCurrentOrder({
            ...currentOrder,
            items: [newItem, ...currentOrder.items],
            totalAmount: parseFloat(newTotal.toFixed(2)),
            balance: parseFloat((newTotal - currentOrder.paidAmount).toFixed(2))
        });

        // Close Designer
        setIsAddingItem(false);
    };

    const handleUpdateItemQty = (itemId: string, newQty: number) => {
        if (newQty < 1) return;
        updateOrderItems(currentOrder.items.map(item => item.id === itemId ? { ...item, quantity: newQty, totalPrice: parseFloat((item.unitPrice * newQty).toFixed(2)) } : item));
    };
    const handleUpdateItemPrice = (itemId: string, newPrice: number) => {
        if (newPrice < 0) return;
        updateOrderItems(currentOrder.items.map(item => item.id === itemId ? { ...item, unitPrice: newPrice, totalPrice: parseFloat((newPrice * item.quantity).toFixed(2)) } : item));
    };
    const handleUpdateItemRemark = (itemId: string, remark: string) => {
        updateOrderItems(currentOrder.items.map(item => item.id === itemId ? { ...item, remark } : item));
    };
    const handleDeleteItem = (itemId: string) => {
        updateOrderItems(currentOrder.items.filter(item => item.id !== itemId));
    };

    const handleMetaChange = (key: 'customerName' | 'customerPhone' | 'address' | 'date' | 'paidAmount' | 'status', value: string | number) => {
        const updatedOrder = { ...currentOrder, [key]: value };
        if (key === 'paidAmount') {
            updatedOrder.balance = parseFloat((currentOrder.totalAmount - Number(value)).toFixed(2));
        }
        setCurrentOrder(updatedOrder);
    };
    const handleBatchMetaChange = (updates: Partial<Order>) => {
        const updatedOrder = { ...currentOrder, ...updates };
        if (updates.paidAmount !== undefined) {
            updatedOrder.balance = parseFloat((currentOrder.totalAmount - Number(updates.paidAmount)).toFixed(2));
        }
        setCurrentOrder(updatedOrder);
    };

    const updateOrderItems = (items: OrderItem[]) => {
        const newTotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
        setCurrentOrder({
            ...currentOrder,
            items: items,
            totalAmount: parseFloat(newTotal.toFixed(2)),
            balance: parseFloat((newTotal - currentOrder.paidAmount).toFixed(2))
        });
    };

    // 处理提交订单
    const handleSubmitOrder = async () => {
        try {
            if (currentOrder.items.length === 0) {
                toast.error('请至少添加一个产品');
                return;
            }

            if (!currentOrder.customerName || !currentOrder.customerPhone) {
                toast.error('请填写客户信息');
                return;
            }

            // 检查客户是否存在
            if (currentOrder.customerPhone) {
                const existsRes = await checkCustomerExists(currentOrder.customerPhone);
                if (existsRes.code === 200 && !existsRes.data.exists) {
                    // 客户不存在，添加到客户库
                    const customerData = {
                        name: currentOrder.customerName,
                        phone: currentOrder.customerPhone,
                        address: currentOrder.address || '',
                    };
                    const createRes = await createCustomer(customerData);
                    if (createRes.code !== 200) {
                        toast.error('添加客户失败，请重试');
                        return;
                    }
                }
            }

            const updatedOrder = { ...currentOrder, updatedAt: new Date().toISOString().slice(0, 10) };

            let res;
            if (updatedOrder.id.startsWith('ORDER-')) {
                // 新订单
                res = await createOrder(updatedOrder);
            } else {
                // 编辑现有订单
                res = await updateOrder(updatedOrder.id, updatedOrder);
            }

            if (res.code === 200) {
                toast.success('订单保存成功');
                localStorage.removeItem('editOrder');
                navigate('/');
            }
        } catch (error) {
            console.error('Failed to submit order:', error);
            toast.error('保存失败，请重试');
        }
    };

    // 处理返回
    const handleBack = () => {
        localStorage.removeItem('editOrder');
        navigate('/orders');
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
                    onSave={handleSubmitOrder}
                    onBack={handleBack}
                    onAddNewItem={() => setIsAddingItem(true)}
                    onPreviewImage={(url) => setPreviewImage(url)}
                />
            ) : (
                // 2. Full Screen Item Designer View
                <ItemDesigner
                    onCancel={() => {
                        setIsAddingItem(false);
                        localStorage.removeItem('selectedTemplateId');
                    }}
                    onSave={(template, width, height, panels, model, realisticEl, wireframeEl) => {
                        handleAddItem(template, width, height, panels, model, realisticEl, wireframeEl);
                        localStorage.removeItem('selectedTemplateId');
                    }}
                    initialTemplateId={localStorage.getItem('selectedTemplateId') || undefined}
                />
            )}

            {/* 3. Global Lightbox Preview */}
            {previewImage && <ImageLightbox src={previewImage} onClose={() => setPreviewImage(null)} />}
        </div>
    );
};