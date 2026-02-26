import React, { useState, useMemo, useEffect } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
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


  const filteredProducts = useMemo(() => {
    return PRODUCT_TEMPLATES.filter(p => {
      const matchesCategory = activeCategory === 'ALL' || p.type === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleSearch = () => {
    setSearchQuery(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchQuery('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F3F6F9] dark:bg-slate-900 animate-fade-in">
      {/* 移动端头部 - 搜索和分类在一行 */}
      <div className="lg:hidden sticky top-0 z-30 bg-[#F3F6F9] dark:bg-slate-900 px-4 pt-4 pb-2 shadow-sm">
        <div className="flex items-center gap-2">
          {/* 搜索框 - 占据剩余宽度 */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="搜索产品..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-8 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 outline-none dark:text-white"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* 分类标签 - 横向滚动，固定宽度 */}
          <div className="flex gap-1 overflow-x-auto scrollbar-hide flex-shrink-0 max-w-[180px]">
            {(['ALL', ProductType.WINDOW, ProductType.DOOR] as const).map((type) => (
              <button
                key={type}
                onClick={() => setActiveCategory(type)}
                className={`
            flex-shrink-0 px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all
            ${activeCategory === type
                    ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700'
                  }
          `}
              >
                {type === 'ALL' ? '全部' : type === ProductType.WINDOW ? '窗户' : '门'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 桌面端头部 */}
      <div className="hidden lg:flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 md:p-8 pb-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">产品库</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">选择标准产品型号开始定制下单</p>
        </div>
        <div className="flex items-center gap-3">
          {/* 桌面端搜索 */}
          <div className="relative group flex items-center gap-2">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="输入产品名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-9 pr-10 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl w-64 text-sm focus:w-80 transition-all outline-none focus:ring-1 focus:ring-blue-500/30 shadow-sm dark:text-white"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button onClick={handleSearch} className="bg-slate-900 dark:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-black transition-all">
              搜索
            </button>
          </div>

          {/* 桌面端分类标签 */}
          <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
            {(['ALL', ProductType.WINDOW, ProductType.DOOR] as const).map((type) => (
              <button
                key={type}
                onClick={() => setActiveCategory(type)}
                className={`
                  px-4 py-2 rounded-lg text-xs font-bold transition-all
                  ${activeCategory === type
                    ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-md'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }
                `}
              >
                {type === 'ALL' ? '全部' : type === ProductType.WINDOW ? '窗' : '门'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 产品网格 */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-28 lg:pb-8 pt-4 lg:pt-6 custom-scrollbar">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <div className="text-sm font-bold">没有找到匹配的产品</div>
            <button
              onClick={() => {
                setActiveCategory('ALL');
                setSearchTerm('');
                setSearchQuery('');
              }}
              className="mt-4 text-blue-500 text-sm font-bold"
            >
              清除筛选
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-6">
            {filteredProducts.map(product => {
              const defaultModel = createDefaultModel(product);

              return (
                <div
                  key={product.id}
                  className="group bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
                  onClick={() => onSelectProduct(product)}
                >
                  {/* 缩略图区域 */}
                  <div className="aspect-[3/2] bg-gray-50 dark:bg-slate-900/50 flex items-center justify-center relative overflow-hidden">
                    <div className="w-full h-full pointer-events-none transform group-hover:scale-105 transition-transform duration-500">
                      <CadCanvas
                        model={defaultModel}
                        template={product}
                        selectedPanelIndex={null}
                        onPanelSelect={() => { }}
                        viewMode="realistic"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-60"></div>
                    <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-slate-800/90 text-black dark:text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                      立即定制
                    </div>
                  </div>

                  {/* 信息区域 */}
                  <div className="p-3 lg:p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm lg:text-base leading-tight line-clamp-2 mb-2">
                      {product.name}
                    </h3>

                    <div className="mt-auto flex justify-between items-center">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm lg:text-base font-bold text-red-500">¥{product.basePricePerSqM}</span>
                        <span className="text-[10px] text-gray-400">/m²</span>
                      </div>
                      <span className={`
                        px-2 py-0.5 rounded text-[10px] font-bold
                        ${product.type === ProductType.WINDOW
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                        }
                      `}>
                        {product.type === ProductType.WINDOW ? '窗' : '门'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 移动端购物车按钮 */}
      <div className="lg:hidden fixed bottom-4 right-4 z-20">
        <button
          onClick={onGoToCart}
          className={`
            flex items-center gap-2 px-5 py-3 rounded-full shadow-lg transition-all hover:-translate-y-1 active:scale-95
            ${cartItemCount > 0
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-white dark:bg-slate-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700'
            }
          `}
        >
          <div className="relative">
            <Icons.Cart />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-red-500 text-xs font-bold min-w-5 h-5 flex items-center justify-center rounded-full px-1 shadow-sm">
                {cartItemCount}
              </span>
            )}
          </div>
          <span className="font-bold text-sm">购物车</span>
        </button>
      </div>

      {/* 桌面端购物车按钮 */}
      <div className="hidden lg:block fixed bottom-8 right-8 z-20">
        <button
          onClick={onGoToCart}
          className={`
            flex items-center gap-3 px-6 py-4 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all hover:-translate-y-1 active:scale-95
            ${cartItemCount > 0
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-white dark:bg-slate-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700'
            }
          `}
        >
          <div className="relative">
            <Icons.Cart />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-red-500 text-xs font-bold min-w-5 h-5 flex items-center justify-center rounded-full px-1 shadow-sm">
                {cartItemCount}
              </span>
            )}
          </div>
          <span className="font-bold text-sm">去结算 ({cartItemCount})</span>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
};