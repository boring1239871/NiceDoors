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
    <aside className="w-80 bg-white border-r border-gray-100 flex flex-col overflow-y-auto shrink-0 z-10">
      <div className="p-6">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">产品库</h2>
        <div className="flex p-1 bg-gray-100 rounded-xl mb-4">
          <button onClick={() => setActiveCategory(ProductType.WINDOW)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeCategory === ProductType.WINDOW ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}>窗类</button>
          <button onClick={() => setActiveCategory(ProductType.DOOR)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeCategory === ProductType.DOOR ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}>门类</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {filteredTemplates.map(tmpl => (
            <button key={tmpl.id} onClick={() => setSelectedTemplateId(tmpl.id)} className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${selectedTemplateId === tmpl.id ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 hover:border-gray-300 bg-gray-50'}`}>
              <span className="text-2xl mb-2">{tmpl.thumbnail}</span>
              <span className="text-[10px] font-bold text-gray-700 text-center leading-tight">{tmpl.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activePanelConfig ? (
          <div className="p-6 border-t border-gray-100 bg-blue-50/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-blue-800">编辑扇叶 #{selectedPanelIndex! + 1}</h2>
              <button onClick={() => setSelectedPanelIndex(null)} className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200">×</button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">类型</label>
                <div className="grid grid-cols-2 gap-2">
                  {['fixed', 'casement', 'sliding', 'awning'].map(t => (
                    <button 
                      key={t}
                      onClick={() => handlePanelConfigChange('type', t)}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border ${activePanelConfig.type === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}
                    >
                      {t === 'fixed' ? '固定' : t === 'casement' ? '平开' : t === 'sliding' ? '推拉' : '上悬'}
                    </button>
                  ))}
                </div>
              </div>

              {activePanelConfig.type !== 'fixed' && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-2">方向</label>
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
          <div className="p-6 border-t border-gray-100">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">参数设置</h2>
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">尺寸 (mm)</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">W</span>
                    <input type="number" value={cadModel.width} onChange={(e) => handleGlobalChange('width', parseInt(e.target.value)||0)} className="w-full pl-8 pr-3 py-2 bg-gray-50 rounded-xl text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">H</span>
                    <input type="number" value={cadModel.height} onChange={(e) => handleGlobalChange('height', parseInt(e.target.value)||0)} className="w-full pl-8 pr-3 py-2 bg-gray-50 rounded-xl text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">分扇: {cadModel.panels}</label>
                  {currentTemplate.rules.allowMullions && (
                    <button onClick={() => handleGlobalChange('enableMullions', !cadModel.enableMullions)} className={`text-[10px] font-bold px-2 py-1 rounded-md ${cadModel.enableMullions ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                      {cadModel.enableMullions ? '中挺: ON' : '中挺: OFF'}
                    </button>
                  )}
                </div>
                <input type="range" min={currentTemplate.rules.panels.min} max={currentTemplate.rules.panels.max} value={cadModel.panels} onChange={(e) => handlePanelCountChange(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">型材颜色</label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {[
                    { id: 'dark_grey', color: '#475569', label: '灰' },
                    { id: 'black', color: '#1e293b', label: '黑' },
                    { id: 'white', color: '#f1f5f9', label: '白' },
                    { id: 'champagne', color: '#fcd34d', label: '金' },
                    { id: 'wood', color: '#92400e', label: '木' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleGlobalChange('profileColor', c.id)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${cadModel.profileColor === c.id ? 'border-blue-500 scale-110' : 'border-gray-200'}`}
                      style={{ backgroundColor: c.color }}
                    >
                      {cadModel.profileColor === c.id && <Icons.Star />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-gray-100">
        <button 
          onClick={onAddToOrder}
          disabled={!validation.isValid}
          className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 ${validation.isValid ? 'bg-black hover:bg-gray-800' : 'bg-gray-300 cursor-not-allowed'}`}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14m7-7H5"/></svg>
          加入订单
        </button>
      </div>
    </aside>
  );
};