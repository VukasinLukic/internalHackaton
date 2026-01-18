import { View, Text, StyleSheet, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useAuthStore } from '../../src/stores/authStore';
import { api } from '../../src/services/api';

export default function PreferencesScreen() {
  const { user, updateUser, clearOnboarding } = useAuthStore();
  const [budget, setBudget] = useState(300);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const vibes = [
    'Nepušač',
    'Rano ustajem',
    'Gamer',
    'Pet-friendly',
    'Uredan',
    'Socijalan',
  ];

  const toggleVibe = (vibe: string) => {
    setSelectedVibes(prev =>
      prev.includes(vibe)
        ? prev.filter(v => v !== vibe)
        : [...prev, vibe]
    );
  };

  const handleFinish = async () => {
    console.log('[PREFERENCES] 🎭 DEMO MODE - Saving preferences locally');

    setIsLoading(true);

    // ===== HARDCODED - NO API CALL =====
    try {
      // Simulate saving delay for realism
      await new Promise(resolve => setTimeout(resolve, 800));

      // Save preferences to local user object (no backend)
      const preferences = {
        budget,
        vibes: selectedVibes,
        location: { city: 'Beograd', radius: 10 },
      };

      // Update local user state
      if (user) {
        updateUser({ preferences });
      }

      console.log('[PREFERENCES] ✅ Preferences saved locally (demo mode)');
      clearOnboarding();

      // Navigate to feed
      router.replace('/(tabs)/feed');

    } catch (error) {
      console.error('[PREFERENCES] Demo error:', error);
      // Even if error, navigate anyway (demo mode)
      router.replace('/(tabs)/feed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>zzimeri</Text>
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Kakav si cimer?</Text>

        {/* Budget */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tvoj mesečni budžet:</Text>
          <Text style={styles.budgetText}>{budget} €</Text>
          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${((budget - 100) / 900) * 100}%` }]} />
            </View>
            <View style={styles.budgetControls}>
              <Pressable
                style={styles.budgetControlButton}
                onPress={() => setBudget(Math.max(100, budget - 50))}
              >
                <Text style={styles.budgetControlText}>-</Text>
              </Pressable>
              <Pressable
                style={styles.budgetControlButton}
                onPress={() => setBudget(Math.min(1000, budget + 50))}
              >
                <Text style={styles.budgetControlText}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Vibes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tvoj vibe (izaberi sve što važi):</Text>
          <View style={styles.vibesContainer}>
            {vibes.map((vibe) => (
              <Pressable
                key={vibe}
                style={[
                  styles.vibeButton,
                  selectedVibes.includes(vibe) && styles.vibeButtonActive,
                ]}
                onPress={() => toggleVibe(vibe)}
              >
                <Text
                  style={[
                    styles.vibeButtonText,
                    selectedVibes.includes(vibe) && styles.vibeButtonTextActive,
                  ]}
                >
                  {vibe}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          style={[styles.button, isLoading && { opacity: 0.6 }]}
          onPress={handleFinish}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#1a1a1a" />
          ) : (
            <Text style={styles.buttonText}>Dalje</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 32,
    paddingTop: 120,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 40,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  budgetText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  sliderContainer: {
    width: '100%',
  },
  sliderTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#E991D9',
    borderRadius: 4,
  },
  budgetControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  budgetControlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E991D9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetControlText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  vibesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  vibeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#1a1a1a',
    backgroundColor: '#fff',
  },
  vibeButtonActive: {
    backgroundColor: '#E991D9',
    borderColor: '#E991D9',
  },
  vibeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  vibeButtonTextActive: {
    color: '#1a1a1a',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#E991D9',
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: '600',
  },
});
