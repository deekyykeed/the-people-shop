import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jqzpskhfssxasrlnffhb.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxenBza2hmc3N4YXNybG5mZmhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTEyOTcsImV4cCI6MjA4OTQ4NzI5N30._KGrjIKBqRjbzi_MBcnFO18ahIMG_p6CR8RT1w9cBLM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type Category = {
  id: string;
  name: string;
  icon: string;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string | null;
  stock: number;
  created_at: string;
  categories?: Category;
};

export type CartItem = {
  id: string;
  session_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  products?: Product;
};

export type ProductImage = {
  id: string;
  product_id: string | null;
  url: string;
  angle: string | null;
  is_primary: boolean;
  created_at: string;
};

export type Order = {
  id: string;
  session_id: string;
  total: number;
  status: string;
  created_at: string;
};
