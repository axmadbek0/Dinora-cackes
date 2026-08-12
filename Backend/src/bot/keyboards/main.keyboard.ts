import { Keyboard } from 'grammy';

export function getMainKeyboard() {
  return new Keyboard()
    .text('🍰 Katalogni ko\'rish')
    .text('🛒 Savatcha')
    .row()
    .text('✨ O\'zim xohlaganimdek')
    .text('📞 Aloqa & Ma\'lumot')
    .resized();
}

export function getPhoneRequestKeyboard() {
  return new Keyboard()
    .requestContact('📱 Telefon raqamni yuborish')
    .resized()
    .oneTime();
}

export function getLocationRequestKeyboard() {
  return new Keyboard()
    .requestLocation('📍 Geolokatsiyani yuborish')
    .row()
    .text('❌ Bekor qilish')
    .resized();
}
