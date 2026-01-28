import React, { useMemo } from 'react';
import { CadModel, ProductTemplate, Rect, PanelConfig, ProfileColor, GlassType } from '../types';
import { MULLION_WIDTH } from '../constants';
import { Dimension } from './Dimension';

export type ViewMode = 'realistic' | 'wireframe';

interface CadCanvasProps {
  model: CadModel;
  template: ProductTemplate;
  selectedPanelIndex: number | null;
  onPanelSelect: (index: number | null) => void;
  viewMode: ViewMode;
}

// --- Dynamic Palette Generator ---
const getColors = (colorType: ProfileColor, viewMode: ViewMode) => {
  // 1. Wireframe Mode: High contrast black & white with structural clarity
  if (viewMode === 'wireframe') {
    return {
      frame: { top: '#ffffff', left: '#ffffff', right: '#ffffff', bottom: '#ffffff', stroke: '#000000', face: '#ffffff' },
      threshold: { fill: '#ffffff', stroke: '#000000' },
      glass: { bg: '#f1f5f9', stroke: '#000000' }, 
      bg: '#ffffff'
    };
  }

  // 2. Realistic Mode: Colors and Shading
  const baseColors = {
    white: { // uPVC style
      top: '#f8fafc', left: '#e2e8f0', right: '#cbd5e1', bottom: '#94a3b8', stroke: '#64748b', face: '#f1f5f9'
    },
    black: { // Matte Black
      top: '#475569', left: '#334155', right: '#1e293b', bottom: '#0f172a', stroke: '#000000', face: '#1e293b'
    },
    champagne: { // Gold/Champagne
      top: '#fef3c7', left: '#fde68a', right: '#d97706', bottom: '#b45309', stroke: '#92400e', face: '#fbbf24'
    },
    wood: { // Wood Texture sim
      top: '#a16207', left: '#854d0e', right: '#713f12', bottom: '#451a03', stroke: '#451a03', face: '#78350f'
    },
    dark_grey: { // Standard Aluminum
      top: '#94a3b8', left: '#64748b', right: '#475569', bottom: '#334155', stroke: '#1e293b', face: '#475569'
    }
  };

  const selected = baseColors[colorType] || baseColors.dark_grey;

  return {
    frame: selected,
    threshold: { fill: selected.left, stroke: selected.stroke },
    glass: { bg: '#f0f9ff', stroke: '#bae6fd' },
    bg: '#e2e8f0'
  };
};

const COMMON_COLORS = {
  selection: '#3b82f6',
  glass: {
    stroke: '#bae6fd'
  }
};

// --- Glass Utils ---
const getGlassStyle = (type: GlassType, viewMode: ViewMode) => {
    const commonStroke = '#bae6fd';
    
    if (viewMode === 'wireframe') {
        return { 
            fill: 'url(#wireframeHatch)', 
            opacity: 1.0, 
            label: type === 'single' ? '5mm' : (type === 'double' ? '5+12A+5' : (type === 'triple' ? '3GU' : 'PVB')),
            tint: 'none',
            stroke: '#000000'
        };
    }

    // Realistic Mode styles
    switch (type) {
        case 'single': 
            return { fill: '#e0f2fe', opacity: 0.2, label: '5mm', tint: 'rgba(224, 242, 254, 0.2)', stroke: commonStroke }; // Light Blue
        case 'double': 
            return { fill: '#d1fae5', opacity: 0.35, label: '5+12A+5', tint: 'rgba(209, 250, 229, 0.35)', stroke: commonStroke }; // Light Greenish (Iron)
        case 'triple': 
            return { fill: '#a7f3d0', opacity: 0.5, label: '5+9A+5+9A+5', tint: 'rgba(167, 243, 208, 0.5)', stroke: commonStroke }; // Stronger Green
        case 'laminated': 
            return { fill: '#cffafe', opacity: 0.4, label: '5+0.76+5', tint: 'rgba(207, 250, 254, 0.4)', stroke: commonStroke }; // Blue-Grey
        default: 
            return { fill: '#e0f2fe', opacity: 0.3, label: '', tint: 'rgba(224, 242, 254, 0.3)', stroke: commonStroke };
    }
};

// --- Helper Components ---

const MiteredFrame: React.FC<{ rect: Rect; profileWidth: number; colors: any }> = ({ rect, profileWidth, colors }) => {
  const { x, y, w, h } = rect;
  const t = profileWidth;
  const safeT = Math.min(t, w / 2, h / 2);

  const top = `M ${x} ${y} L ${x + w} ${y} L ${x + w - safeT} ${y + safeT} L ${x + safeT} ${y + safeT} Z`;
  const bottom = `M ${x} ${y + h} L ${x + w} ${y + h} L ${x + w - safeT} ${y + h - safeT} L ${x + safeT} ${y + h - safeT} Z`;
  const left = `M ${x} ${y} L ${x} ${y + h} L ${x + safeT} ${y + h - safeT} L ${x + safeT} ${y + safeT} Z`;
  const right = `M ${x + w} ${y} L ${x + w} ${y + h} L ${x + w - safeT} ${y + h - safeT} L ${x + w - safeT} ${y + safeT} Z`;
  const face = `M ${x + safeT} ${y + safeT} H ${x + w - safeT} V ${y + h - safeT} H ${x + safeT} Z`;

  return (
    <g>
      <path d={top} fill={colors.top} stroke={colors.stroke} strokeWidth="1" />
      <path d={bottom} fill={colors.bottom} stroke={colors.stroke} strokeWidth="1" />
      <path d={left} fill={colors.left} stroke={colors.stroke} strokeWidth="1" />
      <path d={right} fill={colors.right} stroke={colors.stroke} strokeWidth="1" />
      <path d={face} fill="none" stroke={colors.stroke} strokeWidth="1" opacity="0.1" />
    </g>
  );
};

const OpeningIndicator: React.FC<{ rect: Rect; config: PanelConfig; show: boolean; viewMode: ViewMode }> = ({ rect, config, show, viewMode }) => {
  if (!show || config.type === 'fixed') return null;
  const { x, y, w, h } = rect;
  const stroke = viewMode === 'wireframe' ? '#000000' : '#2563eb';
  const strokeWidth = "3"; // Increased from 1.5 for visibility

  let path = '';
  // Dashed lines usually indicate hinge side in architecture, but strict CAD varies.
  // Here we assume triangle points to handle/opening side.
  // Casement Left: Hinges on Left, Triangle points Right.
  if (config.type === 'casement') {
    if (config.direction === 'left') {
      path = `M ${x} ${y} L ${x + w} ${y + h / 2} L ${x} ${y + h}`;
    } else {
      path = `M ${x + w} ${y} L ${x} ${y + h / 2} L ${x + w} ${y + h}`;
    }
  } else if (config.type === 'awning') { // Top hung
      path = `M ${x} ${y + h} L ${x + w / 2} ${y} L ${x + w} ${y + h}`;
  } else if (config.type === 'sliding') {
      // Arrow
      const cy = y + h / 2;
      const arrowSize = Math.min(w, h) * 0.1; 
      if (config.direction === 'left') {
        path = `M ${x + w/2 + arrowSize} ${cy} H ${x + w/2 - arrowSize} M ${x + w/2 - arrowSize + arrowSize/2} ${cy - arrowSize/2} L ${x + w/2 - arrowSize} ${cy} L ${x + w/2 - arrowSize + arrowSize/2} ${cy + arrowSize/2}`;
      } else {
        path = `M ${x + w/2 - arrowSize} ${cy} H ${x + w/2 + arrowSize} M ${x + w/2 + arrowSize - arrowSize/2} ${cy - arrowSize/2} L ${x + w/2 + arrowSize} ${cy} L ${x + w/2 + arrowSize - arrowSize/2} ${cy + arrowSize/2}`;
      }
  }

  return <path d={path} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeDasharray="15,10" />;
};

export const CadCanvas: React.FC<CadCanvasProps> = ({ model, template, selectedPanelIndex, onPanelSelect, viewMode }) => {
  const { width, height, panels, panelConfigs, transomHeight, profileColor, glassType, enableMullions } = model;
  const profileWidth = template.profileWidth;
  
  const colors = useMemo(() => getColors(profileColor, viewMode), [profileColor, viewMode]);
  const glassStyle = useMemo(() => getGlassStyle(glassType, viewMode), [glassType, viewMode]);

  // --- Geometry Calculation ---
  // Outer Frame
  const outerFrameRect: Rect = { x: 0, y: 0, w: width, h: height };

  // Determine working area (inside outer frame)
  // We need to account for profile width on all 4 sides.
  const innerW = width - (2 * profileWidth);
  let innerH = height - (2 * profileWidth); 
  let startY = profileWidth;
  
  // Transom Logic
  let transomY = 0;
  let lowerH = innerH;
  let upperH = 0;

  if (transomHeight > 0) {
      upperH = transomHeight - profileWidth; // Assuming transomHeight includes top frame
      // Actual transom bar is usually FRAME_PROFILE_WIDTH or MULLION_WIDTH
      transomY = profileWidth + upperH;
      lowerH = innerH - upperH - MULLION_WIDTH;
  }

  // Panel Logic (Horizontal Split)
  // If enableMullions is true, we subtract mullion widths. 
  // If false (like sliding doors often meeting without fixed mullion), we treat differently, 
  // but for simplicity here we assume equal split.
  
  const panelW = enableMullions 
      ? (innerW - (panels - 1) * MULLION_WIDTH) / panels
      : (innerW + (panels - 1) * (profileWidth / 2)) / panels; // Overlap for sliding? Keeping simple for now.
  
  const renderRects: { rect: Rect, type: 'frame' | 'mullion' | 'transom' | 'panel', index?: number }[] = [];

  // 1. Transom Bar
  if (transomHeight > 0) {
      renderRects.push({
          rect: { x: 0, y: transomY, w: width, h: MULLION_WIDTH },
          type: 'transom'
      });
  }

  // 2. Vertical Mullions & Panels
  // If transom exists, panels are usually below it. 
  const panelStartY = transomHeight > 0 ? transomY + MULLION_WIDTH : startY;
  const panelH = transomHeight > 0 ? lowerH : innerH;
  
  // Upper panels (Transom Area) - simplified as one big glass or split? 
  // Usually transom matches vertical mullions below.
  for (let i = 0; i < panels; i++) {
      const px = profileWidth + i * (panelW + (enableMullions ? MULLION_WIDTH : 0));
      
      // Vertical Mullion (before panel, except first)
      if (i > 0 && enableMullions) {
          renderRects.push({
              rect: { x: px - MULLION_WIDTH, y: profileWidth, w: MULLION_WIDTH, h: innerH + (transomHeight > 0 ? MULLION_WIDTH : 0) }, // Full height mullion usually
              type: 'mullion'
          });
      }

      // Main Sash/Panel
      renderRects.push({
          rect: { x: px, y: panelStartY, w: panelW, h: panelH },
          type: 'panel',
          index: i
      });

      // Upper Sash/Glass (if transom)
      if (transomHeight > 0) {
          renderRects.push({
              rect: { x: px, y: profileWidth, w: panelW, h: upperH },
              type: 'panel', 
              index: -1 * (i + 1) // Negative index for upper fixed glass
          });
      }
  }

  // ViewBox padding for dimensions
  const padding = 200;
  const vbX = -padding;
  const vbY = -padding;
  const vbW = width + (padding * 2);
  const vbH = height + (padding * 2);

  return (
    <svg viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`} className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="wireframeHatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="10" stroke="#000000" strokeWidth="1" opacity="0.3" />
        </pattern>
      </defs>

      {/* Background */}
      <rect x={vbX} y={vbY} width={vbW} height={vbH} fill={viewMode === 'realistic' ? "#f8fafc" : "#ffffff"} />

      {/* 1. Main Outer Frame */}
      <MiteredFrame rect={outerFrameRect} profileWidth={profileWidth} colors={colors.frame} />

      {/* 2. Internal Elements */}
      {renderRects.map((item, idx) => {
          if (item.type === 'mullion' || item.type === 'transom') {
              return <rect key={idx} x={item.rect.x} y={item.rect.y} width={item.rect.w} height={item.rect.h} fill={colors.frame.face} stroke={colors.frame.stroke} strokeWidth="1" />;
          }
          if (item.type === 'panel' && item.index !== undefined) {
              const isUpper = item.index < 0;
              const configIndex = isUpper ? Math.abs(item.index) - 1 : item.index;
              const config = panelConfigs[configIndex] || { id: 'fallback', index: configIndex, type: 'fixed', direction: 'left' };
              const isSelected = selectedPanelIndex === configIndex && !isUpper;
              
              // If it's a sash (not fixed), draw sash frame
              const sashProfile = 40; // mm
              let glassRect = item.rect;
              
              // Only draw sash frame for main panels that are not fixed
              const hasSashFrame = !isUpper && config.type !== 'fixed';

              return (
                <g key={idx} onClick={(e) => { e.stopPropagation(); if(!isUpper) onPanelSelect(configIndex); }}>
                    {hasSashFrame && (
                        <MiteredFrame rect={item.rect} profileWidth={sashProfile} colors={colors.frame} />
                    )}
                    
                    {/* Glass Area */}
                    {(() => {
                        const gRect = hasSashFrame ? {
                            x: item.rect.x + sashProfile,
                            y: item.rect.y + sashProfile,
                            w: item.rect.w - 2 * sashProfile,
                            h: item.rect.h - 2 * sashProfile
                        } : item.rect;

                        return (
                            <g>
                                <rect x={gRect.x} y={gRect.y} width={gRect.w} height={gRect.h} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="1" />
                                {/* Glass Label - LARGE FONT (40px) */}
                                {glassStyle.label && (
                                    <text 
                                        x={gRect.x + gRect.w/2} 
                                        y={gRect.y + gRect.h - 40} // Move up from bottom 
                                        textAnchor="middle" 
                                        fontSize="40" 
                                        fontWeight="bold"
                                        fill={viewMode === 'wireframe' ? '#000' : '#475569'}
                                        opacity="0.8"
                                    >
                                        {glassStyle.label}
                                    </text>
                                )}
                            </g>
                        );
                    })()}

                    {/* Opening Indicator */}
                    {!isUpper && <OpeningIndicator rect={item.rect} config={config} show={model.showOpeningIndicators} viewMode={viewMode} />}

                    {/* Selection Highlight */}
                    {isSelected && (
                        <rect x={item.rect.x} y={item.rect.y} width={item.rect.w} height={item.rect.h} fill="none" stroke={COMMON_COLORS.selection} strokeWidth="8" opacity="0.5" />
                    )}

                    {/* Panel ID Circle - LARGE SIZE (32px) */}
                    {!isUpper && (
                        <g transform={`translate(${item.rect.x + item.rect.w/2}, ${item.rect.y + item.rect.h/2})`}>
                            <circle r="32" fill={viewMode === 'realistic' ? "white" : "white"} stroke={colors.frame.stroke} strokeWidth="3" opacity="0.9" />
                            <text dy="10" textAnchor="middle" fontSize="32" fontWeight="bold" fill="#000">
                                {configIndex + 1}
                            </text>
                        </g>
                    )}
                </g>
              );
          }
          return null;
      })}

      {/* 3. Dimensions */}
      <Dimension x1={0} y1={0} x2={width} y2={0} label={`${width} mm`} offset={80} orientation="horizontal" color={viewMode === 'wireframe' ? '#000' : '#2563eb'} />
      <Dimension x1={0} y1={0} x2={0} y2={height} label={`${height} mm`} offset={80} orientation="vertical" color={viewMode === 'wireframe' ? '#000' : '#2563eb'} />

    </svg>
  );
};