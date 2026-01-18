import { View, Text, StyleSheet, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useAuthStore } from '../../src/stores/authStore';
import { api } from '../../src/services/api';

export default function PreferencesScreen() {
  const { user, updateUser, clearOnboarding } = useAuthStore();
  const [budget, setBudget] = useState({ min: 200, max: 500 });
  const [smoker, setSmoker] = useState(false);
  const [pets, setPets] = useState(false);
  const [cleanliness, setCleanliness] = useState(3);
  const [sleepSchedule, setSleepSchedule] = useState<'early' | 'night'>('early');
  const [isLoading, setIsLoading] = useState(false);

  const handleFinish = async () => {
    if (!user) {
      Alert.alert('Greška', 'Nisi prijavljen');
      return;
    }
    setIsLoading(true);
    try {
      const result = await api.updatePreferences(user.id, { budget, smoker, pets, cleanliness, sleepSchedule });
      if (result.success && result.data) {
        updateUser(result.data.user);
        clearOnboarding();
        router.replace('/(tabs)/feed');
      } else {
        Alert.alert('Greška', result.error || 'Neuspelo čuvanje');
      }
    } catch (error) {
      Alert.alert('Greška', 'Došlo je do greške');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Tvoje preference</Text>
        <Text style={styles.subtitle}>Pomozi nam da nađemo savršen match</Text>
      </View>

      {/* Budget */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Budžet (€/mesec)</Text>
        <View style={styles.budgetDisplay}>
          <Text style={styles.budgetText}>
            {budget.min}€ - {budget.max}€
          </Text>
        </View>
        <View style={styles.budgetButtons}>
          <Pressable
            style={styles.budgetButton}
            onPress={() => setBudget({ ...budget, min: Math.max(100, budget.min - 50) })}
          >
            <Text style={styles.budgetButtonText}>-50</Text>
          </Pressable>
          <Pressable
            style={styles.budgetButton}
            onPress={() => setBudget({ ...budget, max: budget.max + 100 })}
          >
            <Text style={styles.budgetButtonText}>+100</Text>
          </Pressable>
        </View>
      </View>

      {/* Lifestyle */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Životni stil</Text>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Pušač?</Text>
          <View style={styles.toggleButtons}>
            <Pressable
              style={[styles.toggleButton, !smoker && styles.toggleButtonActive]}
              onPress={() => setSmoker(false)}
            >
              <Text style={[styles.toggleButtonText, !smoker && styles.toggleButtonTextActive]}>
                Ne
              </Text>
            </Pressable>
            <Pressable
              style={[styles.toggleButton, smoker && styles.toggleButtonActive]}
              onPress={() => setSmoker(true)}
            >
              <Text style={[styles.toggleButtonText, smoker && styles.toggleButtonTextActive]}>
                Da
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Ljubimci?</Text>
          <View style={styles.toggleButtons}>
            <Pressable
              style={[styles.toggleButton, !pets && styles.toggleButtonActive]}
              onPress={() => setPets(false)}
            >
              <Text style={[styles.toggleButtonText, !pets && styles.toggleButtonTextActive]}>
                Ne
              </Text>
            </Pressable>
            <Pressable
              style={[styles.toggleButton, pets && styles.toggleButtonActive]}
              onPress={() => setPets(true)}
            >
              <Text style={[styles.toggleButtonText, pets && styles.toggleButtonTextActive]}>
                Da
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Cleanliness */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Urednost</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable key={star} onPress={() => setCleanliness(star)}>
              <Text style={[styles.star, star <= cleanliness && styles.starActive]}>
                ★
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Sleep Schedule */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Raspored spavanja</Text>
        <View style={styles.scheduleButtons}>
          <Pressable
            style={[styles.scheduleButton, sleepSchedule === 'early' && styles.scheduleButtonActive]}
            onPress={() => setSleepSchedule('early')}
          >
            <Text style={styles.scheduleEmoji}>🌅</Text>
            <Text style={[styles.scheduleText, sleepSchedule === 'early' && styles.scheduleTextActive]}>
              Ranoranioc
            </Text>
          </Pressable>
          <Pressable
            style={[styles.scheduleButton, sleepSchedule === 'night' && styles.scheduleButtonActive]}
            onPress={() => setSleepSchedule('night')}
          >
            <Text style={styles.scheduleEmoji}>🌙</Text>
            <Text style={[styles.scheduleText, sleepSchedule === 'night' && styles.scheduleTextActive]}>
              Noćna ptica
            </Text>
          </Pressable>
        </View>
      </View>

      <Pressable style={[styles.button, isLoading && { opacity: 0.6 }]} onPress={handleFinish} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Započni pretragu 🎉</Text>}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
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
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  budgetDisplay: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  budgetButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  budgetButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  budgetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  toggleButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  toggleButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  star: {
    fontSize: 32,
    color: '#E0E0E0',
  },
  starActive: {
    color: '#FFD700',
  },
  scheduleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  scheduleButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  scheduleButtonActive: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  scheduleEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  scheduleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  scheduleTextActive: {
    color: '#FF6B6B',
  },
  button: {
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
