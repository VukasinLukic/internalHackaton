import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useMatchStore } from '../../src/stores/matchStore';
import { useChatStore } from '../../src/stores/chatStore';
import type { Match } from '../../src/types';

export default function MessagesScreen() {
  const { matches, acceptedMatches, isLoading, fetchMatches } = useMatchStore();
  const { conversations } = useChatStore();

  useEffect(() => {
    fetchMatches();
  }, []);

  // Get matches that have accepted status (can chat)
  const chatableMatches = matches.filter((m) => m.status === 'accepted');

  const handleConversationPress = (matchId: string) => {
    router.push(`/chat/${matchId}`);
  };

  const getLastMessage = (matchId: string) => {
    const msgs = conversations[matchId];
    if (msgs && msgs.length > 0) {
      return msgs[msgs.length - 1];
    }
    return null;
  };

  const renderConversation = ({ item }: { item: Match }) => {
    const lastMessage = getLastMessage(item.id);
    const otherUserName = item.otherUser?.name || 'Korisnik';
    const itemLocation = item.item?.location?.city || '';
    const itemPrice = item.item?.price || 0;

    return (
      <Pressable
        style={styles.conversationCard}
        onPress={() => handleConversationPress(item.id)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {otherUserName.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.userName}>{otherUserName}</Text>
            {lastMessage && (
              <Text style={styles.timestamp}>
                {new Date(lastMessage.createdAt).toLocaleTimeString('sr-RS', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            )}
          </View>

          {itemLocation && itemPrice > 0 && (
            <Text style={styles.apartmentInfo}>
              🏠 {itemLocation} • {itemPrice}€
            </Text>
          )}

          <Text
            style={[
              styles.lastMessage,
              lastMessage && !lastMessage.read && styles.lastMessageUnread,
            ]}
            numberOfLines={1}
          >
            {lastMessage ? lastMessage.content : 'Započni razgovor...'}
          </Text>
        </View>

        {lastMessage && !lastMessage.read && <View style={styles.unreadDot} />}
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Poruke</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Poruke</Text>
      </View>

      <FlatList
        data={chatableMatches}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          chatableMatches.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyTitle}>Nema poruka</Text>
            <Text style={styles.emptySubtitle}>
              Kada dobiješ match i prihvatiš ga, možeš da počneš razgovor
            </Text>
            <Pressable style={styles.refreshButton} onPress={fetchMatches}>
              <Text style={styles.refreshButtonText}>Osveži</Text>
            </Pressable>
          </View>
        }
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
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flexGrow: 1,
  },
  listContentEmpty: {
    flex: 1,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  apartmentInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  lastMessageUnread: {
    color: '#1a1a1a',
    fontWeight: '500',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B6B',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
