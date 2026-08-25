import React, { useState, useEffect, useCallback } from 'react';
import { fetchUserOrders, rateOrder } from '../../services/api';
import type { Order, OrderStatus } from '../../types';
import { formatUZS, formatDate } from '../../utils/formatters';
import { triggerHaptic, triggerSuccessHaptic } from '../../utils/haptics';
import {
  X,
  Search,
  Clock,
  CheckCircle2,
  Truck,
  ChefHat,
  Package,
  AlertCircle,
  ShoppingBag,
  MapPin,
  Sparkles,
  RefreshCw,
  Phone,
  ChevronDown,
  Navigation,
  Star,
  Send,
  MessageSquareHeart,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { getImageUrl } from '../../utils/imageUrl';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StatusStepConfig {
  status: OrderStatus;
  label: string;
  shortLabel: string;
  description: string;
  pickupDescription?: string;
  icon: any;
  activeColor: string;
  activeBg: string;
  borderColor: string;
}

const STATUS_STEPS: StatusStepConfig[] = [
  {
    status: 'PENDING_APPROVAL',
    label: "Ko'rib chiqilmoqda",
    shortLabel: 'Kutilmoqda',
    description: "Buyurtmangiz adminlarga yuborildi. Adminlar ko'rib chiqib, tez orada sizga javob aytiladi.",
    pickupDescription: "Buyurtmangiz adminlarga yuborildi. Adminlar ko'rib chiqib, tez orada sizga javob aytiladi.",
    icon: Clock,
    activeColor: 'text-amber-800',
    activeBg: 'bg-amber-50',
    borderColor: 'border-amber-300',
  },
  {
    status: 'APPROVED',
    label: 'Tasdiqlandi',
    shortLabel: 'Tasdiq',
    description: "Buyurtma admin tomonidan tasdiqlandi va qabul qilindi",
    icon: CheckCircle2,
    activeColor: 'text-blue-700',
    activeBg: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    status: 'PREPARING',
    label: 'Tayyorlanmoqda',
    shortLabel: 'Oshpaz',
    description: "Konditerimiz shirinlikni mehr bilan tayyorlamoqda",
    pickupDescription: "Konditerimiz shirinlikni tayyorlamoqda. Tez orada olib ketishga tayyor bo'ladi",
    icon: ChefHat,
    activeColor: 'text-[#D65B78]',
    activeBg: 'bg-[#F8E7EA]',
    borderColor: 'border-[#D65B78]/30',
  },
  {
    status: 'DELIVERING',
    label: 'Yetkazilmoqda',
    shortLabel: "Yo'lda",
    description: "Buyurtma maxsus sovutgichli qadoqda yetkazilmoqda",
    pickupDescription: "Buyurtma qadoqlandi va topshirishga tayyor holatga keltirildi",
    icon: Truck,
    activeColor: 'text-purple-700',
    activeBg: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    status: 'COMPLETED',
    label: 'Bajarildi',
    shortLabel: 'Tayyor',
    description: "Buyurtma muvaffaqiyatli topshirildi. Yoqimli ishtaha!",
    pickupDescription: "Olib ketishingiz mumkin hurmatli mijoz! Shirinligingiz tayyor bo'ldi.",
    icon: Package,
    activeColor: 'text-emerald-700',
    activeBg: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
];

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ isOpen, onClose }) => {
  const [phoneQuery, setPhoneQuery] = useState(() => {
    return localStorage.getItem('dinora_user_phone') || '';
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSearchForm, setShowSearchForm] = useState(false);

  // Star Rating Dialog State
  const [ratingTargetOrder, setRatingTargetOrder] = useState<Order | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);

  // Accordion Expand/Collapse State for completed & rated orders
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const toggleOrderExpand = (orderId: string) => {
    triggerHaptic('light');
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const loadOrders = useCallback(async (phone?: string, isSilent = false) => {
    const query = phone !== undefined ? phone : phoneQuery;
    
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const data = await fetchUserOrders(query.trim());
      setOrders(data || []);
      setHasSearched(true);
    } catch (e) {
      // Ignore
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [phoneQuery]);

  // Auto-search and instant display on modal open
  useEffect(() => {
    if (isOpen) {
      loadOrders(phoneQuery.trim());
    }
  }, [isOpen]);

  // Real-time live polling every 3 seconds when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      loadOrders(phoneQuery.trim(), true);
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, phoneQuery, loadOrders]);

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericOnly = e.target.value.replace(/[^0-9+]/g, '');
    setPhoneQuery(numericOnly);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneQuery.trim()) return;

    triggerHaptic('medium');
    localStorage.setItem('dinora_user_phone', phoneQuery.trim());
    await loadOrders(phoneQuery.trim());
  };

  const handleOpenRating = (order: Order) => {
    triggerHaptic('medium');
    setRatingTargetOrder(order);
    setSelectedRating(5);
    setHoverRating(0);
    setReviewText('');
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingTargetOrder) return;

    setIsSubmittingRating(true);
    triggerHaptic('heavy');

    try {
      const updated = await rateOrder(ratingTargetOrder.id, selectedRating, reviewText.trim());
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      triggerSuccessHaptic();
      try {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}
      setRatingTargetOrder(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Bahoni saqlashda xatolik yuz berdi');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'AWAITING_RECEIPT':
      case 'RECEIPT_SUBMITTED':
      case 'PENDING_APPROVAL':
        return 0;
      case 'APPROVED':
        return 1;
      case 'PREPARING':
        return 2;
      case 'DELIVERING':
        return 3;
      case 'COMPLETED':
        return 4;
      default:
        return 0;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto select-none">
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl border border-[#2B1810]/10 my-auto flex flex-col"
        >
          {/* Header Bar */}
          <div className="sticky top-0 z-20 px-5 sm:px-8 py-4 bg-white/95 backdrop-blur-md border-b border-[#2B1810]/10 flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#2B1810] text-[#D4AF37] flex items-center justify-center shadow-sm border border-[#CBB279]">
                <Clock className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base sm:text-xl font-serif font-bold text-[#2B1810]">
                    Buyurtmalarni Jonli Kuzatish
                  </h2>
                  {isRefreshing && (
                    <RefreshCw className="w-3.5 h-3.5 text-[#D65B78] animate-spin" />
                  )}
                </div>
                <p className="text-[11px] text-[#6B5B52]">
                  Bot va Admin paneldagi yangilanishlar real vaqtda ko'rinadi
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#FAF6F0] text-[#2B1810] flex items-center justify-center hover:bg-[#F8E7EA] transition-colors touch-manipulation"
              title="Yopish"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5">
            
            {/* Quick Actions / Phone Switcher Toggle */}
            <div className="bg-[#FAF6F0] p-3.5 sm:p-4 rounded-2xl border border-[#2B1810]/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-[#D65B78]" />
                  <span className="text-xs font-bold text-[#2B1810]">
                    {phoneQuery ? `Raqam: ${phoneQuery}` : "Faol buyurtmalaringiz"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSearchForm((prev) => !prev)}
                  className="text-xs font-extrabold text-[#D65B78] hover:underline flex items-center space-x-1 touch-manipulation"
                >
                  <span>{showSearchForm ? "Yashirish" : "📱 Raqamni o'zgartirish"}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSearchForm ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Optional Phone Input Form */}
              {(showSearchForm || orders.length === 0) && (
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-[#2B1810]/10">
                  <input
                    type="tel"
                    inputMode="tel"
                    value={phoneQuery}
                    onChange={handlePhoneChange}
                    placeholder="+998 90 123 45 67"
                    className="flex-1 min-h-[44px] p-3 bg-white border border-[#2B1810]/10 rounded-xl text-xs sm:text-sm text-[#2B1810] font-bold focus:outline-none focus:ring-2 focus:ring-[#D65B78] touch-manipulation"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="min-h-[44px] bg-[#2B1810] text-[#FAF6F0] px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md flex items-center justify-center space-x-1.5 border border-[#CBB279] active:scale-95 transition-all touch-manipulation shrink-0"
                  >
                    <Search className="w-4 h-4 text-[#D65B78]" />
                    <span>{isLoading ? 'Qidirilmoqda...' : 'Kuzatish'}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Orders Timeline Results */}
            <div className="space-y-5">
              {isLoading && orders.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-8 h-8 border-3 border-[#D65B78] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-[#6B5B52]">Buyurtmalar yuklanmoqda...</p>
                </div>
              ) : orders.length === 0 ? (
                hasSearched && (
                  <div className="text-center py-10 bg-[#FAF6F0] rounded-3xl border border-[#2B1810]/10 p-6 space-y-2">
                    <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                    <h3 className="font-serif font-bold text-sm text-[#2B1810]">
                      Aktiv buyurtma topilmadi
                    </h3>
                    <p className="text-xs text-[#6B5B52] max-w-sm mx-auto">
                      {phoneQuery
                        ? `Kiritilgan ${phoneQuery} telefon raqami bo'yicha buyurtma mavjud emas.`
                        : "Hozircha sizda faol buyurtmalar mavjud emas. Menyudan shirinlik tanlab buyurtma bering!"}
                    </p>
                  </div>
                )
              ) : (
                orders.map((order) => {
                  const isPickup = order.deliveryType === 'PICKUP';
                  const isCompleted = order.status === 'COMPLETED';
                  const isDelivering = order.status === 'DELIVERING';
                  const isUnderReview =
                    order.status === 'PENDING_APPROVAL' ||
                    order.status === 'AWAITING_RECEIPT' ||
                    order.status === 'RECEIPT_SUBMITTED';
                  const isRated = Boolean(order.rating);
                  const isCompletedAndRated = isCompleted && isRated;
                  const isExpanded = expandedOrders[order.id] !== undefined 
                    ? expandedOrders[order.id] 
                    : !isCompletedAndRated; // Completed and rated orders start collapsed by default
                  const currentIdx = getStepIndex(order.status);
                  const activeStepConfig = STATUS_STEPS[currentIdx] || STATUS_STEPS[0];
                  const ActiveIcon = activeStepConfig.icon;

                  // 1. COMPACT COLLAPSED CARD (For Completed & Rated orders when not expanded)
                  if (isCompletedAndRated && !isExpanded) {
                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-3xl border border-[#2B1810]/10 shadow-sm p-4 sm:p-5 hover:border-[#CBB279] transition-all space-y-3.5"
                      >
                        {/* Compact Top Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2B1810]/5 pb-2.5">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs sm:text-sm font-extrabold text-[#D65B78] uppercase tracking-wider font-serif">
                              Buyurtma #{order.orderNumber}
                            </span>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              isPickup
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}>
                              {isPickup ? '🏪 Olib ketish' : '🛍️ Yetkazish'}
                            </span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                              ✅ Bajarildi
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-sm sm:text-base font-extrabold text-[#2B1810] font-serif">
                              {formatUZS(order.totalAmount)}
                            </span>
                          </div>
                        </div>

                        {/* Compact Items & Rating Summary */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-[#6B5B52]">
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <img
                              src={getImageUrl((order.items[0] as any)?.imageUrl || (order.items[0] as any)?.product?.imageUrl)}
                              alt="Mahsulot"
                              className="w-10 h-10 object-cover rounded-xl border border-[#2B1810]/10 shrink-0 bg-[#FAF6F0] shadow-xs"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-cake.png';
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-1.5 font-bold text-[#2B1810] truncate">
                                <span className="truncate">
                                  {order.items.map((i) => `${i.productName} (${i.quantity}x)`).join(', ')}
                                </span>
                              </div>
                              <span className="text-[11px] text-[#6B5B52] block mt-0.5">
                                Vaqti: {formatDate(order.createdAt)}
                              </span>
                            </div>
                          </div>

                          {/* Star Rating Badge */}
                          <div className="flex items-center space-x-2 shrink-0 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 self-start sm:self-center">
                            <div className="flex items-center text-amber-500">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    star <= (order.rating || 5)
                                      ? 'fill-amber-400 text-amber-500'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[11px] font-extrabold text-amber-900">
                              {order.rating}/5 baho ❤️
                            </span>
                          </div>
                        </div>

                        {/* Batafsil Ko'rish Action Button */}
                        <div className="pt-2 border-t border-[#2B1810]/5 flex items-center justify-between">
                          <span className="text-[11px] text-[#6B5B52] italic">
                            Buyurtma muvaffaqiyatli yakunlangan
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleOrderExpand(order.id)}
                            className="inline-flex items-center space-x-1.5 bg-[#FAF6F0] hover:bg-[#F8E7EA] text-[#2B1810] hover:text-[#D65B78] text-xs font-bold px-3.5 py-1.5 rounded-xl border border-[#2B1810]/10 transition-all active:scale-95 touch-manipulation shadow-xs"
                          >
                            <span>Batafsil ko'rish</span>
                            <ChevronDown className="w-3.5 h-3.5 text-[#D65B78]" />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // 2. FULL EXPANDED VIEW
                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl border border-[#2B1810]/10 shadow-sm p-4 sm:p-6 space-y-5"
                    >
                      {/* 1. Order Meta Header */}
                      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#2B1810]/10 pb-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs sm:text-sm font-extrabold text-[#D65B78] uppercase tracking-wider font-serif">
                              Buyurtma #{order.orderNumber}
                            </span>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              isPickup
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}>
                              {isPickup ? '🏪 Olib ketish' : '🛍️ Yetkazish'}
                            </span>
                            {isCompleted && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                                ✅ Bajarildi
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#6B5B52] block">
                            Vaqti: {formatDate(order.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <span className="text-[10px] text-[#6B5B52] block uppercase font-medium">Jami Summa</span>
                            <span className="text-sm sm:text-base font-extrabold text-[#2B1810] font-serif">
                              {formatUZS(order.totalAmount)}
                            </span>
                          </div>

                          {/* Collapse button for completed & rated orders */}
                          {isCompletedAndRated && (
                            <button
                              type="button"
                              onClick={() => toggleOrderExpand(order.id)}
                              className="inline-flex items-center space-x-1 bg-[#FAF6F0] hover:bg-[#F8E7EA] text-[#2B1810] text-xs font-bold px-2.5 py-1 rounded-xl border border-[#2B1810]/10 transition-all active:scale-95 touch-manipulation"
                              title="Qisqartirish"
                            >
                              <span className="hidden xs:inline">Qisqartirish</span>
                              <ChevronDown className="w-3.5 h-3.5 text-[#D65B78] rotate-180" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 2. SPECIAL CALLOUT BANNER: UNDER REVIEW vs DELIVERING vs COMPLETED */}
                      {isUnderReview ? (
                        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border-2 border-amber-400 p-4 sm:p-5 rounded-2xl flex items-start space-x-3.5 shadow-sm">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md animate-pulse">
                            <Clock className="w-6 h-6 sm:w-7 sm:h-7" />
                          </div>
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="bg-amber-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                ⏳ Ko'rib chiqilmoqda
                              </span>
                            </div>
                            
                            <h4 className="font-serif font-extrabold text-sm sm:text-base text-amber-950 leading-snug">
                              Buyurtmangiz adminlarga yuborildi!
                            </h4>

                            <p className="text-xs text-amber-900 leading-relaxed font-medium">
                              Adminlar buyurtmangizni ko'rib chiqib, tez orada sizga javob aytiladi. Iltimos, biroz kuting...
                            </p>
                          </div>
                        </div>
                      ) : isDelivering ? (
                        <div className="bg-gradient-to-r from-purple-500/10 via-purple-500/20 to-purple-500/10 border-2 border-purple-400 p-4 sm:p-5 rounded-2xl flex items-start space-x-3.5 shadow-sm">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md animate-bounce">
                            <Truck className="w-6 h-6 sm:w-7 sm:h-7" />
                          </div>
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="bg-purple-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                🚖 Yo'lda (Yetkazilmoqda)
                              </span>
                            </div>
                            
                            <h4 className="font-serif font-extrabold text-sm sm:text-base text-purple-950 leading-snug">
                              Kuryerimiz buyurtmangizni olib yo'lga chiqdi!
                            </h4>

                            <p className="text-xs text-purple-900 leading-relaxed font-medium">
                              Shirinligingiz tez orada eshigingizga yetib boradi. Qabul qilib olgach, pastdagi tugmani bosing va baholang:
                            </p>
                          </div>
                        </div>
                      ) : isCompleted ? (
                        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/20 to-emerald-500/10 border-2 border-emerald-500 p-4 sm:p-5 rounded-2xl flex items-start space-x-3.5 shadow-sm">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                            <Package className="w-6 h-6 sm:w-7 sm:h-7" />
                          </div>
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                ✅ Tayyor bo'ldi
                              </span>
                              <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                            </div>
                            
                            <h4 className="font-serif font-extrabold text-sm sm:text-base text-emerald-950 leading-snug">
                              {isPickup
                                ? "Olib ketishingiz mumkin hurmatli mijoz! 🍰"
                                : "Buyurtmangiz yetkazildi va topshirildi! 🎉"}
                            </h4>

                            <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                              {isPickup
                                ? "Hurmatli mijoz, shirinligingiz qandolatxonamizda tayyor holatda sizni kutmoqda. Istalgan vaqtda kelib olib ketishingiz mumkin."
                                : "Hurmatli mijoz, buyurtmangiz muvaffaqiyatli topshirildi. DINORA shirinliklarini tanlaganingiz uchun tashakkur! Yoqimli ishtaha!"}
                            </p>

                            {isPickup && (
                              <div className="pt-1.5 flex items-center space-x-1.5 text-xs text-emerald-950 font-bold border-t border-emerald-200 mt-2">
                                <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                                <span>Manzil: Sirdaryo tumani, M34 ko'chasi 9-uy (DINORA Shirinliklari)</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null}

                      {/* 3. Visual Stepper Progress Bar */}
                      <div className="bg-[#FAF6F0] p-4 sm:p-5 rounded-2xl border border-[#2B1810]/5 space-y-4">
                        <div className="relative flex items-center justify-between px-2 sm:px-4">
                          <div className="absolute top-1/2 left-4 right-4 h-1.5 bg-gray-200 -translate-y-1/2 rounded-full z-0" />
                          
                          <div
                            className="absolute top-1/2 left-4 h-1.5 bg-gradient-to-r from-[#2B1810] via-[#D65B78] to-emerald-600 -translate-y-1/2 rounded-full z-0 transition-all duration-500"
                            style={{
                              width: `${(currentIdx / (STATUS_STEPS.length - 1)) * 100}%`,
                            }}
                          />

                          {/* 5 Milestone Step Circles */}
                          {STATUS_STEPS.map((step, idx) => {
                            const Icon = step.icon;
                            const isDone = idx < currentIdx;
                            const isCurrent = idx === currentIdx;

                            return (
                              <div key={step.status} className="relative z-10 flex flex-col items-center">
                                <div
                                  className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 ${
                                    isCurrent
                                      ? step.status === 'COMPLETED'
                                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 scale-110 shadow-md animate-bounce'
                                        : 'bg-[#D65B78] text-white ring-4 ring-[#F8E7EA] scale-110 shadow-md animate-pulse'
                                      : isDone
                                      ? 'bg-[#2B1810] text-[#D4AF37]'
                                      : 'bg-white text-gray-300 border border-gray-200'
                                  }`}
                                  title={step.label}
                                >
                                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>

                                <span
                                  className={`hidden sm:block text-[10px] lg:text-[11px] mt-2 font-bold text-center leading-tight whitespace-nowrap ${
                                    isCurrent
                                      ? step.status === 'COMPLETED'
                                        ? 'text-emerald-700 font-extrabold'
                                        : 'text-[#D65B78] font-extrabold'
                                      : isDone
                                      ? 'text-[#2B1810]'
                                      : 'text-gray-400'
                                  }`}
                                >
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Active Status Highlight Card */}
                        {!isCompleted && !isUnderReview && !isDelivering && (
                          <div className={`p-3.5 rounded-xl border flex items-center space-x-3 transition-all ${activeStepConfig.activeBg} ${activeStepConfig.borderColor}`}>
                            <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0 ${activeStepConfig.activeColor}`}>
                              <ActiveIcon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-1.5">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B5B52]">
                                  Hozirgi holat:
                                </span>
                                <strong className={`text-xs font-extrabold ${activeStepConfig.activeColor}`}>
                                  {activeStepConfig.label}
                                </strong>
                              </div>
                              <p className="text-[11px] text-[#6B5B52] truncate mt-0.5">
                                {isPickup && activeStepConfig.pickupDescription
                                  ? activeStepConfig.pickupDescription
                                  : activeStepConfig.description}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 4. RECEIPT CONFIRMATION / STAR RATING SECTION */}
                      {!order.rating ? (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => handleOpenRating(order)}
                            className="w-full min-h-[48px] bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-700 hover:to-emerald-700 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-2xl shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center space-x-2 touch-manipulation border border-emerald-400"
                          >
                            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                            <span>✅ Buyurtmani qo'lga oldim (Yulduzcha bilan baholash)</span>
                          </button>
                        </div>
                      ) : (
                        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center text-amber-500">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= (order.rating || 5)
                                      ? 'fill-amber-400 text-amber-500'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-bold text-amber-950">
                              Siz {order.rating} yulduz bilan baholadingiz
                            </span>
                          </div>
                          {order.review && (
                            <p className="text-[11px] text-amber-900 italic">
                              "{order.review}"
                            </p>
                          )}
                          <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full shrink-0">
                            Baho qabul qilindi ❤️
                          </span>
                        </div>
                      )}

                      {/* 5. Order Items & Delivery Address Details */}
                      <div className="bg-[#FAF6F0]/60 p-3.5 sm:p-4 rounded-2xl border border-[#2B1810]/5 space-y-2">
                        <div className="flex items-center justify-between border-b border-[#2B1810]/5 pb-2">
                          <span className="font-bold text-xs text-[#2B1810] flex items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5 text-[#D65B78]" />
                            <span>Buyurtma tarkibi ({order.items.length} ta mahsulot):</span>
                          </span>
                        </div>

                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-xs text-[#6B5B52] bg-white p-2 rounded-xl border border-[#2B1810]/5">
                              <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                                <img
                                  src={getImageUrl((item as any).imageUrl || (item as any).product?.imageUrl)}
                                  alt={item.productName}
                                  className="w-9 h-9 object-cover rounded-lg border border-[#2B1810]/10 shrink-0 bg-[#FAF6F0]"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder-cake.png';
                                  }}
                                />
                                <div className="min-w-0">
                                  <span className="font-bold text-[#2B1810] block truncate">
                                    {item.productName}
                                  </span>
                                  <span className="text-[10px] text-[#6B5B52]">
                                    {item.quantity} dona × {formatUZS(item.price)}
                                  </span>
                                </div>
                              </div>
                              <span className="font-extrabold text-[#2B1810] whitespace-nowrap shrink-0">
                                {formatUZS(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {order.deliveryAddress && !isPickup && (
                          <div className="pt-2 border-t border-[#2B1810]/5 flex items-start justify-between gap-2 text-[11px] text-[#6B5B52]">
                            <div className="flex items-start space-x-1.5 truncate">
                              <MapPin className="w-3.5 h-3.5 text-[#D65B78] shrink-0 mt-0.5" />
                              <span className="truncate"><strong>Yetkazish manzili:</strong> {order.deliveryAddress}</span>
                            </div>
                            {order.latitude && order.longitude && (
                              <a
                                href={`https://www.google.com/maps?q=${order.latitude},${order.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hover:underline shrink-0 flex items-center gap-1"
                              >
                                <Navigation className="w-3 h-3 text-emerald-600" />
                                <span>GPS</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Interactive Star Rating Dialog Modal */}
          {ratingTargetOrder && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#2B1810]/10 space-y-5 text-center relative"
              >
                <button
                  type="button"
                  onClick={() => setRatingTargetOrder(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF6F0] text-[#2B1810] flex items-center justify-center hover:bg-[#F8E7EA] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-300 flex items-center justify-center mx-auto text-amber-500 shadow-inner">
                  <MessageSquareHeart className="w-8 h-8 text-amber-500" />
                </div>

                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#D65B78] bg-[#F8E7EA] px-3 py-1 rounded-full">
                    Buyurtma #{ratingTargetOrder.orderNumber}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold font-serif text-[#2B1810] mt-2">
                    Shirinlik va Xizmatni Baholang!
                  </h3>
                  <p className="text-xs text-[#6B5B52] mt-1">
                    Sizning fikringiz biz uchun juda muhim. Shirinligimiz sizga yoqdimi?
                  </p>
                </div>

                {/* 5 Interactive Golden Stars */}
                <div className="flex items-center justify-center space-x-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= (hoverRating || selectedRating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setSelectedRating(star);
                        }}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-amber-400 hover:scale-125 active:scale-95 transition-transform touch-manipulation"
                      >
                        <Star
                          className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                            isFilled
                              ? 'fill-amber-400 text-amber-500 drop-shadow-md'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="text-xs font-extrabold text-amber-700">
                  {selectedRating === 5 && '⭐⭐⭐⭐⭐ Ajoyib! Juda mazali!'}
                  {selectedRating === 4 && '⭐⭐⭐⭐ Yaxshi, yoqdi!'}
                  {selectedRating === 3 && "⭐⭐⭐ O'rtacha, yaxshiroq bo'lishi mumkin"}
                  {selectedRating === 2 && '⭐⭐ Qoniqarsiz'}
                  {selectedRating === 1 && '⭐ Yomon'}
                </div>

                {/* Review Textarea */}
                <form onSubmit={handleSubmitRating} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-bold text-[#2B1810] uppercase mb-1">
                      Fikr-mulohazangiz (Ixtiyoriy)
                    </label>
                    <textarea
                      rows={3}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Shirinlik ta'mi, yetkazib berish tezligi yoki kuryer haqida fikringiz..."
                      className="w-full p-3 bg-[#FAF6F0] border border-[#2B1810]/10 rounded-2xl text-xs text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#D65B78] touch-manipulation"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRatingTargetOrder(null)}
                      className="flex-1 min-h-[44px] bg-[#FAF6F0] text-[#2B1810] font-bold text-xs rounded-xl hover:bg-gray-200 transition-colors touch-manipulation"
                    >
                      Bekor qilish
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingRating}
                      className="flex-1 min-h-[44px] bg-gradient-to-r from-[#D65B78] to-[#2B1810] text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center space-x-1.5 touch-manipulation"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingRating ? 'Yuborilmoqda...' : 'Bahoni yuborish'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OrderTrackingModal;
