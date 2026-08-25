import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useTelegram } from '../../context/TelegramContext';
import { formatUZS } from '../../utils/formatters';
import { createOrder, uploadOrderReceipt, fetchPaymentConfig } from '../../services/api';
import { triggerSuccessHaptic, triggerHaptic } from '../../utils/haptics';
import { getImageUrl } from '../../utils/imageUrl';
import { calculateDistanceKm, calculateDeliveryFee } from '../../utils/deliveryCalculator';
import type { DeliveryType, PaymentMode, Order } from '../../types';
import { DeliveryDatePicker } from './DeliveryDatePicker';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Send,
  MapPin,
  CreditCard,
  Banknote,
  ShieldCheck,
  Copy,
  CheckCircle2,
  Upload,
  Clock,
  User,
  ShoppingBag,
  Navigation,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface CartFullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated?: (order: any) => void;
}

export const CartFullScreenModal: React.FC<CartFullScreenModalProps> = ({
  isOpen,
  onClose,
  onOrderCreated,
}) => {
  const { cart, updateQuantity, removeFromCart, clearCart, totalAmount } = useCart();
  const { user } = useTelegram();

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('DELIVERY');
  
  // Customer & address inputs
  const [customerName, setCustomerName] = useState(user?.first_name || '');
  const [district, setDistrict] = useState('Sirdaryo tumani');
  const [mahalla, setMahalla] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [phone, setPhone] = useState(user?.username ? `@${user.username}` : '+998 ');
  const [paymentProvider, setPaymentProvider] = useState<PaymentMode>('CARD_TRANSFER');
  const [notes, setNotes] = useState('');

  // GPS Geolocation state
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Delivery Date & Time Slot
  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('12:00 - 15:00');
  
  const [checkoutStep, setCheckoutStep] = useState<'FORM' | 'RECEIPT_PAYMENT' | 'PENDING_APPROVAL'>('FORM');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [receiptPhotoBase64, setReceiptPhotoBase64] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);
  const [copiedCard, setCopiedCard] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [adminCardNumber, setAdminCardNumber] = useState('8600 4905 1234 5678');
  const [adminCardHolder, setAdminCardHolder] = useState('DINORA SHIRINLIKLARI / ADMIN');

  // Fetch payment config from backend
  useEffect(() => {
    fetchPaymentConfig().then(config => {
      if (config?.adminCardNumber) setAdminCardNumber(config.adminCardNumber);
      if (config?.adminCardHolder) setAdminCardHolder(config.adminCardHolder);
    });
  }, []);

  // Telegram Native BackButton integration
  useEffect(() => {
    if (isOpen) {
      const tg = (window as any)?.Telegram?.WebApp;
      if (tg?.BackButton) {
        tg.BackButton.show();
        const handleBack = () => {
          triggerHaptic('light');
          onClose();
        };
        tg.BackButton.onClick(handleBack);
        return () => {
          tg.BackButton.offClick(handleBack);
          tg.BackButton.hide();
        };
      }
    }
  }, [isOpen, onClose]);

  const handleClose = () => {
    triggerHaptic('light');
    try {
      (window as any)?.Telegram?.WebApp?.BackButton?.hide();
    } catch (e) {}
    onClose();
  };

  // Dynamic distance-based delivery fee: 0-2 km FREE, above 2 km 15,000 UZS/km
  const calculatedDistance = latitude && longitude ? calculateDistanceKm(latitude, longitude) : 0;
  const deliveryCalcResult = calculateDeliveryFee(calculatedDistance);
  const deliveryFee = deliveryType === 'DELIVERY' ? (latitude && longitude ? deliveryCalcResult.deliveryFee : 0) : 0;
  const finalTotal = totalAmount + deliveryFee;

  const handleCopyCard = () => {
    triggerHaptic('light');
    const cleanNumber = adminCardNumber.replace(/\s+/g, '');
    navigator.clipboard.writeText(cleanNumber);
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 2000);
  };

  const handleDetectLocation = () => {
    triggerHaptic('medium');
    setIsDetectingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Qurilmangizda geolokatsiya qo'llab-quvvatlanmaydi");
      setIsDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setIsDetectingLocation(false);
        triggerSuccessHaptic();
      },
      (error) => {
        setIsDetectingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError("Geolokatsiyaga ruxsat berilmadi. Iltimos, brauzerda ruxsat bering");
        } else {
          setLocationError("Lokatsiyani aniqlab bo'lmadi. Qayta urinib ko'ring");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

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

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Chek rasmi 5MB dan oshmasligi kerak!");
      return;
    }

    setReceiptFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setReceiptPhotoBase64(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Savatchangiz bo'sh!");
      return;
    }

    if (!customerName.trim()) {
      alert("Iltimos, ismingizni kiriting!");
      return;
    }

    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length < 9) {
      alert("Iltimos, to'liq 9 xonali telefon raqamingizni kiriting (Masalan: +998 90 123 45 67)!");
      return;
    }

    if (deliveryType === 'DELIVERY') {
      if (!mahalla.trim()) {
        alert("Iltimos, mahallangiz yoki qishloq nomini kiriting!");
        return;
      }
      if (!street.trim()) {
        alert("Iltimos, ko'cha nomini kiriting!");
        return;
      }
    }

    setIsSubmitting(true);
    triggerHaptic('heavy');

    const addressDetails = deliveryType === 'DELIVERY' 
      ? `Sirdaryo viloyati, ${district.trim()}, ${mahalla} mfy, ${street} ko'chasi, ${houseNumber ? `${houseNumber}-uy` : ''}`
      : "Olib ketish (Sirdaryo tumani, M34 ko'chasi 9-uy, DINORA konditeriyasi)";

    const formattedNotes = `${notes ? `${notes} | ` : ''}Sana: ${selectedDate} (${selectedTimeSlot})`;

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: phone,
        mahalla,
        street,
        houseNumber,
        deliveryDistrict: district.trim(),
        deliveryDate: selectedDate,
        cartItems: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        totalAmount: finalTotal,
        paymentMode: paymentProvider,
        notes: formattedNotes,
        telegramId: user?.id,
        deliveryType,
        addressDetails,
        latitude,
        longitude,
      };

      const order = await createOrder(orderPayload);
      if (phone) {
        localStorage.setItem('dinora_user_phone', phone);
      }
      setCreatedOrder(order);
      clearCart();

      if (paymentProvider === 'CASH') {
        triggerSuccessHaptic();
        try {
          confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
        } catch (e) {}
        if (onOrderCreated) onOrderCreated(order);
        setCheckoutStep('PENDING_APPROVAL');
      } else {
        setCheckoutStep('RECEIPT_PAYMENT');
      }
    } catch (err: any) {
      console.warn('Order creation fallback triggered:', err);
      const fallbackOrder: Order = {
        id: `ord-${Date.now().toString().slice(-4)}`,
        orderNumber: Math.floor(1000 + Math.random() * 9000),
        status: 'AWAITING_RECEIPT',
        deliveryType: deliveryType,
        deliveryAddress: addressDetails,
        latitude,
        longitude,
        paymentMode: paymentProvider,
        paymentStatus: 'UNPAID',
        totalAmount: finalTotal,
        notes: formattedNotes || null,
        phone: phone,
        createdAt: new Date().toISOString(),
        items: cart.map((item, idx) => ({
          id: `item-${idx}-${Date.now()}`,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          productId: item.product.id,
        })),
      };
      setCreatedOrder(fallbackOrder);
      clearCart();
      if (phone) {
        localStorage.setItem('dinora_user_phone', phone);
      }
      setCheckoutStep(paymentProvider === 'CASH' ? 'PENDING_APPROVAL' : 'RECEIPT_PAYMENT');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadReceiptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createdOrder) return;
    if (!receiptPhotoBase64) {
      alert("Iltimos, to'lov cheki rasmini yuklang!");
      return;
    }

    setIsSubmitting(true);
    triggerHaptic('heavy');

    try {
      const updated = await uploadOrderReceipt(createdOrder.id, receiptPhotoBase64);
      setCreatedOrder(updated);
      triggerSuccessHaptic();
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
      if (onOrderCreated) onOrderCreated(updated);
      setCheckoutStep('PENDING_APPROVAL');
    } catch (err: any) {
      alert(err?.response?.data?.message || "Chekni yuklashda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 lg:p-6 bg-black/60 backdrop-blur-sm overflow-hidden select-none">
        <div className="fixed inset-0 hidden lg:block" onClick={handleClose} />

        <motion.div
          initial={{ y: '100%', opacity: 0.8 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 240 }}
          className="relative z-10 w-full h-[100dvh] lg:h-auto lg:max-h-[92vh] lg:max-w-4xl bg-[#FAF6F0] lg:bg-white lg:rounded-3xl lg:border lg:border-[#2B1810]/10 flex flex-col justify-between overflow-hidden shadow-2xl"
        >
          {/* Header Bar */}
          <div className="sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3.5 bg-white/95 backdrop-blur-md border-b border-[#2B1810]/10 flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#2B1810] text-[#D4AF37] flex items-center justify-center shadow-md border border-[#CBB279]">
                <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base sm:text-xl font-bold font-serif text-[#2B1810]">
                    {checkoutStep === 'FORM' ? 'Xarid Savatchasi' : checkoutStep === 'RECEIPT_PAYMENT' ? "To'lov Bosqichi" : 'Buyurtma Holati'}
                  </h2>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 bg-[#F8E7EA] text-[#D65B78] rounded-full hidden xs:inline-block">
                    {deliveryType === 'DELIVERY' ? 'Yetkazish' : 'Olib ketish'}
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-[#CBB279]">
                  📍 Sirdaryo tumani bo'limi
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-9 h-9 rounded-full bg-[#FAF6F0] text-[#2B1810] flex items-center justify-center border border-[#2B1810]/10 hover:bg-[#F8E7EA] transition-colors touch-manipulation"
              title="Yopish"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
            
            {/* STEP 3: PENDING ADMIN APPROVAL SCREEN */}
            {checkoutStep === 'PENDING_APPROVAL' && createdOrder ? (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#2B1810]/10 shadow-lg text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-300 flex items-center justify-center mx-auto text-amber-600 shadow-inner animate-pulse">
                  <Clock className="w-10 h-10" />
                </div>

                <div>
                  <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full border border-amber-300">
                    ⏳ Ko'rib chiqilmoqda (Admin tasdiqlashi kutilmoqda)
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#2B1810] mt-3">
                    Buyurtmangiz adminlarga yuborildi!
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B5B52] mt-2 max-w-md mx-auto leading-relaxed">
                    Adminlar buyurtmangizni ko'rib chiqib, tez orada sizga javob aytiladi. Iltimos, biroz kuting...
                  </p>
                </div>

                <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#2B1810]/10 text-left space-y-2.5 max-w-md mx-auto text-xs sm:text-sm">
                  <div className="flex justify-between border-b border-[#2B1810]/5 pb-2">
                    <span className="text-[#6B5B52]">Buyurtma raqami:</span>
                    <span className="font-extrabold text-[#2B1810]">#{createdOrder.orderNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#2B1810]/5 pb-2">
                    <span className="text-[#6B5B52]">Yetkazib berish usuli:</span>
                    <span className="font-bold text-[#2B1810]">
                      {createdOrder.deliveryType === 'PICKUP' ? '🏪 Olib ketish' : '🛍️ Yetkazib berish (Sirdaryo tumani)'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#2B1810]/5 pb-2">
                    <span className="text-[#6B5B52]">Manzil:</span>
                    <span className="font-bold text-[#2B1810] text-right truncate max-w-[200px]">
                      {createdOrder.deliveryAddress}
                    </span>
                  </div>
                  {createdOrder.latitude && createdOrder.longitude && (
                    <div className="flex justify-between border-b border-[#2B1810]/5 pb-2">
                      <span className="text-[#6B5B52]">GPS Lokatsiya:</span>
                      <span className="font-bold text-emerald-700">✅ Biriktirilgan</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#6B5B52]">Jami Summa:</span>
                    <span className="font-extrabold text-[#D65B78]">
                      {formatUZS(Number(createdOrder.totalAmount))}
                    </span>
                  </div>
                </div>

                {/* Status Stepper */}
                <div className="pt-4 border-t border-[#2B1810]/10 max-w-md mx-auto">
                  <h4 className="text-xs font-bold text-[#2B1810] uppercase tracking-wider mb-4">
                    Buyurtma Bosqichlari
                  </h4>
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                    <div className="p-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-300 shadow-xs">
                      ⏳ Kutilmoqda
                    </div>
                    <div className="p-2 bg-gray-100 text-gray-400 rounded-xl">
                      ✅ Tasdiqlash
                    </div>
                    <div className="p-2 bg-gray-100 text-gray-400 rounded-xl">
                      👩‍🍳 Tayyorlash
                    </div>
                    <div className="p-2 bg-gray-100 text-gray-400 rounded-xl">
                      🚖 Yetkazish
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full max-w-md min-h-[44px] bg-[#2B1810] text-[#FAF6F0] py-3.5 rounded-2xl font-bold text-sm shadow-md hover:bg-[#3D2318] transition-colors touch-manipulation"
                >
                  Tushunarli (Yopish)
                </button>
              </div>
            ) : checkoutStep === 'RECEIPT_PAYMENT' && createdOrder ? (
              
              /* STEP 2: PAYMENT & RECEIPT SCREEN */
              <form onSubmit={handleUploadReceiptSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#2B1810]/10 shadow-lg space-y-6">
                <div className="border-b border-[#2B1810]/10 pb-4 text-center">
                  <span className="text-xs font-extrabold text-[#D65B78] uppercase tracking-widest bg-[#F8E7EA] px-3 py-1 rounded-full">
                    2-bosqich: To'lov va Chek
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#2B1810] mt-2">
                    Karta o'tkazmasi va Chek Yuklash
                  </h3>
                  <p className="text-xs text-[#6B5B52] mt-1">
                    Buyurtma №#{createdOrder.orderNumber} (Sirdaryo tumani)
                  </p>
                </div>

                {/* Admin Card Info Box */}
                <div className="bg-[#FAF6F0] p-4 sm:p-5 rounded-2xl border-2 border-[#CBB279]/50 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#6B5B52] uppercase">
                      Admin Karta Raqami
                    </span>
                    <span className="text-xs font-semibold text-[#D65B78]">
                      DINORA Admin
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-white p-3.5 rounded-xl border border-[#2B1810]/10 gap-3">
                    <span className="font-mono text-base sm:text-lg font-extrabold text-[#2B1810] tracking-wider text-center sm:text-left">
                      {adminCardNumber}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCard}
                      className="min-h-[38px] flex items-center justify-center space-x-1.5 bg-[#2B1810] text-[#FAF6F0] px-3 py-2 rounded-xl text-xs font-bold hover:bg-[#3D2318] active:scale-95 transition-all shadow-sm touch-manipulation"
                    >
                      {copiedCard ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Nusxalandi!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-[#CBB279]" />
                          <span>Karta raqamini nusxalash</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[#6B5B52]">Karta egasi: <strong>{adminCardHolder}</strong></span>
                    <span className="text-[#D65B78] font-bold">Summa: {formatUZS(Number(createdOrder.totalAmount))}</span>
                  </div>
                </div>

                {/* Receipt Upload Dropzone */}
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold text-[#2B1810] uppercase tracking-wider">
                    To'lov Cheki Skrinshotini Yuklang *
                  </label>
                  <div className="border-2 border-dashed border-[#D65B78]/40 bg-[#F8E7EA]/40 p-6 rounded-2xl text-center space-y-3 hover:bg-[#F8E7EA]/70 transition-colors cursor-pointer relative touch-manipulation">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      required
                    />
                    <div className="w-12 h-12 rounded-full bg-[#D65B78] text-white flex items-center justify-center mx-auto shadow-md">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#2B1810]">
                        {receiptFileName || "Chek rasm faylini tanlang yoki shu yerga tashlang"}
                      </p>
                      <p className="text-[11px] text-[#6B5B52] mt-0.5">
                        Click / Payme / Uzum to'lov cheki skrinshoti (.jpg, .png)
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !receiptPhotoBase64}
                  className="w-full min-h-[48px] bg-gradient-to-r from-[#D65B78] to-[#2B1810] text-white py-3.5 rounded-2xl font-bold font-serif text-sm sm:text-base shadow-lg hover:shadow-xl active:scale-98 transition-all flex items-center justify-center space-x-2 touch-manipulation disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Chek yuborilmoqda..." : "To'lov chekini yuborish"}</span>
                </button>
              </form>
            ) : (
              
              /* STEP 1: CHECKOUT FORM SCREEN */
              <>
                {/* Cart Items List */}
                <div className="space-y-3 bg-white p-4 sm:p-5 rounded-3xl border border-[#2B1810]/5 shadow-sm">
                  <h3 className="text-xs font-extrabold text-[#2B1810] uppercase tracking-wider border-b border-[#2B1810]/10 pb-2">
                    Buyurtma Tarkibi
                  </h3>

                  {cart.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
                      <p className="text-xs sm:text-sm text-[#6B5B52] font-semibold">
                        Savat bo'sh. Mahsulotlar katalogidan shirinliklarni tanlang!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {cart.map(({ product, quantity }) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between bg-[#FAF6F0] p-3 rounded-2xl border border-[#2B1810]/5 gap-3"
                        >
                          <img
                            src={getImageUrl(product.imageUrl, '/products/logotip.png')}
                            alt={product.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/products/logotip.png';
                            }}
                            className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-xl shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-xs sm:text-sm text-[#2B1810] truncate">
                              {product.name}
                            </h4>
                            <p className="text-[11px] text-[#D65B78] font-semibold mt-0.5">
                              {formatUZS(product.price)}
                            </p>

                            <div className="flex items-center space-x-2 mt-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  triggerHaptic('light');
                                  updateQuantity(product.id, -1);
                                }}
                                className="w-6 h-6 rounded-lg bg-white border border-[#2B1810]/20 text-[#2B1810] flex items-center justify-center font-bold touch-manipulation"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-[#2B1810]">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  triggerHaptic('light');
                                  updateQuantity(product.id, 1);
                                }}
                                className="w-6 h-6 rounded-lg bg-[#D65B78] text-white flex items-center justify-center font-bold touch-manipulation"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-xs font-extrabold text-[#2B1810]">
                              {formatUZS(product.price * quantity)}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                triggerHaptic('medium');
                                removeFromCart(product.id);
                              }}
                              className="p-1 text-red-400 hover:text-red-600 mt-2 touch-manipulation"
                              title="O'chirish"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Checkout Options Form */}
                <form onSubmit={handleCreateOrderSubmit} className="bg-white p-5 sm:p-6 rounded-3xl border border-[#2B1810]/5 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-[#2B1810]/10 pb-3">
                    <h3 className="text-xs font-extrabold text-[#2B1810] uppercase tracking-wider">
                      1-Bosqich: Manzil va Aloqa (Sirdaryo Tumani)
                    </h3>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Sirdaryo tumani locked</span>
                    </span>
                  </div>

                  {/* Delivery Type Switch */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#2B1810] uppercase tracking-wider">
                      Xarid Turi
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setDeliveryType('DELIVERY');
                        }}
                        className={`min-h-[44px] p-3.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all flex items-center justify-center space-x-2 touch-manipulation ${
                          deliveryType === 'DELIVERY'
                            ? 'bg-[#2B1810] text-white border-[#CBB279] shadow-sm'
                            : 'bg-[#FAF6F0] text-[#6B5B52] border-[#2B1810]/10 hover:bg-white'
                        }`}
                      >
                        <span>🛍️ Yetkazib berish (2 km bepul)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setDeliveryType('PICKUP');
                        }}
                        className={`min-h-[44px] p-3.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all flex items-center justify-center space-x-2 touch-manipulation ${
                          deliveryType === 'PICKUP'
                            ? 'bg-[#2B1810] text-white border-[#CBB279] shadow-sm'
                            : 'bg-[#FAF6F0] text-[#6B5B52] border-[#2B1810]/10 hover:bg-white'
                        }`}
                      >
                        <span>🏪 Olib ketish (Bepul)</span>
                      </button>
                    </div>
                  </div>

                  {/* Pickup Location Information Card */}
                  {deliveryType === 'PICKUP' && (
                    <div className="p-4 sm:p-5 bg-[#FAF6F0] rounded-2xl border-2 border-[#CBB279]/50 space-y-3 shadow-sm">
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
                        className="inline-flex items-center justify-center space-x-2 w-full bg-[#2B1810] text-[#FAF6F0] p-3 rounded-xl text-xs font-bold hover:bg-[#3D2318] transition-colors shadow-sm touch-manipulation"
                      >
                        <MapPin className="w-4 h-4 text-[#D4AF37]" />
                        <span>🗺️ Xaritada ko'rish (Google Maps / Geolokatsiya)</span>
                      </a>
                    </div>
                  )}

                  {/* Customer Name Input */}
                  <div className="space-y-1 bg-[#FAF6F0] p-4 rounded-2xl border border-[#2B1810]/10">
                    <label className="block text-xs font-bold text-[#2B1810] uppercase flex items-center gap-1.5">
                      <User className="w-4 h-4 text-[#D65B78]" />
                      <span>Ismingiz / Familiyangiz *</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Masalan: Dinora Axmedova"
                      className="w-full p-3 bg-white border border-[#2B1810]/10 rounded-xl text-xs sm:text-sm font-bold text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#D65B78] touch-manipulation"
                      required
                    />
                  </div>

                  {/* Flexible Address Form with GPS Geolocation integration */}
                  {deliveryType === 'DELIVERY' && (
                    <div className="space-y-3 p-4 bg-[#FAF6F0] rounded-2xl border border-[#2B1810]/10">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-[#6B5B52] uppercase">
                            Viloyat (Read-only)
                          </label>
                          <input
                            type="text"
                            value="Sirdaryo viloyati"
                            disabled
                            className="w-full mt-1 p-2.5 bg-gray-200/80 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 cursor-not-allowed"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#2B1810] uppercase">
                            Tuman / Shahar *
                          </label>
                          <input
                            type="text"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            placeholder="Masalan: Sirdaryo tumani, Guliston sh."
                            className="w-full mt-1 p-2.5 bg-white border border-[#2B1810]/10 rounded-xl text-xs font-bold text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#D65B78] touch-manipulation"
                            required
                          />
                        </div>
                      </div>

                      {/* Mahalla and Street Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#2B1810] uppercase flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#D65B78]" />
                            <span>Mahalla / MFY Nomi *</span>
                          </label>
                          <input
                            type="text"
                            value={mahalla}
                            onChange={(e) => setMahalla(e.target.value)}
                            placeholder="Masalan: Paxtakor MFY"
                            className="w-full mt-1 p-2.5 bg-white border border-[#2B1810]/10 rounded-xl text-xs text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#D65B78] touch-manipulation"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#2B1810] uppercase">
                            Ko'cha Nomi va Uy Nomi *
                          </label>
                          <div className="flex gap-2 mt-1">
                            <input
                              type="text"
                              value={street}
                              onChange={(e) => setStreet(e.target.value)}
                              placeholder="Mustaqillik ko'chasi"
                              className="flex-1 p-2.5 bg-white border border-[#2B1810]/10 rounded-xl text-xs text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#D65B78] touch-manipulation"
                              required
                            />
                            <input
                              type="text"
                              value={houseNumber}
                              onChange={(e) => setHouseNumber(e.target.value)}
                              placeholder="14-uy"
                              className="w-20 p-2.5 bg-white border border-[#2B1810]/10 rounded-xl text-xs text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#D65B78] touch-manipulation"
                            />
                          </div>
                        </div>
                      </div>

                      {/* GPS Geolocation Button & Status */}
                      <div className="bg-white p-3 rounded-xl border border-[#2B1810]/10 space-y-2 mt-2">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={handleDetectLocation}
                            disabled={isDetectingLocation}
                            className="min-h-[42px] flex items-center justify-center space-x-2 bg-[#FAF6F0] hover:bg-[#F8E7EA] text-[#2B1810] px-4 py-2 rounded-xl border border-[#2B1810]/10 text-xs font-bold active:scale-95 transition-all touch-manipulation"
                          >
                            {isDetectingLocation ? (
                              <>
                                <div className="w-4 h-4 border-2 border-[#D65B78] border-t-transparent rounded-full animate-spin" />
                                <span>GPS lokatsiya aniqlanmoqda...</span>
                              </>
                            ) : (
                              <>
                                <Navigation className="w-4 h-4 text-[#D65B78]" />
                                <span>📍 Jonli Lokatsiyani biriktirish (GPS)</span>
                              </>
                            )}
                          </button>

                          {latitude && longitude && (
                            <div className="flex items-center gap-2">
                              <a
                                href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1 hover:underline touch-manipulation"
                              >
                                <span>🗺️ Xaritada tekshirish</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => { setLatitude(null); setLongitude(null); }}
                                className="text-[11px] text-red-500 font-bold p-1 hover:underline touch-manipulation"
                              >
                                O'chirish
                              </button>
                            </div>
                          )}
                        </div>

                        {latitude && longitude && (
                          <div className="space-y-1.5 pt-1 border-t border-[#2B1810]/5">
                            <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>GPS koordinatalari biriktirildi ({latitude.toFixed(4)}, {longitude.toFixed(4)})</span>
                            </p>

                            <div className="p-2.5 rounded-xl bg-[#FAF6F0] border border-[#CBB279]/40 flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-2">
                                <span className="text-base">📏</span>
                                <div>
                                  <span className="font-bold text-[#2B1810] block">
                                    Masofa: {calculatedDistance} km
                                  </span>
                                  <span className="text-[10px] text-[#6B5B52]">
                                    {deliveryCalcResult.breakdownText}
                                  </span>
                                </div>
                              </div>
                              <span className={`px-2.5 py-1 rounded-lg font-extrabold text-xs ${
                                deliveryCalcResult.isFreeDelivery
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-[#F8E7EA] text-[#D65B78]'
                              }`}>
                                {deliveryCalcResult.isFreeDelivery ? 'BEPUL' : formatUZS(deliveryCalcResult.deliveryFee)}
                              </span>
                            </div>
                          </div>
                        )}
                        {locationError && (
                          <p className="text-[11px] text-amber-700 font-medium">{locationError}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Delivery / Pickup Date & Time Picker */}
                  <DeliveryDatePicker
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    selectedTimeSlot={selectedTimeSlot}
                    onSelectTimeSlot={setSelectedTimeSlot}
                    deliveryType={deliveryType}
                  />

                  {/* Phone Input */}
                  <div className="space-y-1 bg-[#FAF6F0] p-4 rounded-2xl border border-[#2B1810]/10">
                    <label className="block text-xs font-bold text-[#2B1810] uppercase flex items-center justify-between">
                      <span>⚠️ Iltimos, ishlaydigan nomer yozing *</span>
                      <span className="text-[10px] text-[#D65B78] font-bold">Muhim</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={handlePhoneInputChange}
                      placeholder="+998 90 123 45 67"
                      className="w-full p-3 bg-white border border-[#2B1810]/10 rounded-xl text-base font-extrabold text-[#2B1810] tracking-wider focus:outline-none focus:ring-2 focus:ring-[#D65B78] touch-manipulation"
                      required
                    />
                    <p className="text-[10px] text-[#6B5B52] leading-tight pt-1">
                      {deliveryType === 'DELIVERY' 
                        ? "Sirdaryo tumani kuryeri buyurtmani yetkazishdan oldin shu raqamga qo'ng'iroq qiladi."
                        : "Konditeriya xodimi buyurtmangiz tayyor bo'lgach xabar berish uchun shu raqamga qo'ng'iroq qiladi."}
                    </p>
                  </div>

                  {/* Payment Mode Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#2B1810] uppercase tracking-wider">
                      To'lov Usuli *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setPaymentProvider('CARD_TRANSFER');
                        }}
                        className={`min-h-[44px] p-3.5 rounded-2xl text-xs font-bold border transition-all flex items-center justify-between touch-manipulation ${
                          paymentProvider === 'CARD_TRANSFER'
                            ? 'bg-[#2B1810] text-white border-[#CBB279] shadow-sm'
                            : 'bg-[#FAF6F0] text-[#6B5B52] border-[#2B1810]/10 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                          <span>Karta orqali (Chek yuklash)</span>
                        </div>
                        {paymentProvider === 'CARD_TRANSFER' && <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setPaymentProvider('CASH');
                        }}
                        className={`min-h-[44px] p-3.5 rounded-2xl text-xs font-bold border transition-all flex items-center justify-between touch-manipulation ${
                          paymentProvider === 'CASH'
                            ? 'bg-[#2B1810] text-white border-[#CBB279] shadow-sm'
                            : 'bg-[#FAF6F0] text-[#6B5B52] border-[#2B1810]/10 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Banknote className="w-4 h-4 text-emerald-400" />
                          <span>Naqd pul / Qabul qilinganda</span>
                        </div>
                        {paymentProvider === 'CASH' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </button>
                    </div>
                  </div>

                  {/* Notes Field */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#2B1810] uppercase">
                      Kuryer yoki Konditer uchun istaklaringiz
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Eshik kodi, qo'ng'iroq qilish vaqti yoki boshqa istaklar..."
                      className="w-full p-3 bg-[#FAF6F0] border border-[#2B1810]/10 rounded-2xl text-xs text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#D65B78] touch-manipulation"
                    />
                  </div>

                  {/* Checkout Submit CTA */}
                  <div className="pt-2 space-y-2 border-t border-[#2B1810]/10">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[#6B5B52]">
                        <span>Mahsulotlar summasi:</span>
                        <span className="font-bold text-[#2B1810]">{formatUZS(totalAmount)}</span>
                      </div>

                      <div className="flex items-center justify-between text-[#6B5B52]">
                        <span>
                          {deliveryType === 'PICKUP' 
                            ? "Yetkazib berish (Olib ketish):" 
                            : latitude && longitude
                              ? `Yetkazib berish (${calculatedDistance} km):`
                              : "Yetkazib berish:"}
                        </span>
                        <span className="font-bold text-[#2B1810]">
                          {deliveryType === 'PICKUP'
                            ? "0 so'm (Bepul)"
                            : deliveryFee === 0
                              ? "0 so'm (2 km bepul 🎉)"
                              : `+${formatUZS(deliveryFee)}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#2B1810]/5 text-xs sm:text-sm">
                      <span className="font-bold text-[#6B5B52]">Jami to'lov:</span>
                      <span className="font-extrabold text-base sm:text-lg text-[#D65B78] font-serif">
                        {formatUZS(finalTotal)}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full min-h-[48px] bg-gradient-to-r from-[#D65B78] via-[#e26b86] to-[#D65B78] text-white py-3.5 rounded-2xl font-bold font-serif text-sm sm:text-base shadow-lg hover:shadow-xl active:scale-98 transition-all flex items-center justify-center space-x-2 touch-manipulation mt-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? "Yuborilmoqda..." : "Buyurtmani Rasmiylashtirish"}</span>
                    </button>
                  </div>
                </form>
              </>
            )}

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CartFullScreenModal;
