import { View, Text, StyleSheet, Pressable, Dimensions, ActivityIndicator, Image } from 'react-native';
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

export default function FeedScreen() {
  const { feedItems, currentIndex, isLoading, error, fetchFeed, swipe, nextItem, showMatchModal, currentMatch, hideMatchModal } = useFeedStore();
  const { user } = useAuthStore();

  useEffect(() => {
    // Only fetch feed if user is logged in
    if (user) {
      fetchFeed();
    }
  }, [user]);

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
});
