import React from 'react';

interface DimensionProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string | number;
  offset?: number;
  orientation?: 'horizontal' | 'vertical';
  color?: string;
}

export const Dimension: React.FC<DimensionProps> = ({ 
  x1, y1, x2, y2, label, offset = 40, orientation = 'horizontal', color = '#2563eb' 
}) => {
  const isHoriz = orientation === 'horizontal';
  
  // Calculate offset positions
  const ox1 = isHoriz ? x1 : x1 - offset;
  const oy1 = isHoriz ? y1 - offset : y1;
  const ox2 = isHoriz ? x2 : x2 - offset;
  const oy2 = isHoriz ? y2 - offset : y2;

  // Text position (midpoint)
  const mx = (ox1 + ox2) / 2;
  const my = (oy1 + oy2) / 2;
  
  // Adjusted text offsets for much larger font size (64px)
  // Shift text up (horizontal) or left (vertical) to sit nicely on the line
  const textYOffset = isHoriz ? -25 : 0; 
  const textXOffset = isHoriz ? 0 : -25; 
  const textAnchor = isHoriz ? "middle" : "end";

  return (
    <g className="pointer-events-none select-none">
      {/* Extension lines */}
      <line x1={x1} y1={y1} x2={ox1} y2={oy1} stroke={color} strokeWidth="2" strokeOpacity="0.4" />
      <line x1={x2} y1={y2} x2={ox2} y2={oy2} stroke={color} strokeWidth="2" strokeOpacity="0.4" />
      
      {/* Main dimension line */}
      <line x1={ox1} y1={oy1} x2={ox2} y2={oy2} stroke={color} strokeWidth="3" />
      
      {/* Arrows / Ticks - Increased size */}
      <circle cx={ox1} cy={oy1} r={6} fill={color} />
      <circle cx={ox2} cy={oy2} r={6} fill={color} />

      {/* Label with Halo for visibility */}
      <g transform={`translate(${mx + textXOffset}, ${my + textYOffset})`}>
        {/* Stroke halo to simulate background - Thicker for larger text */}
        <text 
          textAnchor={textAnchor}
          dominantBaseline="middle"
          fontSize="64" 
          fontFamily="JetBrains Mono, monospace"
          fontWeight="bold"
          stroke="white"
          strokeWidth="12"
          strokeLinejoin="round"
          fill="none"
        >
          {label}
        </text>
        {/* Actual text */}
        <text 
          textAnchor={textAnchor}
          dominantBaseline="middle"
          fill={color} 
          fontSize="64" 
          fontFamily="JetBrains Mono, monospace"
          fontWeight="bold"
        >
          {label}
        </text>
      </g>
    </g>
  );
};