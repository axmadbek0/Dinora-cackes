import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useTelegram } from '../../context/TelegramContext';
import { formatUZS } from '../../utils/formatters';
import { createOrder } from '../../services/api';
import { triggerSuccessHaptic, triggerHaptic } from '../../utils/haptics';
import { getImageUrl } from '../../utils/imageUrl';
import type { DeliveryType, PaymentMode } from '../../types';
import { X, Plus, Minus, Trash2, ShoppingBag, Send, AlertTriangle, MapPin, CreditCard, Banknote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: any) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onOrderCreated }) => {
  const { cart, updateQuantity, removeFromCart, clearCart, totalAmount } = useCart();
  const { user } = useTelegram();

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('DELIVERY');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phone, setPhone] = useState(user?.username ? `@${user.username}` : '+998 ');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CARD_TRANSFER');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (deliveryType === 'DELIVERY' && !deliveryAddress.trim()) {
      alert("Iltimos, yetkazib berish manzilini kiriting!");
      return;
    }

    if (!phone || phone.trim().length < 7) {
      alert("Iltimos, ishlaydigan aloqa telefon raqamini kiriting!");
      return;
    }

    setIsSubmitting(true);
    triggerHaptic('heavy');

    try {
      const orderPayload: any = {
        customerName: 'Storefront Mijoz',
        customerPhone: phone,
        phone,
        deliveryType,
        deliveryAddress: deliveryType === 'DELIVERY' ? deliveryAddress : "Olib ketish (Sirdaryo tumani, M34 ko'chasi 9-uy)",
        paymentMode,
        notes,
        totalAmount,
        telegramId: user?.id,
        cartItems: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        items: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
      };

      const created = await createOrder(orderPayload);

      triggerSuccessHaptic();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      clearCart();
      onOrderCreated(created);
      onClose();
    } catch (err) {
      alert("Buyurtma berishda xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={onClose} />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#2B1810]/10 flex items-center justify-between bg-[#FAF6F0]">
              <div className="flex items-center space-x-2.5">
                <img
                  src="/logatip.jpg"
                  alt="DINORA Logo"
                  className="w-7 h-7 rounded-full object-cover border border-[#CBB279] shadow-sm shrink-0"
                />
                <h2 className="text-lg font-bold font-serif text-[#2B1810]">
                  Sizning Savatingiz
                </h2>
                <span className="bg-[#D65B78] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {cart.reduce((s, i) => s + i.quantity, 0)} ta
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white text-[#2B1810] flex items-center justify-center shadow-sm hover:bg-[#F8E7EA] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items Scroll Container */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-[#FAF6F0] flex items-center justify-center mx-auto text-[#CBB279]">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-[#2B1810]">Savatingiz bo'sh</h3>
                  <p className="text-xs text-[#6B5B52] max-w-xs mx-auto">
                    Katalogimizdan mazali shirinlik va tortlarni tanlab savatga qo'shing.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-2 bg-[#2B1810] text-[#FAF6F0] px-5 py-2.5 rounded-2xl text-xs font-bold shadow-sm"
                  >
                    Katalogga qaytish
                  </button>
                </div>
              ) : (
                cart.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex items-center space-x-3 bg-[#FAF6F0] p-3 rounded-2xl border border-[#2B1810]/5 shadow-sm"
                  >
                    <img
                      src={getImageUrl(product.imageUrl, '/products/logotip.png')}
                      alt={product.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/products/logotip.png';
                      }}
                      className="w-16 h-16 object-cover rounded-xl shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-[#2B1810] truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs font-extrabold text-[#D65B78] mt-0.5">
                        {formatUZS(product.price)}
                      </p>

                      {/* Quantity Pickers */}
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => updateQuantity(product.id, -1)}
                          className="w-6 h-6 rounded-lg bg-white text-[#2B1810] flex items-center justify-center font-bold text-xs shadow-sm border border-[#2B1810]/10"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-[#2B1810]">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, 1)}
                          className="w-6 h-6 rounded-lg bg-[#D65B78] text-white flex items-center justify-center font-bold text-xs shadow-sm"
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
                        onClick={() => removeFromCart(product.id)}
                        className="text-red-400 hover:text-red-600 p-1 mt-1"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}

              {/* Checkout Input Form */}
              {cart.length > 0 && (
                <form onSubmit={handleCheckout} className="pt-4 border-t border-[#2B1810]/10 space-y-4">
                  
                  {/* Order Type Toggle */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#2B1810] uppercase tracking-wider">
                      1. Xarid Turi
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setDeliveryType('DELIVERY');
                        }}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                          deliveryType === 'DELIVERY'
                            ? 'bg-[#2B1810] text-white border-[#CBB279]'
                            : 'bg-gray-50 text-[#6B5B52] border-gray-200'
                        }`}
                      >
                        🛍️ Yetkazib berish (2 km bepul)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setDeliveryType('PICKUP');
                        }}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                          deliveryType === 'PICKUP'
                            ? 'bg-[#2B1810] text-white border-[#CBB279]'
                            : 'bg-gray-50 text-[#6B5B52] border-gray-200'
                        }`}
                      >
                        🏪 Olib ketish (Bepul)
                      </button>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {deliveryType === 'DELIVERY' && (
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-[#2B1810] uppercase tracking-wider flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-[#D65B78]" />
                        <span>Yetkazib Berish Manzili *</span>
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Toshkent sh., Yunusobod 14, 23-uy..."
                        className="w-full p-2.5 bg-[#FAF6F0] border border-[#2B1810]/10 rounded-xl text-xs text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#D65B78]"
                        required
                      />
                    </div>
                  )}

                  {/* Phone Number Field */}
                  <div className="space-y-1 bg-[#F8E7EA] p-3 rounded-xl border border-[#D65B78]/30">
                    <label className="block text-[11px] font-extrabold text-[#D65B78] flex items-center space-x-1 uppercase tracking-wider">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>⚠️ Iltimos, ishlaydigan nomer yozing *</span>
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+998 90 123 45 67"
                      className="w-full mt-1 p-2 bg-white border border-[#D65B78]/40 rounded-lg text-xs font-bold text-[#2B1810] focus:outline-none"
                      required
                    />
                  </div>

                  {/* Payment Mode Selection */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#2B1810] uppercase tracking-wider">
                      To'lov Usuli
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setPaymentMode('CARD_TRANSFER');
                        }}
                        className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-center space-x-1 transition-all ${
                          paymentMode === 'CARD_TRANSFER'
                            ? 'bg-[#2B1810] text-white border-[#CBB279]'
                            : 'bg-gray-50 text-[#6B5B52] border-gray-200'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5 text-[#CBB279]" />
                        <span>Karta o'tkazma</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setPaymentMode('CASH');
                        }}
                        className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-center space-x-1 transition-all ${
                          paymentMode === 'CASH'
                            ? 'bg-[#2B1810] text-white border-[#CBB279]'
                            : 'bg-gray-50 text-[#6B5B52] border-gray-200'
                        }`}
                      >
                        <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Naqd to'lov</span>
                      </button>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#2B1810] uppercase tracking-wider">
                      Izoh yoki Istaklar
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Tabriknoma yozish, soat nechida va h.k."
                      className="w-full p-2.5 bg-[#FAF6F0] border border-[#2B1810]/10 rounded-xl text-xs text-[#2B1810] focus:outline-none"
                    />
                  </div>

                </form>
              )}
            </div>

            {/* Drawer Footer & Checkout Button */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-[#2B1810]/10 bg-[#FAF6F0] space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B5B52] font-medium">Jami Summa:</span>
                  <span className="text-xl font-extrabold text-[#D65B78]">
                    {formatUZS(totalAmount)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#2B1810] via-[#42261A] to-[#2B1810] text-[#FAF6F0] py-3.5 rounded-2xl font-bold text-sm shadow-dinora-glow hover:shadow-lg active:scale-98 transition-all flex items-center justify-center space-x-2 border border-[#D4AF37]"
                >
                  <Send className="w-4 h-4 text-[#D65B78]" />
                  <span>{isSubmitting ? 'Rasmiylashtirilmoqda...' : 'Buyurtmani Tasdiqlash'}</span>
                </button>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
