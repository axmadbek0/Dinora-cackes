import React, { useState } from 'react';
import { fetchUserOrders } from '../../services/api';
import type { Order, OrderStatus } from '../../types';
import { formatUZS, formatDate } from '../../utils/formatters';
import { X, Search, Clock, CheckCircle2, Truck, ChefHat, Package, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_STEPS: { status: OrderStatus; label: string; icon: any }[] = [
  { status: 'PENDING_APPROVAL', label: 'Qabul qilindi', icon: Clock },
  { status: 'APPROVED', label: 'Tasdiqlandi', icon: CheckCircle2 },
  { status: 'PREPARING', label: 'Tayyorlanmoqda', icon: ChefHat },
  { status: 'DELIVERING', label: 'Yo\'lda / Yetkazilmoqda', icon: Truck },
  { status: 'COMPLETED', label: 'Bajarildi', icon: Package },
];

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ isOpen, onClose }) => {
  const [phoneQuery, setPhoneQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and optional leading plus (+) sign, strictly block letters and symbols
    const numericOnly = e.target.value.replace(/[^0-9+]/g, '');
    setPhoneQuery(numericOnly);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneQuery.trim()) return;

    setIsLoading(true);
    try {
      const data = await fetchUserOrders(phoneQuery);
      setOrders(data);
      setHasSearched(true);
    } catch (e) {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING_APPROVAL': return 0;
      case 'APPROVED': return 1;
      case 'PREPARING': return 2;
      case 'DELIVERING': return 3;
      case 'COMPLETED': return 4;
      default: return 0;
    }
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
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#FAF6F0] text-[#2B1810] flex items-center justify-center hover:bg-[#F8E7EA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#2B1810]">
                Buyurtmalarni Kuzatish
              </h2>
              <p className="text-xs sm:text-sm text-[#6B5B52] mt-1">
                Telefon raqamingizni kiriting va buyurtma holatini jonli rejimda kuzating.
              </p>
            </div>

            {/* Search Input Form — Strictly numbers only (no letters) */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="tel"
                inputMode="tel"
                value={phoneQuery}
                onChange={handlePhoneChange}
                placeholder="+998 90 123 45 67"
                className="flex-1 p-3.5 bg-[#FAF6F0] border border-[#2B1810]/10 rounded-2xl text-xs sm:text-sm text-[#2B1810] font-bold focus:outline-none focus:ring-2 focus:ring-[#D65B78]"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#2B1810] text-[#FAF6F0] px-5 py-3.5 rounded-2xl font-bold text-xs sm:text-sm shadow-md flex items-center space-x-1.5 border border-[#CBB279] active:scale-95 transition-all"
              >
                <Search className="w-4 h-4 text-[#D65B78]" />
                <span>{isLoading ? 'Qidirilmoqda...' : 'Kuzatish'}</span>
              </button>
            </form>

            {/* Orders Timeline Results */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {orders.length === 0 ? (
                hasSearched && (
                  <div className="text-center py-8 text-[#6B5B52] text-xs">
                    <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    Ushbu raqam bo'yicha aktiv buyurtmalar topilmadi.
                  </div>
                )
              ) : (
                orders.map((order) => {
                  const currentIdx = getStepIndex(order.status);
                  return (
                    <div
                      key={order.id}
                      className="bg-[#FAF6F0] p-5 rounded-2xl border border-[#2B1810]/10 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-[#2B1810]/10 pb-3">
                        <div>
                          <span className="text-xs font-bold text-[#D65B78] uppercase">
                            Buyurtma #{order.orderNumber}
                          </span>
                          <span className="text-[11px] text-[#6B5B52] block mt-0.5">
                            Vaqti: {formatDate(order.createdAt)}
                          </span>
                        </div>
                        <span className="text-sm font-extrabold text-[#2B1810]">
                          {formatUZS(order.totalAmount)}
                        </span>
                      </div>

                      {/* Stepper timeline */}
                      <div className="relative flex items-center justify-between pt-2">
                        {/* Connecting line */}
                        <div className="absolute top-1/2 left-4 right-4 h-1 bg-gray-200 -translate-y-1/2 z-0" />
                        <div
                          className="absolute top-1/2 left-4 h-1 bg-[#D65B78] -translate-y-1/2 z-0 transition-all duration-500"
                          style={{
                            width: `${(currentIdx / (STATUS_STEPS.length - 1)) * 100}%`,
                          }}
                        />

                        {STATUS_STEPS.map((step, idx) => {
                          const Icon = step.icon;
                          const isDone = idx <= currentIdx;
                          const isCurrent = idx === currentIdx;

                          return (
                            <div key={step.status} className="relative z-10 flex flex-col items-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all ${
                                  isCurrent
                                    ? 'bg-[#D65B78] text-white ring-4 ring-[#F8E7EA] scale-110'
                                    : isDone
                                    ? 'bg-[#2B1810] text-[#CBB279]'
                                    : 'bg-white text-gray-400 border border-gray-200'
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <span
                                className={`text-[10px] mt-1.5 font-bold text-center max-w-[4rem] leading-tight ${
                                  isCurrent
                                    ? 'text-[#D65B78]'
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

                      {/* Order items list */}
                      <div className="bg-white p-3 rounded-xl text-xs space-y-1">
                        <p className="font-bold text-[#2B1810]">Buyurtma tarkibi:</p>
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-[#6B5B52]">
                            <span>{item.quantity}x {item.productName}</span>
                            <span>{formatUZS(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OrderTrackingModal;
