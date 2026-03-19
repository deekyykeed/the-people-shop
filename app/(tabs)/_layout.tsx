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

// Claude.ai design tokens (light mode)
const T = {
  bg100: '#F9F7F1',       // warm cream page bg
  bg200: '#F3F0E8',
  text000: '#141413',     // primary text
  text400: '#71706B',     // muted
  border100: '#1F1E1C',   // dark border
  brand200: '#D97857',    // terracotta brand
};

function TabIcon({ icon, color, focused }: { icon: any; color: string; focused: boolean }) {
  return (
    <View style={focused ? styles.activeIcon : undefined}>
      <HugeiconsIcon icon={icon} size={24} color={color} strokeWidth={focused ? 2 : 1.5} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: T.text000,
        tabBarInactiveTintColor: T.text400,
        tabBarStyle: {
          backgroundColor: T.bg100,
          borderTopWidth: 1,
          borderTopColor: T.border100,
          height: 60,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
        tabBarButton: (props) => (
          <Pressable
            {...props}
            onPress={(e) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              props.onPress?.(e);
            }}
          />
        ),
        headerStyle: { backgroundColor: T.bg100, shadowColor: 'transparent', borderBottomWidth: 1, borderBottomColor: T.border100 } as any,
        headerTintColor: T.text000,
        headerTitleStyle: { fontFamily: 'Aptos-SemiBold', fontSize: 16, color: T.text000 },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={Home05Icon} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="favourites"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={FavouriteIcon} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={ContainerTruckIcon} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
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
    shadowColor: T.text000,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
});
