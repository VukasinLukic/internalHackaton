import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Image } from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useMatchStore } from '../../src/stores/matchStore';
import { useAuthStore } from '../../src/stores/authStore';
import type { Match } from '../../src/types';

export default function MatchesScreen() {
  const { user } = useAuthStore();
  const { matches, isLoading, fetchMatches, acceptMatch, rejectMatch } = useMatchStore();

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleMatchPress = (matchId: string) => {
    router.push(`/chat/${matchId}`);
  };

  const handleAccept = async (matchId: string) => {
    const success = await acceptMatch(matchId);
    if (success) {
      router.push(`/chat/${matchId}`);
    }
  };

  const handleReject = async (matchId: string) => {
    await rejectMatch(matchId);
  };

  const renderMatch = ({ item }: { item: Match }) => {
    const isProvider = user?.role === 'provider';
    const otherUser = isProvider ? item.seeker : item.provider;
    const isPending = item.status === 'pending';

    return (
      <Pressable style={styles.matchCard} onPress={() => !isPending && handleMatchPress(item.id)}>
        <View style={styles.matchImage}>
          {item.apartment.images?.[0] ? (
            <Image source={{ uri: item.apartment.images[0] }} style={styles.matchImageImg} />
          ) : (
            <Text style={styles.matchImageText}>🏠</Text>
          )}
        </View>

        <View style={styles.matchContent}>
          <View style={styles.matchHeader}>
            <Text style={styles.matchPrice}>{item.apartment.price}€/mes</Text>
            <View style={[styles.statusBadge, item.status === 'accepted' ? styles.statusAccepted : styles.statusPending]}>
              <Text style={styles.statusText}>
                {item.status === 'accepted' ? 'Prihvaćeno' : 'Na čekanju'}
              </Text>
            </View>
          </View>

          <Text style={styles.matchLocation}>📍 {item.apartment.location.city}</Text>
          <Text style={styles.matchProvider}>
            {isProvider ? `Tražilac: ${otherUser.name}` : `Vlasnik: ${otherUser.name}`}
          </Text>

          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{item.score.total}% Match</Text>
          </View>

          <View style={styles.reasonsContainer}>
            {item.score.reasons.slice(0, 2).map((reason, index) => (
              <Text key={index} style={styles.reason}>✓ {reason}</Text>
            ))}
          </View>

          {isProvider && isPending && (
            <View style={styles.actionButtons}>
              <Pressable style={styles.rejectButton} onPress={() => handleReject(item.id)}>
                <Text style={styles.rejectButtonText}>Odbij</Text>
              </Pressable>
              <Pressable style={styles.acceptButton} onPress={() => handleAccept(item.id)}>
                <Text style={styles.acceptButtonText}>Prihvati</Text>
              </Pressable>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  if (isLoading && matches.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tvoji Matchevi</Text>
        </View>
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.emptyTitle}>Učitavanje...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tvoji Matchevi</Text>
        <Text style={styles.headerSubtitle}>{matches.length} matcheva</Text>
      </View>

      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>💔</Text>
            <Text style={styles.emptyTitle}>Nema matcheva</Text>
            <Text style={styles.emptySubtitle}>Nastavi da swajpuješ!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  matchImage: {
    width: 100,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchImageImg: {
    width: '100%',
    height: '100%',
  },
  matchImageText: {
    fontSize: 40,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  matchContent: {
    flex: 1,
    padding: 16,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusAccepted: {
    backgroundColor: '#E8F5E9',
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  matchLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  matchProvider: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  scoreBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  reasonsContainer: {
    marginTop: 8,
  },
  reason: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
});
