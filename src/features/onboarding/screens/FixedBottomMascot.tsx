import React from 'react';
import { View, Image, StyleSheet, Dimensions, ImageSourcePropType } from 'react-native';

// Урезанная версия маскота (голова + руки + плечи), уже обрезана в самом png.
export const MASCOT_SOURCE: ImageSourcePropType = require('../../../assets/mascot/lookprice.png');

const SCREEN_WIDTH = Dimensions.get('window').width;
const asset = Image.resolveAssetSource(MASCOT_SOURCE);

// Картинка на всю ширину экрана; высота зоны = реальная высота картинки при такой ширине.
export const MASCOT_ZONE_HEIGHT = SCREEN_WIDTH * (asset.height / asset.width);

// Насколько маскот "спущен" вниз: нижняя часть картинки уходит за край экрана.
const MASCOT_SINK = MASCOT_ZONE_HEIGHT * 0.08;

interface Props {
  source: ImageSourcePropType;
}

/**
 * Заполняет СВОЕГО родителя картинкой, прижатой к низу.
 * Родитель должен иметь высоту = MASCOT_ZONE_HEIGHT и стоять ПОСЛЕ ScrollView
 * как обычный flex-сосед (не absolute) — тогда ScrollView физически не может
 * отрендерить контент в этой зоне.
 */
export function FixedBottomMascot({ source }: Props) {
  return (
    <View style={styles.fill} pointerEvents="none">
      <Image source={source} style={styles.image} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  image: {
    width: SCREEN_WIDTH,
    height: MASCOT_ZONE_HEIGHT,
    marginBottom: -MASCOT_SINK,
  },
});