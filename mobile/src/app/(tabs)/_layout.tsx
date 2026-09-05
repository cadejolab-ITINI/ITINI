import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { colors, font } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.emerald,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { position: 'absolute', left: 12, right: 12, bottom: 10, height: 64, borderRadius: 22, borderWidth: 1, borderTopWidth: 1, borderColor: '#1B2A42', backgroundColor: 'rgba(3, 9, 26, 0.97)', paddingBottom: 7, paddingTop: 7, elevation: 12, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
        tabBarLabelStyle: { fontFamily: font.bold, fontSize: 9 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Mapa', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="community" options={{ title: 'Comunidad', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-group-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="destinations" options={{ title: 'Destinos', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="map-marker-radius-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Ajustes', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="cog-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="budget" options={{ href: null }} />
    </Tabs>
  );
}
