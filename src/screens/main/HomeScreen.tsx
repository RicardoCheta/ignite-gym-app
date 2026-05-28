import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, fontSize, radius } from '../../theme';

const CLASS_TYPES = [
  { type: 'hiit', label: 'HIIT', emoji: '⚡' },
  { type: 'yoga', label: 'Yoga', emoji: '🧘' },
  { type: 'spinning', label: 'Spinning', emoji: '🚴' },
  { type: 'pilates', label: 'Pilates', emoji: '🤸' },
  { type: 'boxing', label: 'Boxing', emoji: '🥊' },
];

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>Welcome to Ignite</Text>
        <Text style={styles.heroTitle}>Transform Your Body,{'\n'}Transform Your Life</Text>
        <Text style={styles.heroSub}>World-class trainers, modern facilities, and classes for every level.</Text>
        <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.navigate('Classes')}>
          <Text style={styles.heroBtnText}>Explore Classes</Text>
        </TouchableOpacity>
      </View>

      {/* Stats strip */}
      <View style={styles.statsStrip}>
        {[
          { label: '5', sub: 'Class Types' },
          { label: '3', sub: 'Trainers' },
          { label: '12+', sub: 'Equipment' },
          { label: '★', sub: 'Reviews' },
        ].map((s, i) => (
          <View key={i} style={styles.stat}>
            <Text style={styles.statNum}>{s.label}</Text>
            <Text style={styles.statSub}>{s.sub}</Text>
          </View>
        ))}
      </View>

      {/* Class types */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Classes</Text>
        <View style={styles.classGrid}>
          {CLASS_TYPES.map(c => (
            <TouchableOpacity
              key={c.type}
              style={styles.classChip}
              onPress={() => navigation.navigate('Classes', { type: c.type })}
            >
              <Text style={styles.classEmoji}>{c.emoji}</Text>
              <Text style={styles.classLabel}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick links */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.quickLinks}>
          {[
            { label: 'Our Trainers', icon: '🏋️', screen: 'Trainers' },
            { label: 'Equipment', icon: '⚙️', screen: 'Equipment' },
            { label: 'My Profile', icon: '👤', screen: 'Profile' },
          ].map(q => (
            <TouchableOpacity key={q.screen} style={styles.quickCard} onPress={() => navigation.navigate(q.screen)}>
              <Text style={styles.quickIcon}>{q.icon}</Text>
              <Text style={styles.quickLabel}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { backgroundColor: colors.card, padding: spacing.lg, paddingTop: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border },
  heroEyebrow: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: spacing.xs },
  heroTitle: { fontSize: fontSize.xxl, fontWeight: '900', color: colors.text, lineHeight: 34, marginBottom: spacing.sm },
  heroSub: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.lg, lineHeight: 20 },
  heroBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.lg, alignSelf: 'flex-start' },
  heroBtnText: { color: '#fff', fontWeight: '700', fontSize: fontSize.md },
  statsStrip: { flexDirection: 'row', backgroundColor: colors.surface, paddingVertical: spacing.md },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { color: colors.primary, fontSize: fontSize.xl, fontWeight: '900' },
  statSub: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  section: { padding: spacing.lg },
  sectionTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800', marginBottom: spacing.md },
  classGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  classChip: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', width: '30%', flexGrow: 1, borderWidth: 1, borderColor: colors.border },
  classEmoji: { fontSize: 28, marginBottom: spacing.xs },
  classLabel: { color: colors.text, fontWeight: '700', fontSize: fontSize.sm },
  quickLinks: { flexDirection: 'row', gap: spacing.sm },
  quickCard: { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  quickIcon: { fontSize: 28, marginBottom: spacing.xs },
  quickLabel: { color: colors.text, fontWeight: '600', fontSize: fontSize.xs, textAlign: 'center' },
});
