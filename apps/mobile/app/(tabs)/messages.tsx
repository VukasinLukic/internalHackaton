import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { router } from 'expo-router';

const MOCK_CONVERSATIONS = [
  {
    id: 'm1',
    otherUser: {
      name: 'Marko P.',
    },
    apartment: {
      location: 'Vračar',
      price: 350,
    },
    lastMessage: {
      text: 'Super! Možemo da se nađemo sutra?',
      timestamp: '14:30',
      isRead: false,
    },
  },
  {
    id: 'm2',
    otherUser: {
      name: 'Ana M.',
    },
    apartment: {
      location: 'Dorćol',
      price: 400,
    },
    lastMessage: {
      text: 'Stan je dostupan od sledećeg meseca.',
      timestamp: 'Juče',
      isRead: true,
    },
  },
];

export default function MessagesScreen() {
  const handleConversationPress = (matchId: string) => {
    router.push(`/chat/${matchId}`);
  };

  const renderConversation = ({ item }: { item: typeof MOCK_CONVERSATIONS[0] }) => (
    <Pressable
      style={styles.conversationCard}
      onPress={() => handleConversationPress(item.id)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.otherUser.name.charAt(0)}
        </Text>
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.userName}>{item.otherUser.name}</Text>
          <Text style={styles.timestamp}>{item.lastMessage.timestamp}</Text>
        </View>

        <Text style={styles.apartmentInfo}>
          🏠 {item.apartment.location} • {item.apartment.price}€
        </Text>

        <Text
          style={[
            styles.lastMessage,
            !item.lastMessage.isRead && styles.lastMessageUnread,
          ]}
          numberOfLines={1}
        >
          {item.lastMessage.text}
        </Text>
      </View>

      {!item.lastMessage.isRead && <View style={styles.unreadDot} />}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Poruke</Text>
      </View>

      <FlatList
        data={MOCK_CONVERSATIONS}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyTitle}>Nema poruka</Text>
            <Text style={styles.emptySubtitle}>
              Kada dobiješ match, možeš da počneš razgovor
            </Text>
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
  listContent: {
    flexGrow: 1,
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
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
