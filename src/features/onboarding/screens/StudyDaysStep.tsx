import React from 'react';
import { View, Text } from 'react-native';
import { StudyIntensity } from '../types';

interface Props {
  value: string[];
  intensity: StudyIntensity | null;
  onConfirm: (days: string[], intensity: StudyIntensity) => void;
}

export function StudyDaysStep({ onConfirm }: Props) {
  // TODO: мультивыбор дней недели + слайдер интенсивности
  return (
    <View style={{ flex: 1, padding: 24 }}>
      <Text>Study days step — TODO</Text>
    </View>
  );
}