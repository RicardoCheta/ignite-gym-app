import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import { submitReview } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, radius } from '../../theme';

export default function ReviewScreen({ route, navigation }: any) {
  const { session } = route.params;
  const { colors } = useTheme();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { Alert.alert('Please select a rating.'); return; }
    setLoading(true);
    try {
      await submitReview(session.session_id, rating, comment);
      Alert.alert('Review submitted!', '', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Could not submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.classCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.classTitle, { color: colors.text }]}>{session.title}</Text>
        <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>📅 {session.session_date}</Text>
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Your Rating</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map(i => (
          <TouchableOpacity key={i} onPress={() => setRating(i)}>
            <Text style={[styles.star, { color: i <= rating ? '#f0a500' : colors.border }]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Comment (optional)</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        value={comment}
        onChangeText={setComment}
        placeholder="Share your experience..."
        placeholderTextColor={colors.textMuted}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.btnText}>{loading ? 'Submitting...' : 'Submit Review'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  classCard: { borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1 },
  classTitle: { fontSize: fontSize.lg, fontWeight: '800', marginBottom: 4 },
  label: { fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.sm },
  stars: { flexDirection: 'row', marginBottom: spacing.lg, gap: spacing.sm },
  star: { fontSize: 40 },
  input: { borderRadius: radius.md, padding: spacing.md, fontSize: fontSize.md, borderWidth: 1, minHeight: 120, marginBottom: spacing.lg },
  btn: { borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: fontSize.md },
});
