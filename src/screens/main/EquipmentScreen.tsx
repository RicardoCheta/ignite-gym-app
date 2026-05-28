import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { getEquipment } from '../../services/api';
import { colors, spacing, fontSize, radius } from '../../theme';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  available:   { label: 'Available',    color: '#4caf50', bg: '#112a11' },
  occupied:    { label: 'In Use',       color: '#ff9800', bg: '#2a1e11' },
  maintenance: { label: 'Maintenance',  color: '#aaaaaa', bg: '#1a1a1a' },
};

const CATEGORY_ICONS: Record<string, string> = {
  cardio: '🏃', strength: '🏋️', flexibility: '🤸',
};

export default function EquipmentScreen() {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await getEquipment();
      setEquipment(res.data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch { } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const grouped = equipment.reduce((acc: Record<string, any[]>, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  if (loading) return <ActivityIndicator color={colors.primary} style={{ flex: 1, backgroundColor: colors.background }} />;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
    >
      <Text style={styles.header}>Equipment</Text>
      {lastUpdated ? <Text style={styles.updated}>Last updated at {lastUpdated} · auto-refreshes every 30s</Text> : null}

      {Object.entries(grouped).map(([category, items]) => (
        <View key={category} style={styles.section}>
          <Text style={styles.category}>
            {CATEGORY_ICONS[category] || '🏠'} {category.charAt(0).toUpperCase() + category.slice(1)}
          </Text>
          {items.map((item: any) => {
            const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.available;
            return (
              <View key={item.equipment_id} style={styles.card}>
                <View style={styles.cardLeft}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.location ? <Text style={styles.itemLocation}>📍 {item.location}</Text> : null}
                </View>
                <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
                  <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              </View>
            );
          })}
        </View>
      ))}
      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '900', padding: spacing.lg, paddingBottom: 4 },
  updated: { color: colors.textMuted, fontSize: fontSize.xs, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  section: { paddingHorizontal: spacing.md, marginBottom: spacing.md },
  category: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800', marginBottom: spacing.sm },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLeft: { flex: 1 },
  itemName: { color: colors.text, fontSize: fontSize.md, fontWeight: '600' },
  itemLocation: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  badge: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  badgeText: { fontSize: fontSize.xs, fontWeight: '700' },
});
