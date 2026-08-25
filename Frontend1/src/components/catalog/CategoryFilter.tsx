import React from 'react';
import { useTranslation } from 'react-i18next';
import type { FilterCategory } from '../../types';
import { Search, Sparkles, X } from 'lucide-react';
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
  const { t } = useTranslation();

  const getCategoryLabel = (cat: FilterCategory): string => {
    switch (cat) {
      case 'Barchasi': return t('categories.all');
      case 'Tortlar': return t('categories.cakes');
      case 'Pirojniylar': return t('categories.pastries');
      case 'Art Desertlar': return t('categories.art_desserts');
      case 'Korpus Pirojniylar': return t('categories.mousse_cakes');
      default: return cat;
    }
  };

  return (
    <div className="space-y-4 my-6 select-none">
      
      {/* Search Bar & Title Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-serif text-[#2B1810] tracking-tight flex items-center gap-2">
            <span>{t('hero.menu_btn')}</span>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
          </h2>
          <p className="text-xs sm:text-sm text-[#6B5B52] mt-0.5">
            {t('hero.subtitle')}
          </p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B5B52]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('categories.search_placeholder')}
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-[#2B1810]/10 rounded-2xl text-xs sm:text-sm text-[#2B1810] placeholder-[#6B5B52]/60 focus:outline-none focus:ring-2 focus:ring-[#D65B78]/40 focus:border-[#D65B78] shadow-sm transition-all touch-manipulation"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[#6B5B52] hover:text-[#2B1810] transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Pills Horizontal Scroll with no-scrollbar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                triggerSelectionHaptic();
                onSelectCategory(cat);
              }}
              className={`min-h-[38px] px-3.5 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 shadow-sm touch-manipulation ${
                isActive
                  ? 'bg-[#2B1810] text-[#FAF6F0] border-2 border-[#CBB279] shadow-dinora-subtle scale-102 font-bold'
                  : 'bg-white text-[#6B5B52] border border-[#2B1810]/10 hover:bg-[#F8E7EA] hover:text-[#2B1810]'
              }`}
            >
              {cat === 'Barchasi' && '✨ '}
              {getCategoryLabel(cat)}
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default CategoryFilter;
