// ItemDesigner.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PRODUCT_TEMPLATES } from '../../constants';
import { ProductType, CadModel, SashType, SashDirection, ProfileColor, PanelConfig, GlassType } from '../../types';
import { Icons } from '../common/Icons';
import { CadCanvas, ViewMode } from '../designer/CadCanvas';
import { calculatePrice, createDefaultModel } from '../../utils';

interface ItemDesignerProps {
    onCancel: () => void;
    onSave: (template: any, width: number, height: number, panels: number, model: CadModel, realisticEl: HTMLElement | null, wireframeEl: HTMLElement | null) => void;
    initialTemplateId?: string;
}

export const ItemDesigner: React.FC<ItemDesignerProps> = ({ onCancel, onSave, initialTemplateId }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [activeCategory, setActiveCategory] = useState<ProductType>(ProductType.WINDOW);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplateId || '');

    // 如果提供了初始模板ID，确保它被正确设置
    useEffect(() => {
        if (initialTemplateId) {
            setSelectedTemplateId(initialTemplateId);
            // 从模板中获取产品类型并设置活动分类
            const template = PRODUCT_TEMPLATES.find(t => t.id === initialTemplateId);
            if (template) {
                setActiveCategory(template.type);
            }
        }
    }, [initialTemplateId]);
    const [viewMode, setViewMode] = useState<ViewMode>('realistic');
    const [searchQuery, setSearchQuery] = useState('');

    const [width, setWidth] = useState(1000);
    const [height, setHeight] = useState(1000);
    const [panels, setPanels] = useState(1);
    const [profileColor, setProfileColor] = useState<ProfileColor>('dark_grey');
    const [glassType, setGlassType] = useState<GlassType>('double');

    const [enableMullions, setEnableMullions] = useState(true);
    const [transomHeight, setTransomHeight] = useState(0);

    const [pricePreview, setPricePreview] = useState(0);
    const [isImageExpanded, setIsImageExpanded] = useState(false);

    const realisticRef = useRef<HTMLDivElement>(null);
    const wireframeRef = useRef<HTMLDivElement>(null);

    // 检测移动端
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const filteredTemplates = useMemo(() => {
        return PRODUCT_TEMPLATES.filter(t => {
            const matchesCategory = t.type === activeCategory;
            const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, searchQuery]);

    useEffect(() => {
        if (filteredTemplates.length > 0 && !filteredTemplates.find(t => t.id === selectedTemplateId)) {
            setSelectedTemplateId(filteredTemplates[0].id);
        }
    }, [activeCategory, filteredTemplates, selectedTemplateId]);

    const currentTemplate = PRODUCT_TEMPLATES.find(t => t.id === selectedTemplateId) || PRODUCT_TEMPLATES[0];

    useEffect(() => {
        if (currentTemplate) {
            setWidth(currentTemplate.defaultSize.width);
            setHeight(currentTemplate.defaultSize.height);
            setPanels(currentTemplate.defaultPanels);
            setEnableMullions(currentTemplate.rules.allowMullions);
            setTransomHeight(0);

            if (currentTemplate.material === 'upvc') setProfileColor('white');
            else if (currentTemplate.material === 'wood_clad') setProfileColor('wood');
            else setProfileColor('dark_grey');
        }
    }, [currentTemplate?.id]);

    useEffect(() => {
        const base = calculatePrice(width, height, currentTemplate.basePricePerSqM, panels);
        const transomSurcharge = transomHeight > 0 ? (width * 0.05) : 0;
        setPricePreview(base.price + transomSurcharge);
    }, [width, height, panels, currentTemplate, transomHeight]);

    const previewModel = useMemo<CadModel>(() => {
        if (!currentTemplate) return {} as CadModel;
        let defaultType: SashType = 'casement', defaultDir: SashDirection = 'left';
        if (currentTemplate.id.includes('sliding')) defaultType = 'sliding';
        if (currentTemplate.id.includes('fixed')) defaultType = 'fixed';
        if (currentTemplate.id.includes('awning')) { defaultType = 'awning'; defaultDir = 'top'; }
        if (currentTemplate.id.includes('folding')) defaultType = 'folding';
        if (currentTemplate.id.includes('entry')) defaultType = 'fixed';

        const initialConfigs: PanelConfig[] = [];
        for (let i = 0; i < panels; i++) {
            initialConfigs.push({
                id: `p-${i}`,
                index: i,
                type: defaultType,
                direction: defaultType === 'casement' ? (i % 2 === 0 ? 'left' : 'right') : defaultDir
            });
        }

        return {
            id: 'preview',
            templateId: currentTemplate.id,
            width: width,
            height: height,
            panels: panels,
            panelConfigs: initialConfigs,
            transomHeight: transomHeight,
            hasThreshold: currentTemplate.type === ProductType.DOOR,
            thresholdHeight: 30,
            showOpeningIndicators: true,
            glassColor: 'blue',
            profileColor: profileColor,
            glassType: glassType,
            enableMullions: enableMullions
        };
    }, [currentTemplate, width, height, panels, profileColor, glassType, enableMullions, transomHeight]);

    const colorOptions: { value: ProfileColor; label: string; bg: string; border: string }[] = [
        { value: 'dark_grey', label: '深空灰', bg: 'bg-slate-600', border: 'border-slate-700' },
        { value: 'white', label: '珍珠白', bg: 'bg-white', border: 'border-gray-200' },
        { value: 'black', label: '哑光黑', bg: 'bg-black', border: 'border-gray-800' },
        { value: 'champagne', label: '香槟金', bg: 'bg-[#e5cca5]', border: 'border-[#d4b990]' },
        { value: 'wood', label: '柚木纹', bg: 'bg-[#855e42]', border: 'border-[#6b4a32]' },
    ];

    const glassOptions: { value: GlassType; label: string; desc: string }[] = [
        { value: 'single', label: '单玻', desc: '5mm 钢化' },
        { value: 'double', label: '双玻', desc: '5+12A+5' },
        { value: 'triple', label: '三玻', desc: '三玻两腔' },
        { value: 'laminated', label: '夹胶', desc: 'PVB 安全' },
    ];

    // 移动端布局
    if (isMobile) {
        return (
            <div className="flex flex-col h-full w-full bg-[#f0f4f9] dark:bg-black overflow-y-auto">
                {/* 移动端头部 - 返回和标题 */}
                <div className="sticky top-0 z-20 bg-white dark:bg-[#1e1f20] px-4 pt-12 pb-3 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <button onClick={onCancel} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Icons.ChevronLeft />
                            <span className="text-sm font-bold">返回</span>
                        </button>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">配置产品</h2>
                        <div className="w-8"></div> {/* 占位保持平衡 */}
                    </div>
                </div>

                {/* 图片预览区域 */}
                <div className="relative bg-[#eef2f6] dark:bg-[#0a0a0a] aspect-square">
                    <div className="absolute inset-0 opacity-[0.4] pointer-events-none" style={{
                        backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }}></div>

                    <div
                        className="relative w-full h-full cursor-zoom-in"
                        onClick={() => setIsImageExpanded(true)}
                    >
                        <div className="w-full h-full flex items-center justify-center p-4">
                            <div className="w-full h-full max-w-lg shadow-2xl shadow-blue-900/10 rounded-xl overflow-hidden bg-white dark:bg-transparent">
                                <CadCanvas
                                    model={previewModel}
                                    template={currentTemplate}
                                    selectedPanelIndex={null}
                                    onPanelSelect={() => { }}
                                    viewMode={viewMode}
                                />
                            </div>
                        </div>

                        {/* 查看大图提示 */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm">
                            <Icons.Search />
                            点击查看大图
                        </div>
                    </div>

                    {/* 视图切换 */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/90 dark:bg-[#1e1f20]/90 backdrop-blur-md p-1 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex gap-1">
                        <button
                            onClick={() => setViewMode('realistic')}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'realistic'
                                ? 'bg-slate-800 text-white shadow-sm'
                                : 'text-gray-500'
                                }`}
                        >
                            效果图
                        </button>
                        <button
                            onClick={() => setViewMode('wireframe')}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'wireframe'
                                ? 'bg-slate-800 text-white shadow-sm'
                                : 'text-gray-500'
                                }`}
                        >
                            结构图
                        </button>
                    </div>
                </div>

                {/* 产品信息 */}
                <div className="bg-white dark:bg-[#1e1f20] p-4 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{currentTemplate.name}</h2>
                    <p className="text-xs text-gray-500 mt-1">¥{currentTemplate.basePricePerSqM}/m² · {currentTemplate.material}</p>
                </div>

                {/* 产品选择 - 横向滚动 */}
                <div className="bg-white dark:bg-[#1e1f20] p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex gap-2 mb-3">
                        <button
                            onClick={() => setActiveCategory(ProductType.WINDOW)}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeCategory === ProductType.WINDOW
                                ? 'bg-slate-900 dark:bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-[#2c2c2e] text-gray-600 dark:text-gray-400'
                                }`}
                        >
                            窗系统
                        </button>
                        <button
                            onClick={() => setActiveCategory(ProductType.DOOR)}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeCategory === ProductType.DOOR
                                ? 'bg-slate-900 dark:bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-[#2c2c2e] text-gray-600 dark:text-gray-400'
                                }`}
                        >
                            门系统
                        </button>
                    </div>

                    {/* 搜索框 */}
                    <div className="relative mb-3">
                        <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="搜索型号..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-[#2c2c2e] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 outline-none"
                        />
                    </div>

                    {/* 产品列表 - 横向滚动 */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {filteredTemplates.map(tmpl => (
                            <div
                                key={tmpl.id}
                                onClick={() => setSelectedTemplateId(tmpl.id)}
                                className={`flex-shrink-0 w-24 cursor-pointer p-2 rounded-lg border transition-all ${selectedTemplateId === tmpl.id
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <div className="w-full aspect-square bg-gray-100 dark:bg-[#2c2c2e] rounded overflow-hidden mb-1">
                                    <CadCanvas
                                        model={createDefaultModel(tmpl)}
                                        template={tmpl}
                                        selectedPanelIndex={null}
                                        onPanelSelect={() => { }}
                                        viewMode="realistic"
                                    />
                                </div>
                                <div className="text-[10px] font-bold text-center truncate text-gray-700 dark:text-gray-300">
                                    {tmpl.name}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 配置参数 */}
                <div className="flex-1 bg-gray-50 dark:bg-[#0a0a0a] p-4 space-y-4 pb-28">
                    {/* 尺寸规格 */}
                    <div className="bg-white dark:bg-[#1e1f20] p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                        <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            尺寸规格
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">宽度 (mm)</label>
                                <input
                                    type="number"
                                    value={width}
                                    onChange={(e) => setWidth(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#2c2c2e] border border-gray-200 dark:border-gray-700 rounded-lg font-mono font-bold text-gray-800 dark:text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">高度 (mm)</label>
                                <input
                                    type="number"
                                    value={height}
                                    onChange={(e) => setHeight(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#2c2c2e] border border-gray-200 dark:border-gray-700 rounded-lg font-mono font-bold text-gray-800 dark:text-white text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 结构布局 */}
                    <div className="bg-white dark:bg-[#1e1f20] p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                        <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                            结构布局
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-gray-600 dark:text-gray-400">分扇数量</span>
                                    <span className="text-sm font-bold text-gray-800 dark:text-white">{panels}</span>
                                </div>
                                <input
                                    type="range"
                                    min={currentTemplate.rules.panels.min}
                                    max={currentTemplate.rules.panels.max}
                                    step="1"
                                    value={panels}
                                    onChange={(e) => setPanels(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-slate-800"
                                    disabled={currentTemplate.rules.panels.min === currentTemplate.rules.panels.max}
                                />
                            </div>

                            {currentTemplate.rules.allowMullions && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600 dark:text-gray-400">竖中挺</span>
                                    <button
                                        onClick={() => setEnableMullions(!enableMullions)}
                                        className={`w-12 h-6 rounded-full relative transition-all ${enableMullions ? 'bg-slate-900 dark:bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${enableMullions ? 'right-0.5' : 'left-0.5'
                                            }`}></div>
                                    </button>
                                </div>
                            )}

                            {currentTemplate.rules.allowTransom && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-gray-600 dark:text-gray-400">上亮高度</span>
                                        {transomHeight > 0 ? (
                                            <span className="text-xs font-bold text-blue-600">{transomHeight}mm</span>
                                        ) : (
                                            <span className="text-xs text-gray-400">无</span>
                                        )}
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max={height / 2}
                                        step="50"
                                        value={transomHeight}
                                        onChange={(e) => setTransomHeight(parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 型材颜色 */}
                    <div className="bg-white dark:bg-[#1e1f20] p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                        <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                            型材颜色
                        </h3>
                        <div className="flex gap-3 mb-2">
                            {colorOptions.map((c) => (
                                <button
                                    key={c.value}
                                    onClick={() => setProfileColor(c.value)}
                                    className={`w-10 h-10 rounded-full border-2 transition-all ${c.bg} ${c.border} ${profileColor === c.value ? 'ring-2 ring-offset-2 ring-slate-800 dark:ring-white' : ''
                                        }`}
                                    title={c.label}
                                />
                            ))}
                        </div>
                        <div className="text-sm font-bold text-gray-800 dark:text-white">
                            {colorOptions.find(c => c.value === profileColor)?.label}
                        </div>
                    </div>

                    {/* 玻璃配置 */}
                    <div className="bg-white dark:bg-[#1e1f20] p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                        <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            玻璃配置
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {glassOptions.map((g) => (
                                <button
                                    key={g.value}
                                    onClick={() => setGlassType(g.value)}
                                    className={`p-3 rounded-lg border text-left transition-all ${glassType === g.value
                                        ? 'bg-slate-900 dark:bg-blue-600 border-slate-900 dark:border-blue-600 text-white'
                                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                                        }`}
                                >
                                    <div className="text-sm font-bold">{g.label}</div>
                                    <div className="text-xs opacity-70">{g.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 底部操作栏 */}
                <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a1a1c] border-t border-gray-200 dark:border-gray-800 p-4 z-40">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <div className="text-xs text-gray-500">预估总价</div>
                            <div className="text-xl font-bold text-gray-900 dark:text-white">¥{pricePreview.toLocaleString()}</div>
                        </div>
                        <button
                            onClick={() => onSave(currentTemplate, width, height, panels, previewModel, realisticRef.current, wireframeRef.current)}
                            className="flex-1 py-3 rounded-xl font-bold text-white bg-slate-900 dark:bg-blue-600 shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Icons.Cart />
                            加入清单
                        </button>
                    </div>
                </div>

                {/* 图片放大弹窗 */}
                {isImageExpanded && (
                    <div
                        className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
                        onClick={() => setIsImageExpanded(false)}
                    >
                        <div className="flex justify-end p-4">
                            <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-white">
                                    <path d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 flex items-center justify-center p-4">
                            <div className="w-full h-full max-w-2xl max-h-[80vh]">
                                <CadCanvas
                                    model={previewModel}
                                    template={currentTemplate}
                                    selectedPanelIndex={null}
                                    onPanelSelect={() => { }}
                                    viewMode={viewMode}
                                />
                            </div>
                        </div>
                        <div className="flex justify-center p-4 gap-4">
                            <button
                                onClick={(e) => { e.stopPropagation(); setViewMode('realistic'); }}
                                className={`px-4 py-2 rounded-full text-sm font-bold ${viewMode === 'realistic' ? 'bg-white text-black' : 'bg-white/10 text-white'
                                    }`}
                            >
                                效果图
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setViewMode('wireframe'); }}
                                className={`px-4 py-2 rounded-full text-sm font-bold ${viewMode === 'wireframe' ? 'bg-white text-black' : 'bg-white/10 text-white'
                                    }`}
                            >
                                结构图
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // 桌面端三栏布局（保持不变）
    return (
        <div className="flex h-full w-full bg-[#f0f4f9] dark:bg-black animate-slide-in-up overflow-hidden">
            {/* COLUMN 1: 产品列表 */}
            <div className="w-72 flex flex-col bg-white dark:bg-[#1e1f20] border-r border-gray-200 dark:border-gray-800 shrink-0 z-20">
                <div className="p-5 pb-2 border-b border-gray-100 dark:border-gray-800 space-y-4">
                    <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2">产品库</h2>
                    <div className="flex p-1 bg-gray-100 dark:bg-[#2c2c2e] rounded-lg">
                        <button onClick={() => setActiveCategory(ProductType.WINDOW)} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${activeCategory === ProductType.WINDOW ? 'bg-white dark:bg-[#444746] text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>窗系统</button>
                        <button onClick={() => setActiveCategory(ProductType.DOOR)} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${activeCategory === ProductType.DOOR ? 'bg-white dark:bg-[#444746] text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>门系统</button>
                    </div>
                    <div className="relative">
                        <div className="absolute left-3 top-2.5 text-gray-400"><Icons.Search /></div>
                        <input type="text" placeholder="搜索型号..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-[#2c2c2e] border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-2">
                    {filteredTemplates.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 text-xs">无匹配产品</div>
                    ) : (
                        filteredTemplates.map(tmpl => (
                            <div
                                key={tmpl.id}
                                onClick={() => setSelectedTemplateId(tmpl.id)}
                                className={`cursor-pointer p-2 rounded-xl border transition-all group flex items-center gap-3 ${selectedTemplateId === tmpl.id
                                    ? 'border-blue-500 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-900/20 shadow-sm ring-1 ring-blue-500/20'
                                    : 'border-transparent hover:bg-gray-50 dark:hover:bg-[#2c2c2e]'
                                    }`}
                            >
                                <div className={`w-12 h-12 flex items-center justify-center rounded-lg shrink-0 p-1 overflow-hidden pointer-events-none ${selectedTemplateId === tmpl.id ? 'bg-white dark:bg-white/10' : 'bg-gray-100 dark:bg-[#2c2c2e]'
                                    }`}>
                                    <CadCanvas model={createDefaultModel(tmpl)} template={tmpl} selectedPanelIndex={null} onPanelSelect={() => { }} viewMode="realistic" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className={`font-bold text-xs truncate ${selectedTemplateId === tmpl.id ? 'text-blue-900 dark:text-blue-100' : 'text-gray-700 dark:text-gray-200'
                                        }`}>{tmpl.name}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
                                            {tmpl.material === 'broken_bridge' ? '断桥' : '普通'}
                                        </span>
                                        <span className="text-[10px] text-gray-400">¥{tmpl.basePricePerSqM}/m²</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* COLUMN 2: 画布预览 */}
            <div className="flex-1 flex flex-col relative bg-[#eef2f6] dark:bg-[#0a0a0a] overflow-hidden">
                <div className="absolute inset-0 opacity-[0.4] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-white/90 dark:bg-[#1e1f20]/90 backdrop-blur-md p-1 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex gap-1">
                    <button onClick={() => setViewMode('realistic')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'realistic' ? 'bg-slate-800 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10'}`}>效果图</button>
                    <button onClick={() => setViewMode('wireframe')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'wireframe' ? 'bg-slate-800 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10'}`}>结构图</button>
                </div>
                <div className="flex-1 flex items-center justify-center relative p-8">
                    <div ref={realisticRef} className={`absolute inset-0 z-0 opacity-0 pointer-events-none`}>
                        <CadCanvas model={previewModel} template={currentTemplate} selectedPanelIndex={null} onPanelSelect={() => { }} viewMode="realistic" />
                    </div>
                    <div ref={wireframeRef} className={`absolute inset-0 z-0 opacity-0 pointer-events-none`}>
                        <CadCanvas model={previewModel} template={currentTemplate} selectedPanelIndex={null} onPanelSelect={() => { }} viewMode="wireframe" />
                    </div>
                    <div className={`w-full h-full max-w-4xl max-h-[80vh] transition-all duration-500 ${viewMode === 'realistic' ? 'shadow-2xl shadow-blue-900/10' : 'shadow-none'}`}>
                        <CadCanvas model={previewModel} template={currentTemplate} selectedPanelIndex={null} onPanelSelect={() => { }} viewMode={viewMode} />
                    </div>
                </div>
            </div>

            {/* COLUMN 3: 配置面板 */}
            <div className="w-[340px] bg-white dark:bg-[#1e1f20] border-l border-gray-200 dark:border-gray-800 flex flex-col shrink-0 z-30 shadow-2xl">
                <div className="p-6 pb-2 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1e1f20] z-10">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-1">{currentTemplate.name}</h2>
                    <p className="text-xs text-gray-500">¥{currentTemplate.basePricePerSqM}/m² · {currentTemplate.material}</p>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                    <section>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> 尺寸规格
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative group">
                                <label className="absolute -top-2 left-3 px-1 bg-white dark:bg-[#1e1f20] text-[10px] font-bold text-gray-400 group-focus-within:text-blue-500 transition-colors">宽度 (mm)</label>
                                <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#2c2c2e] border border-gray-200 dark:border-gray-700 rounded-xl font-mono font-bold text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                            </div>
                            <div className="relative group">
                                <label className="absolute -top-2 left-3 px-1 bg-white dark:bg-[#1e1f20] text-[10px] font-bold text-gray-400 group-focus-within:text-blue-500 transition-colors">高度 (mm)</label>
                                <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#2c2c2e] border border-gray-200 dark:border-gray-700 rounded-xl font-mono font-bold text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                            </div>
                        </div>
                    </section>

                    <section className="p-4 rounded-2xl bg-gray-50 dark:bg-[#2c2c2e] border border-gray-100 dark:border-gray-700/50">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> 结构布局
                        </h3>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">分扇数量</span>
                                    <span className="text-xs font-mono font-bold bg-white dark:bg-black/20 px-2 py-0.5 rounded text-gray-500">{panels}</span>
                                </div>
                                <input type="range" min={currentTemplate.rules.panels.min} max={currentTemplate.rules.panels.max} step="1" value={panels} onChange={(e) => setPanels(parseInt(e.target.value))} className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-slate-800 dark:accent-white" disabled={currentTemplate.rules.panels.min === currentTemplate.rules.panels.max} />
                            </div>
                            {currentTemplate.rules.allowMullions && (
                                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600/50">
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">竖中挺 (Mullion)</span>
                                    <button onClick={() => setEnableMullions(!enableMullions)} className={`w-10 h-6 rounded-full relative transition-all duration-300 ${enableMullions ? 'bg-slate-800 dark:bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                        <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-1.5 shadow-sm transition-transform duration-300 ${enableMullions ? 'translate-x-5' : 'translate-x-1.5'}`}></div>
                                    </button>
                                </div>
                            )}
                            {currentTemplate.rules.allowTransom && (
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-600/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">上亮高度</span>
                                        {transomHeight > 0 ? <span className="text-xs font-bold text-blue-600">{transomHeight}mm</span> : <span className="text-xs text-gray-400">无</span>}
                                    </div>
                                    <input type="range" min="0" max={height / 2} step="50" value={transomHeight} onChange={(e) => setTransomHeight(parseInt(e.target.value))} className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                                </div>
                            )}
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> 外观材质
                        </h3>
                        <div className="mb-5">
                            <label className="text-[10px] font-bold text-gray-500 mb-2 block">型材颜色</label>
                            <div className="flex gap-3">
                                {colorOptions.map((c) => (
                                    <button key={c.value} onClick={() => setProfileColor(c.value)} className={`w-8 h-8 rounded-full border shadow-sm transition-all relative group ${c.bg} ${c.border} ${profileColor === c.value ? 'scale-110 ring-2 ring-offset-2 ring-slate-800 dark:ring-white dark:ring-offset-[#1e1f20]' : 'hover:scale-105 opacity-80 hover:opacity-100'}`} title={c.label}></button>
                                ))}
                            </div>
                            <div className="text-xs font-bold text-gray-800 dark:text-white mt-2">{colorOptions.find(c => c.value === profileColor)?.label}</div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 mb-2 block">玻璃配置</label>
                            <div className="grid grid-cols-2 gap-2">
                                {glassOptions.map((g) => (
                                    <button key={g.value} onClick={() => setGlassType(g.value)} className={`px-3 py-2 rounded-lg border text-left transition-all relative overflow-hidden ${glassType === g.value ? 'bg-slate-800 dark:bg-blue-600 border-slate-800 dark:border-blue-600 text-white shadow-md' : 'bg-white dark:bg-[#2c2c2e] border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                                        <div className="text-xs font-bold">{g.label}</div>
                                        <div className={`text-[10px] truncate ${glassType === g.value ? 'text-gray-300 dark:text-blue-100' : 'text-gray-400'}`}>{g.desc}</div>
                                        {glassType === g.value && <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full"></div>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                <div className="p-5 border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#1a1a1c]/90 backdrop-blur-md z-40">
                    <div className="flex justify-between items-baseline mb-4">
                        <span className="text-xs font-bold text-gray-500">预估总价</span>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">¥{pricePreview.toLocaleString()}</span>
                            <span className="text-xs text-gray-400 block font-normal">{(width * height / 1000000).toFixed(2)} m² × ¥{currentTemplate.basePricePerSqM}</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onCancel} className="px-5 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-[#2c2c2e] hover:bg-gray-200 transition-all text-sm">取消</button>
                        <button onClick={() => onSave(currentTemplate, width, height, panels, previewModel, realisticRef.current, wireframeRef.current)} className="flex-1 py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-500 shadow-lg shadow-slate-900/20 dark:shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm">
                            <Icons.Cart /> 加入清单
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};