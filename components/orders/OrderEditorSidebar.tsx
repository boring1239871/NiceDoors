import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PRODUCT_TEMPLATES } from '../../constants';
import { ProductType, CadModel, SashType, SashDirection, ProfileColor, PanelConfig } from '../../types';
import { Icons } from '../common/Icons';
import { CadCanvas, ViewMode } from '../designer/CadCanvas';
import { calculatePrice, createDefaultModel } from '../../utils';

interface OrderEditorSidebarProps {
  onAddItem: (template: any, width: number, height: number, panels: number, model: CadModel, realisticEl: HTMLElement | null, wireframeEl: HTMLElement | null) => void;
}

export const OrderEditorSidebar: React.FC<OrderEditorSidebarProps> = ({ onAddItem }) => {
  const [activeCategory, setActiveCategory] = useState<ProductType>(ProductType.WINDOW);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('realistic');
  const [width, setWidth] = useState(1000);
  const [height, setHeight] = useState(1000);
  const [pricePreview, setPricePreview] = useState(0);
  const realisticRef = useRef<HTMLDivElement>(null);
  const wireframeRef = useRef<HTMLDivElement>(null);

  const filteredTemplates = PRODUCT_TEMPLATES.filter(t => t.type === activeCategory);
  
  // Auto-select first template
  useEffect(() => { 
    if (filteredTemplates.length > 0 && !filteredTemplates.find(t => t.id === selectedTemplateId)) {
        setSelectedTemplateId(filteredTemplates[0].id); 
    }
  }, [activeCategory, filteredTemplates, selectedTemplateId]);
  
  const currentTemplate = PRODUCT_TEMPLATES.find(t => t.id === selectedTemplateId) || PRODUCT_TEMPLATES[0];
  
  // Reset dimensions when template changes
  useEffect(() => { 
      if (currentTemplate) { 
          setWidth(currentTemplate.defaultSize.width); 
          setHeight(currentTemplate.defaultSize.height); 
      } 
  }, [currentTemplate.id]);
  
  // Update price
  useEffect(() => { 
      const { price } = calculatePrice(width, height, currentTemplate.basePricePerSqM, currentTemplate.defaultPanels); 
      setPricePreview(price); 
  }, [width, height, currentTemplate]);

  // Construct Preview Model
  const previewModel = useMemo<CadModel>(() => {
    let defaultType: SashType = 'casement', defaultDir: SashDirection = 'left';
    if (currentTemplate.id.includes('sliding')) defaultType = 'sliding';
    if (currentTemplate.id.includes('fixed')) defaultType = 'fixed';
    if (currentTemplate.id.includes('awning')) { defaultType = 'awning'; defaultDir = 'top'; }
    if (currentTemplate.id.includes('folding')) defaultType = 'folding';
    if (currentTemplate.id.includes('entry')) defaultType = 'fixed';
    
    const initialConfigs: PanelConfig[] = [];
    for(let i=0; i<currentTemplate.defaultPanels; i++) { 
        initialConfigs.push({ id: `p-${i}`, index: i, type: defaultType, direction: defaultType === 'casement' ? (i % 2 === 0 ? 'left' : 'right') : defaultDir }); 
    }
    
    let defaultColor: ProfileColor = 'dark_grey';
    if (currentTemplate.material === 'upvc') defaultColor = 'white';
    if (currentTemplate.material === 'wood_clad') defaultColor = 'wood';
    
    return { 
        id: 'preview', 
        templateId: currentTemplate.id, 
        width: width, 
        height: height, 
        panels: currentTemplate.defaultPanels, 
        panelConfigs: initialConfigs, 
        transomHeight: 0, 
        hasThreshold: currentTemplate.type === ProductType.DOOR, 
        thresholdHeight: 30, 
        showOpeningIndicators: true, 
        glassColor: 'blue', 
        profileColor: defaultColor, 
        glassType: 'double', 
        enableMullions: true 
    };
  }, [currentTemplate, width, height]);

  return (
    <aside className="w-[380px] bg-white dark:bg-[#1e1f20] border-r border-gray-200 dark:border-gray-800 flex flex-col shrink-0 h-full z-20 transition-colors">
      
      {/* 1. Header & Preview Section */}
      <div className="flex flex-col p-5 pb-0">
          <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                配置产品
              </h3>
              <div className="bg-gray-100 dark:bg-[#2c2c2e] rounded-full p-1 flex">
                <button onClick={() => setViewMode('realistic')} className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${viewMode === 'realistic' ? 'bg-white dark:bg-[#444746] text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>效果</button>
                <button onClick={() => setViewMode('wireframe')} className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${viewMode === 'wireframe' ? 'bg-white dark:bg-[#444746] text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>图纸</button>
              </div>
          </div>
          
          <div className="relative aspect-square bg-[#f0f4f9] dark:bg-[#131314] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden group mb-4 shadow-inner">
               <div ref={realisticRef} className={`absolute inset-0 w-full h-full transition-opacity duration-300 p-4 ${viewMode === 'realistic' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                 <div className="w-full h-full bg-white dark:bg-transparent rounded-xl shadow-sm dark:shadow-none overflow-hidden">
                    <CadCanvas model={previewModel} template={currentTemplate} selectedPanelIndex={null} onPanelSelect={() => {}} viewMode="realistic" />
                 </div>
               </div>
               <div ref={wireframeRef} className={`absolute inset-0 w-full h-full transition-opacity duration-300 p-4 ${viewMode === 'wireframe' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                 <div className="w-full h-full bg-white dark:bg-white/90 rounded-xl shadow-sm overflow-hidden">
                    <CadCanvas model={previewModel} template={currentTemplate} selectedPanelIndex={null} onPanelSelect={() => {}} viewMode="wireframe" />
                 </div>
               </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
               <div className="group">
                 <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">宽度 (Width)</label>
                 <div className="relative">
                    <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full pl-3 pr-8 py-2.5 bg-gray-50 dark:bg-[#2c2c2e] border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-[#c2e7ff] dark:focus:ring-[#004a77] focus:border-[#c2e7ff] dark:focus:border-[#004a77] outline-none transition-all" />
                    <span className="absolute right-3 top-2.5 text-xs font-medium text-gray-400">mm</span>
                 </div>
               </div>
               <div className="group">
                 <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">高度 (Height)</label>
                 <div className="relative">
                    <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full pl-3 pr-8 py-2.5 bg-gray-50 dark:bg-[#2c2c2e] border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-[#c2e7ff] dark:focus:ring-[#004a77] focus:border-[#c2e7ff] dark:focus:border-[#004a77] outline-none transition-all" />
                    <span className="absolute right-3 top-2.5 text-xs font-medium text-gray-400">mm</span>
                 </div>
               </div>
          </div>
      </div>

      {/* 2. Template Selection (Scrollable) */}
      <div className="flex-1 flex flex-col min-h-0 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#1a1a1c]">
        <div className="px-5 py-3 flex justify-between items-center sticky top-0 z-10 bg-gray-50/50 dark:bg-[#1a1a1c] backdrop-blur-sm">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">产品库</span>
            <div className="flex p-1 bg-gray-200 dark:bg-[#2c2c2e] rounded-lg">
                <button onClick={() => setActiveCategory(ProductType.WINDOW)} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeCategory === ProductType.WINDOW ? 'bg-white dark:bg-[#444746] text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>窗系统</button>
                <button onClick={() => setActiveCategory(ProductType.DOOR)} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeCategory === ProductType.DOOR ? 'bg-white dark:bg-[#444746] text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>门系统</button>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-5 pb-4 custom-scrollbar">
           <div className="space-y-2">
               {filteredTemplates.map(tmpl => (
                   <div 
                      key={tmpl.id} 
                      onClick={() => setSelectedTemplateId(tmpl.id)} 
                      className={`
                        cursor-pointer p-3 rounded-xl border transition-all relative flex items-center gap-4 group
                        ${selectedTemplateId === tmpl.id 
                            ? 'bg-[#eef5fd] dark:bg-[#004a77] border-[#c2e7ff] dark:border-[#004a77] shadow-sm' 
                            : 'bg-white dark:bg-[#1e1f20] border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-500 hover:shadow-sm'}
                      `}
                   >
                      <div className={`
                          w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors p-1.5 overflow-hidden pointer-events-none
                          ${selectedTemplateId === tmpl.id ? 'bg-white/60 dark:bg-white/10' : 'bg-gray-50 dark:bg-[#2c2c2e]'}
                      `}>
                          {/* DYNAMIC THUMBNAIL HERE */}
                          <CadCanvas model={createDefaultModel(tmpl)} template={tmpl} selectedPanelIndex={null} onPanelSelect={() => {}} viewMode="realistic" />
                      </div>
                      <div className="flex-1 min-w-0">
                          <div className={`text-sm font-bold truncate ${selectedTemplateId === tmpl.id ? 'text-[#001d35] dark:text-[#c2e7ff]' : 'text-gray-700 dark:text-gray-200'}`}>{tmpl.name}</div>
                          <div className={`text-xs mt-0.5 truncate ${selectedTemplateId === tmpl.id ? 'text-[#001d35]/70 dark:text-[#c2e7ff]/70' : 'text-gray-400'}`}>
                            {tmpl.material === 'aluminum' ? '普通铝合金' : tmpl.material === 'broken_bridge' ? '断桥隔热铝' : tmpl.material === 'upvc' ? '高强度塑钢' : '铝包木'}
                          </div>
                      </div>
                      {selectedTemplateId === tmpl.id && <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-[#c2e7ff] shrink-0"></div>}
                   </div>
               ))}
           </div>
        </div>
      </div>

      {/* 3. Footer Action */}
      <div className="p-5 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e1f20] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
         <div className="flex justify-between items-end mb-3">
             <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">预估单价</div>
             <div className="text-2xl font-bold text-gray-900 dark:text-white">¥ {pricePreview.toLocaleString()}</div>
         </div>
         <button 
            onClick={() => onAddItem(currentTemplate, width, height, currentTemplate.defaultPanels, previewModel, realisticRef.current, wireframeRef.current)} 
            className="w-full py-3.5 bg-[#0b57d0] hover:bg-[#0842a0] dark:bg-[#a8c7fa] dark:hover:bg-[#8ab4f8] text-white dark:text-[#0b57d0] rounded-full font-bold shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
         >
            <Icons.Plus />
            <span>添加到清单</span>
         </button>
      </div>
    </aside>
  );
};