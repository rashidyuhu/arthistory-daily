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
      {/* Outer frame */}
      <Rect x="1.5" y="1.5" width="21" height="21" rx="1.5" stroke={color} strokeWidth="1.5" />
      {/* Inner frame line */}
      <Rect x="3.5" y="3.5" width="17" height="17" rx="0.5" stroke={color} strokeWidth="0.7" strokeDasharray="1.5 1" />
      {/* Head */}
      <Ellipse cx="12" cy="9.5" rx="3.5" ry="4" stroke={color} strokeWidth="1.4" />
      {/* Shoulders */}
      <Path
        d="M3.5 20.5 Q7 15.5 12 15.5 Q17 15.5 20.5 20.5"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Gallery grid — used for the Collection tab */
export function GalleryIcon({ size = 26, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Large left painting */}
      <Rect x="1.5" y="2" width="11" height="14" rx="1" stroke={color} strokeWidth="1.5" />
      {/* Small top-right painting */}
      <Rect x="14.5" y="2" width="8" height="8" rx="1" stroke={color} strokeWidth="1.5" />
      {/* Small bottom-right painting */}
      <Rect x="14.5" y="12" width="8" height="10" rx="1" stroke={color} strokeWidth="1.5" />
      {/* Small bottom-left painting */}
      <Rect x="1.5" y="18" width="11" height="4" rx="1" stroke={color} strokeWidth="1.5" />
    </Svg>
  );
}

/** Upward arrow from tray — Share */
export function ShareIcon({ size = 24, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Arrow stem */}
      <Line x1="12" y1="15" x2="12" y2="4" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      {/* Arrow head */}
      <Path
        d="M7.5 8.5 L12 4 L16.5 8.5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Tray */}
      <Path
        d="M4 14 L4 19 L20 19 L20 14"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Circle with lowercase i — Info */
export function InfoIcon({ size = 24, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
      {/* dot */}
      <Circle cx="12" cy="7.5" r="1.2" fill={color} />
      {/* stem */}
      <Line x1="12" y1="11" x2="12" y2="17" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

/** Filled heart — used when favorited */
export function HeartFillIcon({ size = 24, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 21C12 21 3 14.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.81 3.93 12 5C12.19 3.93 13.76 3 15.5 3C18.58 3 21 5.42 21 8.5C21 14.5 12 21 12 21Z"
        fill={color}
      />
    </Svg>
  );
}

/** Outline heart — used when not favorited */
export function HeartOutlineIcon({ size = 24, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21C12 21 3 14.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.81 3.93 12 5C12.19 3.93 13.76 3 15.5 3C18.58 3 21 5.42 21 8.5C21 14.5 12 21 12 21Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Bookmark ribbon — used for favorite (outline, not saved) */
export function BookmarkIcon({ size = 24, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Ribbon body */}
      <Path
        d="M6 2 H18 Q19 2 19 3 L19 21 L12 16 L5 21 L5 3 Q5 2 6 2 Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Small ornamental horizontal rule inside */}
      <Line x1="9" y1="7" x2="15" y2="7" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <Line x1="10" y1="10" x2="14" y2="10" stroke={color} strokeWidth="0.8" strokeLinecap="round" />
    </Svg>
  );
}

/** Bookmark ribbon — filled when saved */
export function BookmarkFillIcon({ size = 24, color = '#FFD0D0' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M6 2 H18 Q19 2 19 3 L19 21 L12 16 L5 21 L5 3 Q5 2 6 2 Z"
        fill={color}
      />
      <Line x1="9" y1="7" x2="15" y2="7" stroke="rgba(0,0,0,0.2)" strokeWidth="1" strokeLinecap="round" />
      <Line x1="10" y1="10" x2="14" y2="10" stroke="rgba(0,0,0,0.2)" strokeWidth="0.8" strokeLinecap="round" />
    </Svg>
  );
}

/** Quill pen — used for share */
export function QuillIcon({ size = 24, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Feather body — large right-curved shape */}
      <Path
        d="M20 2 C20 2 22 10 16 15 C12 18.5 7 19 4 21"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Left edge of feather */}
      <Path
        d="M20 2 C16 4 12 8 10 13 C8.5 17 7 19 4 21"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Quill spine / central vane */}
      <Path
        d="M20 2 L4 21"
        stroke={color}
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeDasharray="2 2"
      />
      {/* Ink nib at tip */}
      <Path
        d="M4 21 L3 22.5 L5.5 21.5 Z"
        fill={color}
      />
    </Svg>
  );
}

/** Artistic eye — used for info */
export function EyeIcon({ size = 24, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Outer almond eye shape */}
      <Path
        d="M2 12 Q7 5.5 12 5.5 Q17 5.5 22 12 Q17 18.5 12 18.5 Q7 18.5 2 12 Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Iris ring */}
      <Circle cx="12" cy="12" r="3.2" stroke={color} strokeWidth="1.3" />
      {/* Pupil fill */}
      <Circle cx="12" cy="12" r="1.4" fill={color} />
      {/* Highlight glint */}
      <Circle cx="13.2" cy="10.8" r="0.55" fill={color} opacity={0.6} />
      {/* Decorative upper lash hint */}
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

/** Small flip/rotate arrow — used on the card */
export function FlipIcon({ size = 20, color = '#888' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 12C4 7.58 7.58 4 12 4C14.76 4 17.18 5.38 18.6 7.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Path
        d="M20 12C20 16.42 16.42 20 12 20C9.24 20 6.82 18.62 5.4 16.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Path d="M19 4.5 L18.6 7.5 L15.6 7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 19.5 L5.4 16.5 L8.4 17" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
