import { View, Text, StyleSheet, ScrollView, Pressable, Image, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
    'Lep i svetao stan u mirnoj ulici, blizu svih sadržaja. Potpuno namešten, spreman za useljenje. Ima centralno grejanje, klima uređaj, i brzi internet.',
  images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
  attributes: [
    { name: 'Modern', confidence: 0.95 },
    { name: 'Svetao', confidence: 0.88 },
    { name: 'Prostran', confidence: 0.92 },
  ],
  amenities: ['WiFi', 'Klima', 'Grejanje', 'Veš mašina', 'Parking'],
  provider: {
    id: 'u1',
    name: 'Marko P.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
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
    router.back();
  };

  const handleDislike = () => {
    router.back();
  };

  const handleChat = () => {
    router.push(`/chat/${MOCK_APARTMENT.provider.id}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          {MOCK_APARTMENT.images[0] ? (
            <Image source={{ uri: MOCK_APARTMENT.images[0] }} style={styles.heroImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>🏠</Text>
            </View>
          )}

          {/* Back Button */}
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>

          {/* Match Score Badge */}
          <View style={styles.matchBadge}>
            <Text style={styles.matchBadgeText}>{MOCK_APARTMENT.compatibility.total}% Match!</Text>
          </View>

          {/* Provider Avatar overlapping */}
          <View style={styles.providerAvatarContainer}>
            {MOCK_APARTMENT.provider.image ? (
              <Image source={{ uri: MOCK_APARTMENT.provider.image }} style={styles.providerAvatar} />
            ) : (
              <View style={[styles.providerAvatar, styles.providerAvatarPlaceholder]}>
                <Text style={styles.providerAvatarText}>
                  {MOCK_APARTMENT.provider.name.charAt(0)}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.content}>
          {/* Price Section */}
          <View style={styles.priceSection}>
            <Text style={styles.price}>{MOCK_APARTMENT.price} €</Text>
            <Text style={styles.priceLabel}>/mesec</Text>
          </View>

          {/* Location */}
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>{MOCK_APARTMENT.location.city}</Text>
          </View>

          {/* Quick Info Badges */}
          <View style={styles.quickInfoRow}>
            <View style={styles.infoBadge}>
              <Text style={styles.infoBadgeText}>{MOCK_APARTMENT.size}m²</Text>
            </View>
            <View style={styles.infoBadge}>
              <Text style={styles.infoBadgeText}>{MOCK_APARTMENT.bedrooms} sobe</Text>
            </View>
            <View style={styles.infoBadge}>
              <Text style={styles.infoBadgeText}>{MOCK_APARTMENT.bathrooms} kupatilo</Text>
            </View>
          </View>

          {/* AI Insight Banner */}
          <View style={styles.aiInsightBanner}>
            <View style={styles.aiInsightIconWrapper}>
              <Text style={styles.aiInsightIcon}>✱</Text>
            </View>
            <Text style={styles.aiInsightText}>
              Ovaj stan je '<Text style={styles.aiInsightHighlight}>{MOCK_APARTMENT.attributes[0]?.name}</Text>', baš kao tvoj vajb!
            </Text>
          </View>

          {/* AI Vibes Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vajbovi stana</Text>
            <View style={styles.vibesContainer}>
              {MOCK_APARTMENT.attributes.map((attr, index) => (
                <View key={index} style={styles.vibeBadge}>
                  <Text style={styles.vibeIcon}>✱</Text>
                  <Text style={styles.vibeText}>#{attr.name}</Text>
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

          {/* Amenities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pogodnosti</Text>
            <View style={styles.amenitiesContainer}>
              {MOCK_APARTMENT.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityBadge}>
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Provider Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>O cimeru</Text>
            <View style={styles.providerCard}>
              <View style={styles.providerInfo}>
                {MOCK_APARTMENT.provider.image ? (
                  <Image source={{ uri: MOCK_APARTMENT.provider.image }} style={styles.providerCardAvatar} />
                ) : (
                  <View style={[styles.providerCardAvatar, styles.providerCardAvatarPlaceholder]}>
                    <Text style={styles.providerCardAvatarText}>
                      {MOCK_APARTMENT.provider.name.charAt(0)}
                    </Text>
                  </View>
                )}
                <View style={styles.providerDetails}>
                  <Text style={styles.providerName}>{MOCK_APARTMENT.provider.name}</Text>
                  <View style={styles.providerVibes}>
                    {MOCK_APARTMENT.provider.attributes.map((attr, index) => (
                      <View key={index} style={styles.providerVibeBadge}>
                        <Text style={styles.providerVibeText}>#{attr.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
              <Pressable style={styles.chatButton} onPress={handleChat}>
                <Text style={styles.chatButtonText}>💬</Text>
              </Pressable>
            </View>
          </View>

          {/* Compatibility Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Zašto ste kompatibilni</Text>
            <View style={styles.compatibilityCard}>
              {MOCK_APARTMENT.compatibility.reasons.map((reason, index) => (
                <View key={index} style={styles.compatibilityRow}>
                  <View style={styles.compatibilityCheck}>
                    <Text style={styles.compatibilityCheckText}>✓</Text>
                  </View>
                  <Text style={styles.compatibilityReason}>{reason}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Bottom spacing */}
          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Pressable style={styles.dislikeButton} onPress={handleDislike}>
          <Text style={styles.dislikeButtonIcon}>✕</Text>
        </Pressable>
        <Pressable style={styles.likeButton} onPress={handleLike}>
          <Text style={styles.likeButtonIcon}>♥</Text>
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
    height: 320,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  backButtonText: {
    fontSize: 24,
    color: '#1a1a1a',
  },
  matchBadge: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: '#22C55E',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  matchBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  providerAvatarContainer: {
    position: 'absolute',
    bottom: -32,
    left: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#fff',
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  providerAvatar: {
    width: '100%',
    height: '100%',
  },
  providerAvatarPlaceholder: {
    backgroundColor: '#E991D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 44,
  },
  priceSection: {
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
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  locationText: {
    fontSize: 16,
    color: '#666',
  },
  quickInfoRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  infoBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  infoBadgeText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  aiInsightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 20,
  },
  aiInsightIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E991D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiInsightIcon: {
    fontSize: 12,
    color: '#fff',
  },
  aiInsightText: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  aiInsightHighlight: {
    fontWeight: 'bold',
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 14,
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
    gap: 6,
  },
  vibeIcon: {
    fontSize: 12,
    color: '#E991D9',
  },
  vibeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  vibeConfidence: {
    fontSize: 12,
    color: '#E991D9',
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 26,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  amenityText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 20,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  providerCardAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
  },
  providerCardAvatarPlaceholder: {
    backgroundColor: '#E991D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerCardAvatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  providerVibes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  providerVibeBadge: {
    backgroundColor: '#F8E8F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  providerVibeText: {
    fontSize: 12,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  chatButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E991D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatButtonText: {
    fontSize: 22,
  },
  compatibilityCard: {
    backgroundColor: '#F0FFF4',
    padding: 18,
    borderRadius: 20,
    gap: 14,
  },
  compatibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compatibilityCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  compatibilityCheckText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  compatibilityReason: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 20,
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    paddingVertical: 20,
    paddingBottom: 36,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  dislikeButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  dislikeButtonIcon: {
    fontSize: 28,
    color: '#666',
  },
  likeButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E991D9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E991D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  likeButtonIcon: {
    fontSize: 28,
    color: '#fff',
  },
});
