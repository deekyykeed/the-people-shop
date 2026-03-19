import { supabase } from './supabase';
import { getSessionId } from './session';

export async function getCartItems() {
  const sessionId = await getSessionId();
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, products(*, categories(*))')
    .eq('session_id', sessionId);
  if (error) throw error;
  return data ?? [];
}

export async function addToCart(productId: string, quantity = 1) {
  const sessionId = await getSessionId();
  const { error } = await supabase.from('cart_items').upsert(
    { session_id: sessionId, product_id: productId, quantity },
    { onConflict: 'session_id,product_id', ignoreDuplicates: false }
  );
  if (error) throw error;
}

export async function updateCartQty(cartItemId: string, quantity: number) {
  if (quantity <= 0) {
    return removeFromCart(cartItemId);
  }
  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId);
  if (error) throw error;
}

export async function removeFromCart(cartItemId: string) {
  const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);
  if (error) throw error;
}

export async function clearCart() {
  const sessionId = await getSessionId();
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('session_id', sessionId);
  if (error) throw error;
}

export async function getCartCount(): Promise<number> {
  const items = await getCartItems();
  return items.reduce((sum, i) => sum + (i.quantity ?? 0), 0);
}
