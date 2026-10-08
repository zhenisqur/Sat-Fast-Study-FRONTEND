import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Circle, Polygon, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../core/theme-context';
import { SingleChoiceField } from '../types';

const ICON_SIZE = 24;
const FLAG_WIDTH = 32;
const FLAG_HEIGHT = 22;

type IconKey = `${SingleChoiceField}:${string}`;
type IonName = React.ComponentProps<typeof Ionicons>['name'];

const SUPPORTED: IconKey[] = [
  'language:en',
  'language:ru',
  'source:tiktok',
  'source:instagram',
  'source:app_store',
  'source:play_market',
  'source:friend',
  'role:school',
  'role:college',
  'role:working',
];

/** Есть ли иконка для этого варианта ответа. */
export function hasOptionIcon(field: SingleChoiceField, value: string): boolean {
  return SUPPORTED.includes(`${field}:${value}` as IconKey);
}

// ---------- флаги ----------

function RussiaFlag() {
  const h = FLAG_HEIGHT / 3;
  return (
    <Svg width={FLAG_WIDTH} height={FLAG_HEIGHT} viewBox={`0 0 ${FLAG_WIDTH} ${FLAG_HEIGHT}`}>
      <Rect x={0} y={0} width={FLAG_WIDTH} height={h} fill="#FFFFFF" />
      <Rect x={0} y={h} width={FLAG_WIDTH} height={h} fill="#1C57A5" />
      <Rect x={0} y={h * 2} width={FLAG_WIDTH} height={h} fill="#D52B1E" />
    </Svg>
  );
}

function UsaFlag() {
  const stripeH = FLAG_HEIGHT / 13;
  const cantonW = FLAG_WIDTH * 0.4;
  const cantonH = stripeH * 7;

  const stars: { x: number; y: number }[] = [];
  const rows = 4;
  const cols = 5;
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      stars.push({ x: ((c + 0.5) / cols) * cantonW, y: ((r + 0.5) / rows) * cantonH });
    }
  }

  return (
    <Svg width={FLAG_WIDTH} height={FLAG_HEIGHT} viewBox={`0 0 ${FLAG_WIDTH} ${FLAG_HEIGHT}`}>
      <Rect x={0} y={0} width={FLAG_WIDTH} height={FLAG_HEIGHT} fill="#FFFFFF" />
      {[0, 2, 4, 6, 8, 10, 12].map((i) => (
        <Rect key={i} x={0} y={i * stripeH} width={FLAG_WIDTH} height={stripeH} fill="#B22234" />
      ))}
      <Rect x={0} y={0} width={cantonW} height={cantonH} fill="#3C3B6E" />
      {stars.map((s, i) => (
        <Circle key={i} cx={s.x} cy={s.y} r={0.75} fill="#FFFFFF" />
      ))}
    </Svg>
  );
}

// ---------- логотипы с настоящими цветами ----------

function InstagramLogo() {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id="igGradient" x1="0" y1="1" x2="1" y2="0">
          <Stop offset="0" stopColor="#FEDA77" />
          <Stop offset="0.3" stopColor="#F58529" />
          <Stop offset="0.55" stopColor="#DD2A7B" />
          <Stop offset="0.8" stopColor="#8134AF" />
          <Stop offset="1" stopColor="#515BD4" />
        </LinearGradient>
      </Defs>
      <Rect x={2.5} y={2.5} width={19} height={19} rx={5.5} stroke="url(#igGradient)" strokeWidth={2.2} fill="none" />
      <Circle cx={12} cy={12} r={4.3} stroke="url(#igGradient)" strokeWidth={2.2} fill="none" />
      <Circle cx={17.3} cy={6.7} r={1.3} fill="url(#igGradient)" />
    </Svg>
  );
}

function PlayMarketLogo() {
  // Треугольник Google Play из четырёх цветных частей.
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24">
      <Polygon points="3.5,2.4 3.5,21.6 13.4,12" fill="#00A0FF" />
      <Polygon points="3.5,2.4 16.7,9.6 13.4,12" fill="#00E676" />
      <Polygon points="16.7,9.6 21,12 16.7,14.4 13.4,12" fill="#FFD600" />
      <Polygon points="3.5,21.6 13.4,12 16.7,14.4" fill="#FF3D3D" />
    </Svg>
  );
}

function TikTokLogo({ color }: { color: string }) {
  // Три слоя: бирюзовый и красный со сдвигом, сверху основной цвет.
  const layer = (c: string, dx: number, dy: number) => (
    <View style={[styles.layer, { left: dx, top: dy }]}>
      <Ionicons name="logo-tiktok" size={ICON_SIZE} color={c} />
    </View>
  );
  return (
    <View style={styles.tiktok}>
      {layer('#25F4EE', -0.9, 0.7)}
      {layer('#FE2C55', 0.9, -0.7)}
      {layer(color, 0, 0)}
    </View>
  );
}

// ---------- публичный компонент ----------

interface Props {
  field: SingleChoiceField;
  value: string;
}

export function OptionIcon({ field, value }: Props) {
  const { colors } = useTheme();
  const key = `${field}:${value}` as IconKey;

  switch (key) {
    case 'language:ru':
      return (
        <View style={styles.flag}>
          <RussiaFlag />
        </View>
      );
    case 'language:en':
      return (
        <View style={styles.flag}>
          <UsaFlag />
        </View>
      );
    case 'source:instagram':
      return <InstagramLogo />;
    case 'source:play_market':
      return <PlayMarketLogo />;
    case 'source:tiktok':
      return <TikTokLogo color={colors.text} />;
    case 'source:app_store': {
      const name: IonName = 'logo-apple-appstore';
      return <Ionicons name={name} size={ICON_SIZE} color="#0D96F6" />;
    }
    case 'source:friend': {
      const name: IonName = 'people';
      return <Ionicons name={name} size={ICON_SIZE} color={colors.mintDeep} />;
    }
    case 'role:school': {
      const name: IonName = 'book';
      return <Ionicons name={name} size={ICON_SIZE} color={colors.gold} />;
    }
    case 'role:college': {
      const name: IonName = 'school';
      return <Ionicons name={name} size={ICON_SIZE} color={colors.purple} />;
    }
    case 'role:working': {
      const name: IonName = 'briefcase';
      return <Ionicons name={name} size={ICON_SIZE} color={colors.mintDeep} />;
    }
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  flag: {
    width: FLAG_WIDTH,
    height: FLAG_HEIGHT,
    borderRadius: 4,
    overflow: 'hidden',
  },
  // небольшой сдвиг вправо: у глифа TikTok в Ionicons центр тяжести смещён влево
  tiktok: { width: ICON_SIZE, height: ICON_SIZE, alignItems: 'center', justifyContent: 'center', marginLeft: 1.5 },
  layer: { position: 'absolute', width: ICON_SIZE, height: ICON_SIZE, alignItems: 'center', justifyContent: 'center' },
});