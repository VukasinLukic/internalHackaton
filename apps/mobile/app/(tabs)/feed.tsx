import { View, Text, StyleSheet, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { SwipeCard } from '../../src/components/SwipeCard';
import { MatchModal } from '../../src/components/MatchModal';
import { useFeedStore } from '../../src/stores/feedStore';
import type { FeedItem, SwipeAction } from '../../src/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Mock data - will be replaced with API/store data
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
      images: [],
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
        'Matching vibes: Modern, Minimalist',
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
      images: [],
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
      images: [],
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
  const { feedItems, currentIndex, isLoading, fetchFeed, swipe, nextItem, showMatchModal, currentMatch, hideMatchModal } = useFeedStore();

  useEffect(() => {
    fetchFeed();
  }, []);

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

  const handleButtonSwipe = (action: SwipeAction) => {
    handleSwipe(action);
  };

  // Loading state
  if (isLoading && feedItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ZZZimeri</Text>
        </View>
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.emptyTitle}>Učitavanje...</Text>
        </View>
      </View>
    );
  }

  // Empty state
  if (!currentItem) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ZZZimeri</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🏠</Text>
          <Text style={styles.emptyTitle}>Nema više stanova</Text>
          <Text style={styles.emptySubtitle}>Vrati se kasnije za nove opcije</Text>
          <Pressable style={styles.refreshButton} onPress={fetchFeed}>
            <Text style={styles.refreshButtonText}>Osveži feed</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ZZZimeri</Text>
        <Text style={styles.headerSubtitle}>
          {feedItems.length - currentIndex} stanova
        </Text>
      </View>

      {/* Cards Container */}
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

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Pressable
          style={[styles.actionButton, styles.dislikeButton]}
          onPress={() => handleButtonSwipe('dislike')}
        >
          <Text style={[styles.actionIcon, styles.dislikeIcon]}>✕</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.superlikeButton]}
          onPress={() => handleButtonSwipe('superlike')}
        >
          <Text style={[styles.actionIcon, styles.superlikeIcon]}>⭐</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleButtonSwipe('like')}
        >
          <Text style={[styles.actionIcon, styles.likeIcon]}>♥</Text>
        </Pressable>
      </View>

      {/* Match Modal */}
      <MatchModal
        visible={showMatchModal}
        match={currentMatch}
        onSendMessage={handleSendMessage}
        onKeepSwiping={handleKeepSwiping}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    paddingVertical: 20,
    paddingBottom: 30,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  dislikeButton: {
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#FF6B6B',
  },
  superlikeButton: {
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#4A90D9',
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  likeButton: {
    backgroundColor: '#FF6B6B',
  },
  actionIcon: {
    fontSize: 28,
  },
  dislikeIcon: {
    color: '#FF6B6B',
  },
  superlikeIcon: {
    color: '#4A90D9',
    fontSize: 24,
  },
  likeIcon: {
    color: '#fff',
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
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
