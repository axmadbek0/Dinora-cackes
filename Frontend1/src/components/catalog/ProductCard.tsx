import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { formatUZS } from '../../utils/formatters';
import { triggerHaptic, triggerSelectionHaptic } from '../../utils/haptics';
import { getLocalizedField } from '../../utils/localized';
import { getImageUrl } from '../../utils/imageUrl';
import { Plus, Minus, Info, Ban } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { t, i18n } = useTranslation();
  const { getItemQuantity, addToCart, updateQuantity } = useCart();
  const quantity = getItemQuantity(product.id);
  const [imageLoaded, setImageLoaded] = useState(false);

  const localizedName = getLocalizedField(product, 'name', i18n.language) || product.name;
  const localizedDescription = getLocalizedField(product, 'description', i18n.language) || product.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-[#2B1810]/5 shadow-dinora-subtle flex flex-col justify-between group relative select-none"
    >
      {/* Image & Badges Container */}
      <div
        className="relative aspect-square w-full overflow-hidden bg-[#FAF6F0] cursor-pointer touch-manipulation"
        onClick={() => {
          triggerSelectionHaptic();
          onOpenDetails(product);
        }}
      >
        {/* Skeleton loader while loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF6F0] via-white to-[#FAF6F0] animate-shimmer" />
        )}

        <img
          src={getImageUrl(product.imageUrl, '/products/logotip.png')}
          alt={localizedName}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/products/logotip.png';
            setImageLoaded(true);
          }}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } ${!product.isAvailable ? 'grayscale brightness-90' : ''}`}
        />

        {/* Info button hover overlay */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            triggerHaptic('light');
            onOpenDetails(product);
          }}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-md text-[#2B1810] flex items-center justify-center shadow-md hover:bg-[#F8E7EA] hover:text-[#D65B78] transition-colors touch-manipulation"
          title={t('product.details')}
        >
          <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Portion / Weight Badge */}
        {product.portion && (
          <span className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-[#2B1810]/80 backdrop-blur-sm text-[#FAF6F0] text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-white/20">
            {product.portion}
          </span>
        )}

        {/* Stock Status Badge */}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-[#2B1810]/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-2 text-center">
            <span className="bg-[#D65B78] text-white px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-md flex items-center space-x-1">
              <Ban className="w-3 h-3" />
              <span>{t('product.out_of_stock')}</span>
            </span>
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-3 sm:p-4 md:p-5 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <h3 
            onClick={() => {
              triggerSelectionHaptic();
              onOpenDetails(product);
            }}
            className="font-bold text-xs sm:text-sm md:text-base text-[#2B1810] line-clamp-1 cursor-pointer hover:text-[#D65B78] transition-colors font-serif"
          >
            {localizedName}
          </h3>

          {localizedDescription && (
            <p className="text-[11px] sm:text-xs text-[#6B5B52] line-clamp-2 mt-0.5 leading-relaxed hidden xs:block">
              {localizedDescription}
            </p>
          )}

          {product.ingredients && (
            <p className="text-[10px] sm:text-[11px] font-serif italic text-[#CBB279] line-clamp-1 mt-0.5 hidden sm:block">
              🌿 {product.ingredients}
            </p>
          )}
        </div>

        {/* Price & Cart Actions */}
        <div className="pt-2 border-t border-[#2B1810]/5 flex items-center justify-between gap-1">
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] text-[#6B5B52] block uppercase font-medium">
              {t('cart.total_amount').replace(':', '')}
            </span>
            <span className="text-xs sm:text-sm md:text-base font-extrabold text-[#D65B78] truncate block">
              {formatUZS(product.price)}
            </span>
          </div>

          {/* Cart Quantity Picker or Add Button */}
          {product.isAvailable ? (
            quantity > 0 ? (
              <div className="flex items-center space-x-1 bg-[#F8E7EA] rounded-xl p-0.5 sm:p-1 border border-[#D65B78]/30 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    updateQuantity(product.id, -1);
                  }}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white text-[#2B1810] flex items-center justify-center font-bold text-xs shadow-sm active:scale-90 transition-transform touch-manipulation"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-[11px] sm:text-xs font-bold text-[#2B1810] px-1 min-w-[1rem] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    updateQuantity(product.id, 1);
                  }}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#D65B78] text-white flex items-center justify-center font-bold text-xs shadow-sm active:scale-90 transition-transform touch-manipulation"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  addToCart(product);
                }}
                className="min-h-[36px] bg-[#2B1810] hover:bg-[#3D2318] text-[#FAF6F0] px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold shadow-sm flex items-center space-x-1 active:scale-95 transition-all border border-[#CBB279]/30 shrink-0 touch-manipulation"
              >
                <Plus className="w-3.5 h-3.5 text-[#D65B78]" />
                <span className="hidden xs:inline">{t('product.add_to_cart')}</span>
              </button>
            )
          ) : (
            <button
              type="button"
              disabled
              className="bg-gray-100 text-gray-400 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-medium cursor-not-allowed shrink-0"
            >
              {t('product.out_of_stock')}
            </button>
          )}
        </div>

      </div>
    </motion.div>
  );
};

export default ProductCard;
