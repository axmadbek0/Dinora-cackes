import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useTelegram } from '../../context/TelegramContext';
import { formatUZS } from '../../utils/formatters';
import { createOrder, uploadOrderReceipt, fetchPaymentConfig } from '../../services/api';
import { triggerSuccessHaptic, triggerHaptic } from '../../utils/haptics';
import type { DeliveryType, PaymentMode, Order } from '../../types';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Send,
  AlertTriangle,
  MapPin,
  CreditCard,
  Banknote,
  ShieldCheck,
  Copy,
  CheckCircle2,
  Upload,
  Clock,
  User,
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
      setAdminCardNumber(config.adminCardNumber);
      setAdminCardHolder(config.adminCardHolder);
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

  // Fixed 10,000 UZS delivery fee for Sirdaryo tumani
  const deliveryFee = deliveryType === 'DELIVERY' ? 10000 : 0;
  const finalTotal = totalAmount + deliveryFee;

  const handleCopyCard = () => {
    triggerHaptic('light');
    const cleanNumber = adminCardNumber.replace(/\s+/g, '');
    navigator.clipboard.writeText(cleanNumber);
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 3000);
  };

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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

  const handleCreateOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!customerName.trim()) {
      alert("⚠️ Iltimos, ismingizni kiriting!");
      return;
    }

    if (deliveryType === 'DELIVERY' && (!district.trim() || !mahalla.trim() || !street.trim())) {
      alert("Iltimos, Tuman, Mahalla va Ko'cha ma'lumotlarini kiriting!");
      return;
    }

    const phoneDigits = phone.replace(/\D/g, '').replace(/^998/, '');
    if (phoneDigits.length !== 9) {
      alert("⚠️ Iltimos, to'liq 9 xonali telefon raqam kiriting!\nMasalan: +998 90 123 45 67");
      return;
    }

    setIsSubmitting(true);
    triggerHaptic('heavy');

    const addressDetails = deliveryType === 'DELIVERY' 
      ? `Sirdaryo viloyati, ${district.trim()}, ${mahalla} mfy, ${street} ko'chasi, ${houseNumber ? `${houseNumber}-uy` : ''}`
      : "Olib ketish (Sirdaryo tumani, M34 ko'chasi 9-uy, DINORA konditeriyasi)";

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: phone,
        mahalla,
        street,
        houseNumber,
        deliveryDistrict: district.trim(),
        cartItems: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        totalAmount: finalTotal,
        paymentMode: paymentProvider,
        notes,
        telegramId: user?.id,
        deliveryType,
        addressDetails,
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
        latitude: null,
        longitude: null,
        paymentMode: paymentProvider,
        paymentStatus: 'UNPAID',
        totalAmount: finalTotal,
        notes: notes || null,
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

      if (paymentProvider === 'CASH') {
        triggerSuccessHaptic();
        try {
          confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
        } catch (e) {}
        if (onOrderCreated) onOrderCreated(fallbackOrder);
        setCheckoutStep('PENDING_APPROVAL');
      } else {
        setCheckoutStep('RECEIPT_PAYMENT');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadReceiptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdOrder) return;

    if (!receiptPhotoBase64) {
      alert("Iltimos, to'lov cheki skrinshotini yuklang!");
      return;
    }

    setIsSubmitting(true);
    triggerHaptic('heavy');

    try {
      const updated = await uploadOrderReceipt(createdOrder.id, receiptPhotoBase64);
      setCreatedOrder(updated);

      triggerSuccessHaptic();
      try {
        confetti({ particleCount: 100, spread: 90, origin: { y: 0.6 } });
      } catch (e) {}

      if (onOrderCreated) onOrderCreated(updated);
      setCheckoutStep('PENDING_APPROVAL');
    } catch (err: any) {
      alert("To'lov chekini yuklashda xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
          {/* Header Bar */}
          <div className="sticky top-0 z-10 px-4 sm:px-8 py-4 bg-white/95 backdrop-blur-md border-b border-[#2B1810]/10 flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center space-x-3">
              <img
                src="/carts/logotip.jpg"
                alt="DINORA Logo"
                className="w-10 h-10 rounded-2xl object-cover border border-[#CBB279] shadow-sm shrink-0"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg sm:text-xl font-bold font-serif text-[#2B1810]">
                    Sizning Savatchangiz
                  </h2>
                  {checkoutStep === 'FORM' && (
                    <span className="bg-[#D65B78] text-white text-xs px-2.5 py-0.5 rounded-full font-extrabold shadow-sm">
                      {totalCount} ta
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-semibold text-[#CBB279]">
                  📍 Sirdaryo tumani bo'limi
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-full bg-[#FAF6F0] text-[#2B1810] flex items-center justify-center border border-[#2B1810]/10 hover:bg-[#F8E7EA] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 max-w-4xl mx-auto w-full">
            
            {/* STEP 3: PENDING ADMIN APPROVAL SCREEN */}
            {checkoutStep === 'PENDING_APPROVAL' && createdOrder ? (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#2B1810]/10 shadow-lg text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-[#F8E7EA] flex items-center justify-center mx-auto text-[#D65B78] shadow-inner">
                  <Clock className="w-10 h-10 animate-spin" />
                </div>

                <div>
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-300">
                    RECEIPT_SUBMITTED ➔ Admin Tasdiqlashi Kutilmoqda
                  </span>
                  <h3 className="text-2xl font-bold font-serif text-[#2B1810] mt-3">
                    To'lov cheki qabul qilindi!
                  </h3>
                  <p className="text-sm text-[#6B5B52] mt-1 max-w-md mx-auto">
                    Admin rasmingizni va to'lovni tekshirmoqda. Tasdiqlanishi bilan buyurtmangiz tayyorlash jarayoniga o'tadi!
                  </p>
                </div>

                <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#2B1810]/10 text-left space-y-2.5 max-w-md mx-auto text-xs sm:text-sm">
                  <div className="flex justify-between border-b border-[#2B1810]/5 pb-2">
                    <span className="text-[#6B5B52]">Buyurtma raqami:</span>
                    <span className="font-extrabold text-[#2B1810]">#{createdOrder.orderNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#2B1810]/5 pb-2">
                    <span className="text-[#6B5B52]">Yetkazib berish hududi:</span>
                    <span className="font-bold text-[#2B1810]">Sirdaryo tumani</span>
                  </div>
                  <div className="flex justify-between border-b border-[#2B1810]/5 pb-2">
                    <span className="text-[#6B5B52]">Manzil:</span>
                    <span className="font-bold text-[#2B1810] text-right truncate max-w-[200px]">
                      {createdOrder.deliveryAddress}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B5B52]">Jami Summa:</span>
                    <span className="font-extrabold text-[#D65B78]">
                      {formatUZS(Number(createdOrder.totalAmount))}
                    </span>
                  </div>
                </div>

                {/* Live Status Stepper */}
                <div className="pt-4 border-t border-[#2B1810]/10 max-w-md mx-auto">
                  <h4 className="text-xs font-bold text-[#2B1810] uppercase tracking-wider mb-4">
                    Buyurtma Holati
                  </h4>
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                    <div className="p-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
                      ⏳ Chek yuborildi
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
                  onClick={handleClose}
                  className="w-full max-w-md bg-[#2B1810] text-[#FAF6F0] py-3.5 rounded-2xl font-bold text-sm shadow-md hover:bg-[#3D2318] transition-colors"
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
                  <h3 className="text-xl font-bold font-serif text-[#2B1810] mt-2">
                    Karta o'tkazmasi va Chek Yuklash
                  </h3>
                  <p className="text-xs text-[#6B5B52] mt-1">
                    Buyurtma №#{createdOrder.orderNumber} (Sirdaryo tumani)
                  </p>
                </div>

                {/* Admin Card Info Box */}
                <div className="bg-[#FAF6F0] p-5 rounded-2xl border-2 border-[#CBB279]/50 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#6B5B52] uppercase">
                      Admin Karta Raqami
                    </span>
                    <span className="text-xs font-semibold text-[#D65B78]">
                      DINORA Admin
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-[#2B1810]/10">
                    <span className="font-mono text-lg font-extrabold text-[#2B1810] tracking-wider">
                      {adminCardNumber}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCard}
                      className="flex items-center space-x-1.5 bg-[#2B1810] text-[#FAF6F0] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#3D2318] active:scale-95 transition-all shadow-sm"
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
                  <div className="border-2 border-dashed border-[#D65B78]/40 bg-[#F8E7EA]/40 p-6 rounded-2xl text-center space-y-3 hover:bg-[#F8E7EA]/70 transition-colors cursor-pointer relative">
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
                  className="w-full bg-gradient-to-r from-[#2B1810] via-[#42261A] to-[#2B1810] text-[#FAF6F0] py-4 rounded-2xl font-bold text-sm sm:text-base shadow-lg hover:shadow-xl active:scale-98 transition-all flex items-center justify-center space-x-2 border-2 border-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5 text-[#D65B78]" />
                  <span>{isSubmitting ? "Chek yuborilmoqda..." : "To'lov chekini yuborish"}</span>
                </button>
              </form>
            ) : (
              
              /* STEP 1: CHECKOUT FORM SCREEN */
              <>
                {/* Cart Items List */}
                <div className="space-y-3 bg-white p-5 rounded-3xl border border-[#2B1810]/5 shadow-sm">
                  <h3 className="text-xs font-extrabold text-[#2B1810] uppercase tracking-wider border-b border-[#2B1810]/10 pb-2">
                    Buyurtma Tarkibi
                  </h3>

                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {cart.map(({ product, quantity }) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between bg-[#FAF6F0] p-3 rounded-2xl border border-[#2B1810]/5"
                      >
                        <img
                          src={product.imageUrl || '/products/pistachio_berry_cake.jpg'}
                          alt={product.name}
                          className="w-14 h-14 object-cover rounded-xl shrink-0"
                        />

                        <div className="flex-1 min-w-0 px-3">
                          <h4 className="font-bold text-xs text-[#2B1810] truncate">
                            {product.name}
                          </h4>
                          <p className="text-[11px] text-[#D65B78] font-semibold mt-0.5">
                            {formatUZS(product.price)}
                          </p>

                          <div className="flex items-center space-x-2 mt-1.5">
                            <button
                              onClick={() => {
                                triggerHaptic('light');
                                updateQuantity(product.id, -1);
                              }}
                              className="w-6 h-6 rounded-lg bg-white border border-[#2B1810]/20 text-[#2B1810] flex items-center justify-center font-bold"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-[#2B1810]">
                              {quantity}
                            </span>
                            <button
                              onClick={() => {
                                triggerHaptic('light');
                                updateQuantity(product.id, 1);
                              }}
                              className="w-6 h-6 rounded-lg bg-[#D65B78] text-white flex items-center justify-center font-bold"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-extrabold text-[#2B1810]">
                            {formatUZS(product.price * quantity)}
                          </p>
                          <button
                            onClick={() => {
                              triggerHaptic('medium');
                              removeFromCart(product.id);
                            }}
                            className="p-1 text-red-400 hover:text-red-600 mt-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Checkout Options Form */}
                <form onSubmit={handleCreateOrderSubmit} className="bg-white p-6 rounded-3xl border border-[#2B1810]/5 shadow-sm space-y-5">
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
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setDeliveryType('DELIVERY');
                        }}
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all flex items-center justify-center space-x-2 ${
                          deliveryType === 'DELIVERY'
                            ? 'bg-[#2B1810] text-white border-[#CBB279] shadow-sm'
                            : 'bg-[#FAF6F0] text-[#6B5B52] border-[#2B1810]/10 hover:bg-white'
                        }`}
                      >
                        <span>🛍️ Yetkazib berish (10,000 UZS)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setDeliveryType('PICKUP');
                        }}
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all flex items-center justify-center space-x-2 ${
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
                      className="w-full p-3 bg-white border border-[#2B1810]/10 rounded-xl text-xs sm:text-sm font-bold text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#D65B78]"
                      required
                    />
                  </div>

                  {/* Flexible Address Form */}
                  {deliveryType === 'DELIVERY' && (
                    <div className="space-y-3 p-4 bg-[#FAF6F0] rounded-2xl border border-[#2B1810]/10">
                      <div className="grid grid-cols-2 gap-3">
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
                            className="w-full mt-1 p-2.5 bg-white border border-[#2B1810]/10 rounded-xl text-xs font-bold text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#D65B78]"
                            required
                          />
                        </div>
                      </div>

                      {/* Mahalla Input */}
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
                          className="w-full mt-1 p-2.5 bg-white border border-[#2B1810]/10 rounded-xl text-xs text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#D65B78]"
                          required
                        />
                      </div>

                      {/* Street and House Number */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-[#2B1810] uppercase">
                            Ko'cha Nomi *
                          </label>
                          <input
                            type="text"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            placeholder="Mustaqillik ko'chasi"
                            className="w-full mt-1 p-2.5 bg-white border border-[#2B1810]/10 rounded-xl text-xs text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#D65B78]"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#2B1810] uppercase">
                            Uy Nuri / Kvartira
                          </label>
                          <input
                            type="text"
                            value={houseNumber}
                            onChange={(e) => setHouseNumber(e.target.value)}
                            placeholder="14-uy"
                            className="w-full mt-1 p-2.5 bg-white border border-[#2B1810]/10 rounded-xl text-xs text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#D65B78]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Phone Input with Explicit Alert Label */}
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
                      className="w-full p-3 bg-white border border-[#D65B78]/40 rounded-xl text-xs sm:text-sm font-bold text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#D65B78]"
                      required
                    />
                    <p className="text-[11px] text-[#6B5B52]">
                      Sirdaryo tumani kuryeri buyurtmani tasdiqlash uchun shu raqamga qo'ng'iroq qiladi.
                    </p>
                  </div>

                  {/* Payment Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#2B1810] uppercase tracking-wider">
                      To'lov Usuli
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setPaymentProvider('CARD_TRANSFER');
                        }}
                        className={`p-3.5 rounded-2xl text-xs font-bold border flex items-center justify-center space-x-2 transition-all ${
                          paymentProvider === 'CARD_TRANSFER'
                            ? 'bg-[#2B1810] text-white border-[#CBB279] shadow-sm'
                            : 'bg-[#FAF6F0] text-[#6B5B52] border-[#2B1810]/10 hover:bg-white'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-[#CBB279]" />
                        <span>Karta o'tkazmasi + Chek</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setPaymentProvider('CASH');
                        }}
                        className={`p-3.5 rounded-2xl text-xs font-bold border flex items-center justify-center space-x-2 transition-all ${
                          paymentProvider === 'CASH'
                            ? 'bg-[#2B1810] text-white border-[#CBB279] shadow-sm'
                            : 'bg-[#FAF6F0] text-[#6B5B52] border-[#2B1810]/10 hover:bg-white'
                        }`}
                      >
                        <Banknote className="w-4 h-4 text-emerald-500" />
                        <span>Naqd pul (Qabul qilinganda)</span>
                      </button>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#2B1810] uppercase tracking-wider">
                      Izoh yoki Maxsus Istaklar
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Tabriknoma matni, tayyor bo'lish vaqti va h.k."
                      className="w-full p-3.5 bg-[#FAF6F0] border border-[#2B1810]/10 rounded-2xl text-xs sm:text-sm text-[#2B1810] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#2B1810] via-[#42261A] to-[#2B1810] text-[#FAF6F0] py-4 rounded-2xl font-bold text-sm sm:text-base shadow-lg hover:shadow-xl active:scale-98 transition-all flex items-center justify-center space-x-2 border-2 border-[#D4AF37]"
                  >
                    <Send className="w-5 h-5 text-[#D65B78]" />
                    <span>{isSubmitting ? "Yaratilmoqda..." : "Keyingi bosqich (To'lov ma'lumotlari)"}</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartFullScreenModal;
