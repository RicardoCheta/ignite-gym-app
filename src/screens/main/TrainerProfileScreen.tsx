import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { getTrainer, API_BASE } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, radius } from '../../theme';

export default function TrainerProfileScreen({ route }: any) {
  const { id } = route.params;
  const { colors } = useTheme();
  const [trainer, setTrainer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrainer(id).then(r => setTrainer(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <ActivityIndicator color={colors.primary} style={{ flex: 1, backgroundColor: colors.background }} />;
  if (!trainer) return <Text style={{ color: colors.text, padding: spacing.lg }}>Trainer not found.</Text>;

  const initial = trainer.name?.[0]?.toUpperCase();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Profile card */}
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatarWrap, { backgroundColor: colors.surface }]}>
          {trainer.profile_photo ? (
            <Image source={{ uri: `${API_BASE}${trainer.profile_photo}` }} style={styles.avatar} />
          ) : (
            <Text style={styles.avatarInitial}>{initial}</Text>
          )}
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{trainer.name}</Text>
        {trainer.review_count > 0 && (
          <Text style={styles.rating}>★ {trainer.avg_rating} / 5 ({trainer.review_count} reviews)</Text>
        )}
        {trainer.specialization && (
          <Text style={[styles.spec, { color: colors.primary }]}>{trainer.specialization}</Text>
        )}
        {trainer.certifications && (
          <View style={[styles.infoBlock, { backgroundColor: colors.surface }]}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Certifications</Text>
            <Text style={[styles.infoText, { color: colors.text }]}>{trainer.certifications}</Text>
          </View>
        )}
        {trainer.bio && (
          <View style={[styles.infoBlock, { backgroundColor: colors.surface }]}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>About</Text>
            <Text style={[styles.infoText, { color: colors.text }]}>{trainer.bio}</Text>
          </View>
        )}
      </View>

      {/* Upcoming sessions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming Classes</Text>
        {trainer.sessions?.length === 0 ? (
          <Text style={{ color: colors.textMuted }}>No upcoming sessions.</Text>
        ) : trainer.sessions?.map((s: any) => (
          <View key={s.session_id} style={[styles.sessionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sessionHeader}>
              <Text style={[styles.sessionTitle, { color: colors.text }]}>{s.title}</Text>
              <Text style={[styles.sessionType, { color: colors.primary }]}>{s.type}</Text>
            </View>
            <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>📅 {s.session_date} · 🕐 {s.start_time} – {s.end_time}</Text>
            <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>📍 {s.room} · ⏱ {s.duration_minutes} min</Text>
            <Text style={{ color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 }}>
              {s.capacity - s.enrolled_count} spots left
            </Text>
          </View>
        ))}
      </View>

      {/* Reviews */}
      {trainer.reviews?.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Student Reviews</Text>
          {trainer.reviews.map((r: any, i: number) => (
            <View key={i} style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.reviewHeader}>
                <Text style={[styles.reviewerName, { color: colors.text }]}>{r.reviewer_name}</Text>
                <Text style={styles.stars}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</Text>
              </View>
              <Text style={{ color: colors.primary, fontSize: fontSize.xs, marginBottom: 4 }}>{r.class_title}</Text>
              {r.comment ? <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>{r.comment}</Text> : null}
              <Text style={{ color: colors.textMuted, fontSize: fontSize.xs, marginTop: 4 }}>{r.created_at?.slice(0, 10)}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileCard: { margin: spacing.md, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', borderWidth: 1 },
  avatarWrap: { width: 100, height: 100, borderRadius: 50, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  avatar: { width: 100, height: 100, resizeMode: 'cover' },
  avatarInitial: { fontSize: 40, fontWeight: '900', color: '#fff' },
  name: { fontSize: fontSize.xl, fontWeight: '900', marginBottom: 4 },
  rating: { color: '#f0a500', fontWeight: '700', fontSize: fontSize.sm, marginBottom: 4 },
  spec: { fontWeight: '700', fontSize: fontSize.sm, marginBottom: spacing.md },
  infoBlock: { width: '100%', borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm },
  infoLabel: { fontSize: fontSize.xs, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase' },
  infoText: { fontSize: fontSize.sm, lineHeight: 20 },
  section: { paddingHorizontal: spacing.md, marginBottom: spacing.md },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '800', marginBottom: spacing.sm },
  sessionCard: { borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, gap: 3 },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sessionTitle: { fontSize: fontSize.md, fontWeight: '700' },
  sessionType: { fontSize: fontSize.xs, fontWeight: '700', textTransform: 'capitalize' },
  reviewCard: { borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  reviewerName: { fontWeight: '700', fontSize: fontSize.sm },
  stars: { color: '#f0a500', fontSize: fontSize.sm },
});
