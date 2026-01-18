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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CompatibilityModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
  matchData: {
    name: string;
    image?: string;
    vibes: string[];
    matchScore: number;
    aiInsight: string;
  } | null;
  currentUserVibes?: string[];
}

export function CompatibilityModal({
  visible,
  onClose,
  onAccept,
  onReject,
  matchData,
  currentUserVibes = ['Noćna ptica', 'Gaming'],
}: CompatibilityModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
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
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!matchData) return null;

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
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </Pressable>

          {/* Logo */}
          <Image
            source={require('../../assets/mali logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Title */}
          <Text style={styles.title}>Zašto se uklapate?</Text>

          {/* Compatibility Diagram - Exact match to screenshot */}
          <View style={styles.diagramContainer}>
            {/* Top Vibe Badge */}
            <View style={styles.topVibe}>
              <View style={styles.vibeBadge}>
                <Text style={styles.vibeIcon}>✱</Text>
                <Text style={styles.vibeText}>#Noćna ptica</Text>
              </View>
            </View>

            {/* Connection lines from top vibe */}
            <View style={styles.topLinesContainer}>
              <View style={styles.topLineLeft} />
              <View style={styles.topLineRight} />
            </View>

            {/* Middle Row - Ti and Match User */}
            <View style={styles.usersRow}>
              {/* Ti (You) - Pink rounded rectangle */}
              <View style={styles.tiContainer}>
                <Text style={styles.tiText}>Ti</Text>
              </View>

              {/* Horizontal connection line */}
              <View style={styles.horizontalLine} />

              {/* Match User Photo */}
              <View style={styles.matchUserContainer}>
                {matchData.image ? (
                  <Image source={{ uri: matchData.image }} style={styles.matchUserImage} />
                ) : (
                  <View style={[styles.matchUserImage, styles.matchUserPlaceholder]}>
                    <Text style={styles.matchUserPlaceholderText}>
                      {matchData.name.charAt(0)}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Connection lines to bottom vibe */}
            <View style={styles.bottomLinesContainer}>
              <View style={styles.bottomLineLeft} />
              <View style={styles.bottomLineRight} />
            </View>

            {/* Bottom Vibe Badge */}
            <View style={styles.bottomVibe}>
              <View style={styles.vibeBadge}>
                <Text style={styles.vibeIcon}>✱</Text>
                <Text style={styles.vibeText}>#Gaming</Text>
              </View>
            </View>
          </View>

          {/* AI Insight */}
          <Text style={styles.aiInsightText}>
            <Text style={styles.aiInsightLabel}>* AI Insight: </Text>
            {matchData.aiInsight}
          </Text>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <Pressable style={styles.acceptButton} onPress={onAccept}>
              <Text style={styles.acceptButtonText}>Prihvati zahtev (Chat)</Text>
            </Pressable>

            <Pressable style={styles.rejectButton} onPress={onReject}>
              <Text style={styles.rejectButtonText}>Odbij</Text>
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
    width: SCREEN_WIDTH - 48,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 28,
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
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 28,
  },
  diagramContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  topVibe: {
    marginBottom: 4,
  },
  vibeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8E8F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  vibeIcon: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  vibeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  topLinesContainer: {
    width: 180,
    height: 30,
    position: 'relative',
  },
  topLineLeft: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 2,
    height: 15,
    backgroundColor: '#E991D9',
    marginLeft: -1,
  },
  topLineRight: {
    position: 'absolute',
    top: 15,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: '#E991D9',
  },
  usersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  tiContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#F8E8F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E991D9',
  },
  tiText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  horizontalLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E991D9',
    marginHorizontal: 0,
  },
  matchUserContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E991D9',
  },
  matchUserImage: {
    width: '100%',
    height: '100%',
  },
  matchUserPlaceholder: {
    backgroundColor: '#E991D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchUserPlaceholderText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  bottomLinesContainer: {
    width: 180,
    height: 30,
    position: 'relative',
  },
  bottomLineLeft: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: '#E991D9',
  },
  bottomLineRight: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 2,
    height: 30,
    backgroundColor: '#E991D9',
    marginLeft: -1,
  },
  bottomVibe: {
    marginTop: -4,
  },
  aiInsightText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  aiInsightLabel: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  acceptButton: {
    backgroundColor: '#E991D9',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  rejectButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CompatibilityModal;
