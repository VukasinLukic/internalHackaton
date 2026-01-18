import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';

export default function RoleSelectionScreen() {
  const setOnboardingRole = useAuthStore((state) => state.setOnboardingRole);

  const selectRole = (role: 'seeker' | 'provider') => {
    setOnboardingRole(role);
    router.push('/(onboarding)/profile-setup');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Šta te dovodi?</Text>
        <Text style={styles.subtitle}>Izaberi svoju ulogu</Text>
      </View>

      <View style={styles.options}>
        <Pressable
          style={styles.optionCard}
          onPress={() => selectRole('seeker')}
        >
          <Text style={styles.optionEmoji}>🔍</Text>
          <Text style={styles.optionTitle}>Tražim stan</Text>
          <Text style={styles.optionDescription}>
            Pronađi savršen stan i cimera koji ti odgovara
          </Text>
        </Pressable>

        <Pressable
          style={styles.optionCard}
          onPress={() => selectRole('provider')}
        >
          <Text style={styles.optionEmoji}>🏠</Text>
          <Text style={styles.optionTitle}>Imam stan</Text>
          <Text style={styles.optionDescription}>
            Pronađi idealnog cimera za svoj stan
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  options: {
    gap: 20,
  },
  optionCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  optionEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
