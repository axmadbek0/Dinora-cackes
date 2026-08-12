import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CartProvider, useCart } from './context/CartContext';
import { TelegramProvider } from './context/TelegramContext';
import ErrorBoundary from './components/ErrorBoundary';
import { AnnouncementBar } from './components/layout/AnnouncementBar';
import { Header } from './components/layout/Header';
import { HeroSection } from './components/layout/HeroSection';
import { CategoryFilter } from './components/catalog/CategoryFilter';
import { ProductCard } from './components/catalog/ProductCard';
import { ProductDetailModal } from './components/catalog/ProductDetailModal';
import { CustomCakeFullScreenModal } from './components/custom-cake/CustomCakeFullScreenModal';
import { CartFullScreenModal } from './components/cart/CartFullScreenModal';
import { MasterCertificateCard } from './components/certificate/MasterCertificateCard';
import { LocationSection } from './components/location/LocationSection';
import { ContactSection } from './components/contact/ContactSection';
import { Footer } from './components/layout/Footer';
import { FloatingCartButton } from './components/layout/FloatingCartButton';
import { OrderTrackingModal } from './components/orderTracking/OrderTrackingModal';
import { fetchProducts } from './services/api';
import type { FilterCategory, Product } from './types';
import { Cake, Sparkles } from 'lucide-react';

const FILTER_CATEGORIES: FilterCategory[] = [
  'Barchasi',
  'Tortlar',
  'Pirojniylar',
  'Art Desertlar',
  'Korpus Pirojniylar',
];

const MainStorefront: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('Barchasi');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [selectedProductInternal, setSelectedProductInternal] = useState<Product | null>(null);
  const [isCustomCakeOpenInternal, setIsCustomCakeOpenInternal] = useState(() => {
    return new URLSearchParams(window.location.search).get('modal') === 'custom-cake';
  });
  const [isOrderTrackOpenInternal, setIsOrderTrackOpenInternal] = useState(() => {
    return new URLSearchParams(window.location.search).get('modal') === 'track';
  });

  const updateUrlParam = (key: string, value: string | null) => {
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set(key, value);
    } else {
      if (url.searchParams.has(key)) url.searchParams.delete(key);
    }
    window.history.replaceState({}, '', url);
  };

  const setSelectedProduct = (product: Product | null) => {
    setSelectedProductInternal(product);
    updateUrlParam('product', product ? product.id : null);
  };
  
  const setIsCustomCakeOpen = (isOpen: boolean) => {
    setIsCustomCakeOpenInternal(isOpen);
    updateUrlParam('modal', isOpen ? 'custom-cake' : null);
  };

  const setIsOrderTrackOpen = (isOpen: boolean) => {
    setIsOrderTrackOpenInternal(isOpen);
    updateUrlParam('modal', isOpen ? 'track' : null);
  };

  // TanStack Query to fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchProducts(),
  });

  // Direct URL parameter product lookup for shared links
  useEffect(() => {
    if (products.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const productId = params.get('product');
      if (productId) {
        const found = products.find((p) => p.id === productId);
        if (found) {
          setSelectedProductInternal(found);
        }
      }
    }
  }, [products]);

  // Filter & Search logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      let matchesCategory = true;
      if (activeCategory !== 'Barchasi') {
        if (activeCategory === 'Tortlar') matchesCategory = product.categoryId === 'cat-1' || product.name.toLowerCase().includes('tort') || product.name.toLowerCase().includes('cake');
        else if (activeCategory === 'Pirojniylar') matchesCategory = product.categoryId === 'cat-2' || product.name.toLowerCase().includes('pirojniy') || product.name.toLowerCase().includes('shu') || product.name.toLowerCase().includes('ekler');
        else if (activeCategory === 'Art Desertlar') matchesCategory = product.categoryId === 'cat-3' || product.name.toLowerCase().includes('macaron') || product.name.toLowerCase().includes('art');
        else if (activeCategory === 'Korpus Pirojniylar') matchesCategory = product.categoryId === 'cat-4' || product.name.toLowerCase().includes('korpus') || product.name.toLowerCase().includes('heart') || product.name.toLowerCase().includes('sphere');
      }

      let matchesSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        matchesSearch = Boolean(
          product.name.toLowerCase().includes(q) ||
          (product.description && product.description.toLowerCase().includes(q)) ||
          (product.ingredients && product.ingredients.toLowerCase().includes(q))
        );
      }

      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  const handleNavigateSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col justify-between selection:bg-[#F8E7EA] selection:text-[#D65B78]">
      
      {/* Top Bars & Navigation Header */}
      <div>
        <AnnouncementBar />
        <Header
          onOpenCustomCake={() => setIsCustomCakeOpen(true)}
          onOpenOrdersTrack={() => setIsOrderTrackOpen(true)}
          onNavigateSection={handleNavigateSection}
        />

        {/* Hero Presentation Section */}
        <HeroSection
          onOpenCustomCake={() => setIsCustomCakeOpen(true)}
          onNavigateSection={handleNavigateSection}
        />

        {/* Interactive Product Catalog Container */}
        <main id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          <CategoryFilter
            categories={FILTER_CATEGORIES}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Product Grid / Skeleton Loaders */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 my-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-[#FAF6F0] rounded-3xl p-4 h-96 animate-pulse space-y-4">
                  <div className="bg-[#FAF6F0] h-48 rounded-2xl w-full" />
                  <div className="bg-[#FAF6F0] h-5 rounded-md w-3/4" />
                  <div className="bg-[#FAF6F0] h-4 rounded-md w-1/2" />
                  <div className="bg-[#FAF6F0] h-10 rounded-2xl w-full mt-4" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#2B1810]/5 my-8 p-8 space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#FAF6F0] flex items-center justify-center mx-auto text-[#CBB279]">
                <Cake className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-serif text-[#2B1810]">
                Mahsulot topilmadi
              </h3>
              <p className="text-xs sm:text-sm text-[#6B5B52] max-w-md mx-auto">
                Boshqa nom yoki toifa bo'yicha qidirib ko'ring yoki o'zingiz xohlagandek maxsus tort buyurtma bering!
              </p>
              <button
                onClick={() => {
                  setActiveCategory('Barchasi');
                  setSearchQuery('');
                }}
                className="mt-2 bg-[#2B1810] text-[#FAF6F0] px-5 py-2.5 rounded-2xl text-xs font-bold shadow-sm"
              >
                Barcha menyuni ko'rsatish
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 my-8">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetails={setSelectedProduct}
                />
              ))}
            </div>
          )}

          {/* Custom Cake Builder Banner Callout */}
          <div className="my-16 bg-gradient-to-r from-[#2B1810] via-[#3D2318] to-[#2B1810] text-[#FAF6F0] p-8 sm:p-12 rounded-3xl border-2 border-[#D4AF37] shadow-dinora-gold relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left z-10">
              <div className="flex items-center justify-center md:justify-start space-x-2 text-[#D4AF37] text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-4 h-4" />
                <span>Eksklyuziv Buyurtmalar</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                ✨ O'zim xohlaganimdek (Custom Cake Builder)
              </h3>
              <p className="text-xs sm:text-sm text-[#FAF6F0]/80 max-w-xl">
                Noyob bayram, to'y yoki tug'ilgan kun uchun tort o'yladingizmi? 2 ta rasm yuklang va izohlab bering, DINORA buni san'at asariga aylantiradi.
              </p>
            </div>

            <button
              onClick={() => setIsCustomCakeOpen(true)}
              className="z-10 bg-[#D65B78] hover:bg-[#c24b67] text-white px-8 py-4 rounded-2xl font-bold text-sm sm:text-base shadow-lg active:scale-95 transition-all whitespace-nowrap border border-white/20"
            >
              Tort Dizaynini Yaratish
            </button>
          </div>

        </main>

        {/* Master Confectioner Certificate Section */}
        <MasterCertificateCard />

        {/* Large Prominent Location Section (Sirdaryo Tumani) */}
        <LocationSection />

        {/* Contact & Direct Connect Section */}
        <ContactSection />
      </div>

      {/* Footer */}
      <Footer />

      {/* Floating Mobile Cart Bar */}
      <FloatingCartButton />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductInternal}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Dedicated Full-Screen Custom Cake Builder Modal */}
      <CustomCakeFullScreenModal
        isOpen={isCustomCakeOpenInternal}
        onClose={() => setIsCustomCakeOpen(false)}
      />

      {/* Dedicated Full-Screen Cart View Modal */}
      <ConnectedCartFullScreenModal onOrderCreated={() => {
        setIsOrderTrackOpen(true);
      }} />

      {/* Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isOrderTrackOpenInternal}
        onClose={() => setIsOrderTrackOpen(false)}
      />

    </div>
  );
};

// Connected Full-Screen Cart Modal Helper
const ConnectedCartFullScreenModal: React.FC<{ onOrderCreated: (order: any) => void }> = ({ onOrderCreated }) => {
  const { isCartOpen, setIsCartOpen } = useCart();
  return (
    <CartFullScreenModal
      isOpen={isCartOpen}
      onClose={() => setIsCartOpen(false)}
      onOrderCreated={onOrderCreated}
    />
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <TelegramProvider>
        <CartProvider>
          <MainStorefront />
        </CartProvider>
      </TelegramProvider>
    </ErrorBoundary>
  );
};

export default App;
