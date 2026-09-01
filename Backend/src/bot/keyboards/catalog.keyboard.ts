import { InlineKeyboard } from 'grammy';

export function getProductInlineKeyboard(productId: string, lang: string = 'uz') {
  const btnText =
    lang === 'ru'
      ? '➕ В корзину'
      : lang === 'uz-Cyrl'
      ? '➕ Саватчага қўшиш'
      : '➕ Savatchaga qo\'shish';

  return new InlineKeyboard().text(btnText, `add_cart_${productId}`);
}
