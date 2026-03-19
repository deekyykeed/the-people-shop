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

// ── Design tokens (Supabase-inspired) ─────────────────────────────────────────
const T = {
  bg: '#FCFCFC',
  surface: '#FFFFFF',
  surfaceMuted: '#F7F7F7',
  surfaceControl: '#F3F3F3',
  textDefault: '#171717',
  textSecondary: '#525252',
  textMuted: '#707070',
  border: '#DFDFDF',
  borderStrong: '#D4D4D4',
  brandFill: '#72E3AD',       // green button fill
  brandBorder: 'rgba(22,182,116,0.75)',
  brandLink: '#00B976',
};

const CARD_GAP = 10;
const SCREEN_PADDING = 16;
const CARD_WIDTH = (Dimensions.get('window').width - SCREEN_PADDING * 2 - CARD_GAP) / 2;

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
        <ActivityIndicator size="large" color={T.brandLink} />
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

      {/* Divider */}
      <View style={styles.divider} />

      {/* Product grid */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.brandLink} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>🛒</Text>
              </View>
            )}
            <View style={styles.cardBody}>
              <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.price}>£{item.price.toFixed(2)}</Text>
              <TouchableOpacity
                style={[styles.addBtn, addingId === item.id && styles.addBtnDisabled]}
                onPress={() => handleAddToCart(item.id)}
                disabled={addingId === item.id}
              >
                {addingId === item.id ? (
                  <ActivityIndicator size="small" color={T.textDefault} />
                ) : (
                  <Text style={styles.addBtnText}>+ Add</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
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
    backgroundColor: T.surface,
    borderWidth: 0.67,
    borderColor: T.borderStrong,
  },
  chipActive: {
    backgroundColor: T.surfaceControl,
    borderColor: T.textDefault,
  },
  chipText: {
    fontSize: 12,
    fontFamily: 'Aptos-SemiBold',
    color: T.textSecondary,
  },
  chipTextActive: {
    color: T.textDefault,
  },
  chipEmoji: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: T.border,
    marginHorizontal: 0,
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
  card: {
    width: CARD_WIDTH,
    backgroundColor: T.surface,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 0.67,
    borderColor: T.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.07,
    shadowRadius: 30,
    elevation: 1,
  },
  image: {
    width: '100%',
    height: 130,
  },
  imagePlaceholder: {
    width: '100%',
    height: 130,
    backgroundColor: T.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 34,
  },
  cardBody: {
    padding: 10,
    gap: 3,
    borderTopWidth: 0.67,
    borderTopColor: T.border,
  },
  productName: {
    fontSize: 12,
    fontFamily: 'Aptos-SemiBold',
    color: T.textDefault,
    lineHeight: 17,
  },
  price: {
    fontSize: 14,
    fontFamily: 'Aptos-Bold',
    color: T.textDefault,
  },
  addBtn: {
    marginTop: 6,
    backgroundColor: T.brandFill,
    borderRadius: 6,
    borderWidth: 0.67,
    borderColor: T.brandBorder,
    paddingVertical: 6,
    alignItems: 'center',
  },
  addBtnDisabled: {
    opacity: 0.55,
  },
  addBtnText: {
    color: T.textDefault,
    fontFamily: 'Aptos-SemiBold',
    fontSize: 12,
  },
  emptyText: {
    color: T.textMuted,
    fontFamily: 'Aptos',
    fontSize: 14,
    marginTop: 40,
  },
});
