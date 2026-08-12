import React, { useState, useEffect } from 'react';
import { Camera, Trash2, Send, Sparkles, AlertTriangle, CheckCircle2, X, MapPin } from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';
import { createCustomCake } from '../../services/api';
import { triggerSuccessHaptic, triggerHaptic } from '../../utils/haptics';
import type { DeliveryType } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomCakeFullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomCakeFullScreenModal: React.FC<CustomCakeFullScreenModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useTelegram();
  const [images, setImages] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState(user?.username ? `@${user.username}` : '+998 ');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('DELIVERY');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [desiredWeightKg, setDesiredWeightKg] = useState('2.0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    let digits = val.replace(/\D/g, '');
    if (digits.startsWith('998')) {
      digits = digits.slice(3);
    }
    digits = digits.slice(0, 9);

    let formatted = '+998';
    if (digits.length > 0) {
      formatted += ' ' + digits.slice(0, 2);
    }
    if (digits.length > 2) {
      formatted += ' ' + digits.slice(2, 5);
    }
    if (digits.length > 5) {
      formatted += ' ' + digits.slice(5, 7);
    }
    if (digits.length > 7) {
      formatted += ' ' + digits.slice(7, 9);
    }

    setPhone(formatted);
  };
  const [submittedOrder, setSubmittedOrder] = useState<any>(null);

  // Telegram Native BackButton Integration
  useEffect(() => {
    if (isOpen) {
      const tg = (window as any)?.Telegram?.WebApp;
      if (tg?.BackButton) {
        tg.BackButton.show();
        const handleBack = () => {
          triggerHaptic('light');
          handleClose();
        };
        tg.BackButton.onClick(handleBack);
        return () => {
          tg.BackButton.offClick(handleBack);
          tg.BackButton.hide();
        };
      }
    }
  }, [isOpen]);

  const handleClose = () => {
    triggerHaptic('light');
    try {
      (window as any)?.Telegram?.WebApp?.BackButton?.hide();
    } catch (e) {}
    setImages([]);
    setDescription('');
    setSubmittedOrder(null);
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    const remainingSlots = 2 - images.length;
    if (remainingSlots <= 0) {
      alert("Faqat 2 ta rasim yuklash mumkin!");
      return;
    }

    const filesToRead = files.slice(0, remainingSlots);
    filesToRead.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          triggerHaptic('light');
          setImages(prev => [...prev, event.target!.result as string].slice(0, 2));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    triggerHaptic('light');
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length !== 2) {
      alert("Iltimos, aynan 2 ta namuna rasim yuklang!");
      return;
    }
    if (!description.trim()) {
      alert("Iltimos, tort bo'yicha izoh yoki istaklaringizni yozing.");
      return;
    }
    if (!phone || phone.trim().length < 7) {
      alert("Iltimos, bog'lanish uchun ishlaydigan nomer yozing.");
      return;
    }

    setIsSubmitting(true);
    triggerHaptic('heavy');

    try {
      const res = await createCustomCake({
        description: `${description} (Vazni: ~${desiredWeightKg} kg)`,
        referenceImages: images,
        phone,
        deliveryType,
        deliveryAddress: deliveryType === 'DELIVERY' ? deliveryAddress : 'Olib ketish',
        desiredWeightKg: parseFloat(desiredWeightKg) || 2,
      });

      triggerSuccessHaptic();
      setSubmittedOrder(res);
    } catch (err) {
      alert("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="fixed inset-0 z-50 bg-[#FAF6F0] w-full h-full flex flex-col justify-between overflow-hidden"
          style={{ height: '100dvh' }}
        >
          {/* Top Header Bar */}
          <div className="sticky top-0 z-10 px-4 sm:px-8 py-4 bg-white/95 backdrop-blur-md border-b border-[#2B1810]/10 flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#2B1810] text-[#D4AF37] flex items-center justify-center font-bold shadow-sm border border-[#CBB279]">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold font-serif text-[#2B1810]">
                  ✨ O'zim xohlaganimdek
                </h2>
                <p className="text-[11px] text-[#6B5B52]">
                  Custom Cake Builder & Art Pastry
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-2xl bg-[#FAF6F0] text-[#2B1810] flex items-center justify-center shadow-sm hover:bg-[#F8E7EA] active:scale-95 transition-all border border-[#2B1810]/10"
              title="Yopish"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Full-Screen Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-3xl mx-auto w-full space-y-6">
            {submittedOrder ? (
              /* Success Confirmation View */
              <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#2B1810]/10 shadow-sm text-center my-auto space-y-5">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-12 h-12" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-serif font-bold text-[#2B1810]">
                    Buyurtma so'rovi qabul qilindi! 🎉
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B5B52] max-w-md mx-auto leading-relaxed">
                    Maxsus tort so'rovingiz <span className="font-extrabold text-[#2B1810]">#{submittedOrder.requestNumber}</span> raqami bilan muvaffaqiyatli saqlandi. DINORA qandolatchisi tez orada telefon raqamingiz orqali bog'lanib, narxi va tayyor bo'lish vaqtini tasdiqlaydi!
                  </p>
                </div>

                <div className="bg-[#FAF6F0] p-5 rounded-2xl max-w-sm mx-auto border border-[#CBB279]/30 text-xs text-left space-y-1.5 font-medium">
                  <p><strong className="text-[#2B1810]">Telefon:</strong> {submittedOrder.phone}</p>
                  <p><strong className="text-[#2B1810]">Yetkazib berish:</strong> {submittedOrder.deliveryType === 'DELIVERY' ? '🚚 Yetkazish' : '🛍️ Olib ketish'}</p>
                  <p><strong className="text-[#2B1810]">Holat:</strong> <span className="text-amber-600 font-bold">Hisoblanmoqda (Pending Pricing)</span></p>
                </div>

                <button
                  onClick={handleClose}
                  className="bg-[#2B1810] text-[#FAF6F0] px-8 py-3.5 rounded-2xl font-bold text-sm shadow-md hover:bg-[#3D2318] active:scale-95 transition-all border border-[#CBB279]"
                >
                  Tushunarli, Rahmat!
                </button>
              </div>
            ) : (
              /* Custom Builder Form */
              <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-3xl border border-[#2B1810]/10 shadow-sm space-y-6">
                
                {/* Form Main Title Header */}
                <div className="space-y-2 border-b border-[#2B1810]/10 pb-5">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#F8E7EA] text-[#D65B78] text-xs font-bold uppercase tracking-widest">
                    <Sparkles className="w-4 h-4" />
                    <span>Eksklyuziv Tort Konstruktori</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2B1810] leading-tight">
                    Qanday tort hohlaysiz, buni 2ta rasim va izohlab bering
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6B5B52]">
                    O'zingiz orzu qilgan dizayndagi tort yaratish uchun namuna rasmlar va istaklaringizni kiriting.
                  </p>
                </div>

                {/* 2 Reference Photo Upload Area */}
                <div className="space-y-3">
                  <label className="block text-xs font-extrabold text-[#2B1810] uppercase tracking-wider">
                    1. Namuna Rasmlar (Aynan 2 ta rasm yuklang) <span className="text-[#D65B78]">*</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[0, 1].map((index) => {
                      const img = images[index];
                      return (
                        <div
                          key={index}
                          className={`aspect-video rounded-2xl border-2 border-dashed relative overflow-hidden flex flex-col items-center justify-center p-2 text-center transition-all min-h-[160px] ${
                            img
                              ? 'border-[#D65B78] bg-[#F8E7EA]/30'
                              : 'border-[#CBB279]/50 bg-[#FAF6F0] hover:border-[#D65B78]'
                          }`}
                        >
                          {img ? (
                            <>
                              <img src={img} alt={`Ref ${index + 1}`} className="w-full h-full object-cover rounded-xl" />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 active:scale-95 transition-all"
                                title="O'chirish"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <span className="absolute bottom-2 left-2 bg-[#2B1810]/85 text-white text-[11px] px-2.5 py-0.5 rounded-lg font-bold">
                                Rasm #{index + 1}
                              </span>
                            </>
                          ) : (
                            <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-4">
                              <Camera className="w-8 h-8 text-[#CBB279] mb-1.5" />
                              <span className="text-xs font-bold text-[#2B1810]">
                                Rasm #{index + 1} ni yuklang
                              </span>
                              <span className="text-[10px] text-[#6B5B52] mt-0.5">
                                (Aynan 2 ta namuna rasm shart)
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Description & Weight Box */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-extrabold text-[#2B1810] uppercase tracking-wider">
                      2. Tort izohi va masalliq istaklari <span className="text-[#D65B78]">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Masalan: 2 qavatli to'y torti, ichi pista krem va malinali, biskviti vanilli bo'lsin. Usti oq fondan va oltin rang gullar..."
                      className="w-full p-3.5 bg-[#FAF6F0] border border-[#2B1810]/10 rounded-2xl text-xs sm:text-sm text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#D65B78]/40 resize-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-[#2B1810] uppercase tracking-wider">
                      Tahminiy Vazni (Kg)
                    </label>
                    <select
                      value={desiredWeightKg}
                      onChange={(e) => setDesiredWeightKg(e.target.value)}
                      className="w-full p-3.5 bg-[#FAF6F0] border border-[#2B1810]/10 rounded-2xl text-xs sm:text-sm text-[#2B1810] font-bold focus:outline-none"
                    >
                      <option value="1.5">1.5 - 2.0 kg (8-10 kishilik)</option>
                      <option value="2.5">2.5 - 3.0 kg (12-15 kishilik)</option>
                      <option value="4.0">4.0 - 5.0 kg (20-25 kishilik)</option>
                      <option value="6.0">6.0+ kg (To'y / Katta marosim)</option>
                    </select>
                  </div>
                </div>

                {/* Delivery Options */}
                <div className="space-y-3">
                  <label className="block text-xs font-extrabold text-[#2B1810] uppercase tracking-wider">
                    3. Qabul qilish usuli
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setDeliveryType('DELIVERY');
                      }}
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm font-bold border flex items-center justify-center space-x-2 transition-all ${
                        deliveryType === 'DELIVERY'
                          ? 'bg-[#2B1810] text-white border-[#CBB279] shadow-sm'
                          : 'bg-[#FAF6F0] text-[#6B5B52] border-[#2B1810]/10 hover:bg-white'
                      }`}
                    >
                      <span>🚚 Yetkazib berish</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setDeliveryType('PICKUP');
                      }}
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm font-bold border flex items-center justify-center space-x-2 transition-all ${
                        deliveryType === 'PICKUP'
                          ? 'bg-[#2B1810] text-white border-[#CBB279] shadow-sm'
                          : 'bg-[#FAF6F0] text-[#6B5B52] border-[#2B1810]/10 hover:bg-white'
                      }`}
                    >
                      <span>🛍️ Olib ketish</span>
                    </button>
                  </div>

                  {/* Pickup Location Card for Custom Cake */}
                  {deliveryType === 'PICKUP' && (
                    <div className="p-5 bg-[#FAF6F0] rounded-2xl border-2 border-[#CBB279]/50 space-y-3 shadow-sm">
                      <div className="flex items-center space-x-2 text-[#D65B78]">
                        <MapPin className="w-5 h-5 shrink-0" />
                        <h4 className="font-serif font-bold text-sm text-[#2B1810]">
                          Olib ketish manzili (Konditeriya)
                        </h4>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-[#2B1810]/10 text-xs sm:text-sm space-y-1">
                        <p className="font-extrabold text-[#2B1810]">
                          📍 Sirdaryo tumani, M34 ko'chasi 9-uy
                        </p>
                        <p className="text-[11px] text-[#6B5B52]">
                          Mo'ljal: DINORA konditeriyasi binosi
                        </p>
                      </div>

                      <a
                        href="https://www.google.com/maps/place/40%C2%B048'53.5%22N+68%C2%B040'50.5%22E/@40.8147824,68.6801478,183m/data=!3m1!1e3!4m4!3m3!8m2!3d40.814866!4d68.680686?entry=ttu&g_ep=EgoyMDI2MDgwNS4xIKXMDSoASAFQAw%3D%3D"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center space-x-2 w-full bg-[#2B1810] text-[#FAF6F0] p-3 rounded-xl text-xs font-bold hover:bg-[#3D2318] transition-colors shadow-sm"
                      >
                        <MapPin className="w-4 h-4 text-[#D4AF37]" />
                        <span>🗺️ Xaritada ko'rish (Google Maps / Geolokatsiya)</span>
                      </a>
                    </div>
                  )}

                  {deliveryType === 'DELIVERY' && (
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Yetkazish manzili (Tuman, ko'cha, uy raqami)..."
                      className="w-full p-3.5 bg-[#FAF6F0] border border-[#2B1810]/10 rounded-2xl text-xs sm:text-sm text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#D65B78]/40"
                    />
                  )}
                </div>

                {/* Explicit Required Phone Input Label */}
                <div className="space-y-1.5 bg-[#F8E7EA] p-4 rounded-2xl border border-[#D65B78]/30">
                  <label className="block text-xs font-extrabold text-[#D65B78] flex items-center space-x-1.5 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>⚠️ Iltimos, ishlaydigan nomer yozing *</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneInputChange}
                    placeholder="+998 90 123 45 67"
                    maxLength={17}
                    className="w-full p-3.5 bg-white border border-[#D65B78]/40 rounded-xl text-xs sm:text-sm font-bold text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#D65B78]"
                    required
                  />
                  <p className="text-[11px] text-[#6B5B52]">
                    Ushbu raqamga DINORA konditeri tort narxini va tayyor bo'lish vaqtini ma'lum qilish uchun bog'lanadi.
                  </p>
                </div>

                {/* Full-width CTA Submit Button Styled in Dark Mocha (#2B1810) */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#2B1810] hover:bg-[#3D2318] text-[#FAF6F0] py-4 rounded-2xl font-bold text-sm sm:text-base shadow-dinora-gold active:scale-98 transition-all flex items-center justify-center space-x-2 border-2 border-[#D4AF37]"
                >
                  <Send className="w-5 h-5 text-[#D65B78]" />
                  <span>{isSubmitting ? 'Yuborilmoqda...' : 'Maxsus Tort Buyurtmasini Yuborish'}</span>
                </button>

              </form>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomCakeFullScreenModal;
