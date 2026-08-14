import React, { useEffect, useState } from 'react';
import { fetchUserOrders } from '../../services/api';
import { Bell, CheckCircle2, XCircle, Truck, Package, X, ChefHat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LiveOrderNotifier: React.FC = () => {
  const [activeNotification, setActiveNotification] = useState<{
    id: string;
    title: string;
    message: string;
    type: 'APPROVED' | 'REJECTED' | 'DELIVERING' | 'COMPLETED' | 'PREPARING';
  } | null>(null);

  const [knownStatuses, setKnownStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    const checkOrders = async () => {
      const savedPhone = localStorage.getItem('dinora_user_phone');
      if (!savedPhone) return;

      try {
        const userOrders = await fetchUserOrders(savedPhone);
        if (!userOrders || userOrders.length === 0) return;

        const latestStatuses: Record<string, string> = {};
        const prevStatuses = { ...knownStatuses };

        for (const order of userOrders) {
          latestStatuses[order.id] = order.status;

          const prev = prevStatuses[order.id];
          const curr = order.status;

          // If status has changed, trigger notification toast on web storefront
          if (prev && prev !== curr) {
            const isPickup = order.deliveryType === 'PICKUP';

            if (curr === 'APPROVED') {
              setActiveNotification({
                id: `${order.id}-APPROVED`,
                title: `✅ Buyurtma #${order.orderNumber} Tasdiqlandi!`,
                message: "Buyurtmangiz admin tomonidan tasdiqlandi va tayyorlashga topshirildi. 🎂",
                type: 'APPROVED',
              });
            } else if (curr === 'REJECTED') {
              setActiveNotification({
                id: `${order.id}-REJECTED`,
                title: `❌ Buyurtma #${order.orderNumber} Rad Etildi`,
                message: "Afsuski, buyurtmangiz rad etildi.",
                type: 'REJECTED',
              });
            } else if (curr === 'PREPARING') {
              setActiveNotification({
                id: `${order.id}-PREPARING`,
                title: `👩‍🍳 Buyurtma #${order.orderNumber} Tayyorlanmoqda`,
                message: "Konditerlarimiz mahsulotingizni tayyorlamoqda!",
                type: 'PREPARING',
              });
            } else if (curr === 'DELIVERING') {
              setActiveNotification({
                id: `${order.id}-DELIVERING`,
                title: `🚖 Buyurtmangiz Yo'lda! (#${order.orderNumber})`,
                message: "Kuryerimiz Sirdaryo tumani bo'ylab yo'lga chiqdi. Kuting!",
                type: 'DELIVERING',
              });
            } else if (curr === 'COMPLETED') {
              setActiveNotification({
                id: `${order.id}-COMPLETED`,
                title: isPickup
                  ? `🎂 Olib Ketishingiz Mumkin! (#${order.orderNumber})`
                  : `🎉 Buyurtma Topshirildi! (#${order.orderNumber})`,
                message: isPickup
                  ? "Buyurtmangiz tayyor! Do'konimizdan kelib olib ketishingiz mumkin."
                  : "Buyurtmangiz yetkazib berildi. Yoqimli ishtaha!",
                type: 'COMPLETED',
              });
            }
          }
        }

        setKnownStatuses(latestStatuses);
      } catch (err) {
        // Silent catch
      }
    };

    checkOrders();
    const interval = setInterval(checkOrders, 8000); // Poll every 8s
    return () => clearInterval(interval);
  }, [knownStatuses]);

  if (!activeNotification) return null;

  const getIcon = () => {
    switch (activeNotification.type) {
      case 'APPROVED':
        return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
      case 'REJECTED':
        return <XCircle className="w-6 h-6 text-rose-500" />;
      case 'PREPARING':
        return <ChefHat className="w-6 h-6 text-amber-500" />;
      case 'DELIVERING':
        return <Truck className="w-6 h-6 text-sky-500" />;
      case 'COMPLETED':
        return <Package className="w-6 h-6 text-amber-500" />;
      default:
        return <Bell className="w-6 h-6 text-dinora-gold" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        className="fixed top-5 right-5 z-50 max-w-sm w-full bg-[#2B1810] text-[#FAF6F0] p-4 rounded-2xl shadow-2xl border-2 border-[#CBB279] flex items-start gap-3"
      >
        <div className="p-2 bg-white/10 rounded-xl shrink-0">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold font-serif text-[#CBB279]">
            {activeNotification.title}
          </h4>
          <p className="text-xs text-gray-200 mt-1 leading-snug">
            {activeNotification.message}
          </p>
        </div>

        <button
          onClick={() => setActiveNotification(null)}
          className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
