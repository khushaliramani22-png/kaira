import { supabase } from '@/lib/supabase';

export const toggleWishlist = async (userId, productId) => {

  const { data: existing } = await supabase
    .from('wishlist')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('id', existing.id);
    return { status: 'removed', error };
  } else {
    const { error } = await supabase
      .from('wishlist')
      .insert([{ user_id: userId, product_id: productId }]);
    return { status: 'added', error };
  }
};