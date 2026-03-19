import { Tabs } from 'expo-router';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Store01Icon, ShoppingCart01Icon, UserCircleIcon } from '@hugeicons/core-free-icons';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getCartCount } from '@/lib/cart';

const T = {
  bg: '#FCFCFC',
  textDefault: '#171717',
  textMuted: '#707070',
  border: '#DFDFDF',
  brandLink: '#00B976',
  brandFill: '#72E3AD',
};

function CartTabIcon({ color, focused }: { color: string; focused: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    getCartCount().then((n) => { if (active) setCount(n); }).catch(() => {});
    const interval = setInterval(() => {
      getCartCount().then((n) => { if (active) setCount(n); }).catch(() => {});
    }, 3000);
    return () => { active = false; clearInterval(interval); };
  }, []);

  return (
    <View>
      <HugeiconsIcon icon={ShoppingCart01Icon} size={24} color={color} strokeWidth={focused ? 2 : 1.5} />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
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
        headerStyle: { backgroundColor: T.bg, shadowColor: 'transparent', borderBottomWidth: 1, borderBottomColor: T.border } as any,
        headerTintColor: T.textDefault,
        headerTitleStyle: { fontFamily: 'Aptos-SemiBold', fontSize: 16, color: T.textDefault },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, focused }) => (
            <HugeiconsIcon icon={Store01Icon} size={24} color={color} strokeWidth={focused ? 2 : 1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, focused }) => (
            <CartTabIcon color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <HugeiconsIcon icon={UserCircleIcon} size={24} color={color} strokeWidth={focused ? 2 : 1.5} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -7,
    top: -3,
    backgroundColor: 'rgba(220,123,24,0.9)',
    borderRadius: 9999,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'Aptos-Bold',
    letterSpacing: 0.07,
  },
});
