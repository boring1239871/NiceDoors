import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PRODUCT_TEMPLATES } from '../../../constants';
import { ProductType, CadModel, SashType, SashDirection, ProfileColor, PanelConfig } from '../../../types';
import { Icons } from '../../ui/Icons';
import { CadCanvas, ViewMode } from '../../CadCanvas';
import { calculatePrice } from '../../../services/exportService';

interface OrderEditorSidebarProps {
  onAddItem: (template: any, width: number, height: number, panels: number, model: CadModel, realisticEl: HTMLElement | null, wireframeEl: HTMLElement | null) => void;
}

export const OrderEditorSidebar: React.FC<OrderEditorSidebarProps> = ({ onAddItem }) => {
  // State
  const [activeCategory, setActiveCategory] = useState<ProductType>(ProductType.WINDOW);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('realistic');
  
  // Config Inputs
  const [width, setWidth] = useState(1000);
  const [height, setHeight] = useState(1000);
  const [pricePreview, setPricePreview] = useState(0);

  // Refs for dual capture
  const realisticRef = useRef<HTMLDivElement>(null);
  const wireframeRef = useRef<HTMLDivElement>(null);

  // Filter Templates
  const filteredTemplates = PRODUCT_TEMPLATES.filter(t => t.type === activeCategory);
  
  // Initialize selection
  useEffect(() => {
      if (filteredTemplates.length > 0 && !filteredTemplates.find(t => t.id === selectedTemplateId)) {
          setSelectedTemplateId(filteredTemplates[0].id);
      }
  }, [activeCategory, filteredTemplates, selectedTemplateId]);

  const currentTemplate = PRODUCT_TEMPLATES.find(t => t.id === selectedTemplateId) || PRODUCT_TEMPLATES[0];

  // Reset defaults when template changes
  useEffect(() => {
      if (currentTemplate) {
          setWidth(currentTemplate.defaultSize.width);
          setHeight(currentTemplate.defaultSize.height);
      }
  }, [currentTemplate.id]);

  // Calculate Price Preview
  useEffect(() => {
      const { price } = calculatePrice(width, height, currentTemplate.basePricePerSqM, currentTemplate.defaultPanels);
      setPricePreview(price);
  }, [width, height, currentTemplate]);

  // Generate Live Model
  const previewModel = useMemo<CadModel>(() => {
    let defaultType: SashType = 'casement';
    let defaultDir: SashDirection = 'left';

    if (currentTemplate.id.includes('sliding')) defaultType = 'sliding';
    if (currentTemplate.id.includes('fixed')) defaultType = 'fixed';
    if (currentTemplate.id.includes('awning')) { defaultType = 'awning'; defaultDir = 'top'; }
    if (currentTemplate.id.includes('folding')) defaultType = 'folding';
    if (currentTemplate.id.includes('entry')) defaultType = 'fixed';

    const initialConfigs: PanelConfig[] = [];
    for(let i=0; i<currentTemplate.defaultPanels; i++) {
        initialConfigs.push({
            id: `p-${i}`,
            index: i,
            type: defaultType,
            direction: defaultType === 'casement' ? (i % 2 === 0 ? 'left' : 'right') : defaultDir
        });
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
    <aside className="w-[400px] bg-white border-r border-gray-200 flex flex-col shrink-0 h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
      
      {/* SECTION 1 (TOP): Configurator & Preview (Dominant Space) */}
      <div className="flex-1 flex flex-col p-5 bg-white overflow-hidden min-h-0">
          <div className="flex justify-between items-center mb-3 shrink-0">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                 <Icons.Design />
                 <span>产品配置</span>
              </h3>
              
              {/* Wireframe Toggle */}
              <div className="bg-gray-100 rounded-lg p-0.5 flex">
                  <button 
                    onClick={() => setViewMode('realistic')} 
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${viewMode === 'realistic' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
                  >
                    效果图
                  </button>
                  <button 
                    onClick={() => setViewMode('wireframe')} 
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${viewMode === 'wireframe' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
                  >
                    CAD线稿
                  </button>
              </div>
          </div>
          
          {/* Canvas Container - Takes remaining vertical space */}
          <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 mb-4 relative overflow-hidden group min-h-0">
               
               {/* Layer 1: Realistic (Absolute) */}
               <div 
                  ref={realisticRef} 
                  className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${viewMode === 'realistic' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
               >
                  <CadCanvas 
                      model={previewModel} 
                      template={currentTemplate} 
                      selectedPanelIndex={null} 
                      onPanelSelect={() => {}} 
                      viewMode="realistic" 
                  />
               </div>

               {/* Layer 2: Wireframe (Absolute) */}
               <div 
                  ref={wireframeRef} 
                  className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${viewMode === 'wireframe' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
               >
                  <CadCanvas 
                      model={previewModel} 
                      template={currentTemplate} 
                      selectedPanelIndex={null} 
                      onPanelSelect={() => {}} 
                      viewMode="wireframe" 
                  />
               </div>
          </div>

          {/* Inputs & Actions */}
          <div className="shrink-0">
             <div className="grid grid-cols-2 gap-4 mb-4">
               <div>
                   <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">宽度 (mm)</label>
                   <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none" />
               </div>
               <div>
                   <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">高度 (mm)</label>
                   <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none" />
               </div>
             </div>

             <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
               <div className="flex-1">
                   <div className="text-[10px] text-gray-400 font-bold uppercase">单价估算</div>
                   <div className="text-xl font-bold text-blue-600">¥ {pricePreview.toLocaleString()}</div>
               </div>
               <button 
                   onClick={() => onAddItem(currentTemplate, width, height, currentTemplate.defaultPanels, previewModel, realisticRef.current, wireframeRef.current)}
                   className="px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-xl font-bold shadow-lg shadow-gray-200 transition-all active:scale-95 flex items-center gap-2"
               >
                   <span>加入清单</span>
                   <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 12l5 5L19 7"/></svg>
               </button>
             </div>
          </div>
      </div>

      {/* SECTION 2 (BOTTOM): Template Selection (Fixed Height) */}
      <div className="h-[300px] flex flex-col border-t border-gray-200 bg-gray-50 shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
        <div className="px-5 py-3 border-b border-gray-200 bg-white flex justify-between items-center sticky top-0 z-10">
            <span className="text-xs font-bold text-gray-500 uppercase">选择系列模板</span>
            <div className="flex p-0.5 bg-gray-100 rounded-lg">
                <button 
                  onClick={() => setActiveCategory(ProductType.WINDOW)} 
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeCategory === ProductType.WINDOW ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  窗系统
                </button>
                <button 
                  onClick={() => setActiveCategory(ProductType.DOOR)} 
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeCategory === ProductType.DOOR ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  门系统
                </button>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/50">
           <div className="grid grid-cols-2 gap-3">
               {filteredTemplates.map(tmpl => (
                   <div 
                      key={tmpl.id} 
                      onClick={() => setSelectedTemplateId(tmpl.id)}
                      className={`cursor-pointer p-3 rounded-xl border-2 transition-all relative overflow-hidden group ${selectedTemplateId === tmpl.id ? 'bg-white border-blue-500 ring-1 ring-blue-200 shadow-md' : 'bg-white border-gray-100 hover:border-blue-300 hover:shadow-sm'}`}
                   >
                      <div className="flex flex-col items-center gap-1.5">
                          <div className="text-2xl mb-1 scale-90">{tmpl.thumbnail}</div>
                          <div className={`text-xs font-bold text-center leading-tight line-clamp-2 ${selectedTemplateId === tmpl.id ? 'text-blue-800' : 'text-gray-600'}`}>
                              {tmpl.name}
                          </div>
                      </div>
                      {selectedTemplateId === tmpl.id && <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>}
                   </div>
               ))}
           </div>
        </div>
      </div>

    </aside>
  );
};