import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions, Image } from 'react-native';

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
      // Logo appears and grows
      Animated.parallel([
        Animated.spring(flameScale, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
        Animated.timing(flameOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      // Tagline slides up
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(textY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      // Hold
      Animated.delay(700),
      // Fade out
      Animated.timing(screenOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <Animated.Image
        source={require('../../assets/logo.png')}
        style={[styles.logo, { opacity: flameOpacity, transform: [{ scale: flameScale }] }]}
        resizeMode="contain"
      />
      <Animated.View style={{ opacity: textOpacity, transform: [{ translateY: textY }] }}>
        <Text style={styles.tagline}>Train Harder. Ignite Further.</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', width, height, zIndex: 999,
    backgroundColor: '#111111', alignItems: 'center', justifyContent: 'center',
  },
  logo: { width: 260, height: 260 },
  tagline: { fontSize: 14, fontWeight: '600', color: '#aaaaaa', letterSpacing: 2, textAlign: 'center' },
});
