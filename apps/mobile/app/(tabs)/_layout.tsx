import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useAuthStore } from '../../src/stores/authStore';

// Custom tab bar icon component
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, { active: string; inactive: string }> = {
    feed: { active: '🏠', inactive: '🏠' },
    matches: { active: '📥', inactive: '📥' },
    profile: { active: '👤', inactive: '👤' },
  };

  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      <Text style={[styles.icon, focused && styles.iconActive]}>
        {focused ? icons[name]?.active : icons[name]?.inactive}
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
          title: 'Inbox',
          tabBarIcon: ({ focused }) => <TabIcon name="matches" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          href: null, // Hide this tab, we'll merge it with matches
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
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
    height: 70,
    paddingBottom: 16,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  iconContainer: {
    width: 40,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerActive: {
    // Active state styling
  },
  icon: {
    fontSize: 22,
    opacity: 0.6,
  },
  iconActive: {
    opacity: 1,
  },
});
