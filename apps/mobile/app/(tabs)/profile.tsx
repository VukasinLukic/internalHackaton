import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Nisi prijavljen</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {user.role === 'seeker' ? '🔍 Tražim stan' : '🏠 Imam stan'}
          </Text>
        </View>
      </View>

      {/* AI Traits */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✨ AI Osobine</Text>
        <View style={styles.traitsContainer}>
          {user.attributes?.map((attr, index) => (
            <View key={index} style={styles.traitBadge}>
              <Text style={styles.traitName}>{attr.name}</Text>
              <Text style={styles.traitConfidence}>
                {Math.round(attr.confidence * 100)}%
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Preferences (only for seekers) */}
      {user.role === 'seeker' && user.preferences && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Moje preference</Text>

          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>Budžet:</Text>
            <Text style={styles.preferenceValue}>
              {user.preferences.budget.min}€ - {user.preferences.budget.max}€
            </Text>
          </View>

          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>Pušač:</Text>
            <Text style={styles.preferenceValue}>
              {user.preferences.smoker ? 'Da' : 'Ne'}
            </Text>
          </View>

          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>Ljubimci:</Text>
            <Text style={styles.preferenceValue}>
              {user.preferences.pets ? 'Da' : 'Ne'}
            </Text>
          </View>

          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>Urednost:</Text>
            <Text style={styles.preferenceValue}>
              {'★'.repeat(user.preferences.cleanliness)}
              {'☆'.repeat(5 - user.preferences.cleanliness)}
            </Text>
          </View>

          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>Raspored:</Text>
            <Text style={styles.preferenceValue}>
              {user.preferences.sleepSchedule === 'early'
                ? '🌅 Ranoranioc'
                : '🌙 Noćna ptica'}
            </Text>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>Izmeni profil</Text>
        </Pressable>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Odjavi se</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#F8F8F8',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  roleBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  traitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    gap: 8,
  },
  traitName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  traitConfidence: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F8F8',
  },
  preferenceLabel: {
    fontSize: 16,
    color: '#666',
  },
  preferenceValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  actions: {
    padding: 20,
    gap: 12,
  },
  editButton: {
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
});
