import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useAuthStore } from '../src/stores/authStore';
import { chatSocket } from '../src/services/socket';

export default function RootLayout() {
  const { user } = useAuthStore();

  // Initialize Socket.io when user logs in
  useEffect(() => {
    if (user) {
      chatSocket.connect();
    } else {
      chatSocket.disconnect();
    }

    return () => {
      chatSocket.disconnect();
    };
  }, [user]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
