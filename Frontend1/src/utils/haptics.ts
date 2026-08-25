/**
 * Native Telegram WebApp Haptic Feedback Handler
 * Triggers physical vibration on mobile devices running inside Telegram WebApp
 */
export const triggerHaptic = (
  style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium'
) => {
  try {
    const tg = window.Telegram?.WebApp;
    if (tg && tg.HapticFeedback) {
      tg.HapticFeedback.impactOccurred(style);
    } else if (navigator.vibrate) {
      // Fallback for normal web browsers on supported devices
      const duration = style === 'heavy' ? 40 : style === 'medium' ? 25 : 15;
      navigator.vibrate(duration);
    }
  } catch (e) {
    // Ignore haptic errors gracefully
  }
};

export const triggerSuccessHaptic = () => {
  try {
    const tg = window.Telegram?.WebApp;
    if (tg && tg.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('success');
    } else if (navigator.vibrate) {
      navigator.vibrate([30, 50, 30]);
    }
  } catch (e) {
    // Ignore
  }
};

export const triggerSelectionHaptic = () => {
  try {
    const tg = window.Telegram?.WebApp;
    if (tg && tg.HapticFeedback) {
      tg.HapticFeedback.selectionChanged();
    }
  } catch (e) {
    // Ignore
  }
};
