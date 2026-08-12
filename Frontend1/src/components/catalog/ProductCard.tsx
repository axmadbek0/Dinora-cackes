import React, { useState } from 'react';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { formatUZS } from '../../utils/formatters';
import { Plus, Minus, Info, Ban } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { getItemQuantity, addToCart, updateQuantity } = useCart();
  const quantity = getItemQuantity(product.id);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-3xl overflow-hidden border border-[#2B1810]/5 shadow-dinora-subtle flex flex-col justify-between group relative"
    >
      {/* Image & Badges Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#FAF6F0] cursor-pointer" onClick={() => onOpenDetails(product)}>
        
        {/* Skeleton loader while loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF6F0] via-white to-[#FAF6F0] animate-shimmer" />
        )}

        <img
          src={product.imageUrl || '/carts/logotip.jpg'}
          alt={product.name}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } ${!product.isAvailable ? 'grayscale brightness-90' : ''}`}
        />

        {/* Info button hover overlay */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(product);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-[#2B1810] flex items-center justify-center shadow-md hover:bg-[#F8E7EA] hover:text-[#D65B78] transition-colors"
          title="Tarkibi va ma'lumot"
        >
          <Info className="w-4 h-4" />
        </button>

        {/* Portion / Weight Badge */}
        {product.portion && (
          <span className="absolute bottom-3 left-3 bg-[#2B1810]/80 backdrop-blur-sm text-[#FAF6F0] text-[10px] font-semibold px-2.5 py-1 rounded-full border border-white/20">
            {product.portion}
          </span>
        )}

        {/* Stock Status Badge */}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-[#2B1810]/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-4 text-center">
            <span className="bg-[#D65B78] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center space-x-1">
              <Ban className="w-3.5 h-3.5" />
              <span>🔴 Vaqtincha tugagan</span>
            </span>
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 
            onClick={() => onOpenDetails(product)}
            className="font-bold text-base sm:text-lg text-[#2B1810] line-clamp-1 cursor-pointer hover:text-[#D65B78] transition-colors"
          >
            {product.name}
          </h3>

          {product.description && (
            <p className="text-xs text-[#6B5B52] line-clamp-2 mt-1 leading-relaxed">
              {product.description}
            </p>
          )}

          {product.ingredients && (
            <p className="text-[11px] font-serif italic text-[#CBB279] line-clamp-1 mt-1">
              🌿 {product.ingredients}
            </p>
          )}
        </div>

        {/* Price & Cart Actions */}
        <div className="mt-4 pt-3 border-t border-[#2B1810]/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#6B5B52] block uppercase font-medium">Narxi</span>
            <span className="text-base sm:text-lg font-extrabold text-[#D65B78]">
              {formatUZS(product.price)}
            </span>
          </div>

          {/* Cart Quantity Picker or Add Button */}
          {product.isAvailable ? (
            quantity > 0 ? (
              <div className="flex items-center space-x-2 bg-[#F8E7EA] rounded-2xl p-1 border border-[#D65B78]/30">
                <button
                  onClick={() => updateQuantity(product.id, -1)}
                  className="w-7 h-7 rounded-xl bg-white text-[#2B1810] flex items-center justify-center font-bold text-sm shadow-sm active:scale-90 transition-transform"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-[#2B1810] px-1 min-w-[1.25rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => updateQuantity(product.id, 1)}
                  className="w-7 h-7 rounded-xl bg-[#D65B78] text-white flex items-center justify-center font-bold text-sm shadow-sm active:scale-90 transition-transform"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(product)}
                className="bg-[#2B1810] hover:bg-[#3D2318] text-[#FAF6F0] px-3.5 py-2 rounded-2xl text-xs font-bold shadow-sm flex items-center space-x-1.5 active:scale-95 transition-all border border-[#CBB279]/30"
              >
                <Plus className="w-4 h-4 text-[#D65B78]" />
                <span>Savatga</span>
              </button>
            )
          ) : (
            <button
              disabled
              className="bg-gray-100 text-gray-400 px-3 py-2 rounded-2xl text-xs font-medium cursor-not-allowed"
            >
              Mavjud emas
            </button>
          )}
        </div>

      </div>
    </motion.div>
  );
};
