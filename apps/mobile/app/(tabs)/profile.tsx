import { View, Text, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
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

  const handleAddApartment = () => {
    router.push('/add-apartment');
  };

  // Use real user data only
  const displayUser = user;

  if (!displayUser) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/mali logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, color: '#666' }}>Molimo prijavite se</Text>
        </View>
      </View>
    );
  }

  const isProvider = displayUser.role === 'provider';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Logo */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/mali logo.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {displayUser.images?.[0] ? (
            <Image source={{ uri: displayUser.images[0] }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>{displayUser.name.charAt(0)}</Text>
            </View>
          )}
          <View style={styles.avatarBorder} />
        </View>

        {/* Name & Email */}
        <Text style={styles.name}>{displayUser.name}</Text>
        <Text style={styles.email}>{displayUser.email}</Text>

        {/* Role Badge */}
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {isProvider ? '🏠 Nudim stan' : '🔍 Tražim stan'}
          </Text>
        </View>
      </View>

      {/* AI Vibes Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Moji Vajbovi</Text>
        <View style={styles.vibesContainer}>
          {displayUser.attributes?.map((attr, index) => (
            <View key={index} style={styles.vibeBadge}>
              <Text style={styles.vibeIcon}>✱</Text>
              <Text style={styles.vibeName}>{attr.name}</Text>
              <Text style={styles.vibeConfidence}>
                {Math.round(attr.confidence * 100)}%
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Preferences Section (only for seekers) */}
      {!isProvider && displayUser.preferences && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Šta tražim</Text>

          <View style={styles.preferenceCard}>
            {/* Budget */}
            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceIcon}>💰</Text>
              <Text style={styles.preferenceLabel}>Budžet</Text>
              <Text style={styles.preferenceValue}>
                {typeof displayUser.preferences.budget === 'number'
                  ? `${displayUser.preferences.budget}€`
                  : `${displayUser.preferences.budget?.min}€ - ${displayUser.preferences.budget?.max}€`}
              </Text>
            </View>

            {/* Vibe Tags */}
            {displayUser.preferences.vibes && displayUser.preferences.vibes.length > 0 && (
              <>
                <View style={styles.divider} />
                <View style={styles.preferenceColumn}>
                  <View style={styles.preferenceRowHeader}>
                    <Text style={styles.preferenceIcon}>✨</Text>
                    <Text style={styles.preferenceLabel}>Moj Vibe</Text>
                  </View>
                  <View style={styles.vibesWrapper}>
                    {displayUser.preferences.vibes.map((vibe, index) => (
                      <View key={index} style={styles.vibeTag}>
                        <Text style={styles.vibeTagText}>{vibe}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            )}

            {/* Sleep Schedule */}
            {displayUser.preferences.sleepSchedule && (
              <>
                <View style={styles.divider} />
                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceIcon}>
                    {displayUser.preferences.sleepSchedule === 'early' ? '🌅' : '🌙'}
                  </Text>
                  <Text style={styles.preferenceLabel}>Raspored</Text>
                  <Text style={styles.preferenceValue}>
                    {displayUser.preferences.sleepSchedule === 'early'
                      ? 'Ranoranioc'
                      : 'Noćna ptica'}
                  </Text>
                </View>
              </>
            )}

            {/* Old preferences (if they exist) */}
            {displayUser.preferences.smoker !== undefined && (
              <>
                <View style={styles.divider} />
                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceIcon}>🚬</Text>
                  <Text style={styles.preferenceLabel}>Pušač</Text>
                  <Text style={styles.preferenceValue}>
                    {displayUser.preferences.smoker ? 'Da' : 'Ne'}
                  </Text>
                </View>
              </>
            )}

            {displayUser.preferences.pets !== undefined && (
              <>
                <View style={styles.divider} />
                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceIcon}>🐕</Text>
                  <Text style={styles.preferenceLabel}>Ljubimci</Text>
                  <Text style={styles.preferenceValue}>
                    {displayUser.preferences.pets ? 'Da' : 'Ne'}
                  </Text>
                </View>
              </>
            )}

            {displayUser.preferences?.cleanliness && (
              <>
                <View style={styles.divider} />
                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceIcon}>🧹</Text>
                  <Text style={styles.preferenceLabel}>Urednost</Text>
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Text
                        key={star}
                        style={[
                          styles.star,
                          star <= (displayUser.preferences?.cleanliness || 0) && styles.starActive
                        ]}
                      >
                        ★
                      </Text>
                    ))}
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      )}

      {/* Provider Section - Add Apartment */}
      {isProvider && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Moj Stan</Text>
          <Pressable style={styles.addApartmentButton} onPress={handleAddApartment}>
            <View style={styles.addApartmentIcon}>
              <Text style={styles.addApartmentIconText}>+</Text>
            </View>
            <View style={styles.addApartmentContent}>
              <Text style={styles.addApartmentTitle}>Dodaj novi stan</Text>
              <Text style={styles.addApartmentSubtitle}>
                Uploaduj slike i informacije o stanu
              </Text>
            </View>
          </Pressable>
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

      {/* Bottom spacing */}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  headerLogo: {
    width: 40,
    height: 40,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    backgroundColor: '#E991D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  avatarBorder: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 64,
    borderWidth: 3,
    borderColor: '#E991D9',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: '#F8E8F5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  vibesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  vibeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8E8F5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  vibeIcon: {
    fontSize: 14,
    color: '#E991D9',
  },
  vibeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  vibeConfidence: {
    fontSize: 12,
    color: '#E991D9',
    fontWeight: '500',
  },
  preferenceCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  preferenceColumn: {
    paddingVertical: 8,
  },
  preferenceRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vibesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginLeft: 40,
  },
  vibeTag: {
    backgroundColor: '#E991D9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  vibeTagText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  preferenceIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 28,
  },
  preferenceLabel: {
    flex: 1,
    fontSize: 16,
    color: '#666',
  },
  preferenceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    fontSize: 18,
    color: '#E0E0E0',
  },
  starActive: {
    color: '#E991D9',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginVertical: 8,
  },
  addApartmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E991D9',
    borderStyle: 'dashed',
  },
  addApartmentIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E991D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  addApartmentIconText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
    marginTop: -2,
  },
  addApartmentContent: {
    flex: 1,
  },
  addApartmentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  addApartmentSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    paddingHorizontal: 20,
    gap: 12,
  },
  editButton: {
    backgroundColor: '#E991D9',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  editButtonText: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  logoutButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '600',
  },
});
