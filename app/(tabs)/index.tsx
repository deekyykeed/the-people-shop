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
  TextInput,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase, Product, Category } from '@/lib/supabase';
import { addToCart } from '@/lib/cart';

const CARD_GAP = 12;
const SCREEN_PADDING = 16;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - SCREEN_PADDING * 2 - CARD_GAP) / 2;

const CATEGORY_COLORS = ['#DBEAFE', '#D1FAE5', '#FEF3C7', '#FCE7F3', '#EDE9FE', '#FEE2E2'];

const PRODUCT_FILTERS = [
  { key: 'for_you', label: 'For you' },
  { key: 'flash_sales', label: '⚡ Flash sales' },
  { key: 'popular', label: 'Popular' },
  { key: 'new', label: 'New' },
];

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('for_you');
  const [searchQuery, setSearchQuery] = useState('');
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
    } catch {
      // silently fail
    } finally {
      setAddingId(null);
    }
  };

  const filtered = (() => {
    let result = [...products];
    if (searchQuery.trim()) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    switch (selectedFilter) {
      case 'flash_sales':
        return result.filter((p) => p.stock > 0 && p.stock <= 5);
      case 'new':
        return result.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      default:
        return result;
    }
  })();

  if (loading) {
    return (
      <View style={[s.container, s.center, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ActivityIndicator size="large" color={AMBER} />
      </View>
    );
  }

  const ListHeader = (
    <View>
      {/* ── Header ── */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <View style={s.avatar}>
          <Text style={s.avatarEmoji}>👤</Text>
        </View>
        <View style={s.locationWrap}>
          <Text style={s.locationLabel}>Location</Text>
          <View style={s.locationRow}>
            <Text style={s.locationPin}>📍</Text>
            <Text style={s.locationText}>Your Location</Text>
            <Text style={s.locationCaret}> ▾</Text>
          </View>
        </View>
        <TouchableOpacity style={s.bellBtn}>
          <Text style={s.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* ── Search ── */}
      <View style={s.searchRow}>
        <View style={s.searchBar}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={s.filterBtn}>
          <Text style={s.filterBtnIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* ── Promo Banner ── */}
      <View style={s.banner}>
        <View style={s.bannerContent}>
          <Text style={s.bannerTitle}>FREE DELIVERY FOR{'\n'}VEGETABLES</Text>
          <Text style={s.bannerSubtitle}>Up to 3 times per day</Text>
          <TouchableOpacity style={s.bannerBtn}>
            <Text style={s.bannerBtnText}>Order now</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.bannerEmoji}>🥦{'\n'}🧅🥕</Text>
      </View>

      {/* ── Categories ── */}
      <View style={s.sectionRow}>
        <Text style={s.sectionTitle}>Categories</Text>
        <TouchableOpacity>
          <Text style={s.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.categoriesScroll}
      >
        {categories.map((cat, i) => (
          <TouchableOpacity key={cat.id} style={s.categoryCard}>
            <View
              style={[
                s.categoryIconWrap,
                { backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] },
              ]}
            >
              <Text style={s.categoryIconEmoji}>{cat.icon}</Text>
            </View>
            <Text style={s.categoryName}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Filter Tabs ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterRow}
      >
        {PRODUCT_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[s.filterChip, selectedFilter === f.key && s.filterChipActive]}
            onPress={() => setSelectedFilter(f.key)}
          >
            <Text
              style={[
                s.filterChipText,
                selectedFilter === f.key && s.filterChipTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={s.gridRow}
        contentContainerStyle={s.grid}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={AMBER} />
        }
        ListEmptyComponent={
          <View style={s.emptyWrap}>
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

// ── Product Card ───────────────────────────────────────────────────────────────
function ProductCard({
  item,
  addingId,
  onAdd,
}: {
  item: Product;
  addingId: string | null;
  onAdd: (id: string) => void;
}) {
  const outOfStock = item.stock === 0;
  const lowStock = item.stock > 0 && item.stock <= 5;

  return (
    <View style={s.productCard}>
      <View style={s.productImageWrap}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={s.productImage} resizeMode="cover" />
        ) : (
          <View style={s.productImagePlaceholder}>
            <Text style={{ fontSize: 40 }}>🛒</Text>
          </View>
        )}
        {lowStock && (
          <View style={s.lowStockBadge}>
            <Text style={s.lowStockText}>{item.stock} left</Text>
          </View>
        )}
      </View>
      <View style={s.productBody}>
        <Text style={s.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[s.productPrice, outOfStock && s.productPriceOos]}>
          {outOfStock ? 'Out of stock' : `£${item.price.toFixed(2)}`}
        </Text>
        {!outOfStock && (
          <TouchableOpacity
            style={[s.addBtn, addingId === item.id && { opacity: 0.55 }]}
            onPress={() => onAdd(item.id)}
            disabled={addingId === item.id}
            activeOpacity={0.8}
          >
            {addingId === item.id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={s.addBtnText}>+ Add</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ── Colors & Styles ────────────────────────────────────────────────────────────
const AMBER = '#F59E0B';
const AMBER_LIGHT = '#FEF3C7';
const AMBER_DARK = '#D97706';
const GRAY_BG = '#F3F4F6';
const TEXT_DARK = '#111827';
const TEXT_MID = '#374151';
const TEXT_LIGHT = '#9CA3AF';

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { alignItems: 'center', justifyContent: 'center' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GRAY_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 22 },
  locationWrap: { flex: 1, marginLeft: 12 },
  locationLabel: { fontSize: 11, color: TEXT_LIGHT, fontFamily: 'Aptos' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 1 },
  locationPin: { fontSize: 13 },
  locationText: { fontSize: 15, fontFamily: 'Aptos-SemiBold', color: TEXT_DARK, marginLeft: 2 },
  locationCaret: { fontSize: 13, color: TEXT_DARK },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GRAY_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: { fontSize: 18 },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING,
    gap: 10,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GRAY_BG,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: TEXT_DARK,
    fontFamily: 'Aptos',
    ...Platform.select({ web: { outlineWidth: 0 } as any }),
  },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: TEXT_DARK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnIcon: { fontSize: 18 },

  // Banner
  banner: {
    marginHorizontal: SCREEN_PADDING,
    borderRadius: 20,
    backgroundColor: AMBER_LIGHT,
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 22,
    alignItems: 'center',
  },
  bannerContent: { flex: 1 },
  bannerTitle: {
    fontSize: 15,
    fontFamily: 'Aptos-Bold',
    color: TEXT_DARK,
    lineHeight: 22,
    marginBottom: 4,
  },
  bannerSubtitle: { fontSize: 12, fontFamily: 'Aptos', color: '#6B7280', marginBottom: 14 },
  bannerBtn: {
    backgroundColor: AMBER,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
    alignSelf: 'flex-start',
  },
  bannerBtnText: { color: '#fff', fontFamily: 'Aptos-SemiBold', fontSize: 13 },
  bannerEmoji: { fontSize: 44, lineHeight: 50, textAlign: 'center' },

  // Section header
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontFamily: 'Aptos-Bold', color: TEXT_DARK },
  seeAll: { fontSize: 13, fontFamily: 'Aptos', color: TEXT_LIGHT },

  // Categories
  categoriesScroll: { paddingHorizontal: SCREEN_PADDING, gap: 14, paddingBottom: 20 },
  categoryCard: { alignItems: 'center', gap: 6 },
  categoryIconWrap: {
    width: 66,
    height: 66,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconEmoji: { fontSize: 30 },
  categoryName: { fontSize: 12, fontFamily: 'Aptos', color: TEXT_MID },

  // Filter tabs
  filterRow: { paddingHorizontal: SCREEN_PADDING, gap: 8, paddingBottom: 14 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: GRAY_BG,
  },
  filterChipActive: {
    backgroundColor: AMBER_LIGHT,
    borderWidth: 1,
    borderColor: AMBER,
  },
  filterChipText: { fontSize: 13, fontFamily: 'Aptos-SemiBold', color: '#6B7280' },
  filterChipTextActive: { color: AMBER_DARK },

  // Product grid
  grid: { paddingHorizontal: SCREEN_PADDING, paddingBottom: 32 },
  gridRow: { justifyContent: 'space-between', marginBottom: CARD_GAP },
  emptyWrap: { alignItems: 'center', paddingTop: 20 },
  emptyText: { color: TEXT_LIGHT, fontFamily: 'Aptos', fontSize: 14 },

  // Product card
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  productImageWrap: { width: '100%', aspectRatio: 1, backgroundColor: '#F9FAFB' },
  productImage: { width: '100%', height: '100%' },
  productImagePlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  lowStockBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: AMBER_LIGHT,
    borderWidth: 1,
    borderColor: AMBER,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  lowStockText: { fontSize: 9, fontFamily: 'Aptos-SemiBold', color: AMBER_DARK },
  productBody: { padding: 10, gap: 4 },
  productName: { fontSize: 13, fontFamily: 'Aptos-SemiBold', color: TEXT_DARK, lineHeight: 18 },
  productPrice: { fontSize: 15, fontFamily: 'Aptos-Bold', color: TEXT_DARK },
  productPriceOos: { fontSize: 12, fontFamily: 'Aptos', color: TEXT_LIGHT },
  addBtn: {
    marginTop: 6,
    backgroundColor: AMBER,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontFamily: 'Aptos-SemiBold', fontSize: 12 },
});
