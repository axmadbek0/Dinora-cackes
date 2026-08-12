import { InlineKeyboard } from 'grammy';

export function getCategoriesInlineKeyboard(categories: Array<{ id: string; name: string }>) {
  const keyboard = new InlineKeyboard();
  categories.forEach((cat) => {
    keyboard.text(cat.name, `cat_${cat.id}`).row();
  });
  return keyboard;
}

export function getProductInlineKeyboard(productId: string) {
  return new InlineKeyboard()
    .text('➕ Savatchaga qo\'shish', `add_cart_${productId}`)
    .row()
    .text('⬅️ Orqaga', 'back_to_categories');
}
