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

const T = {
  bg: '#FCFCFC',
  textDefault: '#171717',
  textMuted: '#707070',
  border: '#DFDFDF',
  brandLink: '#00B976',
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
        tabBarActiveTintColor: T.textDefault,
        tabBarInactiveTintColor: T.textMuted,
        tabBarStyle: {
          backgroundColor: T.bg,
          borderTopWidth: 1,
          borderTopColor: T.border,
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
        headerStyle: { backgroundColor: T.bg, shadowColor: 'transparent', borderBottomWidth: 1, borderBottomColor: T.border } as any,
        headerTintColor: T.textDefault,
        headerTitleStyle: { fontFamily: 'Aptos-SemiBold', fontSize: 16, color: T.textDefault },
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
    shadowColor: '#171717',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
});
