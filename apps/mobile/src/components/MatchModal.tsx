import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import type { FeedItem } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MatchModalProps {
  visible: boolean;
  match: FeedItem | null;
  onSendMessage: () => void;
  onKeepSwiping: () => void;
  currentUserImage?: string;
  currentUserName?: string;
  currentUserVibes?: string[];
}

export function MatchModal({
  visible,
  match,
  onSendMessage,
  onKeepSwiping,
  currentUserImage,
  currentUserName = 'Ti',
  currentUserVibes = ['Chill'],
}: MatchModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

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
    } else {
      // Reset
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!match) return null;

  const { item: apartment, provider, score } = match;

  // Get provider's primary vibe
  const providerVibes = provider.attributes?.slice(0, 1).map(a => a.name) || ['Student'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View style={[styles.container, { opacity: opacityAnim }]}>
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          {/* Close Button */}
          <Pressable style={styles.closeButton} onPress={onKeepSwiping}>
            <Text style={styles.closeButtonText}>×</Text>
          </Pressable>

          {/* Logo */}
          <Image
            source={require('../../assets/mali logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Profile Photos with Match Score */}
          <View style={styles.photosContainer}>
            {/* Left Photo (Current User) */}
            <View style={styles.photoWrapper}>
              {currentUserImage ? (
                <Image source={{ uri: currentUserImage }} style={styles.profilePhoto} />
              ) : (
                <View style={[styles.profilePhoto, styles.profilePhotoPlaceholder]}>
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' }}
                    style={styles.profilePhoto}
                  />
                </View>
              )}
              <View style={styles.photoBorder} />
            </View>

            {/* Match Score Badge - Centered between photos */}
            <View style={styles.matchScoreBadge}>
              <Text style={styles.matchScoreText}>{score.total}% Match!</Text>
            </View>

            {/* Right Photo (Provider) */}
            <View style={[styles.photoWrapper, styles.photoWrapperRight]}>
              {provider.images && provider.images.length > 0 ? (
                <Image source={{ uri: provider.images[0] }} style={styles.profilePhoto} />
              ) : (
                <View style={[styles.profilePhoto, styles.profilePhotoPlaceholder]}>
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400' }}
                    style={styles.profilePhoto}
                  />
                </View>
              )}
              <View style={styles.photoBorder} />
            </View>
          </View>

          {/* It's a Match! Title */}
          <Text style={styles.title}>It's a Match!</Text>

          {/* Vibes Section */}
          <View style={styles.vibesContainer}>
            {/* Left Vibe (Current User) */}
            <View style={styles.vibeSection}>
              <View style={styles.vibeRow}>
                <View style={styles.vibeIconWrapper}>
                  <Text style={styles.vibeIcon}>✱</Text>
                </View>
                <View style={styles.vibeTextContainer}>
                  <Text style={styles.vibeLabel}>Tvoj vibe:</Text>
                  <Text style={styles.vibeValue}>{currentUserVibes[0] || 'Chill'}</Text>
                </View>
              </View>
              <View style={styles.vibeLine} />
            </View>

            {/* Right Vibe (Provider) */}
            <View style={[styles.vibeSection, styles.vibeSectionRight]}>
              <View style={styles.vibeLineRight} />
              <View style={styles.vibeRow}>
                <View style={styles.vibeIconWrapper}>
                  <Text style={styles.vibeIcon}>✱</Text>
                </View>
                <View style={styles.vibeTextContainer}>
                  <Text style={styles.vibeLabel}>Njegov vibe:</Text>
                  <Text style={styles.vibeValue}>{providerVibes[0] || 'Student'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Mutual Friend Section */}
          <View style={styles.mutualSection}>
            <View style={styles.mutualRow}>
              <View style={styles.vibeIconWrapper}>
                <Text style={styles.vibeIcon}>✱</Text>
              </View>
              <Text style={styles.mutualLabel}>Zajednički prijatelj</Text>
              <View style={styles.mutualAvatarWrapper}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' }}
                  style={styles.mutualAvatar}
                />
              </View>
            </View>
            <View style={styles.mutualLine} />
          </View>

          {/* AI Insight Banner */}
          <View style={styles.aiInsightBanner}>
            <Text style={styles.aiInsightIcon}>✱</Text>
            <Text style={styles.aiInsightText}>
              AI Insight: {score.reasons[0] || 'Oboje cenite mirno jutro i dobru kafu!'}
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <Pressable style={styles.chatButton} onPress={onSendMessage}>
              <Text style={styles.chatButtonText}>Započni Chat</Text>
            </Pressable>

            <Pressable style={styles.closeButtonSecondary} onPress={onKeepSwiping}>
              <Text style={styles.closeButtonSecondaryText}>Zatvori</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: SCREEN_WIDTH - 40,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 28,
    color: '#999',
    fontWeight: '300',
  },
  logo: {
    width: 40,
    height: 40,
    marginBottom: 16,
  },
  photosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  photoWrapper: {
    position: 'relative',
  },
  photoWrapperRight: {
    marginLeft: -20,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profilePhotoPlaceholder: {
    backgroundColor: '#E8E8E8',
    overflow: 'hidden',
  },
  photoBorder: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 53,
    borderWidth: 3,
    borderColor: '#E991D9',
  },
  matchScoreBadge: {
    position: 'absolute',
    top: -8,
    left: '50%',
    transform: [{ translateX: -45 }],
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 10,
  },
  matchScoreText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  vibesContainer: {
    width: '100%',
    marginBottom: 8,
  },
  vibeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vibeSectionRight: {
    justifyContent: 'flex-end',
  },
  vibeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vibeIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E991D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  vibeIcon: {
    fontSize: 12,
    color: '#fff',
  },
  vibeTextContainer: {
    flexDirection: 'column',
  },
  vibeLabel: {
    fontSize: 12,
    color: '#999',
  },
  vibeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  vibeLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E991D9',
    marginLeft: 8,
    marginTop: 4,
  },
  vibeLineRight: {
    flex: 1,
    height: 2,
    backgroundColor: '#E991D9',
    marginRight: 8,
    marginTop: 4,
  },
  mutualSection: {
    width: '100%',
    marginBottom: 16,
  },
  mutualRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mutualLabel: {
    fontSize: 14,
    color: '#1a1a1a',
    marginLeft: 0,
    marginRight: 8,
  },
  mutualAvatarWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mutualAvatar: {
    width: '100%',
    height: '100%',
  },
  mutualLine: {
    height: 2,
    backgroundColor: '#E991D9',
    marginLeft: 32,
    marginTop: 8,
    width: 100,
  },
  aiInsightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    marginBottom: 20,
  },
  aiInsightIcon: {
    fontSize: 14,
    color: '#1a1a1a',
    marginRight: 8,
  },
  aiInsightText: {
    flex: 1,
    fontSize: 13,
    color: '#1a1a1a',
    lineHeight: 18,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  chatButton: {
    backgroundColor: '#E991D9',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButtonSecondary: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  closeButtonSecondaryText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default MatchModal;
