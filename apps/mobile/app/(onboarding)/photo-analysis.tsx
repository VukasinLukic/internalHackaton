import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert, Image } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../src/stores/authStore';
import { api, uploadMultipleToCloudinary } from '../../src/services';
import type { UserAttribute, UserRole } from '../../src/types';

export default function PhotoAnalysisScreen() {
  const { user, onboardingRole, onboardingName, onboardingBio, onboardingPhotos, updateUser, clearOnboarding } = useAuthStore();

  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [traits, setTraits] = useState<UserAttribute[]>([]);
  const [visibleTraits, setVisibleTraits] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [_mockUser, setMockUser] = useState<any>(null);

  useEffect(() => {
    analyzeProfile();
  }, []);

  const analyzeProfile = async () => {
    try {
      console.log('[PHOTO-ANALYSIS] 🎭 HARDCODED DEMO MODE - No backend needed!');

      // ===== SIMULATE "UPLOADING" =====
      await new Promise(resolve => setTimeout(resolve, 1200));

      // ===== CREATE MOCK USER (NO API CALL) =====
      const mockUserId = `demo_user_${Date.now()}`;
      const mockUser = {
        id: mockUserId,
        name: onboardingName || 'Demo Korisnik',
        email: `${mockUserId}@zzzimeri.demo`,
        role: (onboardingRole || 'seeker') as UserRole,
        bio: onboardingBio || 'Demo profil - hardcoded mode',
        images: onboardingPhotos, // Local URIs
        attributes: [] as UserAttribute[],
        createdAt: new Date().toISOString(),
      };

      setUserId(mockUser.id);
      console.log('[PHOTO-ANALYSIS] ✅ Demo user created (hardcoded)');

      // ===== SIMULATE "AI ANALYSIS" =====
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Hardcoded traits based on role
      const demoTraits: UserAttribute[] = onboardingRole === 'seeker'
        ? [
            { name: 'Organizovan', confidence: 0.92 },
            { name: 'Minimalist', confidence: 0.88 },
            { name: 'Tih', confidence: 0.85 },
            { name: 'Čist', confidence: 0.90 },
          ]
        : [
            { name: 'Druželjubiv', confidence: 0.90 },
            { name: 'Pouzdan', confidence: 0.87 },
            { name: 'Komunikativan', confidence: 0.85 },
            { name: 'Fleksibilan', confidence: 0.82 },
          ];

      setTraits(demoTraits);
      mockUser.attributes = [...demoTraits];
      setMockUser(mockUser);
      setIsAnalyzing(false);

      console.log('[PHOTO-ANALYSIS] ✅ Demo AI analysis complete (hardcoded)');

      // Update existing user with attributes (don't overwrite email/name from registration)
      if (user) {
        updateUser({ attributes: demoTraits });
      }
      console.log('[PHOTO-ANALYSIS] ✅ User attributes updated - DEMO MODE ACTIVE');

    } catch (error) {
      console.error('[PHOTO-ANALYSIS] Demo error:', error);

      // Even if something crashes, create fallback user
      const fallbackUser = {
        id: `fallback_${Date.now()}`,
        name: onboardingName || 'Demo Korisnik',
        email: 'demo@zzzimeri.app',
        role: (onboardingRole || 'seeker') as UserRole,
        bio: onboardingBio || '',
        images: onboardingPhotos,
        attributes: [
          { name: 'Prijatan', confidence: 0.85 },
          { name: 'Kooperativan', confidence: 0.80 },
        ],
        createdAt: new Date().toISOString(),
      };

      const fallbackAttributes = [
        { name: 'Prijatan', confidence: 0.85 },
        { name: 'Kooperativan', confidence: 0.80 },
      ];

      setTraits(fallbackAttributes);
      setMockUser(fallbackUser);
      setIsAnalyzing(false);

      if (user) {
        updateUser({ attributes: fallbackAttributes });
      }

      console.log('[PHOTO-ANALYSIS] ✅ Fallback attributes updated');
    }
  };

  useEffect(() => {
    // Animate traits appearing one by one
    if (!isAnalyzing && visibleTraits < traits.length) {
      const timer = setTimeout(() => {
        setVisibleTraits((prev) => prev + 1);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isAnalyzing, visibleTraits, traits.length]);

  const handleContinue = () => {
    if (onboardingRole === 'seeker') {
      router.push('/(onboarding)/preferences');
    } else {
      // Provider goes straight to feed
      clearOnboarding();
      router.replace('/(tabs)/feed');
    }
  };

  return (
    <View style={styles.container}>
      {isAnalyzing ? (
        <View style={styles.analyzingContainer}>
          <View style={styles.loaderWrapper}>
            <ActivityIndicator size="large" color="#E991D9" />
          </View>
          <Text style={styles.analyzingText}>Analiziramo tvoj vibe...</Text>
          <Text style={styles.analyzingSubtext}>
            AI proučava tvoje slike i otkriva tvoju personalnost
          </Text>
        </View>
      ) : (
        <View style={styles.resultsContainer}>
          {/* Logo at top */}
          <Image
            source={require('../../assets/veliki logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Koji je tvoj vajb?</Text>

          <View style={styles.imageCard}>
            <Image
              source={require('../../assets/room-mockup.jpg')}
              style={styles.roomImage}
              resizeMode="cover"
            />
            <View style={styles.vibeTagsContainer}>
              {/* AI Vibe Check tag at top */}
              <View style={styles.vibeTag}>
                <Text style={styles.vibeTagText}>AI Vibe Check ✨</Text>
              </View>

              {/* Bottom right tags */}
              <View style={styles.bottomRightTags}>
                <View style={styles.vibeTag}>
                  <Text style={styles.vibeTagText}>#Modern</Text>
                </View>
              </View>

              {/* Bottom left tags */}
              <View style={styles.bottomLeftTags}>
                <View style={styles.vibeTag}>
                  <Text style={styles.vibeTagText}>#Bright</Text>
                </View>
                <View style={[styles.vibeTag, { marginTop: 140 }]}>
                  <Text style={styles.vibeTagText}>#Plants</Text>
                </View>
              </View>
            </View>
          </View>

          <Pressable style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>Potvrdi vibe</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  analyzingContainer: {
    alignItems: 'center',
  },
  loaderWrapper: {
    marginBottom: 24,
  },
  analyzingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 24,
    textAlign: 'center',
  },
  analyzingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  resultsContainer: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 40,
    textAlign: 'center',
  },
  imageCard: {
    width: '100%',
    aspectRatio: 0.65,
    marginBottom: 40,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#1a1a1a',
    position: 'relative',
  },
  roomImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  vibeTagsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24,
  },
  vibeTag: {
    backgroundColor: '#E991D9',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  vibeTagText: {
    color: '#1a1a1a',
    fontSize: 17,
    fontWeight: '600',
  },
  bottomRightTags: {
    position: 'absolute',
    right: 24,
    top: '45%',
  },
  bottomLeftTags: {
    position: 'absolute',
    left: 24,
    bottom: 24,
  },
  button: {
    backgroundColor: '#E991D9',
    paddingVertical: 20,
    paddingHorizontal: 80,
    borderRadius: 35,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#1a1a1a',
    fontSize: 20,
    fontWeight: '600',
  },
});
