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
const SWIPE_OUT_DURATION = 300;

interface SwipeCardProps {
  item: FeedItem;
  onSwipe: (action: SwipeAction) => void;
  onPress?: () => void;
  isFirst?: boolean;
}

export function SwipeCard({ item, onSwipe, onPress, isFirst = true }: SwipeCardProps) {
  const position = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(isFirst ? 1 : 0.95)).current;

  // Reset position when item changes
  useEffect(() => {
    position.setValue({ x: 0, y: 0 });
    scale.setValue(isFirst ? 1 : 0.95);
  }, [item.item.id, isFirst]);

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
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
      friction: 5,
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
      // Reset position for next card
      position.setValue({ x: 0, y: 0 });
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isFirst,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return isFirst && Math.abs(gesture.dx) > 5;
      },
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy * 0.3 });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          swipeCard('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          swipeCard('left');
        } else {
          resetPosition();
        }
      },
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

  return (
    <Animated.View
      style={[styles.card, cardStyle]}
      {...(isFirst ? panResponder.panHandlers : {})}
    >
      <Pressable style={styles.cardContent} onPress={onPress} disabled={!isFirst}>
        {/* Logo */}
        <Image
          source={require('../../assets/veliki logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Image Container */}
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

          {/* Match Score Badge */}
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{score.total}% Match!</Text>
          </View>

          {/* Provider Avatar - Positioned at top of info section */}
          <View style={styles.providerAvatarContainer}>
            {provider.images && provider.images.length > 0 ? (
              <Image source={{ uri: provider.images[0] }} style={styles.providerAvatar} />
            ) : (
              <View style={[styles.providerAvatar, styles.providerAvatarPlaceholder]}>
                <Text style={styles.providerAvatarText}>{provider.name.charAt(0)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Card Info */}
        <View style={styles.infoContainer}>
          {/* Price */}
          <Text style={styles.price}>{apartment.price} €</Text>

          {/* Location */}
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.location}>{apartment.location.city}</Text>
          </View>

          {/* Apartment Details Badges */}
          <View style={styles.detailsRow}>
            <View style={styles.detailBadge}>
              <Text style={styles.detailText}>{apartment.size}m²</Text>
            </View>
            <View style={styles.detailBadge}>
              <Text style={styles.detailText}>{apartment.bedrooms} sobe</Text>
            </View>
            <View style={styles.detailBadge}>
              <Text style={styles.detailText}>{apartment.bathrooms} kupatilo</Text>
            </View>
          </View>

          {/* AI Insight Banner */}
          <View style={styles.aiInsightBanner}>
            <View style={styles.aiInsightIconWrapper}>
              <Text style={styles.aiInsightIcon}>✱</Text>
            </View>
            <Text style={styles.aiInsightText}>
              Ovaj stan je '<Text style={styles.aiInsightHighlight}>{primaryVibe}</Text>', baš kao tvoj vajb!
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable style={styles.dislikeButton} onPress={() => swipeCard('left')}>
              <Text style={styles.dislikeButtonIcon}>✕</Text>
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
    height: SCREEN_HEIGHT * 0.75,
    backgroundColor: '#fff',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  logo: {
    width: 120,
    height: 32,
    marginBottom: 8,
  },
  imageContainer: {
    height: '45%',
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
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
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
  },
  overlayBadgeDislike: {
    backgroundColor: '#EF4444',
  },
  overlayBadgeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  scoreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  providerAvatarContainer: {
    position: 'absolute',
    bottom: -28,
    left: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#fff',
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoContainer: {
    flex: 1,
    paddingTop: 36,
    paddingHorizontal: 4,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  location: {
    fontSize: 15,
    color: '#666',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  detailBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  aiInsightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 12,
  },
  aiInsightIconWrapper: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E991D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  aiInsightIcon: {
    fontSize: 11,
    color: '#fff',
  },
  aiInsightText: {
    flex: 1,
    fontSize: 13,
    color: '#fff',
    lineHeight: 18,
  },
  aiInsightHighlight: {
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginTop: 14,
  },
  dislikeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    fontSize: 26,
    color: '#666',
  },
  likeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    fontSize: 26,
    color: '#fff',
  },
});

export default SwipeCard;
