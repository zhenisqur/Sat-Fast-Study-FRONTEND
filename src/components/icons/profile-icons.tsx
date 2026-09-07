import React from 'react';
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

// Dartboard with concentric rings, a highlight, and a flying dart — used for "Target score".
export function DartIcon({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Defs>
        <RadialGradient id="dartOuter" cx="42%" cy="38%" r="65%">
          <Stop offset="0%" stopColor="#FF9AA6" />
          <Stop offset="60%" stopColor="#FF6B6B" />
          <Stop offset="100%" stopColor="#D94F5C" />
        </RadialGradient>
        <RadialGradient id="dartInner" cx="42%" cy="38%" r="65%">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="100%" stopColor="#F1EEFF" />
        </RadialGradient>
        <RadialGradient id="dartBull" cx="42%" cy="38%" r="65%">
          <Stop offset="0%" stopColor="#FF8A96" />
          <Stop offset="100%" stopColor="#E14C5A" />
        </RadialGradient>
      </Defs>
      <Circle cx="21" cy="24" r="19" fill="url(#dartOuter)" />
      <Circle cx="21" cy="24" r="19" stroke="#B23A47" strokeWidth="0.8" fill="none" />
      <Circle cx="21" cy="24" r="13" fill="url(#dartInner)" />
      <Circle cx="21" cy="24" r="13" stroke="#FF6B6B" strokeWidth="1.6" fill="none" />
      <Circle cx="21" cy="24" r="6.6" fill="url(#dartOuter)" />
      <Circle cx="21" cy="24" r="6.6" stroke="#B23A47" strokeWidth="0.6" fill="none" />
      <Circle cx="21" cy="24" r="2.6" fill="url(#dartBull)" />
      <Circle cx="17.5" cy="19.5" r="3.2" fill="#FFFFFF" opacity={0.35} />
      <Path d="M28 17L40 5" stroke="#8983A5" strokeWidth="2.4" strokeLinecap="round" />
      <Path d="M40 5L34 6.4M40 5L38.6 11" stroke="#8983A5" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M28.5 20.5L26 18" stroke="#5D53BA" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

// 3D calendar block with a shadow layer, header bar, hanging rings, and a dot grid — used for "Age".
export function CalendarIcon({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Defs>
        <LinearGradient id="calBody" x1="24" y1="10" x2="24" y2="42" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#9191FF" />
          <Stop offset="1" stopColor="#6A5ACD" />
        </LinearGradient>
        <LinearGradient id="calHeader" x1="24" y1="9" x2="24" y2="18" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#5D53BA" />
          <Stop offset="1" stopColor="#4B3F9B" />
        </LinearGradient>
      </Defs>
      <Rect x="6" y="12" width="36" height="30" rx="6" fill="#4B3F9B" opacity={0.25} />
      <Rect x="7" y="10" width="34" height="30" rx="6" fill="url(#calBody)" />
      <Path d="M7 16C7 12.6863 9.68629 10 13 10H35C38.3137 10 41 12.6863 41 16V18H7V16Z" fill="url(#calHeader)" />
      <Rect x="14" y="5" width="4" height="10" rx="2" fill="#4B3F9B" />
      <Rect x="30" y="5" width="4" height="10" rx="2" fill="#4B3F9B" />
      <Circle cx="16" cy="24.5" r="2.1" fill="#FFFFFF" />
      <Circle cx="24" cy="24.5" r="2.1" fill="#FFFFFF" opacity={0.85} />
      <Circle cx="32" cy="24.5" r="2.1" fill="#FFFFFF" opacity={0.55} />
      <Circle cx="16" cy="31.5" r="2.1" fill="#FFFFFF" opacity={0.85} />
      <Circle cx="24" cy="31.5" r="2.1" fill="#FFD700" />
    </Svg>
  );
}

// Rising bar chart with gradient bars, a trend line, and an arrow — used for "Previous SAT" score.
export function ChartIcon({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Defs>
        <LinearGradient id="barLow" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#8CF2C4" />
          <Stop offset="1" stopColor="#54E6A8" />
        </LinearGradient>
        <LinearGradient id="barMid" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#3FCB8F" />
          <Stop offset="1" stopColor="#239B69" />
        </LinearGradient>
        <LinearGradient id="barHigh" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#9191FF" />
          <Stop offset="1" stopColor="#6A5ACD" />
        </LinearGradient>
      </Defs>
      <Rect x="5" y="27" width="9" height="15" rx="2.4" fill="url(#barLow)" />
      <Rect x="19.5" y="18" width="9" height="24" rx="2.4" fill="url(#barMid)" />
      <Rect x="34" y="7" width="9" height="35" rx="2.4" fill="url(#barHigh)" />
      <Path d="M6 24L20 15L34.5 6" stroke="#FFD700" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M29 6H35V12" stroke="#FFD700" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

// Envelope with gradient body, fold shading, and a wax-seal dot — used for "Email".
export function EnvelopeIcon({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Defs>
        <LinearGradient id="envBody" x1="24" y1="10" x2="24" y2="38" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FF9AA6" />
          <Stop offset="1" stopColor="#FF7A8A" />
        </LinearGradient>
      </Defs>
      <Rect x="4" y="10" width="40" height="28" rx="6" fill="#D9576A" opacity={0.25} />
      <Rect x="5" y="9" width="38" height="28" rx="6" fill="url(#envBody)" />
      <Path d="M6 12L24 26L42 12" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M6 35L18 22" stroke="#D9576A" strokeWidth="2" strokeLinecap="round" opacity={0.4} />
      <Path d="M42 35L30 22" stroke="#D9576A" strokeWidth="2" strokeLinecap="round" opacity={0.4} />
      <Circle cx="24" cy="26" r="3.4" fill="#FFD700" />
    </Svg>
  );
}