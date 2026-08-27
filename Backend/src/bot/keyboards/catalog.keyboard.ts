import { InlineKeyboard } from 'grammy';

export function getProductInlineKeyboard(productId: string) {
  return new InlineKeyboard()
    .text('➕ Savatchaga qo\'shish', `add_cart_${productId}`);
}
