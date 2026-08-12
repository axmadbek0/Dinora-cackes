import React, { useState } from 'react';
import {
  useProducts,
  useCategories,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from './hooks/useProducts';
import { ProductCard } from './components/ProductCard';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductModal } from './components/ProductModal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Product, CreateProductDTO } from '../../types/product.types';
import { Plus, Search, Loader2, PackageX } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useProducts({
    categoryId: selectedCategoryId,
    search: search || undefined,
  });

  const { data: categories = [] } = useCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Haqiqatdan ham ushbu mahsulotni o'chirmoqchimisiz?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (dto: CreateProductDTO) => {
    if (editingProduct) {
      updateMutation.mutate(
        { id: editingProduct.id, dto },
        {
          onSuccess: () => setIsModalOpen(false),
        }
      );
    } else {
      createMutation.mutate(dto, {
        onSuccess: () => setIsModalOpen(false),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Search, Category Filter & Add Product Button */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-dinora-border shadow-dinora">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Mahsulot nomi bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button variant="gold" icon={<Plus className="w-4 h-4" />} onClick={handleOpenAddModal}>
            Yangi Mahsulot
          </Button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <CategoryFilter
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />

      {/* Product Catalog Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-10 h-10 text-dinora-gold animate-spin mb-3" />
          <p className="text-sm font-medium text-dinora-chocolate">Katalog yuklanmoqda...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dinora-border shadow-dinora max-w-md mx-auto my-8">
          <PackageX className="w-16 h-16 text-dinora-gray/40 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-dinora-chocolate font-serif">Mahsulot topilmadi</h3>
          <p className="text-xs text-dinora-gray mt-1">
            Qidiruv so'roviga mos keluvchi mahsulotlar hozircha mavjud emas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleOpenEditModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        product={editingProduct}
        categories={categories}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};
