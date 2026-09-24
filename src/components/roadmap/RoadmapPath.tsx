import React from 'react';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

export interface Point {
  x: number;
  y: number;
}

export interface RoadmapPathProps {
  from: Point;
  to: Point;
  isActive: boolean;
  themeColor?: string;
  index?: number;
}

export const RoadmapPath: React.FC<RoadmapPathProps> = ({
  from,
  to,
  isActive,
  themeColor = '#F59E0B',
  index = 0,
}) => {
  // Bounding box for this SVG curve segment
  const minX = Math.min(from.x, to.x) - 30;
  const maxX = Math.max(from.x, to.x) + 30;
  const minY = from.y;
  const maxY = to.y;

  const width = Math.max(maxX - minX, 60);
  const height = Math.max(maxY - minY, 20);

  // Coordinates local to the SVG box
  const localX1 = from.x - minX;
  const localY1 = from.y - minY;
  const localX2 = to.x - minX;
  const localY2 = to.y - minY;

  // Cubic Bezier control points for smooth S-curve
  const midY = (localY1 + localY2) / 2;
  const pathData = `M ${localX1} ${localY1} C ${localX1} ${midY}, ${localX2} ${midY}, ${localX2} ${localY2}`;

  // Calculate midpoint for decorative waypoint dot
  // Bezier formula at t = 0.5:
  // B(0.5) = 0.125 * P0 + 0.375 * P1 + 0.375 * P2 + 0.125 * P3
  const midDotX = 0.125 * localX1 + 0.375 * localX1 + 0.375 * localX2 + 0.125 * localX2;
  const midDotY = 0.125 * localY1 + 0.375 * midY + 0.375 * midY + 0.125 * localY2;

  const gradientId = `grad_${index}_${isActive ? 'active' : 'inactive'}`;

  return (
    <Svg
      style={{
        position: 'absolute',
        left: minX,
        top: minY,
        width,
        height,
        zIndex: 1,
      }}
      width={width}
      height={height}
    >
      <Defs>
        <LinearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop
            offset="0%"
            stopColor={isActive ? themeColor : '#CBD5E1'}
            stopOpacity={isActive ? 1 : 0.6}
          />
          <Stop
            offset="100%"
            stopColor={isActive ? '#10B981' : '#94A3B8'}
            stopOpacity={isActive ? 0.9 : 0.4}
          />
        </LinearGradient>
      </Defs>

      {/* Shadow path for depth if active */}
      {isActive && (
        <Path
          d={pathData}
          stroke="#000000"
          strokeWidth={8}
          strokeOpacity={0.08}
          fill="none"
          strokeLinecap="round"
        />
      )}

      {/* Main road path */}
      <Path
        d={pathData}
        stroke={`url(#${gradientId})`}
        strokeWidth={isActive ? 6 : 4}
        strokeDasharray={isActive ? undefined : '7, 5'}
        strokeLinecap="round"
        fill="none"
      />

      {/* Subtle waypoint / nautical buoy along the segment */}
      <Circle
        cx={midDotX}
        cy={midDotY}
        r={isActive ? 3.5 : 2.5}
        fill={isActive ? '#FFFFFF' : '#94A3B8'}
        stroke={isActive ? themeColor : '#CBD5E1'}
        strokeWidth={1.5}
      />
    </Svg>
  );
};
