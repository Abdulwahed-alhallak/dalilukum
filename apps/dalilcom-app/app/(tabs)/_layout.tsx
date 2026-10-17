import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

const Icon = MaterialCommunityIcons as any;

const icons: Record<string, [string, string]> = {
  favorites: ['heart-outline', 'heart'],
  notifications: ['bell-outline', 'bell'],
  featured: ['auto-fix', 'auto-fix'],
  index: ['home-outline', 'home'],
  profile: ['account-outline', 'account'],
};

function TabIcon({ route, color, focused, badgeCount }: { route: string; color: string; focused: boolean; badgeCount?: number }) {
  if (route === 'create') {
    return (
      <View style={styles.addButton}>
        <Icon name="plus-circle-outline" size={31} color={COLORS.white} />
      </View>
    );
  }
  const [outline, filled] = icons[route] || ['circle-outline', 'circle'];
  return (
    <View>
      <Icon name={focused ? filled : outline} size={26} color={focused ? COLORS.primary : color} />
      {badgeCount && badgeCount > 0 ? (
        <View style={styles.badge}><Text style={styles.badgeText}>{badgeCount}</Text></View>
      ) : null}
    </View>
  );
}

export default function TabLayout() {
  const { state } = useApp();
  const unreadNotifs = state.notifications.filter(n => !n.isRead).length;
  const favCount = state.favorites.length;

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray500,
        tabBarStyle: styles.bar,
        tabBarLabelStyle: styles.label,
        headerShown: false,
      }}
    >
      <Tabs.Screen name="favorites" options={{ title: 'المفضلة', tabBarIcon: p => <TabIcon route="favorites" badgeCount={favCount} {...p} /> }} />
      <Tabs.Screen name="notifications" options={{ title: 'الإشعارات', tabBarIcon: p => <TabIcon route="notifications" badgeCount={unreadNotifs} {...p} /> }} />
      <Tabs.Screen name="create" options={{ title: '', tabBarIcon: p => <TabIcon route="create" {...p} /> }} />
      <Tabs.Screen name="featured" options={{ title: 'المميزة', tabBarIcon: p => <TabIcon route="featured" {...p} /> }} />
      <Tabs.Screen name="index" options={{ title: 'الرئيسية', tabBarIcon: p => <TabIcon route="index" {...p} /> }} />
      <Tabs.Screen name="cars" options={{ href: null }} />
      <Tabs.Screen name="real-estate" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: { backgroundColor: COLORS.white, borderTopColor: 'rgba(201,161,90,0.34)', borderTopWidth: 1, height: 76, paddingTop: 8, paddingBottom: 12, elevation: 12 },
  label: { fontSize: 11, fontWeight: '700' },
  addButton: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#0D3B46', alignItems: 'center', justifyContent: 'center', borderWidth: 5, borderColor: COLORS.white, marginTop: -27, elevation: 10 },
  badge: { position: 'absolute', top: -8, right: -9, minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 4, backgroundColor: '#C9A15A', alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: COLORS.white, fontSize: 11, fontWeight: '900' },
});
