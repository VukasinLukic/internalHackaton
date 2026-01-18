import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../src/stores/authStore';
import { api, uploadMultipleToCloudinary } from '../../src/services';
import type { UserAttribute, UserRole } from '../../src/types';

export default function PhotoAnalysisScreen() {
  const { onboardingRole, onboardingName, onboardingBio, onboardingPhotos, login, clearOnboarding } = useAuthStore();

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

      // Save to local store (no backend)
      login(mockUser.id, mockUser);
      console.log('[PHOTO-ANALYSIS] ✅ User logged in - DEMO MODE ACTIVE');

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

      setTraits(fallbackUser.attributes);
      setMockUser(fallbackUser);
      setIsAnalyzing(false);
      login(fallbackUser.id, fallbackUser);

      console.log('[PHOTO-ANALYSIS] ✅ Fallback demo user created');
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
      {!isAnalyzing && (
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>zzimeri</Text>
        </View>
      )}

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
          <Text style={styles.title}>Koji je tvoj vajb?</Text>

          <View style={styles.imageCard}>
            <View style={styles.imagePlaceholder}>
              {/* Mock room image */}
              <View style={styles.vibeTagsContainer}>
                <Pressable style={styles.vibeTag}>
                  <Text style={styles.vibeTagText}>AI Vibe Check ✨</Text>
                </Pressable>
                <Pressable style={styles.vibeTag}>
                  <Text style={styles.vibeTagText}>#Modern</Text>
                </Pressable>
                <Pressable style={styles.vibeTag}>
                  <Text style={styles.vibeTagText}>#Bright</Text>
                </Pressable>
                <Pressable style={styles.vibeTag}>
                  <Text style={styles.vibeTagText}>#Plants</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {visibleTraits >= traits.length && (
            <Pressable style={styles.button} onPress={handleContinue}>
              <Text style={styles.buttonText}>Potvrdi vibe</Text>
            </Pressable>
          )}
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
  logoContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
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
    paddingTop: 120,
    alignItems: 'center',
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
    aspectRatio: 0.7,
    marginBottom: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#1a1a1a',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  vibeTagsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
  },
  vibeTag: {
    backgroundColor: '#E991D9',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignSelf: 'flex-start',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  vibeTagText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#E991D9',
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 30,
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
