import { InlineKeyboard } from 'grammy';
import { CartItem } from '../context.js';

export function getCartInlineKeyboard(cart: CartItem[]) {
  const keyboard = new InlineKeyboard();

  cart.forEach((item) => {
    keyboard
      .text(`➖`, `cart_dec_${item.productId}`)
      .text(`${item.name} (${item.quantity})`, `noop`)
      .text(`➕`, `cart_inc_${item.productId}`)
      .row();
  });

  if (cart.length > 0) {
    keyboard
      .text('✅ Buyurtmani rasmiylashtirish', 'checkout_start')
      .row()
      .text('🗑 Savatchani tozalash', 'cart_clear');
  }

  return keyboard;
}

export function getDeliveryTypeInlineKeyboard() {
  return new InlineKeyboard()
    .text('🛍️ Yetkazib berish (Dastavka)', 'delivery_delivery')
    .row()
    .text('🏃 Olib ketish (Konditeriyadan)', 'delivery_pickup');
}

export function getDistrictInlineKeyboard() {
  return new InlineKeyboard()
    .text('Sirdaryo tumani', 'dist_Sirdaryo tumani')
    .text('Guliston shahri', 'dist_Guliston shahri')
    .row()
    .text('Yangiyer shahri', 'dist_Yangiyer shahri')
    .text('Shirin shahri', 'dist_Shirin shahri')
    .row()
    .text('Sayxunobod t.', 'dist_Sayxunobod tumani')
    .text('Boyovut t.', 'dist_Boyovut tumani')
    .row()
    .text('✏️ Boshqa tuman (Matn yuborish)', 'dist_custom');
}

export function getPaymentModeInlineKeyboard() {
  return new InlineKeyboard()
    .text('💳 Karta o\'tkazmasi (Chek yuklash)', 'payment_card')
    .row()
    .text('💵 Naqd pul (Qabul qilinganda)', 'payment_cash');
}
