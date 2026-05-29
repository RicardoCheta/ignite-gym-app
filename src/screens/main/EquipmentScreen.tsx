import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEquipment } from '../../services/api';
import { colors, spacing, fontSize, radius } from '../../theme';
import { SkeletonBox } from '../../components/SkeletonLoader';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  available:   { label: 'Available',    color: '#4caf50', bg: '#112a11' },
  occupied:    { label: 'In Use',       color: '#ff9800', bg: '#2a1e11' },
  maintenance: { label: 'Maintenance',  color: '#aaaaaa', bg: '#1a1a1a' },
};

const CATEGORY_ICONS: Record<string, string> = {
  cardio: '🏃', strength: '🏋️', flexibility: '🤸',
};

export default function EquipmentScreen({ navigation }: any) {
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

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.header}>Equipment</Text>
          {lastUpdated ? <Text style={styles.updated}>Updated {lastUpdated} · auto-refreshes every 30s</Text> : null}
        </View>
        <TouchableOpacity style={styles.mapBtn} onPress={() => navigation.navigate('EquipmentMap')}>
          <Ionicons name="map-outline" size={18} color={colors.primary} />
          <Text style={styles.mapBtnText}>Map</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ paddingHorizontal: spacing.md, gap: spacing.sm }}>
          {[1, 2, 3, 4, 5].map(i => <SkeletonBox key={i} height={60} style={{ borderRadius: 12 }} />)}
        </View>
      ) : Object.entries(grouped).map(([category, items]) => (
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: spacing.lg },
  header: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '900', padding: spacing.lg, paddingBottom: 2 },
  updated: { color: colors.textMuted, fontSize: fontSize.xs, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  mapBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#2a1111', borderRadius: radius.full, paddingHorizontal: spacing.sm + 2, paddingVertical: 6 },
  mapBtnText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '700' },
  section: { paddingHorizontal: spacing.md, marginBottom: spacing.md },
  category: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800', marginBottom: spacing.sm },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLeft: { flex: 1 },
  itemName: { color: colors.text, fontSize: fontSize.md, fontWeight: '600' },
  itemLocation: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  badge: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  badgeText: { fontSize: fontSize.xs, fontWeight: '700' },
});
