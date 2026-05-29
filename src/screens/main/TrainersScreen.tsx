import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, RefreshControl } from 'react-native';
import { getTrainers, API_BASE } from '../../services/api';
import { colors, spacing, fontSize, radius } from '../../theme';
import { TrainerCardSkeleton } from '../../components/SkeletonLoader';

export default function TrainersScreen({ navigation }: any) {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await getTrainers();
      setTrainers(res.data);
    } catch { } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
    >
      <Text style={styles.header}>Our Trainers</Text>
      <Text style={styles.sub}>Meet our certified fitness professionals</Text>

      {loading ? (
        [1, 2, 3].map(i => <TrainerCardSkeleton key={i} />)
      ) : trainers.map((t: any) => (
        <TouchableOpacity key={t.trainer_id} style={styles.card} onPress={() => navigation.navigate('TrainerProfile', { id: t.trainer_id })}>
          <View style={styles.avatar}>
            {t.profile_photo ? (
              <Image source={{ uri: `${API_BASE}${t.profile_photo}` }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarInitial}>{t.name[0].toUpperCase()}</Text>
            )}
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{t.name}</Text>
            {t.specialization ? <Text style={styles.spec}>{t.specialization}</Text> : null}
            {t.bio ? <Text style={styles.bio} numberOfLines={2}>{t.bio}</Text> : null}
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{t.session_count} upcoming sessions</Text>
              {t.review_count > 0 && (
                <Text style={styles.rating}>★ {t.avg_rating} ({t.review_count})</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}
      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '900', padding: spacing.lg, paddingBottom: 4 },
  sub: { color: colors.textMuted, fontSize: fontSize.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  card: { backgroundColor: colors.card, marginHorizontal: spacing.md, marginBottom: spacing.sm, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, flexDirection: 'row' },
  avatar: { width: 100, height: 120, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  avatarImg: { width: 100, height: 120, resizeMode: 'cover' },
  avatarInitial: { color: colors.text, fontSize: 36, fontWeight: '900' },
  info: { flex: 1, padding: spacing.md },
  name: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800', marginBottom: 2 },
  spec: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '700', marginBottom: spacing.xs },
  bio: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 16, marginBottom: spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  metaText: { color: colors.textMuted, fontSize: fontSize.xs },
  rating: { color: '#f0a500', fontSize: fontSize.xs, fontWeight: '700' },
});
