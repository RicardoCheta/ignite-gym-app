import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, radius } from '../../theme';
import { API_BASE, getMyEnrollments } from '../../services/api';

const CLASS_TYPES = [
  { type: 'hiit',     label: 'HIIT',     emoji: '⚡', image: `${API_BASE}/images/hiit.jpg` },
  { type: 'yoga',     label: 'Yoga',     emoji: '🧘', image: `${API_BASE}/images/yoga.jpg` },
  { type: 'spinning', label: 'Spinning', emoji: '🚴', image: `${API_BASE}/images/spinning.jpg` },
  { type: 'pilates',  label: 'Pilates',  emoji: '🤸', image: `${API_BASE}/images/pilates.jpg` },
  { type: 'boxing',   label: 'Boxing',   emoji: '🥊', image: `${API_BASE}/images/boxing.jpg` },
];

function getCountdown(session: any): string {
  const dt = new Date(`${session.session_date}T${session.start_time}`);
  const diff = dt.getTime() - Date.now();
  if (diff <= 0) return 'Starting now!';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (d > 0) return `${d}d ${h}h ${m}m ${s}s`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [nextClass, setNextClass] = useState<any | null>(null);
  const [countdown, setCountdown] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (user?.role === 'member') {
      getMyEnrollments()
        .then(res => {
          const upcoming = res.data[0] ?? null;
          setNextClass(upcoming);
          if (upcoming) setCountdown(getCountdown(upcoming));
        })
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (!nextClass) return;
    intervalRef.current = setInterval(() => {
      setCountdown(getCountdown(nextClass));
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [nextClass]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <ImageBackground source={{ uri: `${API_BASE}/images/gym.jpg` }} style={[styles.hero, { backgroundColor: colors.card, borderBottomColor: colors.border }]} imageStyle={{ opacity: 0.35 }}>
        <Text style={[styles.heroEyebrow, { color: colors.primary }]}>Welcome to Ignite</Text>
        <Text style={[styles.heroTitle, { color: colors.text }]}>Transform Your Body,{'\n'}Transform Your Life</Text>
        <Text style={[styles.heroSub, { color: colors.textMuted }]}>World-class trainers, modern facilities, and classes for every level.</Text>
        <TouchableOpacity style={[styles.heroBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('Classes')}>
          <Text style={styles.heroBtnText}>Explore Classes</Text>
        </TouchableOpacity>
      </ImageBackground>

      {/* Next class countdown */}
      {nextClass && (
        <TouchableOpacity
          style={[styles.countdownCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate('Classes')}
          activeOpacity={0.85}
        >
          <View style={[styles.countdownAccent, { backgroundColor: colors.primary }]} />
          <View style={styles.countdownBody}>
            <Text style={[styles.countdownEyebrow, { color: colors.primary }]}>⏱ NEXT CLASS</Text>
            <Text style={[styles.countdownTitle, { color: colors.text }]} numberOfLines={1}>{nextClass.title}</Text>
            <Text style={[styles.countdownMeta, { color: colors.textMuted }]}>
              📅 {nextClass.session_date}  ·  🕐 {nextClass.start_time}  ·  📍 {nextClass.room}
            </Text>
          </View>
          <View style={styles.countdownRight}>
            <Text style={[styles.countdownTimer, { color: colors.primary }]}>{countdown}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </View>
        </TouchableOpacity>
      )}

      {/* Stats strip */}
      <View style={[styles.statsStrip, { backgroundColor: colors.surface }]}>
        {[
          { label: '5', sub: 'Class Types' },
          { label: '3', sub: 'Trainers' },
          { label: '12+', sub: 'Equipment' },
          { label: '★', sub: 'Reviews' },
        ].map((s, i) => (
          <View key={i} style={styles.stat}>
            <Text style={[styles.statNum, { color: colors.primary }]}>{s.label}</Text>
            <Text style={[styles.statSub, { color: colors.textMuted }]}>{s.sub}</Text>
          </View>
        ))}
      </View>

      {/* Class types */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Classes</Text>
        <View style={styles.classGrid}>
          {CLASS_TYPES.map(c => (
            <TouchableOpacity
              key={c.type}
              style={styles.classChip}
              onPress={() => navigation.navigate('Classes', { type: c.type })}
            >
              <ImageBackground source={{ uri: c.image }} style={styles.classChipImage} imageStyle={{ borderRadius: radius.md }}>
                <View style={styles.classChipOverlay}>
                  <Text style={styles.classEmoji}>{c.emoji}</Text>
                  <Text style={styles.classLabel}>{c.label}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick links */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Access</Text>
        <View style={styles.quickLinks}>
          {[
            { label: 'Our Trainers', icon: '🏋️', screen: 'Trainers' },
            { label: 'Equipment', icon: '⚙️', screen: 'Equipment' },
            { label: 'My Profile', icon: '👤', screen: 'Profile' },
          ].map(q => (
            <TouchableOpacity key={q.screen} style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => navigation.navigate(q.screen)}>
              <Text style={styles.quickIcon}>{q.icon}</Text>
              <Text style={[styles.quickLabel, { color: colors.text }]}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { padding: spacing.lg, paddingTop: spacing.xl, borderBottomWidth: 1 },
  heroEyebrow: { fontSize: fontSize.sm, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: spacing.xs },
  heroTitle: { fontSize: fontSize.xxl, fontWeight: '900', lineHeight: 34, marginBottom: spacing.sm },
  heroSub: { fontSize: fontSize.sm, marginBottom: spacing.lg, lineHeight: 20 },
  heroBtn: { borderRadius: radius.md, paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.lg, alignSelf: 'flex-start' },
  heroBtnText: { color: '#fff', fontWeight: '700', fontSize: fontSize.md },

  countdownCard: {
    marginHorizontal: spacing.md, marginTop: spacing.md,
    borderRadius: radius.lg, borderWidth: 1,
    flexDirection: 'row', alignItems: 'center', overflow: 'hidden',
  },
  countdownAccent: { width: 4, alignSelf: 'stretch' },
  countdownBody: { flex: 1, padding: spacing.md, gap: 3 },
  countdownEyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  countdownTitle: { fontSize: fontSize.md, fontWeight: '800' },
  countdownMeta: { fontSize: fontSize.xs },
  countdownRight: { paddingRight: spacing.md, alignItems: 'flex-end', gap: 4 },
  countdownTimer: { fontSize: fontSize.sm, fontWeight: '900', fontVariant: ['tabular-nums'] },

  statsStrip: { flexDirection: 'row', paddingVertical: spacing.md, marginTop: spacing.md },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: fontSize.xl, fontWeight: '900' },
  statSub: { fontSize: fontSize.xs, marginTop: 2 },
  section: { padding: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '800', marginBottom: spacing.md },
  classGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  classChip: { borderRadius: radius.md, overflow: 'hidden', width: '30%', flexGrow: 1, height: 90 },
  classChipImage: { width: '100%', height: '100%' },
  classChipOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', borderRadius: radius.md },
  classEmoji: { fontSize: 24, marginBottom: 2 },
  classLabel: { color: '#fff', fontWeight: '700', fontSize: fontSize.sm },
  quickLinks: { flexDirection: 'row', gap: spacing.sm },
  quickCard: { flex: 1, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', borderWidth: 1 },
  quickIcon: { fontSize: 28, marginBottom: spacing.xs },
  quickLabel: { fontWeight: '600', fontSize: fontSize.xs, textAlign: 'center' },
});
