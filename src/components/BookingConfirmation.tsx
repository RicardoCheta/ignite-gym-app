import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, fontSize, radius } from '../theme';

const { width, height } = Dimensions.get('window');

type Props = {
  session: { title: string; session_date: string; start_time: string; room: string };
  onDismiss: () => void;
};

export default function BookingConfirmation({ session, onDismiss }: Props) {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const circleScale = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(overlayOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(circleScale, { toValue: 1, tension: 70, friction: 6, useNativeDriver: true }),
      Animated.timing(checkOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(textY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
      Animated.delay(2000),
      Animated.timing(overlayOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => onDismiss());
  }, []);

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
      <Animated.View style={[styles.circle, { transform: [{ scale: circleScale }] }]}>
        <Animated.View style={{ opacity: checkOpacity }}>
          <Ionicons name="checkmark" size={64} color="#fff" />
        </Animated.View>
      </Animated.View>

      <Animated.View style={[styles.info, { opacity: textOpacity, transform: [{ translateY: textY }] }]}>
        <Text style={styles.enrolled}>You're enrolled!</Text>
        <Text style={styles.className}>{session.title}</Text>
        <Text style={styles.meta}>📅 {session.session_date}</Text>
        <Text style={styles.meta}>🕐 {session.start_time}  ·  📍 {session.room}</Text>
        <Text style={styles.reminder}>🔔 You'll be reminded 1 hour before</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute', width, height, zIndex: 998,
    backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center',
  },
  circle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#ff4d4d', alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  info: { alignItems: 'center', paddingHorizontal: spacing.xl },
  enrolled: { color: '#fff', fontSize: fontSize.xxl, fontWeight: '900', marginBottom: spacing.xs },
  className: { color: '#ff4d4d', fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.md },
  meta: { color: '#aaaaaa', fontSize: fontSize.sm, marginBottom: spacing.xs },
  reminder: { color: '#555', fontSize: fontSize.xs, marginTop: spacing.md },
});
