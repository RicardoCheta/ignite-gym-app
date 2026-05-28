import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { updateProfile, API_BASE } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, radius } from '../../theme';

export default function EditProfileScreen({ navigation }: any) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [photo, setPhoto] = useState<string | null>(user?.profile_photo ? `${API_BASE}${user.profile_photo}` : null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({ name, email });
      Alert.alert('Profile updated!', '', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Could not update profile.');
    } finally { setLoading(false); }
  };

  const initial = user?.name?.[0]?.toUpperCase() ?? '?';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Photo picker */}
      <TouchableOpacity style={styles.photoWrap} onPress={pickImage}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photo} />
        ) : (
          <View style={[styles.photoPlaceholder, { backgroundColor: colors.primary }]}>
            <Text style={styles.photoInitial}>{initial}</Text>
          </View>
        )}
        <View style={[styles.photoEdit, { backgroundColor: colors.primary }]}>
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Edit</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textMuted }]}>Full Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          value={name} onChangeText={setName}
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textMuted }]}>Email</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          value={email} onChangeText={setEmail}
          keyboardType="email-address" autoCapitalize="none"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
        onPress={handleSave} disabled={loading}
      >
        <Text style={styles.btnText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, alignItems: 'center' },
  photoWrap: { marginBottom: spacing.xl, position: 'relative' },
  photo: { width: 100, height: 100, borderRadius: 50 },
  photoPlaceholder: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  photoInitial: { color: '#fff', fontSize: 40, fontWeight: '900' },
  photoEdit: { position: 'absolute', bottom: 0, right: 0, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 4 },
  field: { width: '100%', marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: '600', marginBottom: spacing.xs },
  input: { borderRadius: radius.md, padding: spacing.md, fontSize: fontSize.md, borderWidth: 1 },
  btn: { width: '100%', borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  btnText: { color: '#fff', fontWeight: '700', fontSize: fontSize.md },
});
