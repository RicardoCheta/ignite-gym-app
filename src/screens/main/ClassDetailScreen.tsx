import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { enrollClass, cancelEnrollment, API_BASE } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, radius } from '../../theme';
import { scheduleClassNotification } from '../../services/notifications';
import BookingConfirmation from '../../components/BookingConfirmation';

const CLASS_IMAGES: Record<string, string> = {
  hiit: `${API_BASE}/images/hiit.jpg`,
  yoga: `${API_BASE}/images/yoga.jpg`,
  spinning: `${API_BASE}/images/spinning.jpg`,
  pilates: `${API_BASE}/images/pilates.jpg`,
  boxing: `${API_BASE}/images/boxing.jpg`,
};

export default function ClassDetailScreen({ route, navigation }: any) {
  const { session } = route.params;
  const { user } = useAuth();
  const { colors } = useTheme();
  const [enrolled, setEnrolled] = useState(!!session.user_enrolled);
  const [spots, setSpots] = useState(session.capacity - session.enrolled_count);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleEnroll = async () => {
    setLoading(true);
    try {
      await enrollClass(session.session_id);
      await scheduleClassNotification(session);
      setEnrolled(true);
      setSpots(s => s - 1);
      setShowConfirmation(true);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Could not enroll.');
    } finally { setLoading(false); }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await cancelEnrollment(session.session_id);
      setEnrolled(false);
      setSpots(s => s + 1);
    } catch { } finally { setLoading(false); }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: CLASS_IMAGES[session.type] }} style={styles.image} />

        <View style={styles.content}>
          <View style={styles.row}>
            <View style={[styles.typeBadge, { backgroundColor: '#2a1111' }]}>
              <Text style={[styles.typeText, { color: colors.primary }]}>{session.type?.toUpperCase()}</Text>
            </View>
            <View style={[styles.spotsBadge, { backgroundColor: spots <= 0 ? '#3a1111' : spots <= 3 ? '#3a2a11' : '#112a11' }]}>
              <Text style={{ color: spots <= 0 ? colors.primary : spots <= 3 ? '#ff9800' : '#4caf50', fontSize: fontSize.xs, fontWeight: '700' }}>
                {spots <= 0 ? 'Full' : `${spots} spots left`}
              </Text>
            </View>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{session.title}</Text>
          <Text style={[styles.trainer, { color: colors.textMuted }]}>with {session.trainer_name}</Text>
          {session.description ? <Text style={[styles.description, { color: colors.textMuted }]}>{session.description}</Text> : null}

          <View style={[styles.metaGrid, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {[
              { icon: '📅', label: 'Date', value: session.session_date },
              { icon: '🕐', label: 'Time', value: `${session.start_time} – ${session.end_time}` },
              { icon: '📍', label: 'Room', value: session.room },
              { icon: '⏱', label: 'Duration', value: `${session.duration_minutes} min` },
            ].map(m => (
              <View key={m.label} style={styles.metaItem}>
                <Text style={{ fontSize: 20 }}>{m.icon}</Text>
                <Text style={[styles.metaLabel, { color: colors.textMuted }]}>{m.label}</Text>
                <Text style={[styles.metaValue, { color: colors.text }]}>{m.value}</Text>
              </View>
            ))}
          </View>

          {user?.role === 'member' && (
            enrolled ? (
              <TouchableOpacity style={[styles.btn, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]} onPress={handleCancel} disabled={loading}>
                <Text style={{ color: colors.textMuted, fontWeight: '700', fontSize: fontSize.md }}>Cancel Enrollment</Text>
              </TouchableOpacity>
            ) : spots > 0 ? (
              <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleEnroll} disabled={loading}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: fontSize.md }}>{loading ? 'Enrolling...' : 'Enroll Now'}</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.btn, { backgroundColor: colors.surface }]}>
                <Text style={{ color: colors.textMuted, fontWeight: '700', fontSize: fontSize.md }}>Class Full</Text>
              </View>
            )
          )}
        </View>
      </ScrollView>

      {showConfirmation && (
        <BookingConfirmation session={session} onDismiss={() => setShowConfirmation(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },
  image: { width: '100%', height: 240, resizeMode: 'cover' },
  content: { padding: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  typeBadge: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  typeText: { fontSize: fontSize.xs, fontWeight: '800', letterSpacing: 1 },
  spotsBadge: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  title: { fontSize: fontSize.xxl, fontWeight: '900', marginBottom: 4 },
  trainer: { fontSize: fontSize.md, marginBottom: spacing.sm },
  description: { fontSize: fontSize.sm, lineHeight: 22, marginBottom: spacing.lg },
  metaGrid: { borderRadius: radius.lg, padding: spacing.md, flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.lg, borderWidth: 1, gap: spacing.md },
  metaItem: { width: '45%', alignItems: 'center', gap: 2 },
  metaLabel: { fontSize: fontSize.xs },
  metaValue: { fontSize: fontSize.sm, fontWeight: '700' },
  btn: { borderRadius: radius.md, padding: spacing.md + 2, alignItems: 'center', marginBottom: spacing.md },
});
