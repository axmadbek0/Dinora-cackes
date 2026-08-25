import React from 'react';
import { CustomCakeRequest, CustomCakeStatus } from '../../../types/custom-cake.types';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Phone, MapPin, Sparkles, ZoomIn, DollarSign, Calendar } from 'lucide-react';
import { getImageUrl } from '../../../utils/imageUrl';

interface CakeRequestCardProps {
  request: CustomCakeRequest;
  onOpenOfferModal: (request: CustomCakeRequest) => void;
  onOpenLightbox: (imageUrl: string) => void;
  onUpdateStatus: (id: string, status: CustomCakeStatus) => void;
  isPendingStatus?: boolean;
}

export const CakeRequestCard: React.FC<CakeRequestCardProps> = ({
  request,
  onOpenOfferModal,
  onOpenLightbox,
  onUpdateStatus,
  isPendingStatus = false,
}) => {
  const formatMoney = (amount: number | string) => {
    return new Intl.NumberFormat('uz-UZ').format(Number(amount)) + " so'm";
  };

  const photosList = request.photos || (request.referenceImageUrl ? [request.referenceImageUrl] : []);

  const getStatusBadge = (status: CustomCakeStatus) => {
    switch (status) {
      case CustomCakeStatus.PENDING_PRICING:
        return <Badge variant="warning">⏳ Baholash Kutilmoqda</Badge>;
      case CustomCakeStatus.PRICE_OFFERED:
        return <Badge variant="gold">💰 Narx Taklif Etilgan</Badge>;
      case CustomCakeStatus.ACCEPTED:
        return <Badge variant="info">✅ Qabul Qilindi</Badge>;
      case CustomCakeStatus.COMPLETED:
        return <Badge variant="success">🎉 Tayyorlandi (Bajarildi)</Badge>;
      case CustomCakeStatus.REJECTED:
      case CustomCakeStatus.CANCELLED:
        return <Badge variant="danger">❌ Bekor qilingan</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-dinora-border shadow-dinora overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-dinora-hover">
      {/* Header Info */}
      <div className="p-5 border-b border-dinora-border bg-dinora-bg/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-dinora-chocolate text-dinora-gold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-base font-bold text-dinora-chocolate font-serif">
              Buyurtma Tort #{request.requestNumber}
            </h4>
            <span className="text-[10px] text-dinora-gray block">
              {new Date(request.createdAt).toLocaleDateString('uz-UZ', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {getStatusBadge(request.status)}
      </div>

      {/* Uploaded Client Photo Thumbnails (supports 2+ photos) */}
      <div className="p-5 space-y-4 flex-1">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-dinora-gray block mb-2">
            Mijoz Yuklagan Rasm Namunalari (Kattalashtirish uchun bosing)
          </span>

          {photosList.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {photosList.slice(0, 2).map((imgUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => onOpenLightbox(imgUrl)}
                  className="group relative h-36 rounded-xl overflow-hidden bg-dinora-bg border border-dinora-border cursor-pointer"
                >
                  <img
                    src={getImageUrl(imgUrl)}
                    alt={`Reference cake ${idx + 1}`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logotip.png';
                    }}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-dinora-chocolate/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <ZoomIn className="w-6 h-6 text-dinora-gold" />
                  </div>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-dinora-chocolate/80 backdrop-blur-md text-[10px] font-bold text-dinora-gold rounded-md">
                    Rasm #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-dinora-bg text-center text-xs text-dinora-gray">
              Rasm yuklanmagan
            </div>
          )}
        </div>

        {/* Customer Text Description */}
        <div className="p-3.5 bg-dinora-bg rounded-xl border border-dinora-border/80 text-xs text-dinora-chocolate space-y-1">
          <strong className="block font-bold text-dinora-chocolate">Mijoz So'rovi & Izohi:</strong>
          <p className="leading-relaxed">"{request.description}"</p>
        </div>

        {/* Customer Contact & Address Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-xl border border-dinora-border bg-white">
            <span className="text-[10px] font-bold uppercase tracking-wider text-dinora-gray block mb-1">
              Mijoz Aloqasi
            </span>
            <p className="text-xs font-bold text-dinora-chocolate">
              {request.user?.firstName} {request.user?.lastName || ''}
            </p>
            {request.user?.phone && (
              <a
                href={`tel:${request.user.phone}`}
                className="text-xs font-semibold text-dinora-gold hover:underline flex items-center gap-1 mt-1"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{request.user.phone}</span>
              </a>
            )}
          </div>

          <div className="p-3 rounded-xl border border-dinora-border bg-white">
            <span className="text-[10px] font-bold uppercase tracking-wider text-dinora-gray block mb-1">
              Etkazish Manzili
            </span>
            <p className="text-xs font-medium text-dinora-chocolate flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-dinora-gold shrink-0" />
              <span className="truncate">{request.deliveryAddress || "O'zi olib ketadi"}</span>
            </p>
          </div>
        </div>

        {/* Price & Offer Status */}
        {request.estimatedPrice && (
          <div className="p-3.5 bg-dinora-gold-light/60 rounded-xl border border-dinora-gold/40 flex items-center justify-between">
            <span className="text-xs font-bold text-dinora-chocolate">Belgilangan Narx:</span>
            <span className="text-base font-extrabold text-dinora-chocolate font-serif">
              {formatMoney(request.estimatedPrice)}
            </span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-dinora-bg/80 border-t border-dinora-border flex items-center justify-between gap-3">
        <Button
          variant="gold"
          size="sm"
          icon={<DollarSign className="w-4 h-4" />}
          onClick={() => onOpenOfferModal(request)}
        >
          {request.estimatedPrice ? "Narxni O'zgartirish" : '💰 Narx Taklif Qilish'}
        </Button>

        {request.status === CustomCakeStatus.PRICE_OFFERED && (
          <Button
            variant="primary"
            size="sm"
            isLoading={isPendingStatus}
            onClick={() => onUpdateStatus(request.id, CustomCakeStatus.ACCEPTED)}
          >
            ✅ Qabul Qilindi
          </Button>
        )}

        {request.status === CustomCakeStatus.ACCEPTED && (
          <Button
            variant="gold"
            size="sm"
            isLoading={isPendingStatus}
            onClick={() => onUpdateStatus(request.id, CustomCakeStatus.COMPLETED)}
          >
            🎉 Bajarildi
          </Button>
        )}
      </div>
    </div>
  );
};
