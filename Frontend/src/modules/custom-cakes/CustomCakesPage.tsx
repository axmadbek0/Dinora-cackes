import React, { useState } from 'react';
import { useCustomCakes, useUpdateCustomCakeStatus } from './hooks/useCustomCakes';
import { CakeRequestCard } from './components/CakeRequestCard';
import { PriceOfferModal } from './components/PriceOfferModal';
import { PhotoLightboxModal } from './components/PhotoLightboxModal';
import { CustomCakeRequest, CustomCakeStatus } from '../../types/custom-cake.types';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';

export const CustomCakesPage: React.FC = () => {
  const { data: requests = [], isLoading } = useCustomCakes();
  const updateStatusMutation = useUpdateCustomCakeStatus();

  const [selectedOfferRequest, setSelectedOfferRequest] = useState<CustomCakeRequest | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const handlePriceOfferSubmit = (id: string, estimatedPrice: number, adminNotes?: string) => {
    updateStatusMutation.mutate(
      {
        id,
        dto: {
          status: CustomCakeStatus.PRICE_OFFERED,
          estimatedPrice,
          adminNotes,
        },
      },
      {
        onSuccess: () => setSelectedOfferRequest(null),
      }
    );
  };

  const handleDirectStatusUpdate = (id: string, status: CustomCakeStatus) => {
    updateStatusMutation.mutate({ id, dto: { status } });
  };

  return (
    <div className="space-y-6">
      {/* Banner / Info Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-dinora-chocolate to-dinora-chocolate-light text-white shadow-dinora flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-dinora-gold/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-dinora-gold">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-lg font-bold font-serif">Maxsus Tort Buyurtmalar</h3>
          </div>
          <p className="text-xs text-dinora-bg/80">
            Mijozlar tomonidan maxsus tayyorlash uchun yuborilgan rasmli buyurtmalar va so'rovlar
          </p>
        </div>

        <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-xs font-semibold text-dinora-gold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-dinora-pink" />
          <span>Kutilayotgan so'rovlar: {requests.filter(r => r.status === CustomCakeStatus.PENDING_PRICING).length} ta</span>
        </div>
      </div>

      {/* Grid of Custom Cake Requests */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-10 h-10 text-dinora-gold animate-spin mb-3" />
          <p className="text-sm font-medium text-dinora-chocolate">Maxsus so'rovlar yuklanmoqda...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dinora-border shadow-dinora max-w-md mx-auto my-8">
          <Sparkles className="w-16 h-16 text-dinora-gray/40 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-dinora-chocolate font-serif">So'rovlar topilmadi</h3>
          <p className="text-xs text-dinora-gray mt-1">
            Hozircha mijozlardan yangi buyurtma tort so'rovlari tushmagan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((request) => (
            <CakeRequestCard
              key={request.id}
              request={request}
              onOpenOfferModal={setSelectedOfferRequest}
              onOpenLightbox={setLightboxImage}
              onUpdateStatus={handleDirectStatusUpdate}
              isPendingStatus={updateStatusMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Price Offer Modal */}
      <PriceOfferModal
        isOpen={!!selectedOfferRequest}
        onClose={() => setSelectedOfferRequest(null)}
        request={selectedOfferRequest}
        onSubmit={handlePriceOfferSubmit}
        isLoading={updateStatusMutation.isPending}
      />

      {/* Photo Lightbox Modal */}
      <PhotoLightboxModal
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
        imageUrl={lightboxImage}
      />
    </div>
  );
};
