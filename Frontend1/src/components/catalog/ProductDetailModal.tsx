import React, { useState, useEffect } from 'react';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { formatUZS } from '../../utils/formatters';
import { triggerHaptic, triggerSuccessHaptic } from '../../utils/haptics';
import {
  X,
  Plus,
  Minus,
  Sparkles,
  Scale,
  Flame,
  Users,
  Share2,
  Check,
  ShieldCheck,
  Clock,
  Truck,
  ShoppingBag,
  Star,
  ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen?: boolean;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { getItemQuantity, addToCart, updateQuantity } = useCart();
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'storage' | 'delivery'>('ingredients');

  const showModal = isOpen !== undefined ? isOpen : !!product;

  // Telegram Native BackButton Integration
  useEffect(() => {
    if (showModal) {
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
  }, [showModal, onClose]);

  if (!product) return null;

  const quantity = getItemQuantity(product.id);
  const unitPrice = Number(product.price);
  const calculatedTotal = quantity > 0 ? unitPrice * quantity : unitPrice;

  const handleShare = () => {
    triggerHaptic('light');
    const shareUrl = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `DINORA Shirinliklari: ${product.name}`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleAddToCartClick = () => {
    triggerHaptic('medium');
    triggerSuccessHaptic();
    if (quantity === 0) {
      addToCart(product, 1);
    }
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 220 }}
          className="fixed inset-0 z-50 bg-[#FAF6F0] w-full h-full flex flex-col justify-between overflow-hidden"
          style={{ height: '100dvh' }}
        >
          {/* 1. Header & Navigation Controls */}
          <div className="sticky top-0 z-30 px-4 sm:px-8 py-3.5 bg-white/95 backdrop-blur-md border-b border-[#2B1810]/10 flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                }}
                className="p-2 rounded-full bg-[#FAF6F0] text-[#2B1810] hover:bg-[#F8E7EA] transition-colors border border-[#2B1810]/10 active:scale-95"
                title="Qaytash"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <span className="text-[10px] font-bold text-[#CBB279] uppercase tracking-widest block">
                  DINORA Pastry & Art
                </span>
                <h3 className="text-sm sm:text-base font-bold text-[#2B1810] font-serif truncate max-w-[200px] sm:max-w-xs">
                  {product.name}
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Share Button */}
              <button
                onClick={handleShare}
                className="p-2 rounded-full bg-[#FAF6F0] text-[#2B1810] hover:bg-[#F8E7EA] transition-colors border border-[#2B1810]/10 active:scale-95 flex items-center space-x-1"
                title="Ulashish"
              >
                {copiedLink ? (
                  <Check className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Share2 className="w-5 h-5 text-[#6B5B52]" />
                )}
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                }}
                className="p-2 rounded-full bg-[#FAF6F0] text-[#2B1810] hover:bg-[#F8E7EA] transition-colors border border-[#2B1810]/10 active:scale-95"
                title="Yopish"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 2. Scrollable Detail Content Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 max-w-4xl mx-auto w-full">
            
            {/* Gallery / Image Showcase */}
            <div className="relative aspect-square sm:aspect-[4/3] w-full bg-white rounded-3xl overflow-hidden shadow-md border border-[#2B1810]/5 group">
              <img
                src={product.imageUrl || '/carts/logotip.jpg'}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Dynamic Badges on Image */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="bg-[#2B1810]/85 backdrop-blur-md text-[#D4AF37] px-3 py-1 rounded-full text-xs font-bold border border-[#CBB279]/50 flex items-center gap-1.5 shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>100% Tabiiy</span>
                </span>
                <span className="bg-[#D65B78]/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 shadow-md">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Ommabop Ta'm</span>
                </span>
              </div>

              {/* Rating Badge */}
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-[#2B1810]/10 flex items-center space-x-1 shadow-md">
                <Star className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                <span className="text-xs font-bold text-[#2B1810]">4.9</span>
                <span className="text-[10px] text-[#6B5B52]">(48 baho)</span>
              </div>

              {!product.isAvailable && (
                <div className="absolute inset-0 bg-[#2B1810]/75 backdrop-blur-xs flex items-center justify-center">
                  <span className="bg-[#D65B78] text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-lg border border-white/20">
                    🔴 Vaqtincha sotuvda tugagan
                  </span>
                </div>
              )}
            </div>

            {/* Product Information Header */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#2B1810]/5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#FAF6F0] text-[#CBB279] border border-[#2B1810]/10">
                  Konditeriya San'ati
                </span>
                
                {product.isAvailable ? (
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Sotuvda mavjud</span>
                  </span>
                ) : (
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                    Vaqtincha tugagan
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#2B1810] leading-snug">
                {product.name}
              </h1>

              {/* Price & Weight Highlights */}
              <div className="flex items-baseline justify-between pt-2 border-t border-[#2B1810]/10">
                <div>
                  <span className="text-xs text-[#6B5B52] block font-medium uppercase tracking-wider">
                    Narxi
                  </span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#D65B78] font-serif">
                      {formatUZS(product.price)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {product.weightGrams && (
                    <div className="bg-[#FAF6F0] px-3.5 py-2 rounded-2xl border border-[#2B1810]/10 text-right">
                      <span className="text-[10px] text-[#6B5B52] block font-medium">Og'irligi:</span>
                      <span className="text-xs font-bold text-[#2B1810] flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5 text-[#CBB279]" />
                        <span>~{product.weightGrams} gr</span>
                      </span>
                    </div>
                  )}
                  {product.portion && (
                    <div className="bg-[#FAF6F0] px-3.5 py-2 rounded-2xl border border-[#2B1810]/10 text-right">
                      <span className="text-[10px] text-[#6B5B52] block font-medium">Porsiya:</span>
                      <span className="text-xs font-bold text-[#2B1810] flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#D65B78]" />
                        <span>{product.portion}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Description */}
              <p className="text-sm text-[#6B5B52] leading-relaxed pt-2">
                {product.description || "Ushbu eksklyuziv shirinlik DINORA konditeriyaning mualliflik retsepti asosida faqat tabiiy ingredientlardan tayyorlanadi. Har bir luqmasida ajoyib ta'm uyg'unligini his etasiz."}
              </p>
            </div>

            {/* Specifications & Information Tabs (Uzum Market Accordion Style) */}
            <div className="bg-white rounded-3xl border border-[#2B1810]/5 shadow-sm overflow-hidden">
              <div className="flex border-b border-[#2B1810]/10 bg-[#FAF6F0]/60 p-1.5 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveTab('ingredients');
                  }}
                  className={`flex-1 py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-1.5 ${
                    activeTab === 'ingredients'
                      ? 'bg-white text-[#2B1810] shadow-sm border border-[#2B1810]/10'
                      : 'text-[#6B5B52] hover:text-[#2B1810]'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-[#D65B78]" />
                  <span>Tarkibi</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveTab('storage');
                  }}
                  className={`flex-1 py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-1.5 ${
                    activeTab === 'storage'
                      ? 'bg-white text-[#2B1810] shadow-sm border border-[#2B1810]/10'
                      : 'text-[#6B5B52] hover:text-[#2B1810]'
                  }`}
                >
                  <Clock className="w-4 h-4 text-[#CBB279]" />
                  <span>Saqlash Sharoiti</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveTab('delivery');
                  }}
                  className={`flex-1 py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-1.5 ${
                    activeTab === 'delivery'
                      ? 'bg-white text-[#2B1810] shadow-sm border border-[#2B1810]/10'
                      : 'text-[#6B5B52] hover:text-[#2B1810]'
                  }`}
                >
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Yetkazib Berish</span>
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'ingredients' && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-[#2B1810] uppercase tracking-wider">
                      Masalliqlar va Tarkibiy Qism:
                    </h4>
                    <p className="text-xs sm:text-sm text-[#6B5B52] leading-relaxed bg-[#FAF6F0] p-4 rounded-2xl border border-[#2B1810]/5">
                      {product.ingredients || "Belgiya shokoladi (Cacao Barry), 82.5% tabiiy sariyog', yangi sut krem-pishlog'i, rezavor meva konfilari va tabiiy vanil ekstrakti."}
                    </p>
                    <div className="flex items-center space-x-2 text-[11px] text-[#CBB279] font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Sun'iy bo'yoqlar va kimyoviy qo'shimchalardan xoli</span>
                    </div>
                  </div>
                )}

                {activeTab === 'storage' && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-[#2B1810] uppercase tracking-wider">
                      Saqlash Muddati va Harorati:
                    </h4>
                    <ul className="space-y-2 text-xs sm:text-sm text-[#6B5B52]">
                      <li className="flex items-center space-x-2 bg-[#FAF6F0] p-3 rounded-xl border border-[#2B1810]/5">
                        <span className="w-2 h-2 rounded-full bg-[#D65B78]" />
                        <span>Muzlatgichda <strong>+2°C dan +6°C gacha</strong> haroratda saqlansin.</span>
                      </li>
                      <li className="flex items-center space-x-2 bg-[#FAF6F0] p-3 rounded-xl border border-[#2B1810]/5">
                        <span className="w-2 h-2 rounded-full bg-[#CBB279]" />
                        <span>Yaroqlilik muddati: Tayyorlangan vaqtdan boshlab <strong>48 soat</strong>.</span>
                      </li>
                    </ul>
                  </div>
                )}

                {activeTab === 'delivery' && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-[#2B1810] uppercase tracking-wider">
                      Yetkazish Qoidalari:
                    </h4>
                    <p className="text-xs sm:text-sm text-[#6B5B52] leading-relaxed bg-[#FAF6F0] p-4 rounded-2xl border border-[#2B1810]/5">
                      📍 **Sirdaryo tumani** bo'ylab tezkor yetkazib berish xizmati yo'lga qo'yilgan. Mahsulotlar maxsus sovutgichli konteynerlarda yetkaziladi.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* 3. Sticky Bottom Action Bar (Uzum Market Style) */}
          <div className="sticky bottom-0 z-30 px-4 sm:px-8 py-4 bg-white/95 backdrop-blur-md border-t border-[#2B1810]/10 shadow-2xl flex items-center gap-3 shrink-0">
            
            {/* Quantity Counter */}
            {product.isAvailable && quantity > 0 ? (
              <div className="flex items-center space-x-2 bg-[#FAF6F0] p-1.5 rounded-2xl border border-[#2B1810]/10">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    updateQuantity(product.id, -1);
                  }}
                  className="w-10 h-10 rounded-xl bg-white text-[#2B1810] flex items-center justify-center font-bold shadow-sm hover:bg-[#F8E7EA] transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-extrabold text-sm sm:text-base text-[#2B1810]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    updateQuantity(product.id, 1);
                  }}
                  className="w-10 h-10 rounded-xl bg-[#D65B78] text-white flex items-center justify-center font-bold shadow-sm hover:bg-[#c24b67] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : null}

            {/* Main Add to Cart CTA Button */}
            {product.isAvailable ? (
              <button
                type="button"
                onClick={handleAddToCartClick}
                className="flex-1 bg-gradient-to-r from-[#D65B78] via-[#e26b86] to-[#D65B78] hover:from-[#c24b67] hover:to-[#c24b67] text-white py-3.5 sm:py-4 px-6 rounded-2xl font-bold font-serif text-sm sm:text-base shadow-lg hover:shadow-xl active:scale-98 transition-all flex items-center justify-between border border-white/20"
              >
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5 text-white" />
                  <span>{quantity > 0 ? "Savatga yana qo'shish" : "Savatga qo'shish"}</span>
                </div>

                <span className="font-extrabold font-sans text-sm sm:text-base bg-white/20 px-3 py-1 rounded-xl backdrop-blur-xs">
                  {formatUZS(calculatedTotal)}
                </span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="flex-1 bg-gray-200 text-gray-500 py-4 px-6 rounded-2xl font-bold text-sm text-center cursor-not-allowed border border-gray-300"
              >
                🔴 Vaqtincha sotuvda tugagan
              </button>
            )}
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductDetailModal;
