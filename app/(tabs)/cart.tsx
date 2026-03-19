import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Delete02Icon, Add01Icon, MinusSignIcon, ShoppingCart01Icon } from '@hugeicons/core-free-icons';
import { useTheme, Theme } from '@/lib/theme';
import { getCartItems, updateCartQty, removeFromCart, clearCart } from '@/lib/cart';
import { CartItem } from '@/lib/supabase';

export default function CartScreen() {
  const T = useTheme();
  const s = makeStyles(T);

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await getCartItems();
      setItems(data as CartItem[]);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleQty = async (item: CartItem, delta: number) => {
    setUpdatingId(item.id);
    try {
      await updateCartQty(item.id, item.quantity + delta);
      await load();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (item: CartItem) => {
    setUpdatingId(item.id);
    try {
      await removeFromCart(item.id);
      await load();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClear = () => {
    Alert.alert('Clear cart?', 'Remove all items from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear', style: 'destructive', onPress: async () => {
          setLoading(true);
          await clearCart();
          await load();
        },
      },
    ]);
  };

  const total = items.reduce((sum, i) => sum + (i.products?.price ?? 0) * i.quantity, 0);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={T.brand200} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={s.center}>
        <HugeiconsIcon icon={ShoppingCart01Icon} size={56} color={T.text400} strokeWidth={1} />
        <Text style={s.emptyTitle}>Your cart is empty</Text>
        <Text style={s.emptySubtitle}>Add some products from the shop</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={s.row}>
            {item.products?.image_url ? (
              <Image source={{ uri: item.products.image_url }} style={s.thumb} />
            ) : (
              <View style={[s.thumb, s.thumbPlaceholder]}>
                <Text style={{ fontSize: 22 }}>🛒</Text>
              </View>
            )}
            <View style={s.info}>
              <Text style={s.name} numberOfLines={2}>{item.products?.name}</Text>
              <Text style={s.price}>£{((item.products?.price ?? 0) * item.quantity).toFixed(2)}</Text>
              <View style={s.qtyRow}>
                <TouchableOpacity
                  style={s.qtyBtn}
                  onPress={() => handleQty(item, -1)}
                  disabled={updatingId === item.id}
                >
                  <HugeiconsIcon icon={MinusSignIcon} size={14} color={T.text000} strokeWidth={2} />
                </TouchableOpacity>
                <Text style={s.qty}>{item.quantity}</Text>
                <TouchableOpacity
                  style={s.qtyBtn}
                  onPress={() => handleQty(item, 1)}
                  disabled={updatingId === item.id}
                >
                  <HugeiconsIcon icon={Add01Icon} size={14} color={T.text000} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => handleRemove(item)}
              disabled={updatingId === item.id}
              style={s.deleteBtn}
            >
              <HugeiconsIcon icon={Delete02Icon} size={20} color={T.danger000} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <View style={s.footer}>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Total</Text>
              <Text style={s.totalValue}>£{total.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={s.checkoutBtn} activeOpacity={0.8}>
              <Text style={s.checkoutText}>Checkout</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClear} style={s.clearBtn}>
              <Text style={s.clearText}>Clear cart</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

function makeStyles(T: Theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: T.bg100 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: T.bg100, gap: 10 },
    list: { padding: 14, gap: 10, paddingBottom: 40 },
    emptyTitle: { fontSize: 17, fontFamily: 'Aptos-SemiBold', color: T.text000, marginTop: 12 },
    emptySubtitle: { fontSize: 13, fontFamily: 'Aptos', color: T.text400 },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: T.bg000,
      borderRadius: 10,
      padding: 12,
      borderWidth: 1,
      borderColor: T.border100,
      // @ts-ignore
      borderOpacity: 0.1,
    },
    thumb: { width: 64, height: 64, borderRadius: 8 },
    thumbPlaceholder: { backgroundColor: T.bg200, alignItems: 'center', justifyContent: 'center' },
    info: { flex: 1, gap: 4 },
    name: { fontSize: 13, fontFamily: 'Aptos-SemiBold', color: T.text000, lineHeight: 18 },
    price: { fontSize: 15, fontFamily: 'Aptos-Bold', color: T.brand200 },
    qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
    qtyBtn: {
      width: 26, height: 26, borderRadius: 6,
      backgroundColor: T.bg200, alignItems: 'center', justifyContent: 'center',
    },
    qty: { fontSize: 14, fontFamily: 'Aptos-SemiBold', color: T.text000, minWidth: 18, textAlign: 'center' },
    deleteBtn: { padding: 4 },

    footer: { marginTop: 16, gap: 10 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 },
    totalLabel: { fontSize: 15, fontFamily: 'Aptos', color: T.text200 },
    totalValue: { fontSize: 22, fontFamily: 'Aptos-Bold', color: T.text000 },
    checkoutBtn: {
      backgroundColor: T.brand200,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: T.brand000,
    },
    checkoutText: { color: T.onColor, fontFamily: 'Aptos-SemiBold', fontSize: 15 },
    clearBtn: { alignItems: 'center', paddingVertical: 6 },
    clearText: { fontSize: 13, fontFamily: 'Aptos', color: T.danger000 },
  });
}
