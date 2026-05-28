import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

type Props = { onFinish: () => void };

export default function AnimatedSplash({ onFinish }: Props) {
  const flameScale = useRef(new Animated.Value(0)).current;
  const flameOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(20)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // Flame appears and grows
      Animated.parallel([
        Animated.spring(flameScale, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
        Animated.timing(flameOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      // Text slides up
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(textY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      // Hold
      Animated.delay(700),
      // Fade out entire screen
      Animated.timing(screenOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <Animated.Text
        style={[styles.flame, { opacity: flameOpacity, transform: [{ scale: flameScale }] }]}
      >
        🔥
      </Animated.Text>
      <Animated.View style={{ opacity: textOpacity, transform: [{ translateY: textY }] }}>
        <Text style={styles.logo}>IGNITE</Text>
        <Text style={styles.sub}>GYM</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', width, height, zIndex: 999,
    backgroundColor: '#111111', alignItems: 'center', justifyContent: 'center',
  },
  flame: { fontSize: 80, marginBottom: 16 },
  logo: { fontSize: 48, fontWeight: '900', color: '#ff4d4d', letterSpacing: 8, textAlign: 'center' },
  sub: { fontSize: 16, fontWeight: '700', color: '#aaaaaa', letterSpacing: 10, textAlign: 'center', marginTop: -4 },
});
