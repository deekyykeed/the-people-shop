import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { supabase, Product, Category } from '@/lib/supabase';
import { addToCart } from '@/lib/cart';
import { useTheme, Theme } from '@/lib/theme';

const CARD_GAP = 10;
const SCREEN_PADDING = 14;

export default function ShopScreen() {
  const T = useTheme();
  const CARD_WIDTH = (Dimensions.get('window').width - SCREEN_PADDING * 2 - CARD_GAP) / 2;

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const [{ data: cats }, { data: prods }] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('products').select('*, categories(*)').order('name'),
    ]);
    if (cats) setCategories(cats);
    if (prods) setProducts(prods);
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
    } catch (e) {
      // silently fail
    } finally {
      setAddingId(null);
    }
  };

  const filtered = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products;

  const s = makeStyles(T, CARD_WIDTH);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={T.brand200} />
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* Category filter row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.categoryRow}
      >
        <TouchableOpacity
          style={[s.chip, selectedCategory === null && s.chipActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[s.chipText, selectedCategory === null && s.chipTextActive]}>All</Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[s.chip, selectedCategory === cat.id && s.chipActive]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text style={s.chipEmoji}>{cat.icon}</Text>
            <Text style={[s.chipText, selectedCategory === cat.id && s.chipTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={s.divider} />

      {/* Product grid — 2 columns */}
      <FlatList
        data={filtered}
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
          <ShelfCard
            item={item}
            addingId={addingId}
            onAdd={handleAddToCart}
            T={T}
            cardWidth={CARD_WIDTH}
          />
        )}
      />
    </View>
  );
}

// ── Shelf Card ─────────────────────────────────────────────────────────────────
function ShelfCard({
  item,
  addingId,
  onAdd,
  T,
  cardWidth,
}: {
  item: Product;
  addingId: string | null;
  onAdd: (id: string) => void;
  T: Theme;
  cardWidth: number;
}) {
  const s = makeStyles(T, cardWidth);
  const lowStock = item.stock > 0 && item.stock <= 5;
  const outOfStock = item.stock === 0;

  return (
    <View style={s.card}>
      <View style={s.imageWrap}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={s.image} resizeMode="cover" />
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

      <View style={s.cardBody}>
        <Text style={s.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={[s.price, outOfStock && s.priceOutOfStock]}>
          {outOfStock ? 'Out of stock' : `£${item.price.toFixed(2)}`}
        </Text>
        {!outOfStock && (
          <TouchableOpacity
            style={[s.addBtn, addingId === item.id && s.addBtnDisabled]}
            onPress={() => onAdd(item.id)}
            disabled={addingId === item.id}
            activeOpacity={0.75}
          >
            {addingId === item.id ? (
              <ActivityIndicator size="small" color={T.onColor} />
            ) : (
              <Text style={s.addBtnText}>+ Add</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ── Dynamic styles (theme-aware) ───────────────────────────────────────────────
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
    categoryRow: {
      paddingHorizontal: SCREEN_PADDING,
      paddingVertical: 10,
      gap: 6,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 6,
      backgroundColor: T.bg200,
      borderWidth: 1,
      borderColor: T.border100,
    },
    chipActive: {
      backgroundColor: T.bg400,
    },
    chipText: {
      fontSize: 12,
      fontFamily: 'Aptos-SemiBold',
      color: T.text200,
    },
    chipTextActive: {
      color: T.text000,
    },
    chipEmoji: {
      fontSize: 13,
    },
    divider: {
      height: 1,
      backgroundColor: T.border100,
      opacity: 0.15,
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

    // ── Shelf Card ─────────────────────────────────────────────────────────────
    card: {
      width: cardWidth,
      backgroundColor: T.bg000,
      borderRadius: 8,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: T.border100,
      // @ts-ignore
      borderOpacity: 0.12,
      shadowColor: T.alwaysBlack,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.035,
      shadowRadius: 20,
      elevation: 1,
    },
    imageWrap: {
      width: '100%',
      aspectRatio: 1,
      backgroundColor: T.bg200,
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
      bottom: 6,
      left: 6,
      backgroundColor: T.warningBg,
      borderWidth: 1,
      borderColor: T.warning000,
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    stockBadgeText: {
      fontSize: 9,
      fontFamily: 'Aptos-SemiBold',
      color: T.warning000,
      letterSpacing: 0.07,
    },
    cardBody: {
      padding: 10,
      gap: 4,
    },
    productName: {
      fontSize: 13,
      fontFamily: 'Aptos-SemiBold',
      color: T.text000,
      lineHeight: 18,
    },
    price: {
      fontSize: 15,
      fontFamily: 'Aptos-Bold',
      color: T.brand200,
    },
    priceOutOfStock: {
      color: T.text400,
      fontSize: 12,
      fontFamily: 'Aptos',
    },
    addBtn: {
      marginTop: 6,
      backgroundColor: T.brand200,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: T.brand000,
      paddingVertical: 7,
      alignItems: 'center',
    },
    addBtnDisabled: {
      opacity: 0.55,
    },
    addBtnText: {
      color: T.onColor,
      fontFamily: 'Aptos-SemiBold',
      fontSize: 12,
    },
    emptyText: {
      color: T.text400,
      fontFamily: 'Aptos',
      fontSize: 14,
      marginTop: 40,
    },
  });
}
