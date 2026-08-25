import { Keyboard } from 'grammy';
import { SupportedLanguage } from '../i18n.js';

export function getMainKeyboard(lang: SupportedLanguage = 'uz') {
  if (lang === 'ru') {
    return new Keyboard()
      .text('🍰 Смотреть каталог')
      .text('🛒 Корзина')
      .row()
      .text('✨ Свой дизайн торта')
      .text('📞 Контакты и адрес')
      .row()
      .text('🌐 Сменить язык')
      .resized();
  }

  if (lang === 'uz-Cyrl') {
    return new Keyboard()
      .text('🍰 Каталогни кўриш')
      .text('🛒 Саватча')
      .row()
      .text('✨ Ўзим хоҳлаганимдек')
      .text('📞 Алоқа & Маълумот')
      .row()
      .text('🌐 Тилни ўзгартириш')
      .resized();
  }

  // Default 'uz' (Lotin)
  return new Keyboard()
    .text('🍰 Katalogni ko\'rish')
    .text('🛒 Savatcha')
    .row()
    .text('✨ O\'zim xohlaganimdek')
    .text('📞 Aloqa & Ma\'lumot')
    .row()
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
