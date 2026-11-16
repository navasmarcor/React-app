import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';

import { Logo } from '@/components/logo';
import { Text } from '@/components/ui';

const NAVY = '#152033';
const native = process.env.EXPO_OS !== 'web';

/**
 * The opening animation, shown once each time the app opens. It starts on the same navy and logo
 * as the native splash screen, so the hand-off is seamless: the logo pops in, the name rises under
 * it, then the logo zooms toward the viewer while the navy fades away and the app settles into place.
 * People who turned on "Reduce motion" skip straight to the app.
 */
export function Intro({ children }: { children: ReactNode }) {
  const [done, setDone] = useState(false);
  const [logo] = useState(() => new Animated.Value(0)); // 0 → 1: logo appears
  const [word] = useState(() => new Animated.Value(0)); // 0 → 1: name appears
  const [out] = useState(() => new Animated.Value(0)); // 0 → 1: overlay leaves, app arrives

  useEffect(() => {
    let cancelled = false;
    const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
    const run = Animated.sequence([
      Animated.spring(logo, { toValue: 1, friction: 6, tension: 60, useNativeDriver: native }),
      Animated.timing(word, { toValue: 1, duration: 380, easing: ease, useNativeDriver: native }),
      Animated.delay(450),
      Animated.timing(out, { toValue: 1, duration: 620, easing: Easing.bezier(0.6, 0, 0.2, 1), useNativeDriver: native }),
    ]);
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduce) => {
        if (cancelled) return;
        if (reduce) {
          out.setValue(1);
          setDone(true);
        }
        else run.start(({ finished }) => finished && !cancelled && setDone(true));
      });
    return () => {
      cancelled = true;
      run.stop();
    };
  }, [logo, word, out]);

  // The app stays inside the same wrapper after the animation, so it is never re-mounted.
  const app = (
    <Animated.View
      style={{
        flex: 1,
        opacity: out,
        transform: [{ scale: out.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }],
      }}>
      {children}
    </Animated.View>
  );

  return (
    <View style={{ flex: 1 }}>
      {app}
      {!done && (
        <Animated.View
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: NAVY,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: out.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 0.15, 0] }),
            },
          ]}>
          <Animated.View
            style={{
              opacity: logo.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }),
              transform: [
                { scale: logo.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
                { scale: out.interpolate({ inputRange: [0, 1], outputRange: [1, 7] }) },
              ],
            }}>
            <Logo size={120} />
          </Animated.View>
          <Animated.View
            style={{
              marginTop: 22,
              opacity: Animated.multiply(word, out.interpolate({ inputRange: [0, 0.3], outputRange: [1, 0], extrapolate: 'clamp' })),
              transform: [{ translateY: word.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
            }}>
            <Text kind="title" color="#ffffff" style={{ fontSize: 30, lineHeight: 36, letterSpacing: 0.5 }}>
              React App
            </Text>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}
