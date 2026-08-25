import { Composer } from 'grammy';
import { BotContext } from '../context.js';
import { ProductService } from '../../modules/products/product.service.js';
import { getCartInlineKeyboard } from '../keyboards/order.keyboard.js';

export const cartHandler = new Composer<BotContext>();
const productService = new ProductService();

cartHandler.hears(['🛒 Savatcha', '🛒 Саватча', '🛒 Корзина'], async (ctx) => {
  return renderCart(ctx);
});

cartHandler.callbackQuery(/^add_cart_(.+)$/, async (ctx) => {
  const productId = ctx.match[1];
  const product = await productService.getProductById(productId);

  if (!product) {
    return ctx.answerCallbackQuery({ text: 'Mahsulot topilmadi!', show_alert: true });
  }

  const existingIndex = ctx.session.cart.findIndex((item) => item.productId === productId);
  if (existingIndex > -1) {
    ctx.session.cart[existingIndex].quantity += 1;
  } else {
    ctx.session.cart.push({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
    });
  }

  return ctx.answerCallbackQuery({ text: `✅ ${product.name} savatchaga qo'shildi!` });
});

cartHandler.callbackQuery(/^cart_inc_(.+)$/, async (ctx) => {
  ctx.answerCallbackQuery().catch(() => {});
  const productId = ctx.match[1];
  const item = ctx.session.cart.find((i) => i.productId === productId);
  if (item) {
    item.quantity += 1;
  }
  return renderCart(ctx, true);
});

cartHandler.callbackQuery(/^cart_dec_(.+)$/, async (ctx) => {
  ctx.answerCallbackQuery().catch(() => {});
  const productId = ctx.match[1];
  const itemIndex = ctx.session.cart.findIndex((i) => i.productId === productId);
  if (itemIndex > -1) {
    if (ctx.session.cart[itemIndex].quantity > 1) {
      ctx.session.cart[itemIndex].quantity -= 1;
    } else {
      ctx.session.cart.splice(itemIndex, 1);
    }
  }
  return renderCart(ctx, true);
});

cartHandler.callbackQuery('cart_clear', async (ctx) => {
  ctx.session.cart = [];
  ctx.answerCallbackQuery({ text: 'Savatcha tozalandi!' }).catch(() => {});
  return renderCart(ctx, true);
});

async function renderCart(ctx: BotContext, isEdit = false) {
  const cart = ctx.session.cart || [];
  if (cart.length === 0) {
    const text = '🛒 Savatchangiz bo\'sh.';
    if (isEdit) {
      return ctx.editMessageText(text);
    }
    return ctx.reply(text);
  }

  let total = 0;
  let summary = '🛒 **Sizning savatchangiz:**\n\n';
  cart.forEach((item, index) => {
    const sum = item.price * item.quantity;
    total += sum;
    summary += `${index + 1}. **${item.name}**\n   ${item.quantity} dona x ${item.price.toLocaleString('uz-UZ')} = ${sum.toLocaleString('uz-UZ')} so'm\n`;
  });

  summary += `\n💰 **Jami:** ${total.toLocaleString('uz-UZ')} so'm`;

  if (isEdit) {
    return ctx.editMessageText(summary, {
      parse_mode: 'Markdown',
      reply_markup: getCartInlineKeyboard(cart),
    });
  }

  return ctx.reply(summary, {
    parse_mode: 'Markdown',
    reply_markup: getCartInlineKeyboard(cart),
  });
}
