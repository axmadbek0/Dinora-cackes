import { InlineKeyboard } from 'grammy';

export function getAdminOrderApprovalKeyboard(orderId: string) {
  return new InlineKeyboard()
    .text('✅ Tasdiqlash', `admin_approve_order_${orderId}`)
    .text('❌ Rad etish', `admin_reject_order_${orderId}`)
    .row()
    .text('🚚 Holatni o\'zgartirish', `admin_change_status_${orderId}`);
}

export function getAdminCustomCakePricingKeyboard(requestId: string) {
  return new InlineKeyboard()
    .text('💰 Narx belgilash', `admin_price_cake_${requestId}`)
    .text('❌ Bekor qilish', `admin_reject_cake_${requestId}`);
}
