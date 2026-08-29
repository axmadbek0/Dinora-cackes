import React, { useState } from 'react';
import { useCustomCakes, useUpdateCustomCakeStatus } from '../../modules/custom-cakes/hooks/useCustomCakes';
import { CustomCakeRequest, CustomCakeStatus } from '../../types/custom-cake.types';
import { PhotoLightboxModal } from '../../modules/custom-cakes/components/PhotoLightboxModal';
import { Sparkles, Phone, MapPin, ZoomIn, DollarSign, X, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';

interface PriceAssignmentModalProps {
  order: CustomCakeRequest | null;
  onClose?: () => void;
  onSubmitPrice: (orderId: string, price: number, adminNotes?: string) => void;
  isLoading?: boolean;
}

export const PriceAssignmentModal: React.FC<PriceAssignmentModalProps> = ({
  order,
  onClose,
  onSubmitPrice,
  isLoading = false,
}) => {
  const [price, setPrice] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  if (!order) return null;

  const shape = order.customDetails?.shape || (order.description.match(/Shakli:\s*([^|]+)/i)?.[1]?.trim()) || 'Belgilanmagan';
  const layers = order.customDetails?.layers || (order.description.match(/Qavatlar:\s*([^|]+)/i)?.[1]?.trim()) || '1 qavat';
  const cream = order.customDetails?.cream || (order.description.match(/Krem:\s*([^|]+)/i)?.[1]?.trim()) || 'Klassik';
  const customText = order.customDetails?.customText || (order.description.match(/Yozuv:\s*"([^"]+)"/i)?.[1]?.trim()) || order.description;
  const distance = order.distanceKm || (order.description.match(/Masofa:\s*([\d.]+)\s*km/i)?.[1]) || '2.0';
  const deliveryFee = order.deliveryFee !== undefined && order.deliveryFee !== null
    ? order.deliveryFee
    : (order.description.match(/Yetkazish:\s*([\d,\s]+)\s*UZS/i)?.[1] || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      alert("Iltimos, to'g'ri narx kiriting (masalan: 250000)!");
      return;
    }
    onSubmitPrice(order.id, Number(price), adminNotes.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-md w-full border border-[#CBB279] relative animate-in fade-in zoom-in duration-200">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 text-[#2B1810]"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <h3 className="text-lg font-bold text-[#2B1810] flex items-center gap-2 font-serif">
          <span>🎂 Maxsus Tortga Narx Belgilash</span>
        </h3>
        <p className="text-xs text-[#6B5B52] mb-4">
          Mijoz: {order.user?.firstName || 'Mijoz'} ({order.user?.phone || 'Tel ko\'rsatilmagan'})
        </p>

        {/* Order Custom Details Summary */}
        <div className="bg-[#FAF6F0] p-4 rounded-2xl mb-4 text-xs space-y-1.5 border border-[#CBB279]/30">
          <p><strong>⭕️ Shakli:</strong> {shape} ({layers})</p>
          <p><strong>🥛 Krem:</strong> {cream}</p>
          <p><strong>✍️ Yozuv:</strong> "{customText}"</p>
          <p><strong>📍 Masofa:</strong> {distance} km (Delivery: {typeof deliveryFee === 'number' ? deliveryFee.toLocaleString('uz-UZ') : deliveryFee} UZS)</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1 text-[#2B1810]">
              Masalliq va mehnat narxi (UZS):
            </label>
            <input
              type="number"
              placeholder="Masalan: 250000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-3 rounded-xl border border-black/10 outline-none focus:border-[#D65B78] font-bold text-lg"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-[#6B5B52]">
              Admin izohi (Ixtiyoriy):
            </label>
            <input
              type="text"
              placeholder="Masalan: Maxsus karamel va bezaklar bilan..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-black/10 text-xs outline-none focus:border-[#D65B78]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2B1810] text-[#CBB279] py-3.5 rounded-2xl font-bold hover:opacity-90 active:scale-98 transition-all flex items-center justify-center space-x-2 border border-[#CBB279] shadow-md"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#CBB279]" />
                <span>Yuborilmoqda...</span>
              </>
            ) : (
              <span>✅ Narxni Tasdiqlash va Mijozga Yuborish</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export const CustomOrdersPage: React.FC = () => {
  const { data: requests = [], isLoading } = useCustomCakes();
  const updateStatusMutation = useUpdateCustomCakeStatus();

  const [selectedOrder, setSelectedOrder] = useState<CustomCakeRequest | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const handlePriceSubmit = (id: string, price: number, adminNotes?: string) => {
    updateStatusMutation.mutate(
      {
        id,
        dto: {
          status: CustomCakeStatus.PRICE_OFFERED,
          estimatedPrice: price,
          adminNotes,
        },
      },
      {
        onSuccess: () => setSelectedOrder(null),
      }
    );
  };

  const handleStatusUpdate = (id: string, status: CustomCakeStatus) => {
    updateStatusMutation.mutate({ id, dto: { status } });
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#2B1810] to-[#4A2C11] text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-2 border-[#CBB279]/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#D4AF37]">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-xl font-bold font-serif">🎂 Maxsus Tort Buyurtmalari ("O'zim xohlaganimdek")</h2>
          </div>
          <p className="text-xs text-[#FAF6F0]/80">
            Mijozlar tomonidan Visual Builder orqali tuzilgan maxsus tortlar va dinamik narx belgilash oynasi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-xs font-bold text-[#D4AF37] flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Kutilayotgan: {requests.filter((r) => r.status === CustomCakeStatus.PENDING_PRICING).length} ta</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { id: 'ALL', label: 'Barchasi', count: requests.length },
          { id: CustomCakeStatus.PENDING_PRICING, label: '⏳ Narx Kutilmoqda', count: requests.filter((r) => r.status === CustomCakeStatus.PENDING_PRICING).length },
          { id: CustomCakeStatus.PRICE_OFFERED, label: '💰 Narx Taklif Qilindi', count: requests.filter((r) => r.status === CustomCakeStatus.PRICE_OFFERED).length },
          { id: CustomCakeStatus.ACCEPTED, label: '✅ Tasdiqlangan', count: requests.filter((r) => r.status === CustomCakeStatus.ACCEPTED).length },
          { id: CustomCakeStatus.COMPLETED, label: '🎉 Yakunlangan', count: requests.filter((r) => r.status === CustomCakeStatus.COMPLETED).length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === tab.id
                ? 'bg-[#2B1810] text-[#D4AF37] shadow-md border border-[#CBB279]'
                : 'bg-white text-[#6B5B52] border border-black/5 hover:bg-[#FAF6F0]'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Requests Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-10 h-10 text-[#CBB279] animate-spin mb-3" />
          <p className="text-sm font-medium text-[#2B1810]">Maxsus tort so'rovlari yuklanmoqda...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#2B1810]/10 shadow-sm max-w-md mx-auto my-8">
          <Sparkles className="w-16 h-16 text-[#CBB279]/40 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#2B1810] font-serif">So'rovlar topilmadi</h3>
          <p className="text-xs text-[#6B5B52] mt-1">Ushbu holat bo'yicha hech qanday buyurtma mavjud emas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRequests.map((order) => {
            const photos = order.photos || (order.referenceImageUrl ? [order.referenceImageUrl] : []);
            const shape = order.customDetails?.shape || (order.description.match(/Shakli:\s*([^|]+)/i)?.[1]?.trim()) || 'Belgilanmagan';
            const layers = order.customDetails?.layers || (order.description.match(/Qavatlar:\s*([^|]+)/i)?.[1]?.trim()) || '1 qavat';
            const base = order.customDetails?.base || (order.description.match(/Baza\):\s*([^|]+)/i)?.[1]?.trim()) || 'Klassik';
            const cream = order.customDetails?.cream || (order.description.match(/Krem:\s*([^|]+)/i)?.[1]?.trim()) || 'Slivki';
            const filling = order.customDetails?.filling || (order.description.match(/Nachinka:\s*([^|]+)/i)?.[1]?.trim()) || '';
            const customText = order.customDetails?.customText || (order.description.match(/Yozuv:\s*"([^"]+)"/i)?.[1]?.trim());

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-[#2B1810]/10 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
              >
                {/* Header */}
                <div className="p-5 border-b border-[#2B1810]/10 bg-[#FAF6F0] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-[#D65B78]">
                      № {order.requestNumber} - Maxsus Tort
                    </span>
                    <p className="text-[11px] text-[#6B5B52]">
                      {new Date(order.createdAt).toLocaleDateString('uz-UZ', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                      order.status === CustomCakeStatus.PENDING_PRICING
                        ? 'bg-amber-100 text-amber-800'
                        : order.status === CustomCakeStatus.PRICE_OFFERED
                        ? 'bg-blue-100 text-blue-800'
                        : order.status === CustomCakeStatus.ACCEPTED
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {order.status === CustomCakeStatus.PENDING_PRICING && '⏳ Narx Belgilanmoqda'}
                    {order.status === CustomCakeStatus.PRICE_OFFERED && '💰 Narx Taklif Qilindi'}
                    {order.status === CustomCakeStatus.ACCEPTED && '✅ Qabul Qilindi'}
                    {order.status === CustomCakeStatus.COMPLETED && '🎉 Yakunlandi'}
                    {order.status === CustomCakeStatus.REJECTED && '❌ Rad Etildi'}
                  </span>
                </div>

                {/* Details Body */}
                <div className="p-5 space-y-4 flex-1">
                  {/* Photo Thumbnails */}
                  {photos.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {photos.slice(0, 2).map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => setLightboxImage(img)}
                          className="relative h-28 rounded-2xl overflow-hidden bg-[#FAF6F0] border border-[#2B1810]/10 cursor-pointer group"
                        >
                          <img src={getImageUrl(img)} alt="Namuna" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <ZoomIn className="w-5 h-5 text-[#D4AF37]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Visual Recipe Box */}
                  <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#CBB279]/30 text-xs space-y-1">
                    <p><strong>⭕️ Shakli & Qavat:</strong> {shape} ({layers})</p>
                    <p><strong>🍰 Korj / Baza:</strong> {base}</p>
                    <p><strong>🥛 Krem & Nachinka:</strong> {cream} {filling ? `• ${filling}` : ''}</p>
                    {customText && (
                      <p className="text-[#D65B78] font-bold">
                        ✍️ Tabrik yozuvi: "{customText}"
                      </p>
                    )}
                  </div>

                  {/* Customer & Location */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-2xl border border-[#2B1810]/10 bg-white">
                      <span className="text-[10px] uppercase font-bold text-[#6B5B52] block">Mijoz</span>
                      <p className="font-bold text-[#2B1810]">{order.user?.firstName || 'Mijoz'}</p>
                      {order.user?.phone && (
                        <a href={`tel:${order.user.phone}`} className="text-[#D65B78] font-semibold flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          <span>{order.user.phone}</span>
                        </a>
                      )}
                    </div>

                    <div className="p-3 rounded-2xl border border-[#2B1810]/10 bg-white">
                      <span className="text-[10px] uppercase font-bold text-[#6B5B52] block">Yetkazish</span>
                      <p className="font-medium text-[#2B1810] truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#D4AF37] shrink-0" />
                        <span className="truncate">{order.deliveryAddress || "O'zi olib ketadi"}</span>
                      </p>
                      {order.distanceKm && (
                        <span className="text-[10px] text-[#6B5B52] block">
                          Masofa: {order.distanceKm} km
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Offered Price tag */}
                  {order.estimatedPrice && (
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between text-emerald-900">
                      <span className="font-bold">Belgilangan Narx:</span>
                      <span className="text-base font-extrabold font-serif">
                        {Number(order.estimatedPrice).toLocaleString('uz-UZ')} UZS
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 bg-[#FAF6F0] border-t border-[#2B1810]/10 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 py-3 px-4 rounded-2xl bg-[#2B1810] text-[#D4AF37] text-xs font-bold hover:bg-[#3D2318] active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-[#CBB279]"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>{order.estimatedPrice ? "Narxni O'zgartirish" : '💰 Narx Belgilash'}</span>
                  </button>

                  {order.status === CustomCakeStatus.PRICE_OFFERED && (
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(order.id, CustomCakeStatus.ACCEPTED)}
                      className="py-3 px-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 active:scale-95 transition-all"
                    >
                      ✅ Qabul
                    </button>
                  )}

                  {order.status === CustomCakeStatus.ACCEPTED && (
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(order.id, CustomCakeStatus.COMPLETED)}
                      className="py-3 px-4 rounded-2xl bg-[#D4AF37] text-[#2B1810] text-xs font-bold hover:opacity-90 active:scale-95 transition-all"
                    >
                      🎉 Tayyor
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Price Assignment */}
      <PriceAssignmentModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onSubmitPrice={handlePriceSubmit}
        isLoading={updateStatusMutation.isPending}
      />

      {/* Lightbox */}
      <PhotoLightboxModal
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
        imageUrl={lightboxImage}
      />
    </div>
  );
};

export default CustomOrdersPage;
