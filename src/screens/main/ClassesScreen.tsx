import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, Image,
} from 'react-native';
import { getClasses, enrollClass, cancelEnrollment, API_BASE } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, fontSize, radius } from '../../theme';
import { ClassCardSkeleton } from '../../components/SkeletonLoader';
import BookingConfirmation from '../../components/BookingConfirmation';
import { scheduleClassNotification } from '../../services/notifications';

const CLASS_IMAGES: Record<string, string> = {
  hiit: `${API_BASE}/images/hiit.jpg`,
  yoga: `${API_BASE}/images/yoga.jpg`,
  spinning: `${API_BASE}/images/spinning.jpg`,
  pilates: `${API_BASE}/images/pilates.jpg`,
  boxing: `${API_BASE}/images/boxing.jpg`,
};

const TYPE_LABELS: Record<string, string> = {
  hiit: '⚡ HIIT', yoga: '🧘 Yoga', spinning: '🚴 Spinning',
  pilates: '🤸 Pilates', boxing: '🥊 Boxing',
};

export default function ClassesScreen({ navigation }: any) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('');
  const [message, setMessage] = useState('');
  const [confirmedSession, setConfirmedSession] = useState<any | null>(null);

  const load = async () => {
    try {
      const res = await getClasses(filter ? { type: filter } : undefined);
      setSessions(res.data);
    } catch { } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const handleEnroll = async (session: any) => {
    try {
      await enrollClass(session.session_id);
      await scheduleClassNotification(session);
      setConfirmedSession(session);
      load();
    } catch (e: any) {
      setMessage(e.response?.data?.message || 'Could not enroll.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleCancel = async (sessionId: number) => {
    try {
      await cancelEnrollment(sessionId);
      setMessage('Enrollment cancelled.');
      load();
    } catch { }
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <>
    {confirmedSession && (
      <BookingConfirmation
        session={confirmedSession}
        onDismiss={() => setConfirmedSession(null)}
      />
    )}
    <View style={styles.container}>
      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {['', 'hiit', 'yoga', 'spinning', 'pilates', 'boxing'].map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.chip, filter === t && styles.chipActive]}
            onPress={() => setFilter(t)}
          >
            <Text style={[styles.chipText, filter === t && styles.chipTextActive]}>
              {t ? TYPE_LABELS[t] : 'All'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      {loading ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {[1, 2, 3].map(i => <ClassCardSkeleton key={i} />)}
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
        >
          {sessions.length === 0 ? (
            <Text style={styles.empty}>No sessions found.</Text>
          ) : sessions.map((s: any) => {
            const spots = s.capacity - s.enrolled_count;
            return (
              <TouchableOpacity key={s.session_id} style={styles.card} onPress={() => navigation.navigate('ClassDetail', { session: s })} activeOpacity={0.9}>
                {CLASS_IMAGES[s.type] && (
                  <Image source={{ uri: CLASS_IMAGES[s.type] }} style={styles.cardImage} />
                )}
                <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{TYPE_LABELS[s.type] || s.type}</Text>
                  </View>
                  <View style={[styles.spotsBadge, { backgroundColor: spots <= 0 ? '#3a1111' : spots <= 3 ? '#3a2a11' : '#112a11' }]}>
                    <Text style={[styles.spotsText, { color: spots <= 0 ? colors.primary : spots <= 3 ? '#ff9800' : '#4caf50' }]}>
                      {spots <= 0 ? 'Full' : `${spots} spots`}
                    </Text>
                  </View>
                </View>

                <Text style={styles.title}>{s.title}</Text>
                <Text style={styles.trainer}>with {s.trainer_name}</Text>

                <View style={styles.meta}>
                  <Text style={styles.metaItem}>📅 {s.session_date}</Text>
                  <Text style={styles.metaItem}>🕐 {s.start_time} – {s.end_time}</Text>
                  <Text style={styles.metaItem}>📍 {s.room}</Text>
                  <Text style={styles.metaItem}>⏱ {s.duration_minutes} min</Text>
                </View>

                {user?.role === 'member' && (
                  s.user_enrolled ? (
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(s.session_id)}>
                      <Text style={styles.cancelBtnText}>Cancel Enrollment</Text>
                    </TouchableOpacity>
                  ) : spots > 0 ? (
                    <TouchableOpacity style={styles.enrollBtn} onPress={() => handleEnroll(s)}>
                      <Text style={styles.enrollBtnText}>Enroll</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.fullTag}><Text style={styles.fullTagText}>Class Full</Text></View>
                  )
                )}
                </View>
              </TouchableOpacity>
            );
          })}
          <View style={{ height: spacing.xl }} />
        </ScrollView>
      )}
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filterRow: { maxHeight: 52, borderBottomWidth: 1, borderBottomColor: colors.border },
  filterContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, gap: spacing.sm, paddingVertical: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  message: { backgroundColor: '#112a11', color: '#4caf50', padding: spacing.sm, margin: spacing.md, borderRadius: radius.sm, fontSize: fontSize.sm },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 60, fontSize: fontSize.md },
  card: { backgroundColor: colors.card, margin: spacing.md, marginBottom: 0, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  cardImage: { width: '100%', height: 160, resizeMode: 'cover' },
  cardBody: { padding: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  typeBadge: { backgroundColor: '#2a1111', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  typeBadgeText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '700' },
  spotsBadge: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  spotsText: { fontSize: fontSize.xs, fontWeight: '700' },
  title: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800', marginBottom: 2 },
  trainer: { color: colors.textMuted, fontSize: fontSize.sm, marginBottom: spacing.sm },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  metaItem: { color: colors.textMuted, fontSize: fontSize.xs, backgroundColor: colors.surface, paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.sm },
  enrollBtn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center' },
  enrollBtnText: { color: '#fff', fontWeight: '700', fontSize: fontSize.sm },
  cancelBtn: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  cancelBtnText: { color: colors.textMuted, fontWeight: '700', fontSize: fontSize.sm },
  fullTag: { backgroundColor: '#1a1a1a', borderRadius: radius.md, padding: spacing.sm, alignItems: 'center' },
  fullTagText: { color: colors.textMuted, fontSize: fontSize.sm },
});
