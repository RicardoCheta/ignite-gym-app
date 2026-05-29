import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme';

export function SkeletonBox({ width, height, style }: { width?: number | string; height: number; style?: any }) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[{ width: width ?? '100%', height, borderRadius: radius.md, backgroundColor: colors.surface, opacity }, style]}
    />
  );
}

export function ClassCardSkeleton() {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <SkeletonBox height={160} style={{ borderRadius: 0 }} />
      <View style={{ padding: spacing.md, gap: spacing.sm }}>
        <SkeletonBox height={14} width="40%" />
        <SkeletonBox height={20} width="70%" />
        <SkeletonBox height={14} width="50%" />
        <View style={{ flexDirection: 'row', gap: spacing.xs }}>
          <SkeletonBox height={28} width={80} />
          <SkeletonBox height={28} width={80} />
          <SkeletonBox height={28} width={80} />
        </View>
        <SkeletonBox height={40} />
      </View>
    </View>
  );
}

export function TrainerCardSkeleton() {
  const { colors } = useTheme();
  return (
    <View style={[styles.trainerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <SkeletonBox width={100} height={120} style={{ borderRadius: 0 }} />
      <View style={{ flex: 1, padding: spacing.md, gap: spacing.sm }}>
        <SkeletonBox height={20} width="60%" />
        <SkeletonBox height={14} width="80%" />
        <SkeletonBox height={12} width="90%" />
        <SkeletonBox height={12} width="70%" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: spacing.md, marginBottom: spacing.md, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1 },
  trainerCard: { marginHorizontal: spacing.md, marginBottom: spacing.sm, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, flexDirection: 'row' },
});
