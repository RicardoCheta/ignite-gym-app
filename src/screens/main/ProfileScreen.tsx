import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { getProfile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, fontSize, radius } from '../../theme';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile().then(res => setProfile(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color={colors.primary} style={{ flex: 1, backgroundColor: colors.background }} />;

  const initial = user?.name?.[0]?.toUpperCase() ?? '?';
  const roleBadge = { member: '🏃 Member', trainer: '🏋️ Trainer', admin: '⚙️ Admin' }[user?.role ?? 'member'];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.username}>@{user?.username}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{roleBadge}</Text>
        </View>
      </View>

      {/* Enrollments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Enrollments</Text>
        {profile?.enrollments?.length === 0 ? (
          <Text style={styles.empty}>No upcoming classes enrolled.</Text>
        ) : profile?.enrollments?.map((e: any) => (
          <View key={e.session_id} style={styles.card}>
            <Text style={styles.cardTitle}>{e.title}</Text>
            <Text style={styles.cardSub}>📅 {e.session_date} · 🕐 {e.start_time} – {e.end_time}</Text>
            <Text style={styles.cardSub}>👤 {e.trainer_name} · 📍 {e.room}</Text>
          </View>
        ))}
      </View>

      {/* Past classes */}
      {profile?.pastClasses?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Past Classes</Text>
          {profile.pastClasses.map((e: any) => (
            <View key={e.session_id} style={styles.card}>
              <Text style={styles.cardTitle}>{e.title}</Text>
              <Text style={styles.cardSub}>📅 {e.session_date}</Text>
              <TouchableOpacity
                style={styles.reviewBtn}
                onPress={() => navigation.navigate('Review', { session: e })}
              >
                <Text style={styles.reviewBtnText}>
                  {e.has_review ? 'Edit Review' : 'Leave a Review'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Logout */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  profileCard: { backgroundColor: colors.card, padding: spacing.xl, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: '900' },
  name: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800', marginBottom: 2 },
  username: { color: colors.textMuted, fontSize: fontSize.sm, marginBottom: spacing.sm },
  roleBadge: { backgroundColor: '#2a1111', borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 4 },
  roleBadgeText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '700' },
  section: { padding: spacing.lg, paddingBottom: 0 },
  sectionTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800', marginBottom: spacing.md },
  empty: { color: colors.textMuted, fontSize: fontSize.sm },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  cardTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: 4 },
  cardSub: { color: colors.textMuted, fontSize: fontSize.xs, marginBottom: 2 },
  reviewBtn: { marginTop: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.sm, padding: spacing.sm, alignItems: 'center' },
  reviewBtnText: { color: '#fff', fontWeight: '700', fontSize: fontSize.xs },
  logoutBtn: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  logoutText: { color: colors.primary, fontWeight: '700', fontSize: fontSize.md },
});
