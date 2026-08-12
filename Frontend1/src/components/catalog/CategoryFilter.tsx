import React from 'react';
import type { FilterCategory } from '../../types';
import { Search, Sparkles } from 'lucide-react';
import { triggerSelectionHaptic } from '../../utils/haptics';

interface CategoryFilterProps {
  categories: FilterCategory[];
  activeCategory: FilterCategory;
  onSelectCategory: (category: FilterCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="space-y-4 my-6">
      
      {/* Search Bar & Title */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#2B1810] tracking-tight flex items-center gap-2">
            <span>Shirinliklar Menyusi</span>
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
          </h2>
          <p className="text-xs sm:text-sm text-[#6B5B52] mt-0.5">
            Tabiiy sarxil masalliqlardan tayyorlangan eksklyuziv pishiriqlar
          </p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B5B52]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Pirojniy, tort yoki desert qidirish..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#2B1810]/10 rounded-2xl text-sm text-[#2B1810] placeholder-[#6B5B52]/60 focus:outline-none focus:ring-2 focus:ring-[#D65B78]/40 focus:border-[#D65B78] shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6B5B52] hover:text-[#2B1810]"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Pills Horizontal Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                triggerSelectionHaptic();
                onSelectCategory(cat);
              }}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 shadow-sm ${
                isActive
                  ? 'bg-[#2B1810] text-[#FAF6F0] border-2 border-[#CBB279] shadow-dinora-subtle scale-102'
                  : 'bg-white text-[#6B5B52] border border-[#2B1810]/10 hover:bg-[#F8E7EA] hover:text-[#2B1810]'
              }`}
            >
              {cat === 'Barchasi' && '✨ '}
              {cat}
            </button>
          );
        })}
      </div>

    </div>
  );
};
