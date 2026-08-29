import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, MapPin, Sparkles, Navigation, CheckCircle2, Calculator, ArrowRight, ShieldCheck } from 'lucide-react';
import { calculateDistanceKm, calculateDeliveryFee, STORE_COORDINATES } from '../../utils/deliveryCalculator';
import { formatUZS } from '../../utils/formatters';
import { triggerHaptic, triggerSuccessHaptic } from '../../utils/haptics';

export const DeliveryPricingSection: React.FC = () => {
  const { t } = useTranslation();
  const [sliderDistance, setSliderDistance] = useState<number>(3.5);
  const [detectedDistance, setDetectedDistance] = useState<number | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const activeDistance = detectedDistance !== null ? detectedDistance : sliderDistance;
  const result = calculateDeliveryFee(activeDistance);

  const handleDetectGPS = () => {
    triggerHaptic('medium');
    setIsDetecting(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError("Qurilmangizda geolokatsiya qo'llab-quvvatlanmaydi");
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const dist = calculateDistanceKm(
          position.coords.latitude,
          position.coords.longitude,
          STORE_COORDINATES.latitude,
          STORE_COORDINATES.longitude
        );
        setDetectedDistance(dist);
        setSliderDistance(dist);
        setIsDetecting(false);
        triggerSuccessHaptic();
      },
      (error) => {
        setIsDetecting(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsError("Geolokatsiyaga ruxsat berilmadi. Iltimos, brauzerda ruxsat bering");
        } else {
          setGpsError("Lokatsiyani aniqlab bo'lmadi. Masofani qo'lda tanlang");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSliderChange = (val: number) => {
    triggerHaptic('light');
    setSliderDistance(val);
    setDetectedDistance(null);
  };

  return (
    <section id="delivery-pricing" className="py-12 sm:py-18 bg-[#FAF6F0] relative overflow-hidden border-t border-[#2B1810]/5 select-none">
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-[#CBB279]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-[#D65B78]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-[#F8E7EA] text-[#D65B78] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-[#D65B78]/20 shadow-sm">
            <Truck className="w-4 h-4 text-[#D65B78]" />
            <span>{t('delivery_pricing.pill', '🚚 Qulay va Tezkor Xizmat')}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#2B1810] tracking-tight">
            {t('delivery_pricing.title', 'Yetkazib Berish Narxlari va Tariflar')}
          </h2>

          <p className="text-xs sm:text-sm text-[#6B5B52] leading-relaxed">
            {t('delivery_pricing.subtitle', "Sirdaryo tumani bo'ylab buyurtmangizni o'z vaqtida, yangi va bekamu-ko'st holatda yetkazamiz. Masofangizni hisoblab ko'ring.")}
          </p>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          
          {/* Card 1: 0 - 2 km Free */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-emerald-500/40 shadow-lg hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-2xl shadow-sm tracking-wider">
              {t('delivery_pricing.free_badge', '🎉 100% BEPUL')}
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-sm">
                <Sparkles className="w-6 h-6" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                  {t('delivery_pricing.free_zone_title', 'Yaqin Hududlar')}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#2B1810] mt-1">
                  0.0 — 2.0 km
                </h3>
              </div>

              <div className="pt-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-serif block">
                  0 UZS
                </span>
                <span className="text-[11px] text-emerald-700 font-bold">
                  {t('delivery_pricing.free_desc_sub', 'Mutlaqo bepul yetkazish')}
                </span>
              </div>

              <p className="text-xs text-[#6B5B52] leading-relaxed">
                {t('delivery_pricing.free_desc', 'DINORA konditeriyamizdan 2 km radiusgacha bo\'lgan barcha xonadon va joylarga yetkazib berish bepul!')}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-[#2B1810]/5 flex items-center text-emerald-700 text-xs font-bold gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('delivery_pricing.free_guarantee', '2 km gacha komissiyasiz')}</span>
            </div>
          </div>

          {/* Card 2: Above 2 km */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-[#CBB279]/50 shadow-lg hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute top-0 right-0 bg-[#2B1810] text-[#D4AF37] text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-2xl shadow-sm tracking-wider border-b border-l border-[#CBB279]/30">
              {t('delivery_pricing.standard_badge', '🚗 Standart Tarif')}
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF6F0] text-[#D4AF37] flex items-center justify-center border border-[#CBB279]/40 shadow-sm">
                <Truck className="w-6 h-6 text-[#2B1810]" />
              </div>

              <div>
                <span className="text-xs font-bold text-[#6B5B52] uppercase tracking-wider block">
                  {t('delivery_pricing.extra_zone_title', '2 km dan oshganda')}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#2B1810] mt-1">
                  &gt; 2.0 km masofa
                </h3>
              </div>

              <div className="pt-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#D65B78] font-serif block">
                  2,500 UZS <span className="text-xs font-bold text-[#6B5B52]">/ km</span>
                </span>
                <span className="text-[11px] text-[#6B5B52] font-semibold">
                  {t('delivery_pricing.extra_desc_sub', '2 km bepul + qolgan har km uchun')}
                </span>
              </div>

              <p className="text-xs text-[#6B5B52] leading-relaxed">
                {t('delivery_pricing.extra_desc', 'Dastlabki 2 km doim bepul hisoblanadi. 2 km dan oshgan har bir kilometr uchun 2 500 so\'mdan hisoblanadi.')}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-[#2B1810]/5 flex items-center text-[#2B1810] text-xs font-bold gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t('delivery_pricing.extra_guarantee', 'Avtomobilda tezkor yetkazish')}</span>
            </div>
          </div>

          {/* Card 3: Pickup (Samovivoz) */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-[#2B1810]/10 shadow-lg hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute top-0 right-0 bg-[#F8E7EA] text-[#D65B78] text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-2xl shadow-sm tracking-wider">
              {t('delivery_pricing.pickup_badge', '🏪 Olib Ketish')}
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF6F0] text-[#D65B78] flex items-center justify-center border border-[#2B1810]/10 shadow-sm">
                <MapPin className="w-6 h-6" />
              </div>

              <div>
                <span className="text-xs font-bold text-[#6B5B52] uppercase tracking-wider block">
                  {t('delivery_pricing.pickup_zone_title', 'Do\'kondan Olib Ketish')}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#2B1810] mt-1">
                  Konditeriya Binosi
                </h3>
              </div>

              <div className="pt-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#2B1810] font-serif block">
                  0 UZS
                </span>
                <span className="text-[11px] text-[#6B5B52] font-semibold">
                  {t('delivery_pricing.pickup_desc_sub', 'Sirdaryo tumani, M34 ko\'chasi 9-uy')}
                </span>
              </div>

              <p className="text-xs text-[#6B5B52] leading-relaxed">
                {t('delivery_pricing.pickup_desc', 'Tayyor bo\'lgan shirinlik va tortlarni o\'zingiz qulay vaqtda do\'konimizga kelib bepul olib ketishingiz mumkin.')}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-[#2B1810]/5 flex items-center text-[#2B1810] text-xs font-bold gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t('delivery_pricing.pickup_guarantee', 'Tayyor bo\'lgach qo\'ng\'iroq qilamiz')}</span>
            </div>
          </div>

        </div>

        {/* Interactive Live Delivery Fee Calculator Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border-2 border-[#CBB279]/40 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2B1810]/10 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#2B1810] text-[#D4AF37] flex items-center justify-center shadow-md">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-[#2B1810]">
                  {t('delivery_pricing.calc_title', '🧮 Masofani Hisoblash va Narxni Aniqlash')}
                </h3>
                <p className="text-xs text-[#6B5B52]">
                  {t('delivery_pricing.calc_subtitle', 'Slayderni suring yoki GPS orqali uyingizgacha masofa va yetkazish narxini aniqlang.')}
                </p>
              </div>
            </div>

            {/* GPS Detect Button */}
            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={isDetecting}
              className="min-h-[42px] bg-[#FAF6F0] hover:bg-[#F8E7EA] text-[#2B1810] px-4 py-2 rounded-2xl border border-[#CBB279] text-xs font-bold flex items-center space-x-2 shadow-sm active:scale-95 transition-all touch-manipulation whitespace-nowrap"
            >
              {isDetecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#D65B78] border-t-transparent rounded-full animate-spin" />
                  <span>Aniqlanmoqda...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 text-[#D65B78]" />
                  <span>{t('delivery_pricing.gps_btn', '📍 Mening Lokatsiyam (GPS)')}</span>
                </>
              )}
            </button>
          </div>

          {gpsError && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 font-medium">
              ⚠️ {gpsError}
            </div>
          )}

          {/* Calculator Controls & Output Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Distance Range Slider */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-[#2B1810] uppercase tracking-wider">
                  Tanlangan Masofa:
                </label>
                <span className="text-xl sm:text-2xl font-serif font-extrabold text-[#D65B78] bg-[#F8E7EA] px-3.5 py-1 rounded-2xl">
                  {activeDistance.toFixed(1)} km
                </span>
              </div>

              {/* Slider Input */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="0.5"
                  max="25"
                  step="0.5"
                  value={activeDistance}
                  onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
                  className="w-full h-3 bg-[#FAF6F0] rounded-lg appearance-none cursor-pointer accent-[#D65B78] border border-[#2B1810]/10"
                />
                <div className="flex justify-between text-[11px] font-bold text-[#6B5B52]">
                  <span>0.5 km</span>
                  <span className="text-emerald-700 font-extrabold">2.0 km (Bepul chegara)</span>
                  <span>10 km</span>
                  <span>25 km</span>
                </div>
              </div>

              {/* Quick Distance Presets */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-xs text-[#6B5B52] font-semibold self-center mr-1">Tezkor:</span>
                {[1.5, 2.0, 3.5, 5.0, 8.0, 12.0].map((km) => (
                  <button
                    key={km}
                    type="button"
                    onClick={() => handleSliderChange(km)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      Math.abs(activeDistance - km) < 0.1
                        ? 'bg-[#2B1810] text-white border-[#CBB279]'
                        : 'bg-[#FAF6F0] text-[#2B1810] border-[#2B1810]/10 hover:bg-white'
                    }`}
                  >
                    {km} km
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Calculated Price Result Box */}
            <div className="lg:col-span-5 bg-[#FAF6F0] p-6 rounded-3xl border-2 border-[#CBB279]/50 space-y-4 shadow-md">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#6B5B52] block">
                Hisoblangan Yetkazish Narxi:
              </span>

              <div className="flex items-baseline space-x-2">
                <span className={`text-3xl sm:text-4xl font-serif font-extrabold ${
                  result.isFreeDelivery ? 'text-emerald-600' : 'text-[#D65B78]'
                }`}>
                  {result.isFreeDelivery ? 'BEPUL' : formatUZS(result.deliveryFee)}
                </span>
                {result.isFreeDelivery && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    0 UZS
                  </span>
                )}
              </div>

              <div className="p-3 bg-white rounded-2xl border border-[#2B1810]/10 text-xs space-y-1">
                <div className="flex justify-between font-bold text-[#2B1810]">
                  <span>Hisoblash formulasi:</span>
                </div>
                <p className="text-[11px] text-[#6B5B52]">
                  {result.breakdownText}
                </p>
              </div>

              <a
                href="#catalog"
                className="w-full min-h-[44px] bg-[#2B1810] hover:bg-[#3D2318] text-[#FAF6F0] py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md transition-all active:scale-95 touch-manipulation"
              >
                <span>Shirinliklarni Tanlash</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
              </a>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default DeliveryPricingSection;
