import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, radius } from '../../theme';

const GOALS = [
  {
    id: 'fat_loss',
    label: 'Burn Fat',
    description: 'Shed weight with high-energy cardio sessions',
    icon: 'flame' as const,
    classes: ['HIIT', 'Spinning', 'Boxing'],
  },
  {
    id: 'muscle',
    label: 'Build Muscle',
    description: 'Gain strength and build lean muscle mass',
    icon: 'barbell' as const,
    classes: ['Boxing', 'HIIT', 'Pilates'],
  },
  {
    id: 'flexibility',
    label: 'Flexibility',
    description: 'Improve mobility and reduce injury risk',
    icon: 'body' as const,
    classes: ['Yoga', 'Pilates'],
  },
  {
    id: 'endurance',
    label: 'Endurance',
    description: 'Boost stamina and cardiovascular fitness',
    icon: 'pulse' as const,
    classes: ['Spinning', 'HIIT', 'Boxing'],
  },
];

export default function GoalsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!selected) return;
    await AsyncStorage.setItem('fitness_goal', selected);
    navigation.replace('Main');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>What's your goal?</Text>
      <Text style={[styles.sub, { color: colors.textMuted }]}>We'll suggest the best classes for you</Text>

      <View style={styles.grid}>
        {GOALS.map(goal => {
          const active = selected === goal.id;
          return (
            <TouchableOpacity
              key={goal.id}
              style={[styles.card, { backgroundColor: active ? '#2a1111' : colors.card, borderColor: active ? colors.primary : colors.border }]}
              onPress={() => setSelected(goal.id)}
            >
              <Ionicons name={goal.icon} size={36} color={active ? colors.primary : colors.textMuted} style={{ marginBottom: spacing.sm }} />
              <Text style={[styles.cardLabel, { color: active ? colors.primary : colors.text }]}>{goal.label}</Text>
              <Text style={[styles.cardDesc, { color: colors.textMuted }]}>{goal.description}</Text>
              <View style={styles.tags}>
                {goal.classes.map(c => (
                  <View key={c} style={[styles.tag, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.tagText, { color: colors.textMuted }]}>{c}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: selected ? colors.primary : colors.surface, opacity: selected ? 1 : 0.5 }]}
        onPress={handleContinue}
        disabled={!selected}
      >
        <Text style={[styles.btnText, { color: selected ? '#fff' : colors.textMuted }]}>Let's Go</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.replace('Main')} style={{ marginTop: spacing.md }}>
        <Text style={[styles.skip, { color: colors.textMuted }]}>Skip for now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingTop: spacing.xl },
  title: { fontSize: fontSize.xxl, fontWeight: '900', marginBottom: spacing.xs },
  sub: { fontSize: fontSize.md, marginBottom: spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl },
  card: { width: '47%', borderRadius: radius.lg, padding: spacing.md, borderWidth: 2, alignItems: 'center' },
  cardLabel: { fontSize: fontSize.lg, fontWeight: '800', marginBottom: spacing.xs },
  cardDesc: { fontSize: fontSize.xs, textAlign: 'center', marginBottom: spacing.sm, lineHeight: 16 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' },
  tag: { borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { fontSize: 10, fontWeight: '600' },
  btn: { borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  btnText: { fontWeight: '800', fontSize: fontSize.lg },
  skip: { textAlign: 'center', fontSize: fontSize.sm },
});
