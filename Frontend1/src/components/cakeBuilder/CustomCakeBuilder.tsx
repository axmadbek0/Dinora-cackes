import React, { useState } from 'react';
import { Camera, Trash2, Send, Sparkles, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';
import { createCustomCake } from '../../services/api';
import { triggerSuccessHaptic, triggerHaptic } from '../../utils/haptics';
import type { DeliveryType } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

import { compressAndConvertToBase64 } from '../../utils/compressImage';

interface CustomCakeBuilderProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomCakeBuilder: React.FC<CustomCakeBuilderProps> = ({ isOpen, onClose }) => {
  const { user } = useTelegram();
  const [images, setImages] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState(user?.username ? `@${user.username}` : '+998 ');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('DELIVERY');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [desiredWeightKg, setDesiredWeightKg] = useState('2.0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<any>(null);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);

    const remainingSlots = 2 - images.length;
    if (remainingSlots <= 0) {
      alert("Ko'pi bilan 2 ta rasm yuklashingiz mumkin!");
      return;
    }

    const filesToCompress = files.slice(0, remainingSlots);
    for (const file of filesToCompress) {
      try {
        const compressedBase64 = await compressAndConvertToBase64(file, 800, 800, 0.75);
        triggerHaptic('light');
        setImages((prev) => [...prev, compressedBase64].slice(0, 2));
      } catch (err) {
        console.error('Image compression error:', err);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    triggerHaptic('light');
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      alert("Iltimos, kamida 1 ta namuna rasm yuklang!");
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

  const resetAndClose = () => {
    setImages([]);
    setDescription('');
    setSubmittedOrder(null);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-[#2B1810]/10 relative my-8 p-6 sm:p-8"
        >
          {/* Close button */}
          <button
            onClick={resetAndClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#FAF6F0] text-[#2B1810] flex items-center justify-center hover:bg-[#F8E7EA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {submittedOrder ? (
            /* Success confirmation screen */
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#2B1810]">
                Buyurtma so'rovi qabul qilindi! 🎉
              </h3>
              <p className="text-sm text-[#6B5B52] max-w-md mx-auto leading-relaxed">
                Maxsus tort so'rovingiz <span className="font-bold text-[#2B1810]">#{submittedOrder.requestNumber}</span> raqami bilan saqlandi. DINORA qandolatchisi tez orada telefon raqamingiz orqali bog'lanib, aniq narxini va tayyor bo'lish vaqtini ma'lum qiladi!
              </p>
              <div className="bg-[#FAF6F0] p-4 rounded-2xl max-w-sm mx-auto border border-[#CBB279]/30 text-xs text-left space-y-1">
                <p><strong className="text-[#2B1810]">Telefon:</strong> {submittedOrder.phone}</p>
                <p><strong className="text-[#2B1810]">Yetkazib berish:</strong> {submittedOrder.deliveryType === 'DELIVERY' ? '🚚 Yetkazish' : '🛍️ Olib ketish'}</p>
                <p><strong className="text-[#2B1810]">Holat:</strong> <span className="text-amber-600 font-bold">Hisoblanmoqda (Pending Pricing)</span></p>
              </div>
              <button
                onClick={resetAndClose}
                className="mt-4 bg-[#2B1810] text-[#FAF6F0] px-8 py-3 rounded-2xl font-bold text-sm shadow-md hover:bg-[#3D2318] transition-colors border border-[#CBB279]"
              >
                Tushunarli, Rahmat!
              </button>
            </div>
          ) : (
            /* Form Screen */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Header section */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-[#D65B78] text-xs font-bold uppercase tracking-widest">
                  <Sparkles className="w-4 h-4" />
                  <span>Maxsus Konstruktor</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2B1810] leading-tight">
                  Qanday tort hohlaysiz, buni 2ta rasim va izohlab bering
                </h2>
                <p className="text-xs sm:text-sm text-[#6B5B52]">
                  O'zingiz orzu qilgan dizayndagi eksklyuziv tortni yaratish uchun namuna va talablarni kiriting.
                </p>
              </div>

              {/* 2 Reference Photo Upload Area */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#2B1810] uppercase tracking-wider">
                  1. Namuna Rasmlar (Aynan 2 ta rasm yuklang) <span className="text-[#D65B78]">*</span>
                </label>

                <div className="grid grid-cols-2 gap-4">
                  {[0, 1].map((index) => {
                    const img = images[index];
                    return (
                      <div
                        key={index}
                        className={`aspect-video rounded-2xl border-2 border-dashed relative overflow-hidden flex flex-col items-center justify-center p-2 text-center transition-all ${
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
                              className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <span className="absolute bottom-2 left-2 bg-[#2B1810]/80 text-white text-[10px] px-2 py-0.5 rounded-md font-bold">
                              Rasm #{index + 1}
                            </span>
                          </>
                        ) : (
                          <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-4">
                            <Camera className="w-8 h-8 text-[#CBB279] mb-1" />
                            <span className="text-xs font-bold text-[#2B1810]">
                              Rasm #{index + 1} ni tanlang
                            </span>
                            <span className="text-[10px] text-[#6B5B52] mt-0.5">
                              JPEG, PNG (Max 5MB)
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
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-[#2B1810] uppercase tracking-wider">
                    2. Tort izohi va masalliq istaklari <span className="text-[#D65B78]">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Masalan: 2 qavatli to'y torti, ichi pista krem va malinali, biskviti vanilli bo'lsin. Usti oq fondan va oltin rang gullar..."
                    className="w-full p-3 bg-[#FAF6F0] border border-[#2B1810]/10 rounded-2xl text-xs sm:text-sm text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#D65B78]/40 resize-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2B1810] uppercase tracking-wider">
                    Tahminiy Vazni (Kg)
                  </label>
                  <select
                    value={desiredWeightKg}
                    onChange={(e) => setDesiredWeightKg(e.target.value)}
                    className="w-full p-3 bg-[#FAF6F0] border border-[#2B1810]/10 rounded-2xl text-xs sm:text-sm text-[#2B1810] font-bold focus:outline-none"
                  >
                    <option value="1.5">1.5 - 2.0 kg (8-10 kishilik)</option>
                    <option value="2.5">2.5 - 3.0 kg (12-15 kishilik)</option>
                    <option value="4.0">4.0 - 5.0 kg (20-25 kishilik)</option>
                    <option value="6.0">6.0+ kg (Katta to'y/Tadbirlar)</option>
                  </select>
                </div>
              </div>

              {/* Order Type & Address */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#2B1810] uppercase tracking-wider">
                  3. Qanday qabul qilasiz?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setDeliveryType('DELIVERY');
                    }}
                    className={`p-3 rounded-2xl text-xs font-bold border flex items-center justify-center space-x-2 transition-all ${
                      deliveryType === 'DELIVERY'
                        ? 'bg-[#2B1810] text-white border-[#CBB279]'
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
                    className={`p-3 rounded-2xl text-xs font-bold border flex items-center justify-center space-x-2 transition-all ${
                      deliveryType === 'PICKUP'
                        ? 'bg-[#2B1810] text-white border-[#CBB279]'
                        : 'bg-[#FAF6F0] text-[#6B5B52] border-[#2B1810]/10 hover:bg-white'
                    }`}
                  >
                    <span>🛍️ Olib ketish</span>
                  </button>
                </div>

                {deliveryType === 'DELIVERY' && (
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Yetkazish manzili (Tuman, ko'cha, uy raqami)..."
                    className="w-full p-3 bg-[#FAF6F0] border border-[#2B1810]/10 rounded-2xl text-xs sm:text-sm text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#D65B78]/40"
                  />
                )}
              </div>

              {/* Explicit Required Phone Input Label */}
              <div className="space-y-1 bg-[#F8E7EA] p-4 rounded-2xl border border-[#D65B78]/30">
                <label className="block text-xs font-extrabold text-[#D65B78] flex items-center space-x-1 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>⚠️ Iltimos, ishlaydigan nomer yozing</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full mt-1.5 p-3 bg-white border border-[#D65B78]/40 rounded-xl text-sm font-bold text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#D65B78]"
                  required
                />
                <p className="text-[11px] text-[#6B5B52]">
                  Ushbu raqamga DINORA konditeri tort narxini va tayyor bo'lish vaqtini tasdiqlash uchun qo'ng'iroq qiladi.
                </p>
              </div>

              {/* Submit Trigger */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#2B1810] via-[#42261A] to-[#2B1810] text-[#FAF6F0] py-4 rounded-2xl font-bold text-sm sm:text-base shadow-dinora-gold hover:shadow-lg active:scale-98 transition-all flex items-center justify-center space-x-2 border-2 border-[#D4AF37]"
              >
                <Send className="w-5 h-5 text-[#D65B78]" />
                <span>{isSubmitting ? 'Yuborilmoqda...' : 'Maxsus Tort Buyurtmasini Yuborish'}</span>
              </button>

            </form>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
