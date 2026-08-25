import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '../context/CartContext';
import { AnnouncementBar } from '../components/layout/AnnouncementBar';
import { Header } from '../components/layout/Header';
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { HeroSection } from '../components/layout/HeroSection';
import { CategoryFilter } from '../components/catalog/CategoryFilter';
import { ProductCard } from '../components/catalog/ProductCard';
import { ProductDetailModal } from '../components/catalog/ProductDetailModal';
import { CustomCakeFullScreenModal } from '../components/custom-cake/CustomCakeFullScreenModal';
import { CartFullScreenModal } from '../components/cart/CartFullScreenModal';
import { MasterCertificateCard } from '../components/certificate/MasterCertificateCard';
import { LocationSection } from '../components/location/LocationSection';
import { DeliveryPricingSection } from '../components/delivery/DeliveryPricingSection';
import { ContactSection } from '../components/contact/ContactSection';
import { Footer } from '../components/layout/Footer';
import { OrderTrackingModal } from '../components/orderTracking/OrderTrackingModal';
import { LiveOrderNotifier } from '../components/orderTracking/LiveOrderNotifier';
import { LiveOnlineVisitors } from '../components/live/LiveOnlineVisitors';
import { fetchProducts } from '../services/api';
import type { FilterCategory, Product } from '../types';
import { Cake, Sparkles } from 'lucide-react';

const FILTER_CATEGORIES: FilterCategory[] = [
  'Barchasi',
  'Tortlar',
  'Pirojniylar',
  'Art Desertlar',
  'Korpus Pirojniylar',
];

export const StorefrontLayout: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { isCartOpen, setIsCartOpen } = useCart();

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

  // If path is /cart, open the cart automatically
  useEffect(() => {
    if (location.pathname === '/cart') {
      setIsCartOpen(true);
    }
  }, [location.pathname, setIsCartOpen]);

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
        else if (activeCategory === 'Pirojniylar') matchesCategory = product.categoryId === 'cat-2' || product.name.toLowerCase().includes('pirojniy') || product.name.toLowerCase().includes('pastry');
        else if (activeCategory === 'Art Desertlar') matchesCategory = product.categoryId === 'cat-3' || product.name.toLowerCase().includes('art') || product.name.toLowerCase().includes('desert');
        else if (activeCategory === 'Korpus Pirojniylar') matchesCategory = product.categoryId === 'cat-4' || product.name.toLowerCase().includes('korpus') || product.name.toLowerCase().includes('mousse');
      }

      let matchesSearch = true;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        matchesSearch =
          product.name.toLowerCase().includes(q) ||
          (product.description?.toLowerCase() || '').includes(q);
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
    <div className="min-h-screen bg-dinora-bg text-dinora-mocha flex flex-col font-sans selection:bg-dinora-gold/30 selection:text-dinora-mocha pb-24 md:pb-0 overflow-x-hidden">
      {/* Top Announcement Bar */}
      <AnnouncementBar />

      {/* Main Header / Navigation */}
      <Header
        onOpenCustomCake={() => setIsCustomCakeOpen(true)}
        onOpenOrdersTrack={() => setIsOrderTrackOpen(true)}
        onNavigateSection={handleNavigateSection}
      />

      {/* Main Page Body */}
      <main className="flex-1">
        {/* Luxury Hero Showcase */}
        <HeroSection
          onOpenCustomCake={() => setIsCustomCakeOpen(true)}
          onNavigateSection={handleNavigateSection}
        />

        {/* Catalog Section */}
        <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dinora-gold/15 text-dinora-mocha text-xs font-bold uppercase tracking-wider mb-2 border border-dinora-gold/30">
                <Sparkles className="w-3.5 h-3.5 text-dinora-gold" />
                <span>Eksklyuziv Kolleksiya</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold font-serif text-dinora-mocha">
                {t('catalog.title', 'Bizning Shirinliklar')}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-dinora-taupe">
              {filteredProducts.length} {t('catalog.products_count', 'ta mahsulot mavjud')}
            </p>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="mb-6 sm:mb-8">
            <CategoryFilter
              categories={FILTER_CATEGORIES}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>

          {/* Product Grid / Loading / Empty States */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white/60 rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-dinora-mocha/5 animate-pulse flex flex-col gap-3"
                >
                  <div className="w-full aspect-square bg-dinora-gold/10 rounded-xl sm:rounded-2xl" />
                  <div className="h-4 bg-dinora-gold/15 rounded-md w-3/4" />
                  <div className="h-3 bg-dinora-gold/10 rounded-md w-1/2" />
                  <div className="h-6 bg-dinora-gold/20 rounded-lg w-full mt-auto" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white/40 rounded-3xl border border-dinora-mocha/5 max-w-md mx-auto my-8">
              <div className="w-16 h-16 rounded-full bg-dinora-gold/10 flex items-center justify-center mx-auto mb-4 text-dinora-gold">
                <Cake className="w-8 h-8 opacity-60" />
              </div>
              <h3 className="text-lg font-bold text-dinora-mocha mb-1 font-serif">
                {t('catalog.empty_title', 'Mahsulotlar topilmadi')}
              </h3>
              <p className="text-xs text-dinora-taupe mb-4">
                {t('catalog.empty_desc', 'Boshqa kategoriya yoki qidiruv so`zini sinab ko`ring')}
              </p>
              <button
                onClick={() => {
                  setActiveCategory('Barchasi');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-dinora-gold/20 text-dinora-mocha text-xs font-bold hover:bg-dinora-gold/30 transition-colors"
              >
                {t('catalog.reset_filter', 'Filtrlarni tozalash')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetails={setSelectedProduct}
                />
              ))}
            </div>
          )}
        </section>

        {/* Master Confectioner Certificate Section */}
        <MasterCertificateCard />

        {/* Location & Map Section */}
        <LocationSection />

        {/* Fast & Safe Delivery Calculator Section */}
        <DeliveryPricingSection />

        {/* Contact & Telegram Channel Section */}
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Sticky Bottom Navigation Bar (< 768px) */}
      <BottomNavigation
        onOpenCustomCake={() => setIsCustomCakeOpen(true)}
        onOpenOrdersTrack={() => setIsOrderTrackOpen(true)}
        onNavigateCatalog={() => handleNavigateSection('catalog')}
      />

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
      <CartFullScreenModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderCreated={() => {
          setIsOrderTrackOpen(true);
        }}
      />

      {/* Live Realtime Web Notification Banner */}
      <LiveOrderNotifier />

      {/* Live Online Customer Visitors Tracker */}
      <LiveOnlineVisitors />

      {/* Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isOrderTrackOpenInternal}
        onClose={() => setIsOrderTrackOpen(false)}
      />
    </div>
  );
};
