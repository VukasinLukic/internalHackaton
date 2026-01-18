import { View, Text, StyleSheet, Pressable, Dimensions, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { SwipeCard } from '../../src/components/SwipeCard';
import { MatchModal } from '../../src/components/MatchModal';
import { useFeedStore } from '../../src/stores/feedStore';
import { useAuthStore } from '../../src/stores/authStore';
import type { FeedItem, SwipeAction } from '../../src/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Mock data - only used as fallback if API fails
const MOCK_FEED_ITEMS: FeedItem[] = [
  {
    item: {
      id: '1',
      price: 350,
      size: 55,
      bedrooms: 2,
      bathrooms: 1,
      description: 'Lep i svetao stan u mirnoj ulici.',
      images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
      location: { city: 'Vračar, Beograd', address: 'Njegoševa 45' },
      attributes: [
        { name: 'Modern', confidence: 0.95 },
        { name: 'Svetao', confidence: 0.88 },
        { name: 'Minimalist', confidence: 0.82 },
      ],
      providerId: 'u1',
      createdAt: new Date().toISOString(),
    },
    provider: {
      id: 'u1',
      name: 'Marko P.',
      images: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'],
      attributes: [
        { name: 'Organizovan', confidence: 0.92 },
        { name: 'Tih', confidence: 0.85 },
      ],
    },
    score: {
      apartmentCompatibility: 88,
      roommateCompatibility: 82,
      total: 85,
      reasons: [
        'Oboje cenite mirno jutro i dobru kafu!',
        'U okviru tvog budžeta',
        'Kompatibilan cimer: Tih, Organizovan',
      ],
    },
  },
  {
    item: {
      id: '2',
      price: 420,
      size: 65,
      bedrooms: 2,
      bathrooms: 1,
      description: 'Prostran stan na odličnoj lokaciji.',
      images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
      location: { city: 'Dorćol, Beograd', address: 'Cara Dušana 88' },
      attributes: [
        { name: 'Udoban', confidence: 0.91 },
        { name: 'Prostran', confidence: 0.85 },
        { name: 'Svetao', confidence: 0.78 },
      ],
      providerId: 'u2',
      createdAt: new Date().toISOString(),
    },
    provider: {
      id: 'u2',
      name: 'Ana M.',
      images: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'],
      attributes: [
        { name: 'Druželjubiv', confidence: 0.88 },
        { name: 'Pet-lover', confidence: 0.92 },
      ],
    },
    score: {
      apartmentCompatibility: 80,
      roommateCompatibility: 76,
      total: 78,
      reasons: [
        'Blizu centra grada',
        'Pet-friendly domaćin',
        'Prostran za tvoje potrebe',
      ],
    },
  },
  {
    item: {
      id: '3',
      price: 300,
      size: 45,
      bedrooms: 1,
      bathrooms: 1,
      description: 'Kompaktan stan idealan za jednu osobu.',
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
      location: { city: 'Novi Beograd', address: 'Bulevar Zorana Đinđića 55' },
      attributes: [
        { name: 'Kompaktan', confidence: 0.90 },
        { name: 'Praktičan', confidence: 0.87 },
        { name: 'Nov', confidence: 0.95 },
      ],
      providerId: 'u3',
      createdAt: new Date().toISOString(),
    },
    provider: {
      id: 'u3',
      name: 'Nikola S.',
      images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'],
      attributes: [
        { name: 'Introvert', confidence: 0.85 },
        { name: 'Čist', confidence: 0.90 },
      ],
    },
    score: {
      apartmentCompatibility: 92,
      roommateCompatibility: 88,
      total: 90,
      reasons: [
        'Ispod tvog budžeta!',
        'Savršen za tvoj životni stil',
        'Cimer sa sličnim navikama',
      ],
    },
  },
];

// Fake provider apartment data
const FAKE_PROVIDER_APARTMENT = {
  id: 'my-apartment',
  price: 400,
  size: 55,
  bedrooms: 2,
  bathrooms: 1,
  images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
  location: { city: 'Vračar, Beograd', address: 'Njegoševa 45' },
  attributes: [
    { name: 'Svetlo', confidence: 0.95 },
    { name: 'Moderno', confidence: 0.92 },
    { name: 'Biljke', confidence: 0.88 },
  ],
  views: 234,
  likes: 18,
};

// Provider View Component
function ProviderFeedView() {
  const { user } = useAuthStore();
  const hasApartment = true; // In real app, check if user has uploaded apartment

  const handleAddApartment = () => {
    router.push('/add-apartment');
  };

  const handleEditApartment = () => {
    router.push('/add-apartment');
  };

  if (!hasApartment) {
    // Provider hasn't uploaded apartment yet
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/veliki logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
        <ScrollView style={styles.providerContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.providerTitle}>Moj Stan</Text>

          {/* Empty State - Add Apartment */}
          <View style={styles.emptyApartmentCard}>
            <View style={styles.emptyIconWrapper}>
              <Text style={styles.emptyIcon}>🏠</Text>
            </View>
            <Text style={styles.emptyTitle}>Dodaj svoj stan</Text>
            <Text style={styles.emptySubtitle}>
              Uploaduj slike i informacije o svom stanu da bi pronašao idealnog cimera
            </Text>
            <Pressable style={styles.addButton} onPress={handleAddApartment}>
              <Text style={styles.addButtonText}>+ Dodaj stan</Text>
            </Pressable>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  }

  // Provider has apartment - show it
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/veliki logo.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
      </View>
      <ScrollView style={styles.providerContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.providerTitle}>Moj Stan</Text>

        {/* Apartment Card */}
        <View style={styles.apartmentCard}>
          {/* Image */}
          <View style={styles.apartmentImageContainer}>
            <Image
              source={{ uri: FAKE_PROVIDER_APARTMENT.images[0] }}
              style={styles.apartmentImage}
            />
            {/* Stats Overlay */}
            <View style={styles.statsOverlay}>
              <View style={styles.statBadge}>
                <Text style={styles.statIcon}>👁</Text>
                <Text style={styles.statText}>{FAKE_PROVIDER_APARTMENT.views}</Text>
              </View>
              <View style={styles.statBadge}>
                <Text style={styles.statIcon}>♥</Text>
                <Text style={styles.statText}>{FAKE_PROVIDER_APARTMENT.likes}</Text>
              </View>
            </View>
          </View>

          {/* Info */}
          <View style={styles.apartmentInfo}>
            <View style={styles.apartmentHeader}>
              <Text style={styles.apartmentPrice}>{FAKE_PROVIDER_APARTMENT.price} €</Text>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Aktivan</Text>
              </View>
            </View>

            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationText}>{FAKE_PROVIDER_APARTMENT.location.city}</Text>
            </View>

            {/* Quick Info */}
            <View style={styles.quickInfoRow}>
              <View style={styles.quickInfoBadge}>
                <Text style={styles.quickInfoText}>{FAKE_PROVIDER_APARTMENT.size}m²</Text>
              </View>
              <View style={styles.quickInfoBadge}>
                <Text style={styles.quickInfoText}>{FAKE_PROVIDER_APARTMENT.bedrooms} sobe</Text>
              </View>
              <View style={styles.quickInfoBadge}>
                <Text style={styles.quickInfoText}>{FAKE_PROVIDER_APARTMENT.bathrooms} kupatilo</Text>
              </View>
            </View>

            {/* AI Vibes */}
            <View style={styles.vibesSection}>
              <Text style={styles.vibesLabel}>AI Vajbovi:</Text>
              <View style={styles.vibesRow}>
                {FAKE_PROVIDER_APARTMENT.attributes.map((attr, index) => (
                  <View key={index} style={styles.vibeBadge}>
                    <Text style={styles.vibeIcon}>✱</Text>
                    <Text style={styles.vibeText}>#{attr.name}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Edit Button */}
            <Pressable style={styles.editButton} onPress={handleEditApartment}>
              <Text style={styles.editButtonText}>Izmeni oglas</Text>
            </Pressable>
          </View>
        </View>

        {/* Add Another Apartment */}
        <Pressable style={styles.addAnotherButton} onPress={handleAddApartment}>
          <View style={styles.addAnotherIcon}>
            <Text style={styles.addAnotherIconText}>+</Text>
          </View>
          <Text style={styles.addAnotherText}>Dodaj još jedan stan</Text>
        </Pressable>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

export default function FeedScreen() {
  const { feedItems, currentIndex, isLoading, error, fetchFeed, swipe, nextItem, showMatchModal, currentMatch, hideMatchModal } = useFeedStore();
  const { user } = useAuthStore();

  // Check if user is a provider
  const isProvider = user?.role === 'provider';

  useEffect(() => {
    // Only fetch feed if user is logged in and is a seeker
    if (user && !isProvider) {
      fetchFeed();
    }
  }, [user, isProvider]);

  // If provider, show provider view
  if (isProvider) {
    return <ProviderFeedView />;
  }

  const handleSwipe = async (action: SwipeAction) => {
    if (!feedItems[currentIndex]) return;
    await swipe(feedItems[currentIndex].item.id, action);
  };

  const currentItem = feedItems[currentIndex];
  const nextItemData = feedItems[currentIndex + 1];

  const handleCardPress = () => {
    if (currentItem) {
      router.push(`/apartment/${currentItem.item.id}`);
    }
  };

  const handleSendMessage = () => {
    hideMatchModal();
    if (currentMatch) {
      router.push(`/chat/${currentMatch.item.id}`);
    }
  };

  const handleKeepSwiping = () => {
    hideMatchModal();
  };

  // Get current user's vibes for MatchModal
  const currentUserVibes = user?.attributes?.map(a => a.name) || ['Chill'];
  const currentUserImage = user?.images?.[0];

  // Not logged in state
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/veliki logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>👋</Text>
          <Text style={styles.emptyTitle}>Dobrodošli!</Text>
          <Text style={styles.emptySubtitle}>Napravite profil da biste videli stanove</Text>
          <Pressable style={styles.refreshButton} onPress={() => router.push('/(onboarding)/role-selection')}>
            <Text style={styles.refreshButtonText}>Kreiraj profil</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Loading state
  if (isLoading && feedItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/veliki logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#E991D9" />
          <Text style={styles.emptyTitle}>Učitavanje...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error && feedItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/veliki logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>⚠️</Text>
          <Text style={styles.emptyTitle}>Greška</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <Pressable style={styles.refreshButton} onPress={() => fetchFeed()}>
            <Text style={styles.refreshButtonText}>Pokušaj ponovo</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Empty state - no apartments in database
  if (!currentItem) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/veliki logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🏠</Text>
          <Text style={styles.emptyTitle}>Nema stanova</Text>
          <Text style={styles.emptySubtitle}>
            Trenutno nema dostupnih stanova u bazi.{'\n'}
            Probaj ponovo kasnije ili dodaj svoj stan!
          </Text>
          <Pressable style={styles.refreshButton} onPress={() => fetchFeed()}>
            <Text style={styles.refreshButtonText}>Osveži feed</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Cards Container - Full screen, no header */}
      <View style={styles.cardsContainer}>
        {/* Next card (behind) */}
        {nextItemData && (
          <SwipeCard
            key={nextItemData.item.id}
            item={nextItemData}
            onSwipe={() => {}}
            isFirst={false}
          />
        )}

        {/* Current card (front) */}
        <SwipeCard
          key={currentItem.item.id}
          item={currentItem}
          onSwipe={handleSwipe}
          onPress={handleCardPress}
          isFirst={true}
        />
      </View>

      {/* Match Modal */}
      <MatchModal
        visible={showMatchModal}
        match={currentMatch}
        onSendMessage={handleSendMessage}
        onKeepSwiping={handleKeepSwiping}
        currentUserImage={currentUserImage}
        currentUserName={user?.name}
        currentUserVibes={currentUserVibes}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLogo: {
    width: 140,
    height: 36,
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    paddingBottom: 90, // Space for tab bar
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: '#E991D9',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Provider styles
  providerContent: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  providerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 24,
    marginBottom: 20,
  },
  emptyApartmentCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8E8F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 36,
  },
  addButton: {
    backgroundColor: '#E991D9',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  apartmentCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  apartmentImageContainer: {
    height: 200,
    position: 'relative',
  },
  apartmentImage: {
    width: '100%',
    height: '100%',
  },
  statsOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statIcon: {
    fontSize: 12,
  },
  statText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  apartmentInfo: {
    padding: 20,
  },
  apartmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  apartmentPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  activeBadge: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  locationText: {
    fontSize: 15,
    color: '#666',
  },
  quickInfoRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  quickInfoBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  quickInfoText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  vibesSection: {
    marginBottom: 20,
  },
  vibesLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  vibesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vibeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8E8F5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  vibeIcon: {
    fontSize: 12,
    color: '#E991D9',
  },
  vibeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  editButton: {
    backgroundColor: '#E991D9',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addAnotherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  addAnotherIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E991D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addAnotherIconText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '300',
  },
  addAnotherText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
});
