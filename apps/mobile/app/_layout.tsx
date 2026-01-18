import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

// 🎭 DEMO MODE - NO SOCKET INITIALIZATION!
export default function RootLayout() {
  // Socket initialization REMOVED - demo mode only!
  console.log('[LAYOUT] 🎭 DEMO MODE - No socket initialization');

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
