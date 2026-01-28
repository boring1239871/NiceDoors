import React, { useState, useEffect } from 'react';
import { PRODUCT_TEMPLATES } from '../constants';
import { CadModel, ProductTemplate, CadValidationResult, SashType, SashDirection, ProductType, PanelConfig, ProfileColor, OrderItem } from '../types';
import { CadCanvas, ViewMode } from '../components/CadCanvas';
import { validateCadModel } from '../services/validationService';
import { calculatePrice, svgToPng } from '../services/exportService';
import { DesignerSidebar } from '../components/features/designer/DesignerSidebar';

interface DesignerViewProps {
  initialTemplateId: string;
  onAddToOrder: (item: OrderItem) => void;
}

export const DesignerView: React.FC<DesignerViewProps> = ({ initialTemplateId, onAddToOrder }) => {
  const [activeCategory, setActiveCategory] = useState<ProductType>(ProductType.WINDOW);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplateId || ''); 
  const [cadModel, setCadModel] = useState<CadModel | null>(null);
  const [validation, setValidation] = useState<CadValidationResult>({ isValid: true, errors: {} });
  const [isJsonView, setIsJsonView] = useState(false);
  const [selectedPanelIndex, setSelectedPanelIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('realistic');

  const filteredTemplates = PRODUCT_TEMPLATES.filter(t => t.type === activeCategory);
  const currentTemplate = PRODUCT_TEMPLATES.find(t => t.id === selectedTemplateId) || filteredTemplates[0] || PRODUCT_TEMPLATES[0];

  // Initialize Template Logic
  useEffect(() => {
    if (filteredTemplates.length > 0) {
      const exists = filteredTemplates.find(t => t.id === selectedTemplateId);
      if (!exists) setSelectedTemplateId(filteredTemplates[0].id);
    }
  }, [activeCategory, filteredTemplates, selectedTemplateId]);

  // Model Construction Logic
  useEffect(() => {
    if (!currentTemplate) return;

    let defaultType: SashType = 'casement';
    let defaultDir: SashDirection = 'left';

    if (currentTemplate.id.includes('sliding')) defaultType = 'sliding';
    if (currentTemplate.id.includes('fixed')) defaultType = 'fixed';
    if (currentTemplate.id.includes('awning')) { defaultType = 'awning'; defaultDir = 'top'; }
    if (currentTemplate.id.includes('folding')) defaultType = 'folding';
    if (currentTemplate.id.includes('entry')) defaultType = 'fixed'; // Armor door logic

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

    const initialModel: CadModel = {
      id: `CAD-${Date.now()}`, 
      templateId: currentTemplate.id,
      width: currentTemplate.defaultSize.width,
      height: currentTemplate.defaultSize.height,
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
    setCadModel(initialModel);
    setSelectedPanelIndex(null);
  }, [currentTemplate]);

  // Validation Logic
  useEffect(() => {
    if (cadModel && currentTemplate) {
      const res = validateCadModel(cadModel, currentTemplate);
      setValidation(res);
    }
  }, [cadModel, currentTemplate]);

  // Event Handlers
  const handleGlobalChange = (key: keyof CadModel, value: any) => {
    if (!cadModel) return;
    setCadModel(prev => prev ? ({ ...prev, [key]: value }) : null);
  };

  const handlePanelCountChange = (newCount: number) => {
    if (!cadModel) return;
    const currentCount = cadModel.panelConfigs.length;
    let newConfigs = [...cadModel.panelConfigs];

    if (newCount > currentCount) {
        for(let i = currentCount; i < newCount; i++) {
            newConfigs.push({ id: `p-${i}`, index: i, type: 'fixed', direction: 'left' });
        }
    } else if (newCount < currentCount) {
        newConfigs = newConfigs.slice(0, newCount);
    }
    setCadModel({ ...cadModel, panels: newCount, panelConfigs: newConfigs });
    if (selectedPanelIndex !== null && selectedPanelIndex >= newCount) setSelectedPanelIndex(null);
  };

  const handlePanelConfigChange = (key: keyof PanelConfig, value: any) => {
     if (!cadModel || selectedPanelIndex === null) return;
     const newConfigs = [...cadModel.panelConfigs];
     const panel = newConfigs[selectedPanelIndex];
     
     if (key === 'type') {
         const newType = value as SashType;
         panel.type = newType;
         if (newType === 'awning') panel.direction = 'top';
         else if (newType === 'hopper') panel.direction = 'bottom';
         else if (newType === 'sliding' && (panel.direction === 'top' || panel.direction === 'bottom')) panel.direction = 'left';
         else if (newType === 'casement' && (panel.direction === 'top' || panel.direction === 'bottom')) panel.direction = 'left';
     } else {
         // @ts-ignore
         panel[key] = value;
     }

     setCadModel({ ...cadModel, panelConfigs: newConfigs });
  };

  const handleAddToOrder = async () => {
    if (!validation.isValid || !cadModel || !currentTemplate) { 
        alert("设计存在错误，请修正后再添加。"); 
        return; 
    }
    const svgElement = document.querySelector('#cad-canvas-container svg');
    let thumbUrl = '';
    if (svgElement) {
        try {
            thumbUrl = await svgToPng(svgElement as SVGSVGElement, 200, 200);
        } catch (e) {
            console.error("Failed to generate thumbnail", e);
        }
    }
    const { area, price } = calculatePrice(cadModel.width, cadModel.height, currentTemplate.basePricePerSqM, cadModel.panels);
    const newItem: OrderItem = {
        id: `ITEM-${Date.now()}`,
        model: { ...cadModel }, 
        templateName: currentTemplate.name,
        thumbnailDataUrl: thumbUrl,
        quantity: 1,
        unitPrice: price,
        area: area,
        totalPrice: price
    };
    onAddToOrder(newItem);
  };

  if (!cadModel || !currentTemplate) return <div>Loading...</div>;
  const activePanelConfig = selectedPanelIndex !== null ? cadModel.panelConfigs[selectedPanelIndex] : null;

  return (
    <div className="flex h-full w-full overflow-hidden bg-white rounded-tl-[24px] shadow-inner border-l border-t border-gray-200">
      <DesignerSidebar 
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        filteredTemplates={filteredTemplates}
        selectedTemplateId={selectedTemplateId}
        setSelectedTemplateId={setSelectedTemplateId}
        cadModel={cadModel}
        selectedPanelIndex={selectedPanelIndex}
        setSelectedPanelIndex={setSelectedPanelIndex}
        activePanelConfig={activePanelConfig}
        handlePanelConfigChange={handlePanelConfigChange}
        handleGlobalChange={handleGlobalChange}
        handlePanelCountChange={handlePanelCountChange}
        currentTemplate={currentTemplate}
        validation={validation}
        onAddToOrder={handleAddToOrder}
      />

      <main className="flex-1 flex flex-col bg-[#F3F6F9] relative overflow-hidden" id="cad-canvas-container">
        {/* Canvas Toolbar - Cleaned up */}
        <div className="absolute top-6 left-6 z-10 flex gap-3">
            <div className="bg-white rounded-full shadow-sm border border-gray-200 p-1 flex">
                <button onClick={() => setViewMode('realistic')} className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${viewMode === 'realistic' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>效果</button>
                <button onClick={() => setViewMode('wireframe')} className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${viewMode === 'wireframe' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>线稿</button>
            </div>
        </div>
        
        <div className="flex-1 flex overflow-hidden p-4">
            <div className="w-full h-full bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden relative">
                {isJsonView ? <div className="w-full h-full p-8 overflow-auto"><pre className="text-xs bg-slate-800 text-green-400 p-4 rounded-xl">{JSON.stringify(cadModel, null, 2)}</pre></div> 
                : <CadCanvas model={cadModel} template={currentTemplate} selectedPanelIndex={selectedPanelIndex} onPanelSelect={setSelectedPanelIndex} viewMode={viewMode} />}
            </div>
        </div>
      </main>
    </div>
  );
};