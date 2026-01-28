import React from 'react';
import { ProductType, ProductTemplate, CadModel, PanelConfig, CadValidationResult, SashType } from '../../../types';
import { Icons } from '../../ui/Icons';

interface DesignerSidebarProps {
  activeCategory: ProductType;
  setActiveCategory: (type: ProductType) => void;
  filteredTemplates: ProductTemplate[];
  selectedTemplateId: string;
  setSelectedTemplateId: (id: string) => void;
  cadModel: CadModel;
  selectedPanelIndex: number | null;
  setSelectedPanelIndex: (idx: number | null) => void;
  activePanelConfig: PanelConfig | null;
  handlePanelConfigChange: (key: keyof PanelConfig, value: any) => void;
  handleGlobalChange: (key: keyof CadModel, value: any) => void;
  handlePanelCountChange: (count: number) => void;
  currentTemplate: ProductTemplate;
  validation: CadValidationResult;
  onAddToOrder: () => void;
}

export const DesignerSidebar: React.FC<DesignerSidebarProps> = (props) => {
  const {
    activeCategory, setActiveCategory, filteredTemplates, selectedTemplateId, setSelectedTemplateId,
    cadModel, selectedPanelIndex, setSelectedPanelIndex, activePanelConfig,
    handlePanelConfigChange, handleGlobalChange, handlePanelCountChange, currentTemplate, validation, onAddToOrder
  } = props;

  return (
    <aside className="w-80 bg-white border-r border-gray-100 flex flex-col overflow-y-auto shrink-0 z-10 custom-scrollbar">
      {/* 1. Product Library */}
      <div className="p-6">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Icons.Design /> 产品库
        </h2>
        <div className="flex p-1 bg-gray-100 rounded-xl mb-4">
          <button onClick={() => setActiveCategory(ProductType.WINDOW)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeCategory === ProductType.WINDOW ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}>窗类</button>
          <button onClick={() => setActiveCategory(ProductType.DOOR)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeCategory === ProductType.DOOR ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}>门类</button>
        </div>
        <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar">
          {filteredTemplates.map(tmpl => (
            <button key={tmpl.id} onClick={() => setSelectedTemplateId(tmpl.id)} className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${selectedTemplateId === tmpl.id ? 'border-slate-800 bg-slate-50' : 'border-gray-100 hover:border-gray-300 bg-gray-50'}`}>
              <span className="text-2xl mb-2">{tmpl.thumbnail}</span>
              <span className="text-[10px] font-bold text-gray-700 text-center leading-tight">{tmpl.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Parameters Panel */}
      <div className="flex-1 border-t border-gray-100 bg-gray-50/30 overflow-y-auto custom-scrollbar">
        {activePanelConfig ? (
          // === Sash/Panel Editing Mode ===
          <div className="p-6 bg-blue-50/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  编辑扇叶 #{selectedPanelIndex! + 1}
              </h2>
              <button onClick={() => setSelectedPanelIndex(null)} className="w-6 h-6 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center hover:bg-blue-300">×</button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">开启类型</label>
                <div className="grid grid-cols-2 gap-2">
                  {['fixed', 'casement', 'sliding', 'awning'].map(t => (
                    <button 
                      key={t}
                      onClick={() => handlePanelConfigChange('type', t)}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border ${activePanelConfig.type === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}
                    >
                      {t === 'fixed' ? '固定 (Fixed)' : t === 'casement' ? '平开 (Case)' : t === 'sliding' ? '推拉 (Slide)' : '上悬 (Awning)'}
                    </button>
                  ))}
                </div>
              </div>

              {activePanelConfig.type !== 'fixed' && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-2">开启方向</label>
                  <div className="flex gap-2">
                    {['left', 'right', 'top'].map(dir => (
                      <button key={dir} onClick={() => handlePanelConfigChange('direction', dir)} className={`flex-1 py-2 text-xs font-medium rounded-lg border ${activePanelConfig.direction === dir ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                        {dir.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // === Global Parameters Mode ===
          <div className="p-6">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">全局参数</h2>
            <div className="space-y-6">
              {/* Width & Height */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">整体尺寸 (mm)</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">W</span>
                    <input type="number" value={cadModel.width} onChange={(e) => handleGlobalChange('width', parseInt(e.target.value)||0)} className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-slate-500/20" />
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">H</span>
                    <input type="number" value={cadModel.height} onChange={(e) => handleGlobalChange('height', parseInt(e.target.value)||0)} className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-slate-500/20" />
                  </div>
                </div>
              </div>

              {/* Panels Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">分扇数量: {cadModel.panels}</label>
                </div>
                <input type="range" min={currentTemplate.rules.panels.min} max={currentTemplate.rules.panels.max} value={cadModel.panels} onChange={(e) => handlePanelCountChange(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-slate-800" />
              </div>

              {/* Structural Layout (Transom / Mullion) - RESTORED */}
              <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-4">
                  <h3 className="text-xs font-bold text-gray-800 border-b border-gray-100 pb-2">结构布局</h3>
                  
                  {/* Mullion Toggle (Only if allowed) */}
                  {currentTemplate.rules.allowMullions && (
                      <div className="flex items-center justify-between">
                         <span className="text-xs text-gray-600 font-medium">竖中挺 (Mullion)</span>
                         <button 
                            onClick={() => handleGlobalChange('enableMullions', !cadModel.enableMullions)}
                            className={`w-10 h-5 rounded-full relative transition-colors ${cadModel.enableMullions ? 'bg-slate-800' : 'bg-gray-300'}`}
                         >
                            <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform ${cadModel.enableMullions ? 'left-6' : 'left-1'}`}></div>
                         </button>
                      </div>
                  )}

                  {/* Transom Input (Only if allowed) */}
                  {currentTemplate.rules.allowTransom && (
                      <div>
                          <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-600 font-medium">上亮/横挺 (Transom)</span>
                              {cadModel.transomHeight > 0 && (
                                <button onClick={() => handleGlobalChange('transomHeight', 0)} className="text-[10px] text-red-500 hover:underline">移除</button>
                              )}
                          </div>
                          <div className="flex items-center gap-2">
                              <input 
                                  type="range" 
                                  min="0" 
                                  max={cadModel.height / 2} 
                                  step="50"
                                  value={cadModel.transomHeight} 
                                  onChange={(e) => handleGlobalChange('transomHeight', parseInt(e.target.value))}
                                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
                              />
                              <div className="w-16 relative">
                                  <input 
                                      type="number" 
                                      value={cadModel.transomHeight} 
                                      onChange={(e) => handleGlobalChange('transomHeight', parseInt(e.target.value))}
                                      className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-bold text-center"
                                  />
                              </div>
                          </div>
                      </div>
                  )}
              </div>
              
              {/* Appearance */}
              <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-2">外观配色</label>
                  <select 
                      value={cadModel.profileColor} 
                      onChange={(e) => handleGlobalChange('profileColor', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none"
                  >
                      <option value="dark_grey">深空灰 (Dark Grey)</option>
                      <option value="white">珍珠白 (White)</option>
                      <option value="black">哑光黑 (Black)</option>
                      <option value="champagne">香槟金 (Champagne)</option>
                      <option value="wood">柚木纹 (Wood)</option>
                  </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Action Footer */}
      <div className="p-6 border-t border-gray-100 bg-white z-10">
         {/* Validation Errors */}
         {!validation.isValid && (
             <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                 {Object.values(validation.errors).map((err, i) => (
                     <div key={i} className="text-[10px] text-red-600 font-bold flex items-center gap-1">
                         <span>⚠️</span> {err}
                     </div>
                 ))}
             </div>
         )}
         
         <button 
           onClick={onAddToOrder}
           disabled={!validation.isValid}
           className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${validation.isValid ? 'bg-slate-900 hover:bg-black shadow-slate-300 active:scale-95' : 'bg-gray-300 cursor-not-allowed'}`}
         >
           <span>加入订单清单</span>
           <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
         </button>
      </div>
    </aside>
  );
};
