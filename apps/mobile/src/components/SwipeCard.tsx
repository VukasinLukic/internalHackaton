import React, { useRef } from 'react';
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
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const SWIPE_OUT_DURATION = 250;

interface SwipeCardProps {
  item: FeedItem;
  onSwipe: (action: SwipeAction) => void;
  onPress?: () => void;
  isFirst?: boolean;
}

export function SwipeCard({ item, onSwipe, onPress, isFirst = true }: SwipeCardProps) {
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(isFirst ? 1 : 0.92)).current;
  const opacity = useRef(new Animated.Value(isFirst ? 1 : 0.6)).current;

  // Animate the next card when current card is swiped
  const animateNextCard = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isFirst,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return isFirst && (Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5);
      },
      onPanResponderGrant: () => {
        // Slightly scale down on touch
        Animated.spring(scale, {
          toValue: 0.98,
          friction: 10,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (_, gestureState) => {
        pan.setValue({ x: gestureState.dx, y: gestureState.dy * 0.3 });
      },
      onPanResponderRelease: (_, gestureState) => {
        // Restore scale
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }).start();

        if (gestureState.dx > SWIPE_THRESHOLD) {
          // Swipe right - LIKE
          swipeOut('right', 'like');
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Swipe left - DISLIKE
          swipeOut('left', 'dislike');
        } else {
          // Snap back with spring animation
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
            friction: 5,
            tension: 100,
          }).start();
        }
      },
    })
  ).current;

  const swipeOut = (direction: 'left' | 'right', action: SwipeAction) => {
    const x = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;

    Animated.parallel([
      Animated.timing(pan, {
        toValue: { x, y: pan.y._value },
        duration: SWIPE_OUT_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: SWIPE_OUT_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onSwipe(action);
    });
  };

  // Programmatic swipe for button presses
  const handleButtonSwipe = (action: SwipeAction) => {
    if (action === 'like') {
      swipeOut('right', 'like');
    } else if (action === 'dislike') {
      swipeOut('left', 'dislike');
    }
  };

  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-12deg', '0deg', '12deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = pan.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const dislikeOpacity = pan.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD / 2, 0],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  // Scale up like/dislike icons when swiping
  const likeScale = pan.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0.5, 1.2],
    extrapolate: 'clamp',
  });

  const dislikeScale = pan.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1.2, 0.5],
    extrapolate: 'clamp',
  });

  const cardStyle = {
    transform: [
      { translateX: pan.x },
      { translateY: pan.y },
      { rotate },
      { scale },
    ],
    opacity,
  };

  const { item: apartment, provider, score } = item;

  // Get the first AI vibe for display
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

          {/* Like Overlay with Animation */}
          <Animated.View
            style={[
              styles.overlay,
              styles.likeOverlay,
              { opacity: likeOpacity }
            ]}
          >
            <Animated.View style={{ transform: [{ scale: likeScale }] }}>
              <View style={styles.overlayBadge}>
                <Text style={styles.overlayBadgeText}>SVIĐA MI SE</Text>
                <Text style={styles.overlayIcon}>♥</Text>
              </View>
            </Animated.View>
          </Animated.View>

          {/* Dislike Overlay with Animation */}
          <Animated.View
            style={[
              styles.overlay,
              styles.dislikeOverlay,
              { opacity: dislikeOpacity }
            ]}
          >
            <Animated.View style={{ transform: [{ scale: dislikeScale }] }}>
              <View style={[styles.overlayBadge, styles.overlayBadgeDislike]}>
                <Text style={[styles.overlayBadgeText, styles.overlayBadgeTextDislike]}>NE</Text>
                <Text style={[styles.overlayIcon, styles.overlayIconDislike]}>✕</Text>
              </View>
            </Animated.View>
          </Animated.View>

          {/* Match Score Badge - Green */}
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{score.total}% Match!</Text>
          </View>

          {/* Provider Avatar - Bottom Left */}
          <View style={styles.providerAvatarContainer}>
            {provider.images && provider.images.length > 0 ? (
              <Image source={{ uri: provider.images[0] }} style={styles.providerAvatar} />
            ) : (
              <View style={[styles.providerAvatar, styles.providerAvatarPlaceholder]}>
                <Text style={styles.providerAvatarText}>
                  {provider.name.charAt(0)}
                </Text>
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
            <Text style={styles.location}>
              {apartment.location.address ? `${apartment.location.address}, ` : ''}
              {apartment.location.city}
            </Text>
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
            <Pressable
              style={styles.dislikeButton}
              onPress={() => handleButtonSwipe('dislike')}
            >
              <Text style={styles.dislikeButtonIcon}>✕</Text>
            </Pressable>

            <Pressable
              style={styles.likeButton}
              onPress={() => handleButtonSwipe('like')}
            >
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
    marginBottom: 12,
  },
  imageContainer: {
    height: '50%',
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
    fontSize: 80,
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
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
  },
  dislikeOverlay: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  overlayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22C55E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 8,
  },
  overlayBadgeDislike: {
    backgroundColor: '#EF4444',
  },
  overlayBadgeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  overlayBadgeTextDislike: {
    color: '#fff',
  },
  overlayIcon: {
    fontSize: 28,
    color: '#fff',
  },
  overlayIconDislike: {
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
    bottom: -24,
    left: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#fff',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  providerAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
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
    paddingTop: 32,
    paddingHorizontal: 4,
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
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  location: {
    fontSize: 16,
    color: '#666',
  },
  aiInsightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 16,
  },
  aiInsightIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E991D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
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
    color: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginTop: 20,
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
    shadowRadius: 8,
    elevation: 3,
  },
  dislikeButtonIcon: {
    fontSize: 28,
    color: '#1a1a1a',
    fontWeight: '300',
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

export default SwipeCard;
