import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../src/stores/authStore';
import { api } from '../../src/services/api';
import type { UserAttribute } from '../../src/types';

export default function PhotoAnalysisScreen() {
  const { onboardingRole, onboardingName, onboardingBio, onboardingPhotos, login, clearOnboarding } = useAuthStore();

  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [traits, setTraits] = useState<UserAttribute[]>([]);
  const [visibleTraits, setVisibleTraits] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    analyzeProfile();
  }, []);

  const analyzeProfile = async () => {
    try {
      // Upload images first
      const uploadedImageUrls: string[] = [];

      for (const photoUri of onboardingPhotos) {
        const uploadResult = await api.uploadImage(photoUri);
        if (uploadResult.success && uploadResult.data) {
          uploadedImageUrls.push(uploadResult.data.url);
        }
      }

      if (uploadedImageUrls.length === 0) {
        Alert.alert('Greška', 'Nije moguće uploadovati slike');
        router.back();
        return;
      }

      // Create user
      const createUserResult = await api.createUser({
        name: onboardingName,
        email: `${Date.now()}@temp.com`, // TODO: Use real email from auth
        role: onboardingRole || 'seeker',
        bio: onboardingBio,
        images: uploadedImageUrls,
      });

      if (!createUserResult.success || !createUserResult.data) {
        Alert.alert('Greška', createUserResult.error || 'Neuspelo kreiranje profila');
        router.back();
        return;
      }

      const createdUser = createUserResult.data.user;
      setUserId(createdUser.id);

      // Analyze profile
      const analysisResult = await api.analyzeProfile(createdUser.id);

      setIsAnalyzing(false);

      if (analysisResult.success && analysisResult.data) {
        setTraits(analysisResult.data.attributes);
      } else {
        // Use fallback mock data if analysis fails
        setTraits([
          { name: 'Organizovan', confidence: 0.85 },
          { name: 'Tih', confidence: 0.78 },
          { name: 'Minimalist', confidence: 0.82 },
        ]);
      }

      // Save user to auth store
      // TODO: Get real token from backend
      login('temp-token', createdUser);

    } catch (error) {
      console.error('Profile analysis error:', error);
      setIsAnalyzing(false);
      Alert.alert('Greška', 'Došlo je do greške pri analizi');
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
            <ActivityIndicator size="large" color="#FF6B6B" />
          </View>
          <Text style={styles.analyzingText}>Analiziramo tvoj vibe...</Text>
          <Text style={styles.analyzingSubtext}>
            AI proučava tvoje slike i otkriva tvoju personalnost
          </Text>
        </View>
      ) : (
        <View style={styles.resultsContainer}>
          <Text style={styles.sparkle}>✨</Text>
          <Text style={styles.title}>AI je otkrio:</Text>

          <View style={styles.traitsList}>
            {traits.slice(0, visibleTraits).map((trait, index) => (
              <View key={index} style={styles.traitItem}>
                <View style={styles.traitBadge}>
                  <Text style={styles.traitName}>{trait.name}</Text>
                  <Text style={styles.traitConfidence}>
                    {Math.round(trait.confidence * 100)}%
                  </Text>
                </View>
                <View style={styles.confidenceBar}>
                  <View
                    style={[
                      styles.confidenceBarFill,
                      { width: `${trait.confidence * 100}%` }
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>

          {visibleTraits >= traits.length && (
            <Pressable style={styles.button} onPress={handleContinue}>
              <Text style={styles.buttonText}>Nastavi</Text>
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
    alignItems: 'center',
  },
  sparkle: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 32,
  },
  traitsList: {
    width: '100%',
    gap: 16,
    marginBottom: 40,
  },
  traitItem: {
    width: '100%',
  },
  traitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F8FF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  traitName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  traitConfidence: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '700',
  },
  confidenceBar: {
    height: 4,
    backgroundColor: '#E8E8E8',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    backgroundColor: '#4A90D9',
    borderRadius: 2,
  },
  button: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
