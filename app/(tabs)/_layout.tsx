import { Tabs } from 'expo-router';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Store01Icon, ShoppingCart01Icon, UserCircleIcon } from '@hugeicons/core-free-icons';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getCartCount } from '@/lib/cart';

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
      <HugeiconsIcon icon={ShoppingCart01Icon} size={26} color={color} strokeWidth={focused ? 2 : 1.5} />
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
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
          height: 65,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600', fontFamily: 'Aptos-SemiBold' },
        headerStyle: { backgroundColor: '#6C63FF' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontFamily: 'Aptos-Bold', fontSize: 20 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, focused }) => (
            <HugeiconsIcon icon={Store01Icon} size={26} color={color} strokeWidth={focused ? 2 : 1.5} />
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
            <HugeiconsIcon icon={UserCircleIcon} size={26} color={color} strokeWidth={focused ? 2 : 1.5} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -8,
    top: -4,
    backgroundColor: '#FF4757',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Aptos-Bold',
  },
});
