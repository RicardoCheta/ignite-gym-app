import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, fontSize, radius } from '../../theme';

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: string) => (val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    if (!form.name || !form.username || !form.email || !form.password) {
      setError('Please fill in all fields.'); return;
    }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    setError('');
    setLoading(true);
    try {
      await register({ name: form.name, username: form.username, email: form.email, password: form.password });
    } catch (e: any) {
      setError(e.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>IGNITE</Text>
          <Text style={styles.logoSub}>GYM</Text>
        </View>

        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Join Ignite — it's free</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {[
          { key: 'name', label: 'Full Name', placeholder: 'Maria Santos' },
          { key: 'username', label: 'Username', placeholder: 'maria_s', auto: 'none' as const },
          { key: 'email', label: 'Email', placeholder: 'maria@email.com', keyboard: 'email-address' as const },
          { key: 'password', label: 'Password', placeholder: 'Min. 6 characters', secure: true, content: 'none' as const },
          { key: 'confirm', label: 'Confirm Password', placeholder: 'Repeat password', secure: true, content: 'none' as const },
        ].map(f => (
          <View key={f.key} style={styles.field}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput
              style={styles.input}
              value={(form as any)[f.key]}
              onChangeText={set(f.key)}
              placeholder={f.placeholder}
              placeholderTextColor={colors.textMuted}
              secureTextEntry={f.secure}
              autoCapitalize={f.auto ?? (f.key === 'name' ? 'words' : 'none')}
              keyboardType={f.keyboard ?? 'default'}
              textContentType={(f as any).content ?? 'none'}
              autoComplete="off"
            />
          </View>
        ))}

        <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.switchText}>
            Already have an account? <Text style={styles.switchLink}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  logoBox: { alignItems: 'center', marginBottom: spacing.xl },
  logoText: { fontSize: 42, fontWeight: '900', color: colors.primary, letterSpacing: 6 },
  logoSub: { fontSize: 14, fontWeight: '700', color: colors.textMuted, letterSpacing: 8, marginTop: -4 },
  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text, marginBottom: spacing.xs },
  subtitle: { fontSize: fontSize.md, color: colors.textMuted, marginBottom: spacing.lg },
  error: { backgroundColor: '#2a1111', color: colors.primary, padding: spacing.sm, borderRadius: radius.sm, marginBottom: spacing.md, fontSize: fontSize.sm },
  field: { marginBottom: spacing.md },
  label: { color: colors.textMuted, fontSize: fontSize.sm, marginBottom: spacing.xs, fontWeight: '600' },
  input: { backgroundColor: colors.card, color: colors.text, borderRadius: radius.md, padding: spacing.md, fontSize: fontSize.md, borderWidth: 1, borderColor: colors.border },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.lg },
  btnText: { color: '#fff', fontWeight: '700', fontSize: fontSize.md },
  switchText: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.sm },
  switchLink: { color: colors.primary, fontWeight: '700' },
});
