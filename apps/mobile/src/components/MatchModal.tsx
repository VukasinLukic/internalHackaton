import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
  Animated,
} from 'react-native';
import type { FeedItem } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MatchModalProps {
  visible: boolean;
  match: FeedItem | null;
  onSendMessage: () => void;
  onKeepSwiping: () => void;
}

export function MatchModal({
  visible,
  match,
  onSendMessage,
  onKeepSwiping,
}: MatchModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Heart animation with delay
      setTimeout(() => {
        Animated.sequence([
          Animated.spring(heartScale, {
            toValue: 1.3,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.spring(heartScale, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
          }),
        ]).start();
      }, 200);
    } else {
      // Reset
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      heartScale.setValue(0);
    }
  }, [visible]);

  if (!match) return null;

  const { item: apartment, provider, score } = match;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View style={[styles.container, { opacity: opacityAnim }]}>
        {/* Confetti background */}
        <View style={styles.confettiContainer}>
          {[...Array(20)].map((_, i) => (
            <Text
              key={i}
              style={[
                styles.confetti,
                {
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 60}%`,
                  fontSize: 16 + Math.random() * 20,
                  transform: [{ rotate: `${Math.random() * 360}deg` }],
                },
              ]}
            >
              {['🎉', '✨', '💫', '🌟', '❤️', '🎊'][Math.floor(Math.random() * 6)]}
            </Text>
          ))}
        </View>

        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          {/* Heart animation */}
          <Animated.View style={[styles.heartContainer, { transform: [{ scale: heartScale }] }]}>
            <Text style={styles.heartEmoji}>💕</Text>
          </Animated.View>

          {/* Title */}
          <Text style={styles.title}>It's a Match!</Text>
          <Text style={styles.subtitle}>
            Ti i {provider.name} imate {score.total}% kompatibilnosti
          </Text>

          {/* Avatars */}
          <View style={styles.avatarsRow}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>👤</Text>
              </View>
              <Text style={styles.avatarLabel}>Ti</Text>
            </View>

            <View style={styles.matchIcon}>
              <Text style={styles.matchIconText}>❤️</Text>
            </View>

            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, styles.avatarProvider]}>
                <Text style={styles.avatarText}>
                  {provider.name.charAt(0)}
                </Text>
              </View>
              <Text style={styles.avatarLabel}>{provider.name}</Text>
            </View>
          </View>

          {/* Apartment info */}
          <View style={styles.apartmentInfo}>
            <Text style={styles.apartmentPrice}>{apartment.price}€/mesec</Text>
            <Text style={styles.apartmentLocation}>📍 {apartment.location.city}</Text>
          </View>

          {/* Match Reasons */}
          <View style={styles.reasonsContainer}>
            <Text style={styles.reasonsTitle}>Zašto ste kompatibilni:</Text>
            {score.reasons.slice(0, 3).map((reason, index) => (
              <View key={index} style={styles.reasonRow}>
                <Text style={styles.reasonIcon}>✓</Text>
                <Text style={styles.reasonText}>{reason}</Text>
              </View>
            ))}
          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <Pressable style={styles.messageButton} onPress={onSendMessage}>
              <Text style={styles.messageButtonText}>💬 Pošalji poruku</Text>
            </Pressable>

            <Pressable style={styles.keepSwipingButton} onPress={onKeepSwiping}>
              <Text style={styles.keepSwipingButtonText}>Nastavi dalje</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  confetti: {
    position: 'absolute',
  },
  card: {
    width: SCREEN_WIDTH - 40,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  heartContainer: {
    marginBottom: 8,
  },
  heartEmoji: {
    fontSize: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4A90D9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarProvider: {
    backgroundColor: '#FF6B6B',
  },
  avatarText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  avatarLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  matchIcon: {
    marginHorizontal: 16,
  },
  matchIconText: {
    fontSize: 32,
  },
  apartmentInfo: {
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  apartmentPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  apartmentLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  reasonsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  reasonsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reasonIcon: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 8,
  },
  reasonText: {
    fontSize: 14,
    color: '#444',
    flex: 1,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  messageButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  keepSwipingButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  keepSwipingButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default MatchModal;
