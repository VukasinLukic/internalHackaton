import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Pressable,
  Animated,
  PanResponder,
} from 'react-native';
import type { FeedItem, SwipeAction } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_OUT_DURATION = 250;

interface SwipeCardProps {
  item: FeedItem;
  onSwipe: (action: SwipeAction) => void;
  onPress?: () => void;
  onDetailsPress?: () => void;
  isFirst?: boolean;
}

export function SwipeCard({ item, onSwipe, onPress, onDetailsPress, isFirst = true }: SwipeCardProps) {
  const position = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(isFirst ? 1 : 0.95)).current;

  // Reset position when item changes
  useEffect(() => {
    position.setValue({ x: 0, y: 0 });
    scale.setValue(isFirst ? 1 : 0.95);
  }, [item.item.id, isFirst]);

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-8deg', '0deg', '8deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const dislikeOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
      friction: 6,
      tension: 100,
    }).start();
  };

  const swipeCard = (direction: 'left' | 'right') => {
    const x = direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: true,
    }).start(() => {
      onSwipe(direction === 'right' ? 'like' : 'dislike');
      position.setValue({ x: 0, y: 0 });
    });
  };

  // Disabled swipe gestures - only buttons work now
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: () => false,
    })
  ).current;

  const cardStyle = {
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { rotate },
      { scale },
    ],
  };

  const { item: apartment, provider, score } = item;
  const primaryVibe = apartment.attributes?.[0]?.name || 'Cozy';
  const secondaryVibe = apartment.attributes?.[1]?.name || '';

  return (
    <Animated.View
      style={[styles.card, cardStyle]}
      {...(isFirst ? panResponder.panHandlers : {})}
    >
      <Pressable style={styles.cardContent} onPress={onPress} disabled={!isFirst}>
        {/* Logo at top */}
        <Image
          source={require('../../assets/veliki logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Main Image */}
        <View style={styles.imageContainer}>
          {apartment.images && apartment.images.length > 0 ? (
            <Image
              source={{ uri: apartment.images[0] }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>🏠</Text>
            </View>
          )}

          {/* Like Overlay */}
          <Animated.View style={[styles.overlay, styles.likeOverlay, { opacity: likeOpacity }]}>
            <View style={styles.overlayBadge}>
              <Text style={styles.overlayBadgeText}>SVIĐA MI SE ♥</Text>
            </View>
          </Animated.View>

          {/* Dislike Overlay */}
          <Animated.View style={[styles.overlay, styles.dislikeOverlay, { opacity: dislikeOpacity }]}>
            <View style={[styles.overlayBadge, styles.overlayBadgeDislike]}>
              <Text style={styles.overlayBadgeText}>NE ✕</Text>
            </View>
          </Animated.View>

          {/* Match Score Badge - top right */}
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{score.total}% Match!</Text>
          </View>
        </View>

        {/* Provider Avatar - overlapping image */}
        <View style={styles.providerAvatarContainer}>
          {provider.images && provider.images.length > 0 ? (
            <Image source={{ uri: provider.images[0] }} style={styles.providerAvatar} />
          ) : (
            <View style={[styles.providerAvatar, styles.providerAvatarPlaceholder]}>
              <Text style={styles.providerAvatarText}>{provider.name.charAt(0)}</Text>
            </View>
          )}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          {/* Price */}
          <Text style={styles.price}>{apartment.price} €</Text>

          {/* Location */}
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>{apartment.location.city}</Text>
          </View>

          {/* AI Insight Banner - Pink background */}
          <View style={styles.aiInsightBanner}>
            <View style={styles.aiInsightIconWrapper}>
              <Text style={styles.aiInsightIcon}>✱</Text>
            </View>
            <Text style={styles.aiInsightText}>
              Ovaj stan je '<Text style={styles.aiInsightHighlight}>{primaryVibe}{secondaryVibe ? ` & ${secondaryVibe}` : ''}</Text>', baš{'\n'}kao tvoj vajb!
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable style={styles.dislikeButton} onPress={() => swipeCard('left')}>
              <Text style={styles.dislikeButtonIcon}>✕</Text>
            </Pressable>

            <Pressable style={styles.detailsButton} onPress={onDetailsPress}>
              <Text style={styles.detailsButtonText}>Detaljnije</Text>
            </Pressable>

            <Pressable style={styles.likeButton} onPress={() => swipeCard('right')}>
              <Text style={styles.likeButtonIcon}>♥</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH - 32,
    height: SCREEN_HEIGHT * 0.78,
    backgroundColor: '#fff',
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  logo: {
    width: 100,
    height: 28,
    marginBottom: 16,
  },
  imageContainer: {
    flex: 1,
    maxHeight: '50%',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
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
    fontSize: 60,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeOverlay: {
    backgroundColor: 'rgba(34, 197, 94, 0.4)',
  },
  dislikeOverlay: {
    backgroundColor: 'rgba(239, 68, 68, 0.4)',
  },
  overlayBadge: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
  },
  overlayBadgeDislike: {
    backgroundColor: '#EF4444',
  },
  overlayBadgeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: '#22C55E',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  scoreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  providerAvatarContainer: {
    position: 'absolute',
    top: '50%',
    left: 36,
    marginTop: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#E991D9',
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
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
  infoSection: {
    paddingTop: 44,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  locationText: {
    fontSize: 16,
    color: '#666',
  },
  aiInsightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCE7F6',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    marginBottom: 20,
  },
  aiInsightIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiInsightIcon: {
    fontSize: 14,
    color: '#fff',
  },
  aiInsightText: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 20,
  },
  aiInsightHighlight: {
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  dislikeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dislikeButtonIcon: {
    fontSize: 24,
    color: '#666',
  },
  detailsButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: '#1a1a1a',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  likeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E991D9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E991D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  likeButtonIcon: {
    fontSize: 24,
    color: '#fff',
  },
});

export default SwipeCard;
