import React, { useEffect, useRef } from 'react';
import { Animated, AccessibilityInfo, StyleSheet } from 'react-native';

interface Props {
  stepKey: string;
  children: React.ReactNode;
}

const ANIMATION_DURATION = 280;
const SLIDE_DISTANCE = 20;

export function AnimatedStep({ stepKey, children }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(SLIDE_DISTANCE)).current;

  useEffect(() => {
    let cancelled = false;

    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (cancelled) return;

      if (reduceMotion) {
        opacity.setValue(1);
        translateX.setValue(0);
        return;
      }

      opacity.setValue(0);
      translateX.setValue(SLIDE_DISTANCE);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    });

    return () => {
      cancelled = true;
    };
    // stepKey changing is what should re-trigger the animation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey]);

  return (
    <Animated.View style={[styles.flex, { opacity, transform: [{ translateX }] }]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});