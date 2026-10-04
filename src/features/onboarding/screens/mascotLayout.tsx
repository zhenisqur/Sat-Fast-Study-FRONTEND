import { Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Fixed height so the mascot renders at the same apparent size
// on every intro screen, regardless of how tall the speech bubble is.
export const MASCOT_HEIGHT = SCREEN_WIDTH * 1.15;