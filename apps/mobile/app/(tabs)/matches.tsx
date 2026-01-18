import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Image, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useMatchStore } from '../../src/stores/matchStore';
import { useAuthStore } from '../../src/stores/authStore';
import { CompatibilityModal } from '../../src/components/CompatibilityModal';
import type { Match } from '../../src/types';

// Fake data for seekers - people interested in apartments
const FAKE_MATCHES_SEEKER = [
  {
    id: '1',
    name: 'Marko',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
    vibe: 'Student',
    matchScore: 95,
    vibes: ['Student', 'Tih'],
    aiInsight: 'Vaši vajbovi su sinhronizovani! Oboje cenite privatnost i tišinu.',
  },
  {
    id: '2',
    name: 'Ana',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    vibe: 'Uredan',
    matchScore: 92,
    vibes: ['Uredan', 'Organizovan'],
    aiInsight: 'Oboje volite čist i organizovan prostor. Savršen match!',
  },
  {
    id: '3',
    name: 'Ivan',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    vibe: 'Gamer',
    matchScore: 89,
    vibes: ['Gamer', 'Noćna ptica'],
    aiInsight: 'Imate slične navike - oboje ste noćne ptice i volite gaming.',
  },
  {
    id: '4',
    name: 'Jovana',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400',
    vibe: 'Kreativac',
    matchScore: 87,
    vibes: ['Kreativac', 'Ranoranioc'],
    aiInsight: 'Oboje imate kreativnu dušu i cenite jutarnju tišinu za rad.',
  },
  {
    id: '5',
    name: 'Stefan',
    image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400',
    vibe: 'Sportista',
    matchScore: 84,
    vibes: ['Sportista', 'Uredan'],
    aiInsight: 'Slični ste po aktivnom načinu života i održavanju reda.',
  },
];

// Fake data for providers - people requesting to rent their apartment
const FAKE_MATCHES_PROVIDER = [
  {
    id: '1',
    name: 'Milica',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    vibe: 'Studentkinja',
    matchScore: 97,
    vibes: ['Studentkinja', 'Uredna', 'Tiha'],
    aiInsight: 'Idealan cimer! Studentkinja sa odličnim navikama koje se poklapaju sa vašim očekivanjima.',
    message: 'Zdravo! Interesuje me vaš stan. Da li je još uvek dostupan?',
    timestamp: 'Pre 2h',
  },
  {
    id: '2',
    name: 'Nikola',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    vibe: 'Programer',
    matchScore: 94,
    vibes: ['Programer', 'Noćna ptica', 'Čist'],
    aiInsight: 'Radi od kuće i ceni mir. Voli urednost i neće praviti probleme.',
    message: 'Vidim da nudite stan na Vračaru. Mogu li da zakažem razgledanje?',
    timestamp: 'Pre 5h',
  },
  {
    id: '3',
    name: 'Teodora',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    vibe: 'Zaposlena',
    matchScore: 91,
    vibes: ['Zaposlena', 'Organizovana', 'Pet-friendly'],
    aiInsight: 'Zaposlena u IT firmi, stabilni prihodi. Voli životinje ali nema ljubimce.',
    message: 'Super stan! Da li dozvoljava ljubimce?',
    timestamp: 'Pre 1d',
  },
  {
    id: '4',
    name: 'Luka',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    vibe: 'Student',
    matchScore: 88,
    vibes: ['Student', 'Sportista', 'Druželjubiv'],
    aiInsight: 'Student medicine, aktivan i društven. Dobre reference od prethodnih stanodavaca.',
    message: 'Pozdrav, zanima me stan za sledeći semestar.',
    timestamp: 'Pre 2d',
  },
];

type MatchItem = typeof FAKE_MATCHES_SEEKER[0] | typeof FAKE_MATCHES_PROVIDER[0];

export default function MatchesScreen() {
  const { user } = useAuthStore();
  const { matches, isLoading, fetchMatches, acceptMatch, rejectMatch } = useMatchStore();
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null);
  const [showCompatibilityModal, setShowCompatibilityModal] = useState(false);

  const isProvider = user?.role === 'provider';

  useEffect(() => {
    fetchMatches();
  }, []);

  // Use appropriate fake data based on user role
  const displayMatches = isProvider ? FAKE_MATCHES_PROVIDER : FAKE_MATCHES_SEEKER;

  const handleMatchPress = (match: MatchItem) => {
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

  const renderSeekerMatchCard = ({ item }: { item: typeof FAKE_MATCHES_SEEKER[0] }) => {
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

  const renderProviderMatchCard = ({ item }: { item: typeof FAKE_MATCHES_PROVIDER[0] }) => {
    return (
      <Pressable style={styles.providerMatchCard} onPress={() => handleMatchPress(item)}>
        {/* Top Row: Avatar + Info + Score */}
        <View style={styles.providerTopRow}>
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
            <View style={styles.nameRow}>
              <Text style={styles.matchName}>{item.name}</Text>
              <Text style={styles.timestamp}>{item.timestamp}</Text>
            </View>
            <View style={styles.vibeBadge}>
              <Text style={styles.vibeIcon}>✱</Text>
              <Text style={styles.vibeText}>#{item.vibe}</Text>
            </View>
          </View>

          {/* Match Score */}
          <View style={styles.matchScoreBadgeProvider}>
            <Text style={styles.matchScoreTextProvider}>{item.matchScore}%</Text>
          </View>
        </View>

        {/* Message Preview */}
        <View style={styles.messagePreview}>
          <Text style={styles.messageText} numberOfLines={2}>{item.message}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <Pressable
            style={styles.rejectButtonSmall}
            onPress={(e) => {
              e.stopPropagation();
              handleReject();
            }}
          >
            <Text style={styles.rejectButtonSmallText}>Odbij</Text>
          </Pressable>
          <Pressable
            style={styles.acceptButtonSmall}
            onPress={(e) => {
              e.stopPropagation();
              router.push(`/chat/${item.id}`);
            }}
          >
            <Text style={styles.acceptButtonSmallText}>Prihvati i četiraj</Text>
          </Pressable>
        </View>
      </Pressable>
    );
  };

  if (isLoading && matches.length === 0 && displayMatches.length === 0) {
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
        <Text style={styles.title}>
          {isProvider ? 'Zahtevi za\nVaš Stan' : 'Zainteresovani\nCimeri'}
        </Text>

        {/* Subtitle for providers */}
        {isProvider && (
          <Text style={styles.subtitle}>
            {displayMatches.length} osoba zainteresovanih za vaš stan
          </Text>
        )}

        {/* Match Cards */}
        <View style={styles.matchesList}>
          {displayMatches.map((match, index) => (
            <View key={match.id || index}>
              {isProvider
                ? renderProviderMatchCard({ item: match as typeof FAKE_MATCHES_PROVIDER[0] })
                : renderSeekerMatchCard({ item: match as typeof FAKE_MATCHES_SEEKER[0] })
              }
            </View>
          ))}
        </View>

        {/* View All Button */}
        <Pressable style={styles.viewAllButton} onPress={handleViewAllRequests}>
          <Text style={styles.viewAllButtonText}>
            {isProvider ? 'Pogledaj sve zahteve' : 'Pogledaj sve zahteve'}
          </Text>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 20,
  },
  matchesList: {
    gap: 12,
  },
  // Seeker match card styles
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
  // Provider match card styles
  providerMatchCard: {
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
  providerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  matchScoreBadgeProvider: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  matchScoreTextProvider: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  messagePreview: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
  },
  messageText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  rejectButtonSmall: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  rejectButtonSmallText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButtonSmall: {
    flex: 2,
    backgroundColor: '#E991D9',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  acceptButtonSmallText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
