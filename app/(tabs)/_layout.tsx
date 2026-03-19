import { Tabs } from 'expo-router';
import { View, StyleSheet, Pressable } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import * as Haptics from 'expo-haptics';
import {
  Home05Icon,
  FavouriteIcon,
  ContainerTruckIcon,
  Settings03Icon,
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/lib/theme';

function TabIcon({ icon, color, focused }: { icon: any; color: string; focused: boolean }) {
  return (
    <View style={focused ? styles.activeIcon : undefined}>
      <HugeiconsIcon icon={icon} size={24} color={color} strokeWidth={focused ? 2 : 1.5} />
    </View>
  );
}

export default function TabLayout() {
  const T = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: T.text000,
        tabBarInactiveTintColor: T.text400,
        tabBarStyle: {
          backgroundColor: T.bg100,
          borderTopWidth: 1,
          borderTopColor: T.borderSubtle,
          height: 60,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarButton: (props) => (
          <Pressable
            {...props}
            onPress={(e) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              props.onPress?.(e);
            }}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={Home05Icon} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="favourites"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={FavouriteIcon} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen name="cart" options={{ href: null }} />
      <Tabs.Screen name="upload" options={{ href: null }} />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={ContainerTruckIcon} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={Settings03Icon} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIcon: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
});
