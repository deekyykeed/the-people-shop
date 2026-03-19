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

// ── Claude.ai design tokens (light mode) ───────────────────────────────────────
const T = {
  bg100: '#F9F7F1',         // warm cream — page bg
  bg200: '#F3F0E8',         // slightly deeper
  bg300: '#EEEAE0',         // hover
  bg400: '#E6E1D5',         // pressed / selected
  surface: '#FFFFFF',
  text000: '#141413',       // primary
  text200: '#3C3C3A',       // secondary
  text400: '#71706B',       // muted / placeholder
  border100: '#1F1E1C',     // dark border (Claude style)
  brand200: '#D97857',      // terracotta — primary action fill
  brand000: '#C6613F',      // darker terracotta
  brandBorder: 'rgba(198,97,63,0.6)',
  warning000: '#7A4A0A',    // low-stock text
  warningBg: 'hsl(38,65.9%,92%)', // low-stock bg
};

const CARD_GAP = 8;
const SCREEN_PADDING = 12;
const CARD_WIDTH = (Dimensions.get('window').width - SCREEN_PADDING * 2 - CARD_GAP * 2) / 3;

export default function ShopScreen() {
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={T.brand200} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Category filter row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        <TouchableOpacity
          style={[styles.chip, selectedCategory === null && styles.chipActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.chipText, selectedCategory === null && styles.chipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.chip, selectedCategory === cat.id && styles.chipActive]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text style={styles.chipEmoji}>{cat.icon}</Text>
            <Text style={[styles.chipText, selectedCategory === cat.id && styles.chipTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.divider} />

      {/* Product grid */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.brand200} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
        renderItem={({ item }) => <ShelfCard item={item} addingId={addingId} onAdd={handleAddToCart} />}
      />
    </View>
  );
}

// ── Shelf Card ─────────────────────────────────────────────────────────────────
function ShelfCard({
  item,
  addingId,
  onAdd,
}: {
  item: Product;
  addingId: string | null;
  onAdd: (id: string) => void;
}) {
  const lowStock = item.stock > 0 && item.stock <= 5;
  const outOfStock = item.stock === 0;

  return (
    <View style={styles.card}>
      {/* Square image — 1:1 aspect ratio */}
      <View style={styles.imageWrap}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>🛒</Text>
          </View>
        )}
        {/* Low stock badge */}
        {lowStock && (
          <View style={styles.stockBadge}>
            <Text style={styles.stockBadgeText}>{item.stock} left</Text>
          </View>
        )}
      </View>

      {/* Card body */}
      <View style={styles.cardBody}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={[styles.price, outOfStock && styles.priceOutOfStock]}>
          {outOfStock ? 'Out of stock' : `£${item.price.toFixed(2)}`}
        </Text>

        {!outOfStock && (
          <TouchableOpacity
            style={[styles.addBtn, addingId === item.id && styles.addBtnDisabled]}
            onPress={() => onAdd(item.id)}
            disabled={addingId === item.id}
            activeOpacity={0.75}
          >
            {addingId === item.id ? (
              <ActivityIndicator size="small" color={T.surface} />
            ) : (
              <Text style={styles.addBtnText}>+ Add</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
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
    borderRadius: 4,
    backgroundColor: T.bg200,
    borderWidth: 1,
    borderColor: T.border100,
  },
  chipActive: {
    backgroundColor: T.bg400,
    borderColor: T.border100,
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
  },
  grid: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 14,
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: CARD_GAP,
  },

  // ── Shelf Card ───────────────────────────────────────────────────────────────
  card: {
    width: CARD_WIDTH,
    backgroundColor: T.surface,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: T.border100,
    shadowColor: T.text000,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
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
    fontSize: 28,
  },
  stockBadge: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: T.warningBg,
    borderWidth: 1,
    borderColor: T.warning000,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  stockBadgeText: {
    fontSize: 9,
    fontFamily: 'Aptos-SemiBold',
    color: T.warning000,
    letterSpacing: 0.07,
  },
  cardBody: {
    padding: 8,
    gap: 3,
    borderTopWidth: 1,
    borderTopColor: T.border100,
  },
  productName: {
    fontSize: 11,
    fontFamily: 'Aptos-SemiBold',
    color: T.text000,
    lineHeight: 15,
  },
  price: {
    fontSize: 13,
    fontFamily: 'Aptos-Bold',
    color: T.brand200,
  },
  priceOutOfStock: {
    color: T.text400,
    fontSize: 11,
    fontFamily: 'Aptos',
  },
  addBtn: {
    marginTop: 4,
    backgroundColor: T.brand200,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: T.brandBorder,
    paddingVertical: 5,
    alignItems: 'center',
  },
  addBtnDisabled: {
    opacity: 0.55,
  },
  addBtnText: {
    color: T.surface,
    fontFamily: 'Aptos-SemiBold',
    fontSize: 11,
  },
  emptyText: {
    color: T.text400,
    fontFamily: 'Aptos',
    fontSize: 14,
    marginTop: 40,
  },
});
