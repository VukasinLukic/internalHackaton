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
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface SwipeCardProps {
  item: FeedItem;
  onSwipe: (action: SwipeAction) => void;
  onPress?: () => void;
  isFirst?: boolean;
}

export function SwipeCard({ item, onSwipe, onPress, isFirst = true }: SwipeCardProps) {
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(isFirst ? 1 : 0.95)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isFirst,
      onMoveShouldSetPanResponder: () => isFirst,
      onPanResponderMove: (_, gestureState) => {
        pan.setValue({ x: gestureState.dx, y: gestureState.dy * 0.5 });
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          // Swipe right - LIKE
          Animated.timing(pan, {
            toValue: { x: SCREEN_WIDTH * 1.5, y: gestureState.dy },
            duration: 300,
            useNativeDriver: true,
          }).start(() => onSwipe('like'));
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Swipe left - DISLIKE
          Animated.timing(pan, {
            toValue: { x: -SCREEN_WIDTH * 1.5, y: gestureState.dy },
            duration: 300,
            useNativeDriver: true,
          }).start(() => onSwipe('dislike'));
        } else {
          // Snap back
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
            friction: 5,
          }).start();
        }
      },
    })
  ).current;

  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-15deg', '0deg', '15deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = pan.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const dislikeOpacity = pan.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const cardStyle = {
    transform: [
      { translateX: pan.x },
      { translateY: pan.y },
      { rotate },
      { scale },
    ],
    opacity: isFirst ? 1 : 0.7,
  };

  const { item: apartment, provider, score } = item;

  return (
    <Animated.View
      style={[styles.card, cardStyle]}
      {...(isFirst ? panResponder.panHandlers : {})}
    >
      <Pressable style={styles.cardContent} onPress={onPress} disabled={!isFirst}>
        {/* Image */}
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
            <Text style={styles.overlayText}>SVIĐA MI SE</Text>
          </Animated.View>

          {/* Dislike Overlay */}
          <Animated.View style={[styles.overlay, styles.dislikeOverlay, { opacity: dislikeOpacity }]}>
            <Text style={styles.overlayText}>NE</Text>
          </Animated.View>

          {/* Match Score Badge */}
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{score.total}%</Text>
            <Text style={styles.scoreLabel}>Match</Text>
          </View>

          {/* Image pagination dots */}
          {apartment.images && apartment.images.length > 1 && (
            <View style={styles.pagination}>
              {apartment.images.slice(0, 5).map((_, index) => (
                <View
                  key={index}
                  style={[styles.paginationDot, index === 0 && styles.paginationDotActive]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Card Info */}
        <View style={styles.infoContainer}>
          {/* Price & Location */}
          <View style={styles.headerRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{apartment.price}€</Text>
              <Text style={styles.priceLabel}>/mesec</Text>
            </View>
          </View>

          <Text style={styles.location}>📍 {apartment.location.city}</Text>

          {/* AI Vibes */}
          <View style={styles.vibesContainer}>
            {apartment.attributes.slice(0, 3).map((attr, index) => (
              <View key={index} style={styles.vibeBadge}>
                <Text style={styles.vibeText}>{attr.name}</Text>
              </View>
            ))}
          </View>

          {/* Provider Info */}
          <View style={styles.providerRow}>
            <View style={styles.providerAvatar}>
              <Text style={styles.providerAvatarText}>
                {provider.name.charAt(0)}
              </Text>
            </View>
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>{provider.name}</Text>
              <View style={styles.providerVibes}>
                {provider.attributes.slice(0, 2).map((attr, index) => (
                  <Text key={index} style={styles.providerVibe}>
                    {attr.name}
                    {index < Math.min(provider.attributes.length, 2) - 1 ? ' • ' : ''}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          {/* Match Reasons */}
          <View style={styles.reasonsContainer}>
            {score.reasons.slice(0, 2).map((reason, index) => (
              <Text key={index} style={styles.reason}>
                ✓ {reason}
              </Text>
            ))}
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
    height: SCREEN_HEIGHT * 0.7,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
  },
  imageContainer: {
    height: '50%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
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
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
  dislikeOverlay: {
    backgroundColor: 'rgba(244, 67, 54, 0.3)',
  },
  overlayText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    transform: [{ rotate: '-15deg' }],
  },
  scoreBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  scoreText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  scoreLabel: {
    color: '#fff',
    fontSize: 11,
    opacity: 0.9,
  },
  pagination: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 80,
    flexDirection: 'row',
    gap: 4,
  },
  paginationDot: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 2,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
  },
  infoContainer: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  vibesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  vibeBadge: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  vibeText: {
    fontSize: 13,
    color: '#4A90D9',
    fontWeight: '500',
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  providerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  providerAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  providerVibes: {
    flexDirection: 'row',
    marginTop: 2,
  },
  providerVibe: {
    fontSize: 13,
    color: '#666',
  },
  reasonsContainer: {
    marginTop: 12,
  },
  reason: {
    fontSize: 13,
    color: '#4CAF50',
    marginTop: 4,
  },
});

export default SwipeCard;
