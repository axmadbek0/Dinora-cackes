import React from 'react';
import { Product } from '../../../types/product.types';
import { StockToggle } from './StockToggle';
import { Edit2, Trash2, Tag, Image as ImageIcon } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { getImageUrl } from '../../../utils/imageUrl';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  const formatMoney = (amount: number | string) => {
    return new Intl.NumberFormat('uz-UZ').format(Number(amount)) + " so'm";
  };

  return (
    <div className="group rounded-2xl bg-white border border-dinora-border shadow-dinora overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-dinora-hover hover:-translate-y-1">
      {/* Product Image Container */}
      <div className="relative h-48 w-full bg-dinora-bg overflow-hidden">
        {product.imageUrl ? (
          <img
            src={getImageUrl(product.imageUrl)}
            alt={product.name || product.title}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/logotip.png';
            }}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-dinora-gray/50">
            <ImageIcon className="w-12 h-12" />
          </div>
        )}

        {/* Category Badge Overlay */}
        {product.category && (
          <div className="absolute top-3 left-3 bg-dinora-chocolate/80 backdrop-blur-md text-dinora-gold text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-dinora-gold/30">
            <Tag className="w-3 h-3" />
            <span>{product.category.name}</span>
          </div>
        )}
      </div>

      {/* Product Info Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-base font-bold text-dinora-chocolate font-serif line-clamp-1">
              {product.name || product.title}
            </h4>
          </div>
          <p className="text-xs text-dinora-gray mt-1 line-clamp-2 min-h-[32px]">
            {product.description || "Tavsif berilmagan"}
          </p>
        </div>

        {/* Price & Stock Status */}
        <div className="pt-2 border-t border-dinora-border/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-dinora-gray block">Narx</span>
            <span className="text-base font-extrabold text-dinora-chocolate font-serif">
              {formatMoney(product.price)}
            </span>
          </div>

          <StockToggle productId={product.id} isAvailable={product.isAvailable} />
        </div>
      </div>

      {/* Card Actions */}
      <div className="px-5 py-3 bg-dinora-bg/50 border-t border-dinora-border flex items-center justify-end gap-2">
        <Button
          variant="secondary"
          size="sm"
          icon={<Edit2 className="w-3.5 h-3.5" />}
          onClick={() => onEdit(product)}
        >
          Tahrirlash
        </Button>
        <Button
          variant="danger"
          size="sm"
          icon={<Trash2 className="w-3.5 h-3.5" />}
          onClick={() => onDelete(product.id)}
        >
          O'chirish
        </Button>
      </div>
    </div>
  );
};
