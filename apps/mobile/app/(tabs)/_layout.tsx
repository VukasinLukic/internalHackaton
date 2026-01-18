import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '../../src/stores/authStore';

// Custom tab bar icon component
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const getIcon = () => {
    switch (name) {
      case 'feed':
        return '🏠';
      case 'matches':
        return '💌';
      case 'profile':
        return '👤';
      default:
        return '📱';
    }
  };

  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, focused && styles.iconActive]}>
        {getIcon()}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const { user } = useAuthStore();
  const isProvider = user?.role === 'provider';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#E991D9',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: isProvider ? 'Moj Stan' : 'Istraži',
          tabBarIcon: ({ focused }) => <TabIcon name="feed" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: isProvider ? 'Zahtevi' : 'Matchovi',
          tabBarIcon: ({ focused }) => <TabIcon name="matches" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          href: null, // Hide this tab
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 0,
    height: 80,
    paddingBottom: 24,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 20,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  iconContainer: {
    width: 44,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 26,
    opacity: 0.5,
  },
  iconActive: {
    opacity: 1,
  },
});
