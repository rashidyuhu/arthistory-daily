import React from 'react';
import Svg, { Rect, Circle, Path, Line, Ellipse } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

/** Ornate portrait frame with a stylised head — used for the Daily tab */
export function PortraitIcon({ size = 26, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="1.5" y="1.5" width="21" height="21" rx="1.5" stroke={color} strokeWidth="1.5" />
      <Rect x="3.5" y="3.5" width="17" height="17" rx="0.5" stroke={color} strokeWidth="0.7" strokeDasharray="1.5 1" />
      <Ellipse cx="12" cy="9.5" rx="3.5" ry="4" stroke={color} strokeWidth="1.4" />
      <Path
        d="M3.5 20.5 Q7 15.5 12 15.5 Q17 15.5 20.5 20.5"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Fanned card stack — used for the Collection tab */
export function GalleryIcon({ size = 26, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Back card — rotated left */}
      <Rect
        x="5" y="3" width="14" height="18" rx="2"
        stroke={color} strokeWidth="1.4"
        opacity={0.35}
        transform="rotate(-16 12 21)"
      />
      {/* Middle card */}
      <Rect
        x="5" y="3" width="14" height="18" rx="2"
        stroke={color} strokeWidth="1.4"
        opacity={0.65}
        transform="rotate(-7 12 21)"
      />
      {/* Front card — straight */}
      <Rect
        x="5" y="3" width="14" height="18" rx="2"
        stroke={color} strokeWidth="1.6"
        transform="rotate(3 12 21)"
      />
    </Svg>
  );
}

/** Bird in flight — used for share */
export function BirdIcon({ size = 24, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Left wing — sweeps up and out */}
      <Path
        d="M 12 13.5 Q 8 8 3 9.5"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      {/* Right wing */}
      <Path
        d="M 12 13.5 Q 16.5 8 21 9.5"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      {/* Body — tapers to the right */}
      <Path
        d="M 12 13.5 Q 14.5 12.2 16.5 11.5"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Head */}
      <Circle cx="18" cy="11" r="1.8" fill={color} />
      {/* Beak */}
      <Path
        d="M 19.5 10.2 L 22 9"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      {/* Forked tail */}
      <Path
        d="M 12 13.5 L 8.5 16.5 M 12 13.5 L 10 17.5"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Circle with lowercase i — Info (kept for reference) */
export function InfoIcon({ size = 24, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
      <Circle cx="12" cy="7.5" r="1.2" fill={color} />
      <Line x1="12" y1="11" x2="12" y2="17" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

/** Artistic eye — used for info/about */
export function EyeIcon({ size = 24, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Outer almond eye */}
      <Path
        d="M2 12 Q7 5.5 12 5.5 Q17 5.5 22 12 Q17 18.5 12 18.5 Q7 18.5 2 12 Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Iris ring */}
      <Circle cx="12" cy="12" r="3.2" stroke={color} strokeWidth="1.3" />
      {/* Pupil */}
      <Circle cx="12" cy="12" r="1.4" fill={color} />
      {/* Glint */}
      <Circle cx="13.2" cy="10.8" r="0.55" fill={color} opacity={0.6} />
      {/* Lash hint */}
      <Path
        d="M8 8.5 Q10 7 12 6.5 Q14 7 16 8.5"
        stroke={color}
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity={0.55}
      />
    </Svg>
  );
}

/** Ribbon bookmark outline — not saved */
export function BookmarkIcon({ size = 24, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 2 H18 Q19 2 19 3 L19 21 L12 16 L5 21 L5 3 Q5 2 6 2 Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <Line x1="9" y1="7" x2="15" y2="7" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <Line x1="10" y1="10" x2="14" y2="10" stroke={color} strokeWidth="0.8" strokeLinecap="round" />
    </Svg>
  );
}

/** Ribbon bookmark filled — saved */
export function BookmarkFillIcon({ size = 24, color = '#FFD0D0' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M6 2 H18 Q19 2 19 3 L19 21 L12 16 L5 21 L5 3 Q5 2 6 2 Z"
        fill={color}
      />
      <Line x1="9" y1="7" x2="15" y2="7" stroke="rgba(0,0,0,0.18)" strokeWidth="1" strokeLinecap="round" />
      <Line x1="10" y1="10" x2="14" y2="10" stroke="rgba(0,0,0,0.18)" strokeWidth="0.8" strokeLinecap="round" />
    </Svg>
  );
}

/** Solid card with rotation arrow — flip indicator */
export function FlipIcon({ size = 20, color = '#3a2010' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Solid card */}
      <Rect x="3" y="3" width="15" height="19" rx="2" fill={color} />
      {/* Rotation arc top-right — clockwise */}
      <Path
        d="M 18 4 A 5.5 5.5 0 0 1 23 9.5"
        stroke={color}
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Arrowhead */}
      <Path
        d="M 23 6.5 L 23 9.5 L 20 9.5"
        stroke={color}
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
