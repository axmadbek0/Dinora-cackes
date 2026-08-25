import React from 'react';
import { Category } from '../../../types/product.types';
import { clsx } from 'clsx';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId?: string;
  onSelectCategory: (id?: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => onSelectCategory(undefined)}
        className={clsx(
          'px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shadow-sm',
          !selectedCategoryId || selectedCategoryId === 'cat-all'
            ? 'bg-dinora-chocolate text-white shadow-md'
            : 'bg-white text-dinora-chocolate border border-dinora-border hover:bg-dinora-gold-light/40'
        )}
      >
        Barchasi
      </button>

      {categories
        .filter((c) => c.slug !== 'all')
        .map((cat) => {
          const isSelected = selectedCategoryId === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={clsx(
                'px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shadow-sm',
                isSelected
                  ? 'bg-dinora-chocolate text-white shadow-md'
                  : 'bg-white text-dinora-chocolate border border-dinora-border hover:bg-dinora-gold-light/40'
              )}
            >
              {cat.name}
            </button>
          );
        })}
    </div>
  );
};
