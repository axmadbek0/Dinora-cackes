import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Camera,
  Trash2,
  Send,
  Phone,
  Clock,
  CheckCircle2,
  X,
  Navigation,
  Loader2,
  Heart,
  Circle,
  Square,
  PenTool,
} from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';
import { createCustomCake } from '../../services/api';
import { triggerSuccessHaptic, triggerHaptic } from '../../utils/haptics';
import { calculateCustomCakeDeliveryFee, STORE_COORDINATES } from '../../utils/deliveryCalculator';
import type { DeliveryType } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomCakeFullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 1. Shakl variantlari (Shape)
const SHAPES = [
  { id: 'Dumaloq', title: 'Dumaloq', emoji: '⭕️', icon: Circle, desc: 'Klassik va eng mashhur shakl' },
  { id: 'Kvadrat', title: 'Kvadrat', emoji: '🔲', icon: Square, desc: 'Zamonaviy va qulay kesiladi' },
  { id: 'Yurak', title: 'Yurak', emoji: '💖', icon: Heart, desc: 'Sevgi va bayramlar uchun' },
];

// 2. Qavatlar soni (Layers)
const LAYERS = [
  { id: '1 qavat', title: '1 Qavatli', emoji: '🎂', portions: '8 - 12 kishilik', weight: '~1.5 - 2.0 kg' },
  { id: '2 qavat', title: '2 Qavatli', emoji: '🎂🎂', portions: '15 - 25 kishilik', weight: '~3.0 - 4.0 kg' },
  { id: '3 qavat', title: '3 Qavatli', emoji: '👑', portions: '30 - 50+ kishilik', weight: '~5.0 - 7.0 kg (To\'y & Katta bayram)' },
];

// 3. Korj / Baza (Base)
const BASES = [
  { id: 'Biskvit (Klassik)', title: 'Biskvit (Klassik)', emoji: '🍰', color: '#F3E5AB', desc: 'Yumshoq vanilli klassik biskvit' },
  { id: 'Shokoladli', title: 'Shokoladli', emoji: '🍫', color: '#4A2C11', desc: 'Haqiqiy belgiyalik quyuq shokolad' },
  { id: 'Red Velvet', title: 'Red Velvet', emoji: '🍓', color: '#8B0000', desc: 'Yorqin qizil baxmal va mayin ta\'m' },
];

// 4. Krem (Cream)
const CREAMS = [
  { id: 'Slivki', title: 'Slivki (Qaymoqli)', emoji: '🥛', desc: 'Yengil, havodor va tabiiy sutli qaymoq' },
  { id: 'Sgushyonka', title: 'Sgushyonka & Yog\'li', emoji: '🍯', desc: 'Shirin va to\'yimli quyultirilgan sutli krem' },
  { id: 'Tvorojniy', title: 'Tvorojniy (Pishloqli)', emoji: '🧀', desc: 'Mayin tvorogli-kremchiz muvozanati' },
];

// 5. Nachinka (Filling)
const FILLINGS = [
  { id: 'Banan va Yagoda', title: 'Banan & Yagoda', emoji: '🍌🍓', desc: 'Yangi mevalar va qulupnayli konfi' },
  { id: 'Nutella', title: 'Nutella & Shokolad', emoji: '🍫🌰', desc: 'Original Nutella qatlami' },
  { id: 'Yeryong\'oq va Karamel', title: 'Yeryong\'oq & Karamel', emoji: '🥜🍯', desc: 'Snickers ta\'mi: qovurilgan yong\'oq va karamel' },
];

export const CustomCakeFullScreenModal: React.FC<CustomCakeFullScreenModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useTelegram();

  // Wizard Step State (1 to 7)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Standard Selections
  const [selectedShape, setSelectedShape] = useState<string>('Dumaloq');
  const [selectedLayer, setSelectedLayer] = useState<string>('1 qavat');
  const [selectedBase, setSelectedBase] = useState<string>('Biskvit (Klassik)');
  const [selectedCream, setSelectedCream] = useState<string>('Slivki');
  const [selectedFilling, setSelectedFilling] = useState<string>('Banan va Yagoda');

  // "O'zim yozaman" Custom Inputs
  const [isCustomShape, setIsCustomShape] = useState<boolean>(false);
  const [customShapeText, setCustomShapeText] = useState<string>('');

  const [isCustomLayer, setIsCustomLayer] = useState<boolean>(false);
  const [customLayerText, setCustomLayerText] = useState<string>('');

  const [isCustomBase, setIsCustomBase] = useState<boolean>(false);
  const [customBaseText, setCustomBaseText] = useState<string>('');

  const [isCustomCream, setIsCustomCream] = useState<boolean>(false);
  const [customCreamText, setCustomCreamText] = useState<string>('');

  const [isCustomFilling, setIsCustomFilling] = useState<boolean>(false);
  const [customFillingText, setCustomFillingText] = useState<string>('');

  // Step 6: Text and Photos
  const [customText, setCustomText] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [specialNotes, setSpecialNotes] = useState<string>('');

  // Step 7: Delivery and Location
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('DELIVERY');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string>('');

  // Customer Contact
  const [phone, setPhone] = useState<string>(() => {
    return user?.username ? `@${user.username}` : '+998 ';
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRequest, setSubmittedRequest] = useState<any>(null);

  // Resolved Final Values
  const finalShape = isCustomShape ? (customShapeText.trim() || 'Maxsus shakl') : selectedShape;
  const finalLayer = isCustomLayer ? (customLayerText.trim() || 'Maxsus qavat') : selectedLayer;
  const finalBase = isCustomBase ? (customBaseText.trim() || 'Maxsus korj') : selectedBase;
  const finalCream = isCustomCream ? (customCreamText.trim() || 'Maxsus krem') : selectedCream;
  const finalFilling = isCustomFilling ? (customFillingText.trim() || 'Maxsus nachinka') : selectedFilling;

  // Telegram BackButton Integration
  useEffect(() => {
    if (isOpen) {
      const tg = (window as any)?.Telegram?.WebApp;
      if (tg?.BackButton) {
        tg.BackButton.show();
        const handleBack = () => {
          triggerHaptic('light');
          if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
          } else {
            handleClose();
          }
        };
        tg.BackButton.onClick(handleBack);
        return () => {
          tg.BackButton.offClick(handleBack);
          tg.BackButton.hide();
        };
      }
    }
  }, [isOpen, currentStep]);

  const handleClose = () => {
    triggerHaptic('light');
    try {
      (window as any)?.Telegram?.WebApp?.BackButton?.hide();
    } catch (e) {}
    setCurrentStep(1);
    setSubmittedRequest(null);
    onClose();
  };

  // 1-Tap Geolocation detection
  const handleDetectLocation = () => {
    triggerHaptic('medium');
    setLocationError('');
    setIsLocating(true);

    if (!navigator.geolocation) {
      setIsLocating(false);
      setLocationError("Brauzeringiz geolokatsiyani qo'llab-quvvatlamaydi. Iltimos manzilni qo'lda yozing.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ latitude, longitude });

        // Reverse geocoding attempt (OpenStreetMap Nominatim)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'uz,ru,en' } }
          );
          const data = await res.json();
          if (data && data.display_name) {
            const shortAddr = [
              data.address?.road || data.address?.neighbourhood || data.address?.suburb,
              data.address?.city || data.address?.district || data.address?.county,
              data.address?.state || 'Sirdaryo'
            ].filter(Boolean).join(', ');
            setDeliveryAddress(shortAddr || data.display_name);
          } else {
            setDeliveryAddress(`GPS Joylashuv (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          }
        } catch {
          setDeliveryAddress(`GPS Joylashuv (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        }

        setIsLocating(false);
        triggerSuccessHaptic();
      },
      (err) => {
        setIsLocating(false);
        setLocationError("GPS aniqlashda xatolik yuz berdi. Iltimos manzilni qo'lda kiriting.");
        console.warn('Geolocation error:', err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Distance & Delivery Fee
  const distanceKm = coords ? calculateCustomCakeDeliveryFee(
    Math.round(
      6371 *
      2 *
      Math.asin(
        Math.sqrt(
          Math.sin(((coords.latitude - STORE_COORDINATES.latitude) * Math.PI) / 360) ** 2 +
          Math.cos((STORE_COORDINATES.latitude * Math.PI) / 180) *
          Math.cos((coords.latitude * Math.PI) / 180) *
          Math.sin(((coords.longitude - STORE_COORDINATES.longitude) * Math.PI) / 360) ** 2
        )
      ) * 10
    ) / 10
  ) : null;

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    let digits = val.replace(/\D/g, '');
    if (digits.startsWith('998')) {
      digits = digits.slice(3);
    }
    digits = digits.slice(0, 9);

    let formatted = '+998';
    if (digits.length > 0) formatted += ' ' + digits.slice(0, 2);
    if (digits.length > 2) formatted += ' ' + digits.slice(2, 5);
    if (digits.length > 5) formatted += ' ' + digits.slice(5, 7);
    if (digits.length > 7) formatted += ' ' + digits.slice(7, 9);

    setPhone(formatted);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const remainingSlots = 3 - images.length;
    if (remainingSlots <= 0) {
      alert("Ko'pi bilan 3 ta rasm yuklashingiz mumkin!");
      return;
    }

    files.slice(0, remainingSlots).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          triggerHaptic('light');
          setImages((prev) => [...prev, event.target!.result as string].slice(0, 3));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    triggerHaptic('light');
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitCustomCake = async () => {
    if (!phone || phone.trim().length < 9) {
      alert("Iltimos, bog'lanish uchun to'g'ri telefon raqam kiriting.");
      return;
    }

    setIsSubmitting(true);
    triggerHaptic('heavy');

    const formattedDescription = [
      `🎂 Shakli: ${finalShape}`,
      `📐 Qavatlar: ${finalLayer}`,
      `🍰 Korj (Baza): ${finalBase}`,
      `🥛 Krem: ${finalCream}`,
      `🍓 Nachinka: ${finalFilling}`,
      customText.trim() ? `✍️ Yozuv: "${customText.trim()}"` : null,
      specialNotes.trim() ? `📝 Izoh: ${specialNotes.trim()}` : null,
      distanceKm ? `📍 Masofa: ${distanceKm.distanceKm} km (Yetkazish: ${distanceKm.deliveryFee.toLocaleString('uz-UZ')} UZS)` : null,
    ].filter(Boolean).join(' | ');

    try {
      const res = await createCustomCake({
        description: formattedDescription,
        customDetails: {
          shape: finalShape,
          layers: finalLayer,
          base: finalBase,
          cream: finalCream,
          filling: finalFilling,
          customText: customText.trim() || undefined,
        },
        referenceImages: images,
        phone,
        deliveryType,
        deliveryAddress: deliveryType === 'DELIVERY' ? deliveryAddress || 'GPS manzil orqali' : 'Do\'kondan olib ketish',
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        distanceKm: distanceKm?.distanceKm,
        deliveryFee: distanceKm?.deliveryFee,
        telegramId: user?.id,
      });

      triggerSuccessHaptic();
      setSubmittedRequest(res);
    } catch (err) {
      alert("Buyurtma yuborishda xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitles = [
    'Shakli',
    'Qavatlar',
    'Korj (Baza)',
    'Krem',
    'Nachinka',
    'Bezak & Yozuv',
    'Yetkazish & Tasdiqlash',
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 lg:p-6 bg-black/70 backdrop-blur-md overflow-hidden select-none">
          {/* Backdrop for Desktop */}
          <div className="fixed inset-0 hidden lg:block" onClick={handleClose} />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="relative z-10 bg-[#FAF6F0] w-full h-[100dvh] lg:h-auto lg:max-h-[94vh] lg:max-w-2xl lg:rounded-3xl lg:border-2 lg:border-[#CBB279] flex flex-col justify-between overflow-hidden shadow-2xl"
          >
            {/* Top Navigation Bar with Step Indicator */}
            <div className="sticky top-0 z-20 px-4 py-3 bg-white/95 backdrop-blur-md border-b border-[#2B1810]/10 flex items-center justify-between shadow-sm shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#2B1810] text-[#D4AF37] flex items-center justify-center font-bold shadow-md border border-[#CBB279]">
                  <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold font-serif text-[#2B1810] leading-tight">
                    ✨ O'zim xohlaganimdek
                  </h2>
                  <p className="text-[11px] text-[#6B5B52] font-semibold">
                    {submittedRequest
                      ? 'Buyurtma Holati'
                      : `Qadam ${currentStep} / 7: ${stepTitles[currentStep - 1]}`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-10 h-10 rounded-2xl bg-[#FAF6F0] text-[#2B1810] flex items-center justify-center shadow-sm hover:bg-[#F8E7EA] active:scale-95 transition-all border border-[#2B1810]/10 touch-manipulation"
                title="Yopish"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar (Only before submit) */}
            {!submittedRequest && (
              <div className="w-full bg-[#FAF6F0] h-1.5 px-2 flex gap-1 border-b border-[#2B1810]/5">
                {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                  <div
                    key={s}
                    className={`h-full flex-1 rounded-full transition-all duration-300 ${
                      s <= currentStep ? 'bg-[#D65B78]' : 'bg-[#2B1810]/10'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Scrollable Wizard Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {submittedRequest ? (
                /* ================= STEP B: PENDING_PRICING CONFIRMATION SCREEN ================= */
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2B1810]/10 shadow-sm text-center my-auto space-y-5">
                  <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-md animate-pulse">
                    <Clock className="w-10 h-10" />
                  </div>

                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold uppercase tracking-wider">
                      <span>⏳ Holat: PENDING_PRICING</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2B1810]">
                      So'rovingiz qabul qilindi! 🎂
                    </h3>
                    <p className="text-xs sm:text-sm text-[#6B5B52] max-w-md mx-auto leading-relaxed">
                      So'rov raqami: <span className="font-extrabold text-[#2B1810]">#{submittedRequest.requestNumber}</span>.
                      Konditerimiz siz tanlagan masalliqlar va manzil asosida <b>narx belgilamoqda</b>.
                    </p>
                  </div>

                  {/* Summary of what was chosen */}
                  <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#CBB279]/30 text-xs text-left space-y-1.5 font-medium max-w-md mx-auto">
                    <p><strong>⭕️ Shakli:</strong> {finalShape}</p>
                    <p><strong>🎂 Qavatlar:</strong> {finalLayer}</p>
                    <p><strong>🍰 Baza:</strong> {finalBase}</p>
                    <p><strong>🥛 Krem:</strong> {finalCream}</p>
                    <p><strong>🍓 Nachinka:</strong> {finalFilling}</p>
                    {customText && <p><strong>✍️ Yozuv:</strong> "{customText}"</p>}
                    <p><strong>📞 Bog'lanish:</strong> {phone}</p>
                  </div>

                  <div className="p-4 bg-[#F8E7EA] rounded-2xl text-xs text-[#2B1810] space-y-1 text-center border border-[#D65B78]/20">
                    <p className="font-bold text-[#D65B78]">🔔 Telegram orqali bildirishnoma boradi!</p>
                    <p className="text-[11px] text-[#6B5B52]">
                      Admin narx belgilashi bilan Telegram botingizga narx va <b>[✅ Tasdiqlayman]</b> tugmasi yuboriladi.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full min-h-[52px] bg-[#2B1810] text-[#D4AF37] py-3.5 rounded-2xl font-bold text-sm shadow-md hover:bg-[#3D2318] active:scale-95 transition-all border border-[#CBB279] touch-manipulation"
                  >
                    Tushunarli, Bosh sahifaga qaytish
                  </button>
                </div>
              ) : (
                /* ================= STEP-BY-STEP ULTRA-SIMPLE WIZARD ================= */
                <div>
                  {/* STEP 1: SHAPES */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="text-center space-y-1 pb-2">
                        <span className="text-3xl">⭕️</span>
                        <h3 className="text-xl font-bold font-serif text-[#2B1810]">
                          1. Tort shaklini tanlang
                        </h3>
                        <p className="text-xs text-[#6B5B52]">
                          O'zingizga ma'qul bo'lgan shakl ustiga bosing yoki o'zingiz yozing
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {SHAPES.map((item) => {
                          const isSelected = !isCustomShape && selectedShape === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                triggerHaptic('medium');
                                setIsCustomShape(false);
                                setSelectedShape(item.id);
                              }}
                              className={`p-4 sm:p-5 rounded-3xl border-2 flex flex-col items-center justify-center text-center transition-all min-h-[120px] touch-manipulation ${
                                isSelected
                                  ? 'bg-[#2B1810] text-white border-[#D4AF37] shadow-lg scale-[1.02]'
                                  : 'bg-white text-[#2B1810] border-[#2B1810]/10 hover:border-[#D65B78] hover:bg-[#FAF6F0]'
                              }`}
                            >
                              <span className="text-3xl sm:text-4xl mb-1.5">{item.emoji}</span>
                              <span className="text-base font-bold font-serif">{item.title}</span>
                              <span className={`text-[11px] mt-1 ${isSelected ? 'text-[#D4AF37]' : 'text-[#6B5B52]'}`}>
                                {item.desc}
                              </span>
                              {isSelected && (
                                <span className="mt-2 w-6 h-6 rounded-full bg-[#D4AF37] text-[#2B1810] flex items-center justify-center font-bold text-xs">
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* "O'zim yozaman" button for Shape */}
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('medium');
                          setIsCustomShape(true);
                        }}
                        className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all touch-manipulation ${
                          isCustomShape
                            ? 'bg-[#2B1810] text-white border-[#D4AF37] shadow-md'
                            : 'bg-white text-[#2B1810] border-[#CBB279]/50 hover:border-[#D65B78] hover:bg-[#FAF6F0]'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">✍️</span>
                          <div className="text-left">
                            <span className="text-sm font-bold block">Boshqa shakl (O'zim yozaman)</span>
                            <span className={`text-[11px] ${isCustomShape ? 'text-[#D4AF37]' : 'text-[#6B5B52]'}`}>
                              Yulduzcha, sonlar, mashina yoki nostandart shakllar
                            </span>
                          </div>
                        </div>
                        <PenTool className={`w-5 h-5 ${isCustomShape ? 'text-[#D4AF37]' : 'text-[#CBB279]'}`} />
                      </button>

                      {isCustomShape && (
                        <div className="bg-white p-4 rounded-2xl border-2 border-[#D4AF37] space-y-2 animate-in fade-in">
                          <label className="block text-xs font-bold text-[#2B1810]">
                            O'zingiz xohlagan shaklni yozing:
                          </label>
                          <input
                            type="text"
                            value={customShapeText}
                            onChange={(e) => setCustomShapeText(e.target.value)}
                            placeholder="Masalan: 5 raqami shaklida, Yulduzcha yoki Ayiqcha shaklida..."
                            className="w-full p-3 bg-[#FAF6F0] border border-[#2B1810]/20 rounded-xl text-xs sm:text-sm font-bold text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#D65B78]"
                            autoFocus
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 2: LAYERS */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="text-center space-y-1 pb-2">
                        <span className="text-3xl">🎂</span>
                        <h3 className="text-xl font-bold font-serif text-[#2B1810]">
                          2. Qavatlar soni va o'lchami
                        </h3>
                        <p className="text-xs text-[#6B5B52]">
                          Mehmonlar soniga qarab qavatni tanlang yoki o'zingiz yozing
                        </p>
                      </div>

                      <div className="space-y-3">
                        {LAYERS.map((item) => {
                          const isSelected = !isCustomLayer && selectedLayer === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                triggerHaptic('medium');
                                setIsCustomLayer(false);
                                setSelectedLayer(item.id);
                              }}
                              className={`w-full p-4 sm:p-5 rounded-3xl border-2 flex items-center justify-between transition-all touch-manipulation ${
                                isSelected
                                  ? 'bg-[#2B1810] text-white border-[#D4AF37] shadow-lg scale-[1.01]'
                                  : 'bg-white text-[#2B1810] border-[#2B1810]/10 hover:border-[#D65B78] hover:bg-[#FAF6F0]'
                              }`}
                            >
                              <div className="flex items-center space-x-4">
                                <span className="text-3xl sm:text-4xl">{item.emoji}</span>
                                <div className="text-left">
                                  <h4 className="text-base font-bold font-serif">{item.title}</h4>
                                  <p className={`text-xs ${isSelected ? 'text-[#D4AF37]' : 'text-[#6B5B52]'}`}>
                                    👥 {item.portions} • ⚖️ {item.weight}
                                  </p>
                                </div>
                              </div>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border ${
                                isSelected ? 'bg-[#D4AF37] text-[#2B1810] border-[#D4AF37]' : 'border-[#2B1810]/20 text-transparent'
                              }`}>
                                ✓
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* "O'zim yozaman" button for Layers */}
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('medium');
                          setIsCustomLayer(true);
                        }}
                        className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all touch-manipulation ${
                          isCustomLayer
                            ? 'bg-[#2B1810] text-white border-[#D4AF37] shadow-md'
                            : 'bg-white text-[#2B1810] border-[#CBB279]/50 hover:border-[#D65B78] hover:bg-[#FAF6F0]'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">✍️</span>
                          <div className="text-left">
                            <span className="text-sm font-bold block">Boshqa o'lcham (O'zim yozaman)</span>
                            <span className={`text-[11px] ${isCustomLayer ? 'text-[#D4AF37]' : 'text-[#6B5B52]'}`}>
                              4 qavat, Bento mini yoki aniq vazn (masalan: 10 kg)
                            </span>
                          </div>
                        </div>
                        <PenTool className={`w-5 h-5 ${isCustomLayer ? 'text-[#D4AF37]' : 'text-[#CBB279]'}`} />
                      </button>

                      {isCustomLayer && (
                        <div className="bg-white p-4 rounded-2xl border-2 border-[#D4AF37] space-y-2 animate-in fade-in">
                          <label className="block text-xs font-bold text-[#2B1810]">
                            O'zingiz xohlagan qavat yoki vaznni yozing:
                          </label>
                          <input
                            type="text"
                            value={customLayerText}
                            onChange={(e) => setCustomLayerText(e.target.value)}
                            placeholder="Masalan: 4 qavatli to'y torti, 10-12 kg yoki Mini bento 500g..."
                            className="w-full p-3 bg-[#FAF6F0] border border-[#2B1810]/20 rounded-xl text-xs sm:text-sm font-bold text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#D65B78]"
                            autoFocus
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 3: BASE / KORJ */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="text-center space-y-1 pb-2">
                        <span className="text-3xl">🍰</span>
                        <h3 className="text-xl font-bold font-serif text-[#2B1810]">
                          3. Korj / Baza (Biskvit)
                        </h3>
                        <p className="text-xs text-[#6B5B52]">
                          Tortning asosiy xamir qatlami qanday bo'lsin?
                        </p>
                      </div>

                      <div className="space-y-3">
                        {BASES.map((item) => {
                          const isSelected = !isCustomBase && selectedBase === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                triggerHaptic('medium');
                                setIsCustomBase(false);
                                setSelectedBase(item.id);
                              }}
                              className={`w-full p-4 sm:p-5 rounded-3xl border-2 flex items-center justify-between transition-all touch-manipulation ${
                                isSelected
                                  ? 'bg-[#2B1810] text-white border-[#D4AF37] shadow-lg scale-[1.01]'
                                  : 'bg-white text-[#2B1810] border-[#2B1810]/10 hover:border-[#D65B78] hover:bg-[#FAF6F0]'
                              }`}
                            >
                              <div className="flex items-center space-x-4">
                                <span className="text-3xl sm:text-4xl">{item.emoji}</span>
                                <div className="text-left">
                                  <h4 className="text-base font-bold font-serif">{item.title}</h4>
                                  <p className={`text-xs ${isSelected ? 'text-[#D4AF37]' : 'text-[#6B5B52]'}`}>
                                    {item.desc}
                                  </p>
                                </div>
                              </div>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border ${
                                isSelected ? 'bg-[#D4AF37] text-[#2B1810] border-[#D4AF37]' : 'border-[#2B1810]/20 text-transparent'
                              }`}>
                                ✓
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* "O'zim yozaman" button for Base */}
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('medium');
                          setIsCustomBase(true);
                        }}
                        className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all touch-manipulation ${
                          isCustomBase
                            ? 'bg-[#2B1810] text-white border-[#D4AF37] shadow-md'
                            : 'bg-white text-[#2B1810] border-[#CBB279]/50 hover:border-[#D65B78] hover:bg-[#FAF6F0]'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">✍️</span>
                          <div className="text-left">
                            <span className="text-sm font-bold block">Boshqa biskvit (O'zim yozaman)</span>
                            <span className={`text-[11px] ${isCustomBase ? 'text-[#D4AF37]' : 'text-[#6B5B52]'}`}>
                              Medovik xamiri, Pista biskviti, Oreo yoki Sabli
                            </span>
                          </div>
                        </div>
                        <PenTool className={`w-5 h-5 ${isCustomBase ? 'text-[#D4AF37]' : 'text-[#CBB279]'}`} />
                      </button>

                      {isCustomBase && (
                        <div className="bg-white p-4 rounded-2xl border-2 border-[#D4AF37] space-y-2 animate-in fade-in">
                          <label className="block text-xs font-bold text-[#2B1810]">
                            O'zingiz xohlagan korj / xamir turini yozing:
                          </label>
                          <input
                            type="text"
                            value={customBaseText}
                            onChange={(e) => setCustomBaseText(e.target.value)}
                            placeholder="Masalan: Asalli medovik qatlami, Limonli biskvit yoki Oreo korj..."
                            className="w-full p-3 bg-[#FAF6F0] border border-[#2B1810]/20 rounded-xl text-xs sm:text-sm font-bold text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#D65B78]"
                            autoFocus
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 4: CREAM */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <div className="text-center space-y-1 pb-2">
                        <span className="text-3xl">🥛</span>
                        <h3 className="text-xl font-bold font-serif text-[#2B1810]">
                          4. Krem turini tanlang
                        </h3>
                        <p className="text-xs text-[#6B5B52]">
                          O'zingiz yoqtirgan krem tarkibini belgilang yoki o'zingiz yozing
                        </p>
                      </div>

                      <div className="space-y-3">
                        {CREAMS.map((item) => {
                          const isSelected = !isCustomCream && selectedCream === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                triggerHaptic('medium');
                                setIsCustomCream(false);
                                setSelectedCream(item.id);
                              }}
                              className={`w-full p-4 sm:p-5 rounded-3xl border-2 flex items-center justify-between transition-all touch-manipulation ${
                                isSelected
                                  ? 'bg-[#2B1810] text-white border-[#D4AF37] shadow-lg scale-[1.01]'
                                  : 'bg-white text-[#2B1810] border-[#2B1810]/10 hover:border-[#D65B78] hover:bg-[#FAF6F0]'
                              }`}
                            >
                              <div className="flex items-center space-x-4">
                                <span className="text-3xl sm:text-4xl">{item.emoji}</span>
                                <div className="text-left">
                                  <h4 className="text-base font-bold font-serif">{item.title}</h4>
                                  <p className={`text-xs ${isSelected ? 'text-[#D4AF37]' : 'text-[#6B5B52]'}`}>
                                    {item.desc}
                                  </p>
                                </div>
                              </div>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border ${
                                isSelected ? 'bg-[#D4AF37] text-[#2B1810] border-[#D4AF37]' : 'border-[#2B1810]/20 text-transparent'
                              }`}>
                                ✓
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* "O'zim yozaman" button for Cream */}
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('medium');
                          setIsCustomCream(true);
                        }}
                        className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all touch-manipulation ${
                          isCustomCream
                            ? 'bg-[#2B1810] text-white border-[#D4AF37] shadow-md'
                            : 'bg-white text-[#2B1810] border-[#CBB279]/50 hover:border-[#D65B78] hover:bg-[#FAF6F0]'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">✍️</span>
                          <div className="text-left">
                            <span className="text-sm font-bold block">Boshqa krem (O'zim yozaman)</span>
                            <span className={`text-[11px] ${isCustomCream ? 'text-[#D4AF37]' : 'text-[#6B5B52]'}`}>
                              Mascarpone, Shokoladli ganash, Pista krem yoki Beze
                            </span>
                          </div>
                        </div>
                        <PenTool className={`w-5 h-5 ${isCustomCream ? 'text-[#D4AF37]' : 'text-[#CBB279]'}`} />
                      </button>

                      {isCustomCream && (
                        <div className="bg-white p-4 rounded-2xl border-2 border-[#D4AF37] space-y-2 animate-in fade-in">
                          <label className="block text-xs font-bold text-[#2B1810]">
                            O'zingiz xohlagan krem turini yozing:
                          </label>
                          <input
                            type="text"
                            value={customCreamText}
                            onChange={(e) => setCustomCreamText(e.target.value)}
                            placeholder="Masalan: Shokoladli ganash, Mascarpone yoki Muzqaymoqli krem..."
                            className="w-full p-3 bg-[#FAF6F0] border border-[#2B1810]/20 rounded-xl text-xs sm:text-sm font-bold text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#D65B78]"
                            autoFocus
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 5: FILLING (NACHINKA) */}
                  {currentStep === 5 && (
                    <div className="space-y-4">
                      <div className="text-center space-y-1 pb-2">
                        <span className="text-3xl">🍓</span>
                        <h3 className="text-xl font-bold font-serif text-[#2B1810]">
                          5. Nachinka (Ichki to'ldirgich)
                        </h3>
                        <p className="text-xs text-[#6B5B52]">
                          Tort ichidagi meva va shirin qatlam
                        </p>
                      </div>

                      <div className="space-y-3">
                        {FILLINGS.map((item) => {
                          const isSelected = !isCustomFilling && selectedFilling === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                triggerHaptic('medium');
                                setIsCustomFilling(false);
                                setSelectedFilling(item.id);
                              }}
                              className={`w-full p-4 sm:p-5 rounded-3xl border-2 flex items-center justify-between transition-all touch-manipulation ${
                                isSelected
                                  ? 'bg-[#2B1810] text-white border-[#D4AF37] shadow-lg scale-[1.01]'
                                  : 'bg-white text-[#2B1810] border-[#2B1810]/10 hover:border-[#D65B78] hover:bg-[#FAF6F0]'
                              }`}
                            >
                              <div className="flex items-center space-x-4">
                                <span className="text-3xl sm:text-4xl">{item.emoji}</span>
                                <div className="text-left">
                                  <h4 className="text-base font-bold font-serif">{item.title}</h4>
                                  <p className={`text-xs ${isSelected ? 'text-[#D4AF37]' : 'text-[#6B5B52]'}`}>
                                    {item.desc}
                                  </p>
                                </div>
                              </div>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border ${
                                isSelected ? 'bg-[#D4AF37] text-[#2B1810] border-[#D4AF37]' : 'border-[#2B1810]/20 text-transparent'
                              }`}>
                                ✓
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* "O'zim yozaman" button for Filling */}
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('medium');
                          setIsCustomFilling(true);
                        }}
                        className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all touch-manipulation ${
                          isCustomFilling
                            ? 'bg-[#2B1810] text-white border-[#D4AF37] shadow-md'
                            : 'bg-white text-[#2B1810] border-[#CBB279]/50 hover:border-[#D65B78] hover:bg-[#FAF6F0]'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">✍️</span>
                          <div className="text-left">
                            <span className="text-sm font-bold block">Boshqa nachinka (O'zim yozaman)</span>
                            <span className={`text-[11px] ${isCustomFilling ? 'text-[#D4AF37]' : 'text-[#6B5B52]'}`}>
                              Mango-marakuya, Malinali konfi, Pista praline yoki Nachinkasiz
                            </span>
                          </div>
                        </div>
                        <PenTool className={`w-5 h-5 ${isCustomFilling ? 'text-[#D4AF37]' : 'text-[#CBB279]'}`} />
                      </button>

                      {isCustomFilling && (
                        <div className="bg-white p-4 rounded-2xl border-2 border-[#D4AF37] space-y-2 animate-in fade-in">
                          <label className="block text-xs font-bold text-[#2B1810]">
                            O'zingiz xohlagan nachinka yoki mevalarni yozing:
                          </label>
                          <input
                            type="text"
                            value={customFillingText}
                            onChange={(e) => setCustomFillingText(e.target.value)}
                            placeholder="Masalan: Mango marakuya, Malinali jem yoki Faqat qulupnay..."
                            className="w-full p-3 bg-[#FAF6F0] border border-[#2B1810]/20 rounded-xl text-xs sm:text-sm font-bold text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#D65B78]"
                            autoFocus
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 6: DECORATION, TEXT & PHOTOS */}
                  {currentStep === 6 && (
                    <div className="space-y-4">
                      <div className="text-center space-y-1 pb-2">
                        <span className="text-3xl">✍️</span>
                        <h3 className="text-xl font-bold font-serif text-[#2B1810]">
                          6. Bezak, Yozuv va Rasm
                        </h3>
                        <p className="text-xs text-[#6B5B52]">
                          Tort ustiga yozuv va namuna rasm yuklang
                        </p>
                      </div>

                      {/* Custom Text on Cake */}
                      <div className="bg-white p-4 rounded-3xl border border-[#2B1810]/10 space-y-2">
                        <label className="block text-xs font-bold text-[#2B1810] uppercase tracking-wider">
                          ✍️ Tort ustidagi tabrik yozuvi (Ixtiyoriy):
                        </label>
                        <input
                          type="text"
                          value={customText}
                          onChange={(e) => setCustomText(e.target.value)}
                          placeholder='Masalan: "Tug`ilgan kuning bilan, Dinora!"'
                          className="w-full min-h-[48px] p-3.5 bg-[#FAF6F0] border border-[#2B1810]/10 rounded-2xl text-xs sm:text-sm font-bold text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#D65B78]"
                        />
                      </div>

                      {/* Photo Upload Box */}
                      <div className="bg-white p-4 rounded-3xl border border-[#2B1810]/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-[#2B1810] uppercase tracking-wider">
                            📸 Namuna rasmlar (Ixtiyoriy, 3 tagacha):
                          </label>
                          <span className="text-[11px] text-[#6B5B52] font-bold">
                            {images.length} / 3 ta
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                          {images.map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-[#2B1810]/20 group">
                              <img src={img} alt={`Namuna ${idx + 1}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="absolute top-1.5 right-1.5 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 active:scale-95"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}

                          {images.length < 3 && (
                            <label className="aspect-square rounded-2xl border-2 border-dashed border-[#CBB279] bg-[#FAF6F0] flex flex-col items-center justify-center cursor-pointer hover:border-[#D65B78] transition-all p-2 text-center touch-manipulation">
                              <Camera className="w-6 h-6 text-[#CBB279] mb-1" />
                              <span className="text-[10px] font-bold text-[#2B1810]">Rasm qo'shish</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Extra wishes / notes */}
                      <div className="bg-white p-4 rounded-3xl border border-[#2B1810]/10 space-y-2">
                        <label className="block text-xs font-bold text-[#2B1810] uppercase tracking-wider">
                          📝 Qo'shimcha istaklaringiz:
                        </label>
                        <textarea
                          rows={2}
                          value={specialNotes}
                          onChange={(e) => setSpecialNotes(e.target.value)}
                          placeholder="Ranglar, figuralar yoki maxsus bezaklar haqida yozing..."
                          className="w-full p-3 bg-[#FAF6F0] border border-[#2B1810]/10 rounded-2xl text-xs text-[#2B1810] focus:outline-none resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 7: DELIVERY, GEOLOCATION & FINAL CONFIRMATION */}
                  {currentStep === 7 && (
                    <div className="space-y-4">
                      <div className="text-center space-y-1 pb-2">
                        <span className="text-3xl">📍</span>
                        <h3 className="text-xl font-bold font-serif text-[#2B1810]">
                          7. Yetkazish va Bog'lanish
                        </h3>
                        <p className="text-xs text-[#6B5B52]">
                          2 km gacha BEPUL, 2 km dan oshsa +15,000 so'm/km
                        </p>
                      </div>

                      {/* Delivery Mode Tabs */}
                      <div className="grid grid-cols-2 gap-2 bg-white p-1.5 rounded-2xl border border-[#2B1810]/10">
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            setDeliveryType('DELIVERY');
                          }}
                          className={`min-h-[48px] rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
                            deliveryType === 'DELIVERY'
                              ? 'bg-[#2B1810] text-[#D4AF37] shadow-sm'
                              : 'text-[#6B5B52] hover:bg-[#FAF6F0]'
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
                          className={`min-h-[48px] rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
                            deliveryType === 'PICKUP'
                              ? 'bg-[#2B1810] text-[#D4AF37] shadow-sm'
                              : 'text-[#6B5B52] hover:bg-[#FAF6F0]'
                          }`}
                        >
                          <span>🛍️ Olib ketish</span>
                        </button>
                      </div>

                      {/* Geolocation Detection for Delivery */}
                      {deliveryType === 'DELIVERY' && (
                        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#2B1810]/10 space-y-3">
                          <button
                            type="button"
                            onClick={handleDetectLocation}
                            disabled={isLocating}
                            className="w-full min-h-[52px] bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md hover:opacity-95 active:scale-98 transition-all touch-manipulation"
                          >
                            {isLocating ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Joylashuvingiz aniqlanmoqda...</span>
                              </>
                            ) : (
                              <>
                                <Navigation className="w-5 h-5 text-emerald-200" />
                                <span>📍 Mening joylashuvimni yuborish (1-bosishda GPS)</span>
                              </>
                            )}
                          </button>

                          {locationError && (
                            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl text-center">
                              {locationError}
                            </p>
                          )}

                          {coords && distanceKm && (
                            <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-2xl text-xs text-emerald-900 space-y-1">
                              <p className="font-bold flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>GPS Joylashuv muvaffaqiyatli olindi!</span>
                              </p>
                              <p>📏 Masofa: <strong>{distanceKm.distanceKm} km</strong></p>
                              <p>🚚 Yetkazish narxi: <strong>{distanceKm.deliveryFee === 0 ? 'BEPUL 🎁' : `${distanceKm.deliveryFee.toLocaleString('uz-UZ')} UZS`}</strong></p>
                              <p className="text-[11px] text-emerald-700 italic">{distanceKm.breakdownText}</p>
                            </div>
                          )}

                          <div>
                            <label className="block text-[11px] font-bold text-[#2B1810] uppercase tracking-wider mb-1">
                              Yetkazish manzili (Tuman, ko'cha, xonadon):
                            </label>
                            <input
                              type="text"
                              value={deliveryAddress}
                              onChange={(e) => setDeliveryAddress(e.target.value)}
                              placeholder="Masalan: Sirdaryo tumani, Alisher Navoiy ko'chasi 14-uy"
                              className="w-full p-3.5 bg-[#FAF6F0] border border-[#2B1810]/10 rounded-2xl text-xs sm:text-sm text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#D65B78]"
                            />
                          </div>
                        </div>
                      )}

                      {/* Pickup Info */}
                      {deliveryType === 'PICKUP' && (
                        <div className="bg-white p-4 rounded-3xl border border-[#2B1810]/10 space-y-2 text-xs">
                          <p className="font-bold text-[#2B1810] flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-[#D4AF37]" />
                            <span>Konditeriya manzili:</span>
                          </p>
                          <p className="text-[#6B5B52]">
                            Sirdaryo tumani, M34 ko'chasi 9-uy (DINORA shirinliklari binosi)
                          </p>
                        </div>
                      )}

                      {/* Phone Contact Input */}
                      <div className="bg-[#F8E7EA] p-4 rounded-3xl border border-[#D65B78]/30 space-y-2">
                        <label className="block text-xs font-extrabold text-[#D65B78] uppercase tracking-wider flex items-center gap-1.5">
                          <Phone className="w-4 h-4" />
                          <span>Telefon raqamingiz (Narxni aytish uchun): *</span>
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={handlePhoneInputChange}
                          placeholder="+998 90 123 45 67"
                          maxLength={17}
                          className="w-full min-h-[48px] p-3.5 bg-white border border-[#D65B78]/40 rounded-2xl text-sm font-bold text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#D65B78]"
                          required
                        />
                      </div>

                      {/* Summary Review Card */}
                      <div className="bg-white p-4 rounded-3xl border border-[#CBB279] shadow-sm text-xs space-y-1.5">
                        <h4 className="font-serif font-bold text-sm text-[#2B1810] border-b border-[#2B1810]/10 pb-1.5 flex items-center gap-1.5">
                          <span>🎂 Siz tanlagan tort:</span>
                        </h4>
                        <p><strong>⭕️ Shakli:</strong> {finalShape} • <strong>Qavat:</strong> {finalLayer}</p>
                        <p><strong>🍰 Baza:</strong> {finalBase}</p>
                        <p><strong>🥛 Krem:</strong> {finalCream} • <strong>Nachinka:</strong> {finalFilling}</p>
                        {customText && <p><strong>✍️ Yozuv:</strong> "{customText}"</p>}
                        {images.length > 0 && <p><strong>📸 Rasmlar:</strong> {images.length} ta yuklandi</p>}
                        <p className="pt-1 text-[#D65B78] font-bold">
                          ⏳ Narx: Yuborilgandan so'ng Admin tomonidan belgilanadi (Pending Pricing)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Sticky Action Bar (Back / Next / Submit) */}
            {!submittedRequest && (
              <div className="sticky bottom-0 z-20 px-4 py-3 bg-white/95 backdrop-blur-md border-t border-[#2B1810]/10 flex items-center justify-between gap-3 shrink-0">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setCurrentStep((prev) => prev - 1);
                    }}
                    className="min-h-[50px] px-5 rounded-2xl bg-[#FAF6F0] text-[#2B1810] font-bold text-xs sm:text-sm border border-[#2B1810]/10 hover:bg-[#F8E7EA] active:scale-95 transition-all flex items-center space-x-1.5 touch-manipulation"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Ortga</span>
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 7 ? (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('medium');
                      setCurrentStep((prev) => prev + 1);
                    }}
                    className="flex-1 min-h-[50px] px-6 rounded-2xl bg-[#2B1810] text-[#D4AF37] font-bold text-xs sm:text-sm shadow-md hover:bg-[#3D2318] active:scale-98 transition-all flex items-center justify-center space-x-2 border border-[#CBB279] touch-manipulation"
                  >
                    <span>Keyingisi: {stepTitles[currentStep]}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmitCustomCake}
                    className="flex-1 min-h-[52px] px-6 rounded-2xl bg-gradient-to-r from-[#2B1810] to-[#4A2C11] text-[#D4AF37] font-bold text-sm shadow-xl hover:opacity-95 active:scale-98 transition-all flex items-center justify-center space-x-2 border-2 border-[#D4AF37] touch-manipulation"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Yuborilmoqda...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 text-[#D65B78]" />
                        <span>Maxsus Tort Buyurtmasini Yuborish</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CustomCakeFullScreenModal;
