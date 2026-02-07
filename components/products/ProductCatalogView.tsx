import React, { useState, useMemo } from 'react';
import { PRODUCT_TEMPLATES } from '../../constants';
import { ProductType, ProductTemplate } from '../../types';
import { Icons } from '../common/Icons';
import { CadCanvas } from '../designer/CadCanvas';
import { createDefaultModel } from '../../utils';

interface ProductCatalogViewProps {
  onSelectProduct: (template: ProductTemplate) => void;
  cartItemCount: number;
  onGoToCart: () => void;
}

export const ProductCatalogView: React.FC<ProductCatalogViewProps> = ({ onSelectProduct, cartItemCount, onGoToCart }) => {
  const [activeCategory, setActiveCategory] = useState<ProductType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    return PRODUCT_TEMPLATES.filter(p => {
      const matchesCategory = activeCategory === 'ALL' || p.type === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-[#F3F6F9] dark:bg-slate-900 animate-fade-in relative">
      
      {/* Header & Filter Bar */}
      <div className="px-8 pt-8 pb-4 shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-transparent z-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">产品库</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium">选择标准产品型号开始定制</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
           {/* Search */}
           <div className="relative group flex-1 md:flex-none">
              <svg className="absolute left-3 top-3 text-gray-400" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input 
                type="text" 
                placeholder="搜索产品型号..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl w-full md:w-64 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm dark:text-white transition-all" 
              />
           </div>

           {/* Filter Tabs */}
           <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
              {(['ALL', ProductType.WINDOW, ProductType.DOOR] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveCategory(type)}
                  className={`
                    px-4 py-2 rounded-lg text-xs font-bold transition-all
                    ${activeCategory === type 
                      ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-md' 
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}
                  `}
                >
                  {type === 'ALL' ? '全部' : type === ProductType.WINDOW ? '窗系统' : '门系统'}
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-32 custom-scrollbar">
        {filteredProducts.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              
              <div className="text-sm font-bold">没有找到匹配的产品</div>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => {
              // Generate a default model for this template to render in the thumbnail
              const defaultModel = createDefaultModel(product);
              
              return (
                <div 
                  key={product.id}
                  className="group bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
                  onClick={() => onSelectProduct(product)}
                >
                  {/* Thumbnail Area - Now uses Live CAD Canvas */}
                  <div className="aspect-[4/3] bg-gray-50 dark:bg-slate-900/50 flex items-center justify-center relative overflow-hidden p-6">
                     <div className="w-full h-full pointer-events-none transform group-hover:scale-105 transition-transform duration-500">
                        {/* Rendering realistic view */}
                        <CadCanvas 
                            model={defaultModel} 
                            template={product} 
                            selectedPanelIndex={null} 
                            onPanelSelect={() => {}} 
                            viewMode="realistic" 
                        />
                     </div>
                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors"></div>
                     <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                        <span className="bg-white dark:bg-slate-700 text-black dark:text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                          点击配置
                        </span>
                     </div>
                  </div>

                  {/* Info Area */}
                  <div className="p-5 flex-1 flex flex-col">
                     <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight pr-2">{product.name}</h3>
                        <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${product.type === ProductType.WINDOW ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800' : 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800'}`}>
                          {product.type === ProductType.WINDOW ? 'Window' : 'Door'}
                        </span>
                     </div>
                     
                     <div className="mt-auto pt-4 border-t border-dashed border-gray-100 dark:border-slate-700 flex justify-between items-end">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-400 uppercase font-bold">基础单价</span>
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300 font-mono">¥{product.basePricePerSqM}<span className="text-[10px] text-gray-400 font-normal"> /m²</span></span>
                        </div>
                        <button className="w-8 h-8 rounded-full bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center shadow-lg group-hover:bg-blue-600 dark:group-hover:bg-blue-500 transition-colors">
                           <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                        </button>
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      <div className="absolute bottom-8 right-8 z-20">
         <button 
            onClick={onGoToCart}
            className={`
              flex items-center gap-3 px-6 py-4 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.15)] transition-all hover:-translate-y-1 active:scale-95
              ${cartItemCount > 0 ? 'bg-[#0b57d0] hover:bg-[#0842a0] dark:bg-[#a8c7fa] dark:hover:bg-[#8ab4f8] text-white dark:text-[#0b57d0]' : 'bg-white dark:bg-slate-800 text-gray-400 dark:text-gray-500 cursor-default'}
            `}
         >
            <div className="relative">
               <Icons.Cart />
               {cartItemCount > 0 && (
                 <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">{cartItemCount}</span>
               )}
            </div>
            <span className="font-bold text-sm">前往当前订单 ({cartItemCount})</span>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
         </button>
      </div>

    </div>
  );
};