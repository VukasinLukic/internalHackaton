import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Image, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useMatchStore } from '../../src/stores/matchStore';
import { useAuthStore } from '../../src/stores/authStore';
import { CompatibilityModal } from '../../src/components/CompatibilityModal';
import type { Match } from '../../src/types';

// Fake data for demo
const FAKE_MATCHES = [
  {
    id: '1',
    name: 'Marko',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    vibe: 'Student',
    matchScore: 95,
    vibes: ['Student', 'Tih'],
    aiInsight: 'Vaši vajbovi su sinhronizovani! Oboje cenite privatnost i tišinu.',
  },
  {
    id: '2',
    name: 'Ana',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    vibe: 'Uredan',
    matchScore: 92,
    vibes: ['Uredan', 'Organizovan'],
    aiInsight: 'Oboje volite čist i organizovan prostor. Savršen match!',
  },
  {
    id: '3',
    name: 'Ivan',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    vibe: 'Gamer',
    matchScore: 89,
    vibes: ['Gamer', 'Noćna ptica'],
    aiInsight: 'Imate slične navike - oboje ste noćne ptice i volite gaming.',
  },
];

export default function MatchesScreen() {
  const { user } = useAuthStore();
  const { matches, isLoading, fetchMatches, acceptMatch, rejectMatch } = useMatchStore();
  const [selectedMatch, setSelectedMatch] = useState<typeof FAKE_MATCHES[0] | null>(null);
  const [showCompatibilityModal, setShowCompatibilityModal] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  // Use fake data if no real matches
  const displayMatches = matches.length > 0 ? matches : FAKE_MATCHES;
  const isProvider = user?.role === 'provider';

  const handleMatchPress = (match: typeof FAKE_MATCHES[0]) => {
    setSelectedMatch(match);
    setShowCompatibilityModal(true);
  };

  const handleAccept = async () => {
    if (selectedMatch) {
      setShowCompatibilityModal(false);
      // Navigate to chat
      router.push(`/chat/${selectedMatch.id}`);
    }
  };

  const handleReject = async () => {
    setShowCompatibilityModal(false);
    setSelectedMatch(null);
  };

  const handleViewAllRequests = () => {
    // Could navigate to a full requests screen
  };

  const renderMatchCard = ({ item }: { item: typeof FAKE_MATCHES[0] }) => {
    return (
      <Pressable style={styles.matchCard} onPress={() => handleMatchPress(item)}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.matchInfo}>
          <Text style={styles.matchName}>{item.name}</Text>
          <View style={styles.vibeBadge}>
            <Text style={styles.vibeIcon}>✱</Text>
            <Text style={styles.vibeText}>#{item.vibe}</Text>
          </View>
        </View>

        {/* Match Score */}
        <View style={styles.matchScoreBadge}>
          <Text style={styles.matchScoreText}>{item.matchScore}% Match</Text>
        </View>
      </Pressable>
    );
  };

  if (isLoading && matches.length === 0 && FAKE_MATCHES.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/mali logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E991D9" />
          <Text style={styles.loadingText}>Učitavanje...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/mali logo.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={styles.title}>Zainteresovani{'\n'}Cimeri</Text>

        {/* Match Cards */}
        <View style={styles.matchesList}>
          {displayMatches.map((match, index) => (
            <View key={match.id || index}>
              {renderMatchCard({ item: match as typeof FAKE_MATCHES[0] })}
            </View>
          ))}
        </View>

        {/* View All Button */}
        <Pressable style={styles.viewAllButton} onPress={handleViewAllRequests}>
          <Text style={styles.viewAllButtonText}>Pogledaj sve zahteve</Text>
        </Pressable>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Compatibility Modal */}
      <CompatibilityModal
        visible={showCompatibilityModal}
        onClose={() => setShowCompatibilityModal(false)}
        onAccept={handleAccept}
        onReject={handleReject}
        matchData={selectedMatch ? {
          name: selectedMatch.name,
          image: selectedMatch.image,
          vibes: selectedMatch.vibes,
          matchScore: selectedMatch.matchScore,
          aiInsight: selectedMatch.aiInsight,
        } : null}
        currentUserVibes={user?.attributes?.map(a => a.name) || ['Noćna ptica', 'Gaming']}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  headerLogo: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    lineHeight: 40,
    marginBottom: 24,
  },
  matchesList: {
    gap: 12,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    backgroundColor: '#E991D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  vibeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8E8F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    gap: 4,
  },
  vibeIcon: {
    fontSize: 12,
    color: '#E991D9',
  },
  vibeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  matchScoreBadge: {
    backgroundColor: '#F8E8F5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E991D9',
  },
  matchScoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  viewAllButton: {
    backgroundColor: '#E991D9',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 24,
  },
  viewAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
});
