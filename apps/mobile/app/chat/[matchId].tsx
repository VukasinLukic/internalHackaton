import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../src/stores/chatStore';
import { useAuthStore } from '../../src/stores/authStore';
import { useMatchStore } from '../../src/stores/matchStore';
import { useFeedStore } from '../../src/stores/feedStore';
import { useSocket } from '../../src/services/socket';
import type { Message, Match } from '../../src/types';

export default function ChatScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const [inputText, setInputText] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const flatListRef = useRef<FlatList>(null);

  const { user } = useAuthStore();
  const { conversations, fetchMessages, sendMessage: sendMessageToStore, isLoading } = useChatStore();
  const { matches, fetchMatch } = useMatchStore();
  const { feedItems } = useFeedStore();
  const { joinMatch, leaveMatch, sendTypingStart, sendTypingStop } = useSocket();

  // Find provider from feedItems using matchId (which is provider.id)
  const providerFromFeed = feedItems.find(item => item.provider.id === matchId)?.provider;

  // Use real messages from store, or local messages, start empty
  const realMessages = (matchId && conversations[matchId]) || [];
  const messages = realMessages.length > 0 ? realMessages : localMessages;

  const currentMatch = matches.find((m) => m.id === matchId);
  const [isTyping, setIsTyping] = useState(false);

  // Load messages and join match room
  useEffect(() => {
    if (!matchId) return;

    // Fetch match details if not already loaded
    if (!currentMatch) {
      fetchMatch(matchId);
    }

    // Fetch messages from API
    fetchMessages(matchId);

    // Join Socket.io room for real-time updates
    joinMatch(matchId);

    // Cleanup: leave room when unmounting
    return () => {
      leaveMatch(matchId);
      if (isTyping) {
        sendTypingStop(matchId);
      }
    };
  }, [matchId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const sendMessage = async () => {
    if (!inputText.trim() || !matchId) return;

    const messageContent = inputText;
    setInputText('');

    // Stop typing indicator
    if (isTyping) {
      sendTypingStop(matchId);
      setIsTyping(false);
    }

    // Create local message for demo
    const newMessage: Message = {
      id: `local-${Date.now()}`,
      matchId: matchId,
      senderId: user?.id || 'me',
      content: messageContent,
      createdAt: new Date().toISOString(),
      isRead: true,
    };

    // Add to local messages
    setLocalMessages(prev => [...prev, newMessage]);

    // Try to send via store (which calls API) - will fail silently in demo
    try {
      await sendMessageToStore(matchId, messageContent);
    } catch (e) {
      // Ignore API errors in demo mode
    }

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleTextChange = (text: string) => {
    setInputText(text);

    if (!matchId) return;

    // Send typing indicator
    if (text.length > 0 && !isTyping) {
      sendTypingStart(matchId);
      setIsTyping(true);
    } else if (text.length === 0 && isTyping) {
      sendTypingStop(matchId);
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === user?.id || item.senderId === 'me';

    return (
      <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
        <View style={[styles.messageBubble, isMe ? styles.messageBubbleMe : styles.messageBubbleOther]}>
          <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
            {item.content}
          </Text>
        </View>
        <Text style={[styles.timestamp, isMe && styles.timestampMe]}>
          {new Date(item.createdAt).toLocaleTimeString('sr-RS', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  if (isLoading && messages.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#E991D9" />
      </View>
    );
  }

  // Get the other user's name and match details - use provider from feed
  const otherUserName = providerFromFeed?.name || currentMatch?.otherUser?.name || 'Korisnik';
  const otherUserImage = providerFromFeed?.images?.[0] || currentMatch?.otherUser?.images?.[0] || 'https://i.pravatar.cc/150?img=1';
  const otherUserAttrs = providerFromFeed?.attributes || currentMatch?.otherUser?.attributes || [];

  // Generate AI icebreaker based on match data
  const getIcebreaker = () => {
    if (otherUserAttrs.length > 0) {
      const attr = otherUserAttrs[0];
      const firstName = otherUserName.split(' ')[0];
      if (attr.name === 'Organizovan') return `Pitaj ${firstName} o organizacionim veštinama!`;
      if (attr.name === 'Druželjubiv') return `Pitaj ${firstName} o hobijima!`;
      if (attr.name === 'Tih') return `Pitaj ${firstName} o omiljenom mestu za opuštanje!`;
      if (attr.name === 'Komunikativan') return `Pitaj ${firstName} o interesovanjima!`;
      if (attr.name === 'Pouzdan') return `Pitaj ${firstName} o iskustvu sa cimerima!`;
      return `Pitaj ${firstName} o sebi!`;
    }
    return `Započni razgovor sa ${otherUserName.split(' ')[0]}!`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>

        {/* Logo Icon */}
        <Image
          source={require('../../assets/mali logo.png')}
          style={styles.logoIcon}
          resizeMode="contain"
        />

        {/* User Info - Centered */}
        <View style={styles.headerCenter}>
          <Image source={{ uri: otherUserImage }} style={styles.headerAvatar} />
          <Text style={styles.headerName}>{otherUserName}</Text>
        </View>

        {/* Menu dots */}
        <Pressable style={styles.menuButton}>
          <Text style={styles.menuButtonText}>•••</Text>
        </Pressable>
      </View>

      {/* AI Icebreaker Banner */}
      <View style={styles.icebreakerBanner}>
        <Text style={styles.icebreakerIcon}>✱</Text>
        <Text style={styles.icebreakerText}>AI Icebreaker: {getIcebreaker()}</Text>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Pressable style={styles.emojiButton}>
            <Text style={styles.emojiButtonText}>☺</Text>
          </Pressable>
          <TextInput
            style={styles.input}
            placeholder="Napiši poruku..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={handleTextChange}
            multiline
            maxLength={500}
          />
        </View>
        <Pressable
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonIcon}>▶</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#1a1a1a',
  },
  logoIcon: {
    width: 32,
    height: 32,
    marginLeft: 4,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 4,
  },
  menuButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 18,
    color: '#1a1a1a',
    letterSpacing: 2,
  },
  icebreakerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  icebreakerIcon: {
    fontSize: 14,
    color: '#fff',
    marginRight: 8,
  },
  icebreakerText: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageRow: {
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  messageRowMe: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  messageBubbleOther: {
    backgroundColor: '#F5F5F5',
    borderBottomLeftRadius: 4,
  },
  messageBubbleMe: {
    backgroundColor: '#E991D9',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#1a1a1a',
    lineHeight: 20,
  },
  messageTextMe: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    marginLeft: 4,
  },
  timestampMe: {
    marginRight: 4,
    marginLeft: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 30,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 4,
    minHeight: 48,
  },
  emojiButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiButtonText: {
    fontSize: 22,
    color: '#999',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
    paddingVertical: 8,
    paddingRight: 12,
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E991D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#F0D4EB',
  },
  sendButtonIcon: {
    fontSize: 18,
    color: '#fff',
    marginLeft: 2,
  },
});
