import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
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
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/veliki logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 60,
    marginBottom: 40,
  },
  logo: {
    width: 280,
    height: 140,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
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
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  optionEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});
