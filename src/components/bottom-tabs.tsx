import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';
import { useTheme } from '../core/theme-context';
import { ThemeColors } from '../core/theme';
import { Tab } from '../core/types';
import { useLanguage } from '../core/language-context';

function useTabItems(): { id: Tab; label: string; Icon: React.ComponentType<{ size?: number }> }[] {
  const { t } = useLanguage();
  return [
    { id: 'HOME', label: t('tabs.home'), Icon: HomeIcon },
    { id: 'STUDY', label: t('tabs.study'), Icon: StudyIcon },
    { id: 'PRACTICE', label: t('tabs.practice'), Icon: PracticeIcon },
    { id: 'PROFILE', label: t('tabs.profile'), Icon: ProfileIcon },
  ];
}

export function BottomTabs({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const items = useTabItems();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: 10 + insets.bottom }]}>
      {items.map((item) => (
        <TabButton key={item.id} item={item} isActive={active === item.id} onPress={() => onChange(item.id)} />
      ))}
    </View>
  );
}

function TabButton({ item, isActive, onPress }: { item: ReturnType<typeof useTabItems>[number]; isActive: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const scale = useRef(new Animated.Value(1)).current;
  const lift = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(lift, { toValue: isActive ? 1 : 0, useNativeDriver: true, friction: 6, tension: 120 }).start();
    if (isActive) {
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.15, useNativeDriver: true, speed: 40, bounciness: 9 }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }),
      ]).start();
    }
  }, [isActive, scale, lift]);

  const handlePress = () => {
    if (!isActive) Haptics.selectionAsync().catch(() => undefined);
    onPress();
  };

  const pillScale = lift.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const pillOpacity = lift;
  const dotScale = lift;

  return (
    <Pressable onPress={handlePress} style={styles.item} hitSlop={8}>
      <View style={styles.iconWrap}>
        <View style={styles.iconWrapIdle} />
        <Animated.View style={[styles.iconWrapActive, { opacity: pillOpacity, transform: [{ scale: pillScale }] }]} />
        <Animated.View style={{ transform: [{ scale }] }}>
          <item.Icon size={30} />
        </Animated.View>
      </View>
      <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
      <Animated.View style={[styles.activeDot, { transform: [{ scale: dotScale }], opacity: dotScale }]} />
    </Pressable>
  );
}

function HomeIcon({ size = 26 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Defs>
        <LinearGradient id="homeGrad" x1="24" x2="24" y1="21.217" y2="46.652" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#c99fff" />
          <Stop offset="0.219" stopColor="#be85ff" />
          <Stop offset="1" stopColor="#962aff" />
        </LinearGradient>
        <LinearGradient id="homeRoofGlow" x1="23.947" x2="23.947" y1="25.198" y2="-10.968" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#4eaefe" stopOpacity={0.2} />
          <Stop offset="1" stopColor="#41a2fe" stopOpacity={0.4} />
        </LinearGradient>
        <LinearGradient id="homeRoofShine" x1="23.947" x2="23.947" y1="28.341" y2="16.176" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#ffffff" stopOpacity={0.2} />
          <Stop offset="1" stopColor="#71b5ff" stopOpacity={0.4} />
        </LinearGradient>
      </Defs>
      <Path fill="url(#homeGrad)" d="M40,23H8c-0.552,0-1,0.448-1,1v20c0,0.552,0.448,1,1,1h11c0.552,0,1-0.448,1-1V34c0-0.552,0.448-1,1-1h6c0.552,0,1,0.448,1,1v10c0,0.552,0.448,1,1,1h11c0.552,0,1-0.448,1-1V24C41,23.448,40.552,23,40,23z" />
      <Path fill="#ad5eff" opacity={0.1} d="M4.805,26h38.284c0.342,0,0.646-0.083,0.911-0.218v-1.855C44,21.761,42.206,20,40,20H8c-2.206,0-4,1.761-4,3.927v1.907C4.24,25.938,4.509,26,4.805,26z" />
      <Path fill="#ad5eff" opacity={0.2} d="M4.805,26h38.284c0.056,0,0.107-0.009,0.161-0.013v-2.059c0-1.76-1.457-3.191-3.25-3.191H8c-1.793,0-3.25,1.431-3.25,3.191v2.067C4.769,25.995,4.786,26,4.805,26z" />
      <Path fill="#ad5eff" opacity={0.3} d="M42.5,26v-2.073c0-1.354-1.121-2.455-2.5-2.455H8c-1.379,0-2.5,1.1-2.5,2.455V26H42.5z" />
      <Path fill="#ad5eff" opacity={0.4} d="M41.75,26v-2.073c0-0.948-0.784-1.718-1.75-1.718H8c-0.966,0-1.75,0.77-1.75,1.718V26H41.75z" />
      <Path fill="#ad5eff" opacity={0.5} d="M41,26v-2.073c0-0.542-0.448-0.982-1-0.982H8c-0.552,0-1,0.44-1,0.982V26H41z" />
      <Path fill="#a64eff" opacity={0.1} d="M41,28v-4c0-0.552-0.448-1-1-1H8c-0.552,0-1,0.448-1,1v4H41z" />
      <Path fill="#a64eff" opacity={0.15} d="M41,27.6V24c0-0.552-0.448-1-1-1H8c-0.552,0-1,0.448-1,1v3.6H41z" />
      <Path fill="#a64eff" opacity={0.2} d="M41,27.2V24c0-0.552-0.448-1-1-1H8c-0.552,0-1,0.448-1,1v3.2H41z" />
      <Path fill="#a64eff" opacity={0.25} d="M41,26.8V24c0-0.552-0.448-1-1-1H8c-0.552,0-1,0.448-1,1v2.8H41z" />
      <Path fill="#a64eff" opacity={0.3} d="M41,26.4V24c0-0.552-0.448-1-1-1H8c-0.552,0-1,0.448-1,1v2.4H41z" />
      <Path fill="#a64eff" opacity={0.3} d="M41,26v-2c0-0.552-0.448-1-1-1H8c-0.552,0-1,0.448-1,1v2H41z" />
      <Path fill="url(#homeRoofGlow)" d="M44.508,22.607L37,15.083V5.985c0-0.55-0.448-0.995-1-0.995h-3c-0.552,0-1,0.446-1,0.995v4.088l-6.634-6.647c-0.782-0.784-2.056-0.784-2.838,0L3.386,22.607C2.133,23.863,3.027,26,4.805,26h38.284C44.868,26,45.762,23.863,44.508,22.607z" />
      <Path fill="url(#homeRoofShine)" d="M23.947,3.336c0.403,0,0.781,0.157,1.064,0.441l6.634,6.647L32.5,11.28v-1.207V5.985c0-0.274,0.224-0.498,0.5-0.498h3c0.276,0,0.5,0.223,0.5,0.498v9.098v0.205l0.145,0.146l7.508,7.524c0.52,0.521,0.506,1.181,0.321,1.626c-0.186,0.444-0.647,0.919-1.385,0.919H4.805c-0.738,0-1.199-0.475-1.385-0.919c-0.186-0.444-0.199-1.105,0.321-1.626L22.883,3.777C23.167,3.492,23.545,3.336,23.947,3.336L23.947,3.336 M23.947,2.838c-0.514,0-1.028,0.196-1.419,0.588L3.386,22.607C2.133,23.863,3.027,26,4.805,26h38.284c1.779,0,2.672-2.137,1.419-3.393L37,15.083V5.985c0-0.55-0.448-0.995-1-0.995h-3c-0.552,0-1,0.446-1,0.995v4.088l-6.634-6.647C24.975,3.034,24.461,2.838,23.947,2.838L23.947,2.838z" />
    </Svg>
  );
}

function StudyIcon({ size = 26 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Defs>
        <LinearGradient id="studyGrad" x1="140.772" x2="140.772" y1="39.126" y2="9.567" gradientTransform="matrix(-1 0 0 1 164 0)" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#ffa4f9" />
          <Stop offset="0.447" stopColor="#ff5dde" />
          <Stop offset="1" stopColor="#ff01bb" />
        </LinearGradient>
        <LinearGradient id="studyShine1" x1="7.452" x2="31.418" y1="20.021" y2="8.842" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#ffffff" stopOpacity={0.4} />
          <Stop offset="1" stopColor="#ffbe02" stopOpacity={0.4} />
        </LinearGradient>
        <LinearGradient id="studyShine2" x1="-67.948" x2="-59.408" y1="-315.25" y2="-304.897" gradientTransform="matrix(1 0 0 -1 90 -299)" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#ffffff" stopOpacity={0.2} />
          <Stop offset="1" stopColor="#ffbe02" stopOpacity={0.4} />
        </LinearGradient>
      </Defs>
      <Path fill="url(#studyGrad)" d="M11.929,5.037h25.527C36,5.037,35,6.161,35,7.545v31.877c0,1.564-1.715,2.523-3.047,1.704l-8.905-5.475c-0.642-0.395-1.453-0.395-2.095,0l-8.905,5.475C10.715,41.945,9,40.987,9,39.422V7.966C9,6.348,10.312,5.037,11.929,5.037z" />
      <Path fill="#ff01bb" opacity={0.1} d="M33,18.025V5.037h5c0,0.999,0,1.747,0,2.508v10.48H33z" />
      <Path fill="#ff01bb" opacity={0.2} d="M32,18.025V5.037h5.813c-0.452,0.798-0.563,1.747-0.563,2.508v10.48H32z" />
      <Path fill="#ff01bb" opacity={0.3} d="M31,18.025V5.037h6.626C36.721,5.634,36.5,6.783,36.5,7.545v10.48H31z" />
      <Path fill="#ff01bb" opacity={0.4} d="M30,18.025V5.037h7.44c-1.357,0.396-1.69,1.747-1.69,2.508v10.48H30z" />
      <Path fill="#ff01bb" opacity={0.5} d="M29,18.025V5.037h8.253C35.443,5.232,35,6.783,35,7.545v10.48H29z" />
      <Path fill="#e800b7" opacity={0.05} d="M12,5.037h25.456C36,5.037,35,6.161,35,7.545v13.477H17c-2.757,0-5-2.241-5-4.995c0,0-0.003-8.071,0-8.063V5.037z" />
      <Path fill="#e800b7" opacity={0.1} d="M12,5.037h25.456C36,5.037,35,6.161,35,7.545v12.977H17c-2.481,0-4.5-2.017-4.5-4.496c0,0-0.003-8.058,0-8.051C12.5,7.667,12.269,5.037,12,5.037z" />
      <Path fill="#e800b7" opacity={0.2} d="M12,5.037h25.456C36,5.037,35,6.161,35,7.545v12.478H17c-2.205,0-4-1.794-4-3.996c0,0-0.002-8.045,0-8.039C13,7.371,12.539,5.037,12,5.037z" />
      <Path fill="#e800b7" opacity={0.3} d="M12,5.037h25.456C36,5.037,35,6.161,35,7.545v11.978H17c-1.928,0-3.5-1.57-3.5-3.497c0,0-0.002-8.032,0-8.028C13.5,7.074,12.808,5.037,12,5.037z" />
      <Path fill="#e800b7" opacity={0.4} d="M12,5.037h25.456C36,5.037,35,6.161,35,7.545v11.479H17c-1.652,0-3-1.347-3-2.997c0,0-0.001-8.019,0-8.016C14,6.778,13.078,5.037,12,5.037z" />
      <Path fill="#e800b7" opacity={0.5} d="M12,5.037h25.456C36,5.037,35,6.161,35,7.545v10.979H17c-1.376,0-2.5-1.123-2.5-2.498c0,0-0.001-8.006,0-8.004C14.5,6.481,13.347,5.037,12,5.037z" />
      <Path fill="#e800b7" d="M17,18.025c-1.1,0-2-0.899-2-1.998V8.034c0-1.849-1.383-2.997-3-2.997h25.456C36,5.037,35,6.161,35,7.545v10.48H17z" />
      <Path fill="url(#studyShine1)" d="M17,18h22c1.1,0,2-0.9,2-2V7.417C41,6.082,39.918,5,38.583,5H12c1.617,0,3,1.149,3,3v8C15,17.1,15.9,18,17,18z" />
      <Path fill="url(#studyShine2)" d="M39,17.5H17c-0.827,0-1.5-0.673-1.5-1.5V8c0-1.008-0.364-1.879-0.979-2.5h24.062c1.057,0,1.917,0.86,1.917,1.917V16C40.5,16.827,39.827,17.5,39,17.5L39,17.5z M39,18c1.1,0,2-0.9,2-2V7.417C41,6.082,39.918,5,38.583,5H12c1.617,0,3,1.149,3,3v8c0,1.1,0.9,2,2,2H39L39,18z" />
    </Svg>
  );
}

function PracticeIcon({ size = 26 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Defs>
        <LinearGradient id="practiceGrad" x1="25.408" y1="29.2" x2="-3.966" y2="-0.174" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#9191ff" />
          <Stop offset="0.447" stopColor="#7780ff" />
          <Stop offset="1" stopColor="#0037ff" />
        </LinearGradient>
        <LinearGradient id="practiceRed" x1="36.687" y1="32" x2="14.511" y2="18.237" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#ff0000" stopOpacity={0.4} />
          <Stop offset="1" stopColor="#ff0000" stopOpacity={0.4} />
        </LinearGradient>
        <LinearGradient id="practiceShine" x1="25.149" y1="20.567" x2="42.364" y2="40.186" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#ffeab0" stopOpacity={0.1} />
          <Stop offset="1" stopColor="#ff4040" stopOpacity={0.30196} />
        </LinearGradient>
      </Defs>
      <Path fill="#0202ff" opacity={0.4} d="M20.9,13.981c-2.2,0-4,1.8-4,4v16c0,0.263,0.029,0.519,0.078,0.769h10.022c2.383,0,4.362-1.803,4.622-4.094c0.082-0.203,0.128-1.911,0.128-2.142v-13.034c0-0.15-0.019-0.921-0.055-1.498h-10.795z" />
      <Path fill="#0202ff" opacity={0.3} d="M20.9,13.981c-2.2,0-4,1.8-4,4v16c0,0.537,0.11,1.049,0.305,1.519h9.795c2.566,0,4.725-1.807,5.245-4.188c0.164-0.405,0.255-1.839,0.255-2.303v-14.022c0-0.204-0.018-0.596-0.052-1.005h-11.548z" />
      <Path fill="#0202ff" opacity={0.2} d="M20.9,13.981c-2.2,0-4,1.8-4,4v16c0,0.842,0.267,1.622,0.715,2.269h9.385c2.75,0,5.087-1.81,5.867-4.283c0.247-0.608,0.383-1.768,0.383-2.463v-15.011c0-0.15-0.009-0.328-0.022-0.512z" />
      <Path fill="#0202ff" opacity={0.1} d="M34,25.675v-11.675c0-0.006-0.001-0.012-0.001-0.019h-13.099c-2.2,0-4,1.8-4,4v16c0,1.209,0.555,2.284,1.409,3.019h8.691c3.86,0,7-3.141,7-7v-3.657c-0.016-0.226-0.014-0.449,0-0.668z" />
      <Path fill="url(#practiceGrad)" d="M31,14c0-2.2-1.8-4-4-4h-4c-0.7,0-1.1-0.8-0.7-1.4c0.6-1,0.9-2.2,0.6-3.5c-0.4-2-1.9-3.6-3.8-4c-3.3-0.7-6.1,1.8-6.1,4.9c0,1,0.3,1.8,0.7,2.6c0.4,0.6,0,1.4-0.8,1.4h-4c-2.2,0-4,1.8-4,4v3c0,0.7,0.8,1.1,1.4,0.7c1-0.6,2.2-0.9,3.5-0.6c2,0.4,3.6,1.9,4,3.8c0.7,3.2-1.8,6.1-4.9,6.1c-1,0-1.8-0.3-2.6-0.7c-0.5-0.4-1.3,0-1.3,0.7v3c0,2.2,1.8,4,4,4h18c2.2,0,4-1.8,4-4z" />
      <Path fill="#0202ff" opacity={0.4} d="M27,34c2.2,0,4-1.8,4-4v-16c0-0.144-0.032-0.279-0.047-0.419h-10.053c-2.42,0-4.4,1.98-4.4,4.4v16c0.007,0.007,0.011,0.011,0.019,0.019z" />
      <Path fill="#0202ff" opacity={0.3} d="M27,34c2.2,0,4-1.8,4-4v-16c0-0.281-0.035-0.554-0.092-0.819h-10.008c-2.64,0-4.8,2.16-4.8,4.8v16.017c0.001,0,0.001,0.001,0.002,0.001h10.898z" />
      <Path fill="#0202ff" opacity={0.2} d="M27,34c2.2,0,4-1.8,4-4v-16c0-0.429-0.091-0.832-0.219-1.219h-9.881c-2.86,0-5.2,2.34-5.2,5.2v16c0.007,0.007,0.011,0.011,0.019,0.019z" />
      <Path fill="#0202ff" opacity={0.1} d="M27,34c2.2,0,4-1.8,4-4v-16c0-0.578-0.132-1.124-0.359-1.619h-9.741c-3.093,0-5.6,2.507-5.6,5.6v16c0.007,0.007,0.011,0.011,0.019,0.019z" />
      <Path fill="#0202ff" opacity={0.05} d="M27,34c2.2,0,4-1.8,4-4v-16c0-0.743-0.228-1.424-0.588-2.019h-9.512c-3.314,0-6,2.686-6,6v16c0.007,0.007,0.011,0.011,0.019,0.019z" />
      <Path fill="url(#practiceRed)" d="M16.9,33.982c0,2.2,1.8,4,4,4h4c0.7,0,1.1,0.8,0.7,1.4c-0.6,1-0.9,2.2-0.6,3.5c0.4,2,1.9,3.6,3.8,4c3.3,0.7,6.1-1.8,6.1-4.9c0-1-0.3-1.8-0.7-2.6c-0.4-0.6,0-1.4,0.8-1.4h4c2.2,0,4-1.8,4-4v-3c0-0.7-0.8-1.1-1.4-0.7c-1,0.6-2.2,0.9-3.5,0.6c-2-0.4-3.6-1.9-4-3.8c-0.7-3.2,1.8-6.1,4.9-6.1c1,0,1.8,0.3,2.6,0.7c0.5,0.4,1.3,0,1.3-0.7v-3c0-2.2-1.8-4-4-4h-18c-2.2,0-4,1.8-4,4z" />
      <Path fill="url(#practiceShine)" d="M38.9,14.481c1.93,0,3.5,1.57,3.5,3.5v3c0,0.234-0.2,0.359-0.345,0.359c-0.054,0-0.101-0.016-0.142-0.049c-0.027-0.022-0.057-0.041-0.089-0.057c-0.745-0.372-1.662-0.753-2.824-0.753c-1.669,0-3.235,0.757-4.298,2.078c-1.051,1.306-1.448,2.993-1.091,4.625c0.442,2.098,2.165,3.742,4.377,4.184c0.375,0.087,0.757,0.13,1.134,0.13c0.943,0,1.863-0.265,2.756-0.802c0.075-0.05,0.155-0.075,0.239-0.075c0.189,0,0.384,0.134,0.384,0.359v3c0,1.93-1.57,3.5-3.5,3.5h-4c-0.561,0-1.044,0.279-1.294,0.745c-0.235,0.44-0.212,0.974,0.059,1.403c0.331,0.666,0.635,1.412,0.635,2.352c0,2.492-2.013,4.519-4.487,4.519c-0.333,0-0.672-0.036-1.01-0.108c-1.68-0.354-3.052-1.804-3.416-3.623c-0.307-1.33,0.125-2.436,0.529-3.11c0.293-0.44,0.322-1,0.076-1.461c-0.24-0.449-0.686-0.717-1.192-0.717h-4c-1.93,0-3.5-1.57-3.5-3.5v-16c0-1.93,1.57-3.5,3.5-3.5h17.999M38.9,13.981h-18c-2.2,0-4,1.8-4,4v16c0,2.2,1.8,4,4,4h4c0.7,0,1.1,0.8,0.7,1.4c-0.6,1-0.9,2.2-0.6,3.5c0.4,2,1.9,3.6,3.8,4c0.378,0.081,0.751,0.119,1.113,0.119c2.793,0,4.987-2.274,4.987-5.019c0-1-0.3-1.8-0.7-2.6c-0.4-0.6,0-1.4,0.8-1.4h4c2.2,0,4-1.8,4-4v-3c0-0.509-0.422-0.859-0.884-0.859c-0.173,0-0.352,0.05-0.516,0.159c-0.732,0.439-1.571,0.718-2.478,0.718c-0.332,0-0.673-0.037-1.022-0.118c-2-0.4-3.6-1.9-4-3.8c-0.7-3.2,1.8-6.1,4.9-6.1c1,0,1.8,0.3,2.6,0.7c0.137,0.109,0.296,0.159,0.455,0.159c0.423,0,0.845-0.35,0.845-0.859v-3c0-2.2-1.8-4-4-4z" />
    </Svg>
  );
}

function ProfileIcon({ size = 26 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <RadialGradient id="profileHead" cx="50%" cy="30%" r="60%">
          <Stop offset="0%" stopColor="#FFF3E0" />
          <Stop offset="40%" stopColor="#FF9800" />
          <Stop offset="100%" stopColor="#F57C00" />
        </RadialGradient>
        <RadialGradient id="profileHeadShadow" cx="50%" cy="0%" r="70%">
          <Stop offset="0%" stopColor="#FF5722" stopOpacity={0.4} />
          <Stop offset="100%" stopColor="#FF5722" stopOpacity={0} />
        </RadialGradient>
        <LinearGradient id="profileBody" x1="32" y1="36" x2="32" y2="64" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#FFC107" />
          <Stop offset="50%" stopColor="#FF9800" />
          <Stop offset="100%" stopColor="#EF6C00" />
        </LinearGradient>
        <RadialGradient id="profileBodyShadow" cx="50%" cy="0%" r="60%">
          <Stop offset="0%" stopColor="#000000" stopOpacity={0.2} />
          <Stop offset="100%" stopColor="#000000" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Path d="M12 56C12 45.0761 20.7304 36 32 36C43.2696 36 52 45.0761 52 56V60H12V56Z" fill="url(#profileBody)" />
      <Path d="M12 56C12 45.0761 20.7304 36 32 36C43.2696 36 52 45.0761 52 56V60H12V56Z" fill="url(#profileBodyShadow)" />
      <Circle cx="32" cy="24" r="14" fill="url(#profileHead)" />
      <Circle cx="32" cy="24" r="14" fill="url(#profileHeadShadow)" />
    </Svg>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    bar: {
      flexDirection: 'row',
      backgroundColor: colors.purple,
      paddingTop: 10,
      paddingHorizontal: 5,
      justifyContent: 'space-around',
    },
    item: { minWidth: 60, alignItems: 'center', gap: 9 },
    iconWrap: { width: 52, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    iconWrapIdle: { position: 'absolute', width: 52, height: 44, borderRadius: 16, backgroundColor: colors.white, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
    iconWrapActive: { position: 'absolute', width: 52, height: 44, borderRadius: 16, borderWidth: 2.5, borderColor: colors.purple },
    label: { color: 'rgba(255,255,255,0.62)', fontSize: 10, fontWeight: '700' },
    labelActive: { color: colors.white, fontWeight: '900' },
    activeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.white, marginTop: 2 },
  });
}