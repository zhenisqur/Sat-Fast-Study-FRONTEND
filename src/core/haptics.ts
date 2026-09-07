import * as Haptics from 'expo-haptics';

// Every call is wrapped in .catch — haptics can throw on devices/simulators
// without a vibration engine, and a missing buzz should never crash a tap.

export const haptics = {
  // Regular button press — Log out, Check answer, Start Math, etc.
  tap: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined),
  // Picking an option — answer choice, toggle pill, tab switch.
  select: () => Haptics.selectionAsync().catch(() => undefined),
  // Correct answer / level complete.
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined),
  // Wrong answer.
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined),
};