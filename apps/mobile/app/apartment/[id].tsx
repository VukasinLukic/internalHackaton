import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

const MOCK_APARTMENT = {
  id: '1',
  price: 350,
  size: 65,
  bedrooms: 2,
  bathrooms: 1,
  location: {
    address: 'Njegoševa 45',
    city: 'Vračar, Beograd',
  },
  description:
    'Lep i svetao stan u mirnoj ulici, blizu svih sadržaja. Potpuno namešten, spreman za useljenje.',
  images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400'],
  attributes: [
    { name: 'Modern', confidence: 0.95 },
    { name: 'Svetao', confidence: 0.88 },
    { name: 'Prostran', confidence: 0.92 },
  ],
  provider: {
    id: 'u1',
    name: 'Marko P.',
    attributes: [
      { name: 'Organizovan', confidence: 0.92 },
      { name: 'Tih', confidence: 0.85 },
    ],
  },
  compatibility: {
    total: 85,
    reasons: [
      'Matching vibes: Modern, Minimalist',
      'U okviru tvog budžeta',
      'Kompatibilan cimer: Tih, Organizovan',
    ],
  },
};

export default function ApartmentDetailsScreen() {
  const { id } = useLocalSearchParams();

  const handleLike = () => {
    // TODO: Call swipe API
    router.back();
  };

  const handleDislike = () => {
    // TODO: Call swipe API
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>🏠</Text>
          </View>

          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>

          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{MOCK_APARTMENT.compatibility.total}%</Text>
            <Text style={styles.scoreLabel}>Match</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Price & Location */}
          <View style={styles.headerSection}>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{MOCK_APARTMENT.price}€</Text>
              <Text style={styles.priceLabel}>/mesec</Text>
            </View>
            <Text style={styles.address}>{MOCK_APARTMENT.location.address}</Text>
            <Text style={styles.city}>📍 {MOCK_APARTMENT.location.city}</Text>
          </View>

          {/* Quick Info */}
          <View style={styles.quickInfo}>
            <View style={styles.quickInfoItem}>
              <Text style={styles.quickInfoValue}>{MOCK_APARTMENT.size}m²</Text>
              <Text style={styles.quickInfoLabel}>Površina</Text>
            </View>
            <View style={styles.quickInfoDivider} />
            <View style={styles.quickInfoItem}>
              <Text style={styles.quickInfoValue}>{MOCK_APARTMENT.bedrooms}</Text>
              <Text style={styles.quickInfoLabel}>Sobe</Text>
            </View>
            <View style={styles.quickInfoDivider} />
            <View style={styles.quickInfoItem}>
              <Text style={styles.quickInfoValue}>{MOCK_APARTMENT.bathrooms}</Text>
              <Text style={styles.quickInfoLabel}>Kupatilo</Text>
            </View>
          </View>

          {/* AI Vibes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ AI Vibes</Text>
            <View style={styles.vibesContainer}>
              {MOCK_APARTMENT.attributes.map((attr, index) => (
                <View key={index} style={styles.vibeBadge}>
                  <Text style={styles.vibeText}>{attr.name}</Text>
                  <Text style={styles.vibeConfidence}>
                    {Math.round(attr.confidence * 100)}%
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Opis</Text>
            <Text style={styles.description}>{MOCK_APARTMENT.description}</Text>
          </View>

          {/* Provider */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 O cimeru</Text>
            <View style={styles.providerCard}>
              <View style={styles.providerAvatar}>
                <Text style={styles.providerAvatarText}>
                  {MOCK_APARTMENT.provider.name.charAt(0)}
                </Text>
              </View>
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{MOCK_APARTMENT.provider.name}</Text>
                <View style={styles.providerVibes}>
                  {MOCK_APARTMENT.provider.attributes.map((attr, index) => (
                    <View key={index} style={styles.providerVibeBadge}>
                      <Text style={styles.providerVibeText}>{attr.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Compatibility */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💫 Zašto ste kompatibilni</Text>
            <View style={styles.compatibilityCard}>
              {MOCK_APARTMENT.compatibility.reasons.map((reason, index) => (
                <Text key={index} style={styles.compatibilityReason}>
                  ✓ {reason}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Pressable style={[styles.actionButton, styles.dislikeButton]} onPress={handleDislike}>
          <Text style={styles.dislikeButtonText}>✕ Ne sviđa mi se</Text>
        </Pressable>
        <Pressable style={[styles.actionButton, styles.likeButton]} onPress={handleLike}>
          <Text style={styles.likeButtonText}>♥ Sviđa mi se</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: 300,
    position: 'relative',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 80,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 24,
    color: '#1a1a1a',
  },
  scoreBadge: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  scoreText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreLabel: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  headerSection: {
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  priceLabel: {
    fontSize: 18,
    color: '#666',
    marginLeft: 4,
  },
  address: {
    fontSize: 18,
    color: '#1a1a1a',
    marginTop: 8,
  },
  city: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  quickInfo: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  quickInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickInfoValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  quickInfoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  quickInfoDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  vibesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  vibeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    gap: 8,
  },
  vibeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A90D9',
  },
  vibeConfidence: {
    fontSize: 12,
    color: '#999',
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
  },
  providerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  providerAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  providerVibes: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  providerVibeBadge: {
    backgroundColor: '#E8E8E8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  providerVibeText: {
    fontSize: 12,
    color: '#666',
  },
  compatibilityCard: {
    backgroundColor: '#F0FFF4',
    padding: 16,
    borderRadius: 12,
  },
  compatibilityReason: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  dislikeButton: {
    backgroundColor: '#F8F8F8',
  },
  dislikeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  likeButton: {
    backgroundColor: '#FF6B6B',
  },
  likeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
