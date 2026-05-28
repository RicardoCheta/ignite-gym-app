import React, { useEffect, useRef } from 'react';
import { Text, Animated, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

type Props = { onFinish: () => void };

export default function AnimatedSplash({ onFinish }: Props) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(20)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // Faded logo background fades in
      Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      // Text slides up
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(textY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      // Hold
      Animated.delay(800),
      // Fade out entire screen
      Animated.timing(screenOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      {/* Full-screen faded logo background */}
      <Animated.Image
        source={require('../../assets/logo.png')}
        style={[styles.bgLogo, { opacity: logoOpacity }]}
        resizeMode="contain"
      />

      {/* Foreground text */}
      <Animated.View style={[styles.foreground, { opacity: textOpacity, transform: [{ translateY: textY }] }]}>
        <Text style={styles.name}>IGNITE</Text>
        <Text style={styles.sub}>GYM</Text>
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
  bgLogo: {
    position: 'absolute',
    width: width,
    height: width,
    opacity: 0.12,
  },
  foreground: {
    alignItems: 'center',
  },
  name: { fontSize: 52, fontWeight: '900', color: '#ff4d4d', letterSpacing: 8 },
  sub: { fontSize: 16, fontWeight: '700', color: '#aaaaaa', letterSpacing: 12, marginTop: -6 },
  tagline: { fontSize: 13, fontWeight: '500', color: '#666666', letterSpacing: 2, marginTop: 16 },
});
