import { InlineKeyboard, Keyboard } from 'grammy';
import { env } from '../../config/env.js';

function isValidHttps(url?: string): boolean {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  return trimmed.startsWith('https://') && !trimmed.includes('localhost') && !trimmed.includes('127.0.0.1');
}

/**
 * Inline keyboard attached to new order notifications sent to admins
 */
export function getAdminOrderApprovalKeyboard(orderId: string, webAppUrl?: string) {
  const targetUrl = webAppUrl || env.FRONTEND_WEB_URL || 'http://localhost:5173';
  const kb = new InlineKeyboard()
    .text('✅ Tasdiqlash', `admin_approve_order_${orderId}`)
    .text('❌ Rad etish', `admin_reject_order_${orderId}`)
    .row()
    .text('🚚 Holatni o\'zgartirish', `admin_change_status_${orderId}`);

  if (isValidHttps(targetUrl)) {
    kb.row().webApp('📊 Admin Panel (Mini App)', targetUrl);
  } else {
    kb.row().text('📊 Admin Panel Ma\'lumoti', 'admin_open_panel_info');
  }

  return kb;
}

/**
 * Inline keyboard attached to custom cake requests sent to admins
 */
export function getAdminCustomCakePricingKeyboard(requestId: string, webAppUrl?: string) {
  const targetUrl = webAppUrl || env.FRONTEND_WEB_URL || 'http://localhost:5173';
  const kb = new InlineKeyboard()
    .text('💰 Narx belgilash', `admin_price_cake_${requestId}`)
    .text('❌ Bekor qilish', `admin_reject_cake_${requestId}`);

  if (isValidHttps(targetUrl)) {
    kb.row().webApp('🎂 Paneldan boshqarish', targetUrl);
  } else {
    kb.row().text('🎂 Admin Panel Ma\'lumoti', 'admin_open_panel_info');
  }

  return kb;
}

/**
 * Admin Dashboard inline keyboard
 */
export function getAdminDashboardInlineKeyboard(webAppUrl?: string) {
  const targetUrl = webAppUrl || env.FRONTEND_WEB_URL || 'http://localhost:5173';
  const kb = new InlineKeyboard();

  if (isValidHttps(targetUrl)) {
    kb.webApp('📊 Admin Panelni Ochish (Mini App)', targetUrl).row();
  } else {
    kb.text('📊 Admin Panel Ma\'lumoti', 'admin_open_panel_info').row();
  }

  kb.text('📦 Buyurtmalar', 'admin_list_orders')
    .text('🎂 Maxsus Zakazlar', 'admin_list_custom_cakes')
    .row()
    .text('⚙️ Do\'kon Sozlamalari', 'admin_view_settings')
    .text('🔄 Yangilash', 'admin_refresh_dashboard');

  return kb;
}

/**
 * Admin persistent reply keyboard
 */
export function getAdminMainReplyKeyboard(webAppUrl?: string) {
  const targetUrl = webAppUrl || env.FRONTEND_WEB_URL || 'http://localhost:5173';
  const kb = new Keyboard();

  if (isValidHttps(targetUrl)) {
    kb.webApp('📊 Admin Panel (Mini App)', targetUrl).row();
  } else {
    kb.text('📊 Admin Panel (Mini App)').row();
  }

  kb.text('📦 Buyurtmalar')
    .text('🎂 Maxsus Buyurtmalar')
    .row()
    .text('⚙️ Sozlamalar')
    .text('📞 Mijoz Ko\'rinishi')
    .resized();

  return kb;
}
