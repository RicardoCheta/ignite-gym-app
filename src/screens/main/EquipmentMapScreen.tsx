import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { getEquipment } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, radius } from '../../theme';

const { width } = Dimensions.get('window');
const MAP_WIDTH = width - spacing.md * 2;

const STATUS_COLOR: Record<string, string> = {
  available: '#4caf50',
  occupied: '#ff9800',
  maintenance: '#666666',
};

type Equipment = { equipment_id: number; name: string; category: string; status: string; location: string };

const ZONES = [
  { id: 'cardio',      label: 'Cardio Area',    icon: '🏃', location: 'Main floor' },
  { id: 'strength',    label: 'Weights Area',   icon: '🏋️', location: 'Weights area' },
  { id: 'flexibility', label: 'Studio A',        icon: '🧘', location: 'Studio A' },
];

export default function EquipmentMapScreen() {
  const { colors } = useTheme();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selected, setSelected] = useState<Equipment | null>(null);
  const [lastUpdated, setLastUpdated] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await getEquipment();
      setEquipment(res.data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {}
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const getZoneEquipment = (location: string) =>
    equipment.filter(e => e.location?.toLowerCase() === location.toLowerCase());

  const available = equipment.filter(e => e.status === 'available').length;
  const occupied = equipment.filter(e => e.status === 'occupied').length;
  const maintenance = equipment.filter(e => e.status === 'maintenance').length;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <Text style={[styles.header, { color: colors.text }]}>Equipment Map</Text>
      {lastUpdated ? <Text style={[styles.updated, { color: colors.textMuted }]}>Updated at {lastUpdated}</Text> : null}

      {/* Legend */}
      <View style={[styles.legend, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {[
          { color: '#4caf50', label: 'Available', count: available },
          { color: '#ff9800', label: 'In Use',    count: occupied },
          { color: '#666666', label: 'Maintenance', count: maintenance },
        ].map(l => (
          <View key={l.label} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: l.color }]} />
            <Text style={[styles.legendLabel, { color: colors.textMuted }]}>{l.label}</Text>
            <Text style={[styles.legendCount, { color: colors.text }]}>{l.count}</Text>
          </View>
        ))}
      </View>

      {/* Floor map */}
      <View style={[styles.map, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {ZONES.map(zone => {
          const items = getZoneEquipment(zone.location);
          return (
            <View key={zone.id} style={[styles.zone, { borderColor: colors.border }]}>
              <Text style={[styles.zoneLabel, { color: colors.textMuted }]}>{zone.icon} {zone.label}</Text>
              <View style={styles.equipmentGrid}>
                {items.map(item => (
                  <TouchableOpacity
                    key={item.equipment_id}
                    style={[styles.equipmentDot, { backgroundColor: STATUS_COLOR[item.status] + '33', borderColor: STATUS_COLOR[item.status] }]}
                    onPress={() => setSelected(selected?.equipment_id === item.equipment_id ? null : item)}
                  >
                    <View style={[styles.dotInner, { backgroundColor: STATUS_COLOR[item.status] }]} />
                  </TouchableOpacity>
                ))}
              </View>
              {/* Selected tooltip */}
              {selected && items.find(i => i.equipment_id === selected.equipment_id) && (
                <View style={[styles.tooltip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.tooltipName, { color: colors.text }]}>{selected.name}</Text>
                  <Text style={[{ color: STATUS_COLOR[selected.status], fontSize: fontSize.xs, fontWeight: '700' }]}>
                    {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Equipment list below */}
      {ZONES.map(zone => {
        const items = getZoneEquipment(zone.location);
        return (
          <View key={zone.id} style={{ paddingHorizontal: spacing.md, marginBottom: spacing.md }}>
            <Text style={[styles.listHeader, { color: colors.text }]}>{zone.icon} {zone.label}</Text>
            {items.map(item => (
              <View key={item.equipment_id} style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.statusBar, { backgroundColor: STATUS_COLOR[item.status] }]} />
                <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.itemStatus, { color: STATUS_COLOR[item.status] }]}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
            ))}
          </View>
        );
      })}

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: fontSize.xxl, fontWeight: '900', padding: spacing.lg, paddingBottom: 4 },
  updated: { fontSize: fontSize.xs, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  legend: { flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: spacing.md, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  legendLabel: { fontSize: fontSize.xs },
  legendCount: { fontSize: fontSize.xs, fontWeight: '800' },
  map: { marginHorizontal: spacing.md, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, marginBottom: spacing.lg, gap: spacing.md },
  zone: { borderWidth: 1, borderRadius: radius.md, padding: spacing.sm, borderStyle: 'dashed' },
  zoneLabel: { fontSize: fontSize.xs, fontWeight: '700', marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 1 },
  equipmentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  equipmentDot: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  dotInner: { width: 16, height: 16, borderRadius: 8 },
  tooltip: { marginTop: spacing.sm, borderRadius: radius.sm, padding: spacing.sm, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between' },
  tooltipName: { fontSize: fontSize.sm, fontWeight: '600' },
  listHeader: { fontSize: fontSize.md, fontWeight: '800', marginBottom: spacing.sm },
  listItem: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.md, borderWidth: 1, marginBottom: spacing.xs, overflow: 'hidden' },
  statusBar: { width: 4, alignSelf: 'stretch' },
  itemName: { flex: 1, fontSize: fontSize.sm, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  itemStatus: { fontSize: fontSize.xs, fontWeight: '700', paddingRight: spacing.md },
});
