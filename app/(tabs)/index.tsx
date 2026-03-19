import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase, Product } from '@/lib/supabase';
import { addToCart } from '@/lib/cart';
import { useTheme, Theme } from '@/lib/theme';

const CARD_GAP = 12;
const SCREEN_PADDING = 16;

export default function ShopScreen() {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const CARD_WIDTH = (Dimensions.get('window').width - SCREEN_PADDING * 2 - CARD_GAP) / 2;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const { data } = await supabase.from('products').select('*, categories(*)').order('name');
    if (data) setProducts(data);
  }, []);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleAddToCart = async (productId: string) => {
    setAddingId(productId);
    try {
      await addToCart(productId);
    } catch {
      // silently fail
    } finally {
      setAddingId(null);
    }
  };

  const s = makeStyles(T, CARD_WIDTH);

  if (loading) {
    return (
      <View style={[s.container, s.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={T.brand200} />
      </View>
    );
  }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={s.row}
        contentContainerStyle={s.grid}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.brand200} />
        }
        ListEmptyComponent={
          <View style={s.center}>
            <Text style={s.emptyText}>No products found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard item={item} addingId={addingId} onAdd={handleAddToCart} />
        )}
      />
    </View>
  );
}

// ── Shelf Card ──────────────────────────────────────────────────────────────────
function ProductCard({
  item,
  addingId,
  onAdd,
}: {
  item: Product;
  addingId: string | null;
  onAdd: (id: string) => void;
}) {
  const T = useTheme();
  const CARD_WIDTH = (Dimensions.get('window').width - SCREEN_PADDING * 2 - CARD_GAP) / 2;
  const s = makeStyles(T, CARD_WIDTH);

  const outOfStock = item.stock === 0;
  const lowStock = item.stock > 0 && item.stock <= 5;

  return (
    <View style={s.card}>
      {/* Image */}
      <View style={s.imageWrap}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={s.image} resizeMode="contain" />
        ) : (
          <View style={s.imagePlaceholder}>
            <Text style={s.imagePlaceholderText}>🛒</Text>
          </View>
        )}
        {lowStock && (
          <View style={s.stockBadge}>
            <Text style={s.stockBadgeText}>{item.stock} left</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={s.cardBody}>
        <Text style={s.productName} numberOfLines={1}>{item.name}</Text>
        <View style={s.priceRow}>
          <Text style={[s.price, outOfStock && s.priceOutOfStock]}>
            {outOfStock ? 'Out of stock' : `£${item.price.toFixed(2)}`}
          </Text>
          {!outOfStock && (
            <TouchableOpacity
              style={[s.addBtn, addingId === item.id && s.addBtnDisabled]}
              onPress={() => onAdd(item.id)}
              disabled={addingId === item.id}
              activeOpacity={0.7}
            >
              {addingId === item.id ? (
                <ActivityIndicator size="small" color={T.onColor} />
              ) : (
                <Text style={s.addBtnText}>+</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────────
function makeStyles(T: Theme, cardWidth: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: T.bg100,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    grid: {
      paddingHorizontal: SCREEN_PADDING,
      paddingTop: 14,
      paddingBottom: 32,
    },
    row: {
      justifyContent: 'space-between',
      marginBottom: CARD_GAP,
    },

    // Card — borderless, image floats on page bg
    card: {
      width: cardWidth,
      backgroundColor: T.bg100,
    },
    imageWrap: {
      width: '100%',
      aspectRatio: 1,
      backgroundColor: T.bg000,
      borderRadius: 8,
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    imagePlaceholder: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    imagePlaceholderText: {
      fontSize: 36,
    },
    stockBadge: {
      position: 'absolute',
      bottom: 8,
      left: 8,
      backgroundColor: T.warningBg,
      borderRadius: 4,
      paddingHorizontal: 5,
      paddingVertical: 2,
    },
    stockBadgeText: {
      fontSize: 9,
      fontFamily: 'Aptos-SemiBold',
      color: T.warning000,
    },
    cardBody: {
      paddingTop: 8,
      paddingHorizontal: 2,
      gap: 4,
    },
    productName: {
      fontSize: 12,
      fontFamily: 'Aptos',
      color: T.text400,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    price: {
      fontSize: 15,
      fontFamily: 'Aptos-Bold',
      color: T.text000,
    },
    priceOutOfStock: {
      color: T.text400,
      fontSize: 12,
      fontFamily: 'Aptos',
    },
    addBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: T.brand200,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addBtnDisabled: {
      opacity: 0.55,
    },
    addBtnText: {
      color: T.onColor,
      fontFamily: 'Aptos-Bold',
      fontSize: 18,
      lineHeight: 22,
    },
    emptyText: {
      color: T.text400,
      fontFamily: 'Aptos',
      fontSize: 14,
      marginTop: 40,
    },
  });
}
