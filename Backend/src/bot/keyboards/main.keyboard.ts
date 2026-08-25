import { Keyboard } from 'grammy';
import { SupportedLanguage } from '../i18n.js';

export function getMainKeyboard(lang: SupportedLanguage = 'uz') {
  if (lang === 'ru') {
    return new Keyboard()
      .text('🍰 Смотреть каталог')
      .text('🛒 Корзина')
      .row()
      .text('🚚 Отследить заказ')
      .text('✨ Свой дизайн торта')
      .row()
      .text('📞 Контакты и адрес')
      .text('🌐 Сменить язык')
      .resized();
  }

  if (lang === 'uz-Cyrl') {
    return new Keyboard()
      .text('🍰 Каталогни кўриш')
      .text('🛒 Саватча')
      .row()
      .text('🚚 Буюртмани кузатиш')
      .text('✨ Ўзим хоҳлаганимдек')
      .row()
      .text('📞 Алоқа & Маълумот')
      .text('🌐 Тилни ўзгартириш')
      .resized();
  }

  // Default 'uz' (Lotin)
  return new Keyboard()
    .text('🍰 Katalogni ko\'rish')
    .text('🛒 Savatcha')
    .row()
    .text('🚚 Buyurtmani kuzatish')
    .text('✨ O\'zim xohlaganimdek')
    .row()
    .text('📞 Aloqa & Ma\'lumot')
    .text('🌐 Tilni o\'zgartirish')
    .resized();
}

export function getPhoneRequestKeyboard(lang: SupportedLanguage = 'uz') {
  const label =
    lang === 'ru'
      ? '📱 Отправить номер телефона'
      : lang === 'uz-Cyrl'
      ? '📱 Телефон рақамни юбориш'
      : '📱 Telefon raqamni yuborish';

  return new Keyboard()
    .requestContact(label)
    .resized()
    .oneTime();
}

export function getLocationRequestKeyboard(lang: SupportedLanguage = 'uz') {
  const locLabel =
    lang === 'ru'
      ? '📍 Отправить геопозицию'
      : lang === 'uz-Cyrl'
      ? '📍 Геолокацияни юбориш'
      : '📍 Geolokatsiyani yuborish';

  const cancelLabel =
    lang === 'ru'
      ? '❌ Отмена'
      : lang === 'uz-Cyrl'
      ? '❌ Бекор қилиш'
      : '❌ Bekor qilish';

  return new Keyboard()
    .requestLocation(locLabel)
    .row()
    .text(cancelLabel)
    .resized();
}
