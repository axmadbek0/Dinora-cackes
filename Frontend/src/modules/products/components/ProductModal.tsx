import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Product, Category, CreateProductDTO } from '../../../types/product.types';
import { Image, DollarSign, Tag, FileText, Upload, Link, X, CheckCircle, Globe, Package, Thermometer, Truck } from 'lucide-react';
import { apiClient } from '../../../api/axios.client';
import { getImageUrl } from '../../../utils/imageUrl';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductDTO) => void;
  product?: Product | null;
  categories: Category[];
  isLoading?: boolean;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  product,
  categories,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  
  // Multilingual Names
  const [nameUz, setNameUz] = useState('');
  const [nameUzCyrl, setNameUzCyrl] = useState('');
  const [nameRu, setNameRu] = useState('');

  // Multilingual Descriptions
  const [descriptionUz, setDescriptionUz] = useState('');
  const [descriptionUzCyrl, setDescriptionUzCyrl] = useState('');
  const [descriptionRu, setDescriptionRu] = useState('');

  // Active language tab for inputs
  const [activeLangTab, setActiveLangTab] = useState<'uz' | 'uz-Cyrl' | 'ru'>('uz');

  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Product extra fields
  const [ingredients, setIngredients] = useState('');
  const [storageConditions, setStorageConditions] = useState('');
  const [deliveryTerms, setDeliveryTerms] = useState('');

  // Image upload state
  const [imageMode, setImageMode] = useState<'url' | 'file'>('url');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadSuccess, setImageUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const validCats = categories.filter((c) => c.id !== 'cat-all');
    const defaultCatId = validCats[0]?.id || 'cat-1';

    if (product) {
      setNameUz(product.nameUz || product.name || (product as any).title || '');
      setNameUzCyrl(product.nameUzCyrl || '');
      setNameRu(product.nameRu || '');

      setDescriptionUz(product.descriptionUz || product.description || '');
      setDescriptionUzCyrl(product.descriptionUzCyrl || '');
      setDescriptionRu(product.descriptionRu || '');

      setIngredients((product as any).ingredients || '');
      setStorageConditions((product as any).storageConditions || '');
      setDeliveryTerms((product as any).deliveryTerms || '');

      setPrice(String(product.price));
      setImageUrl(product.imageUrl || '');
      setImagePreview(product.imageUrl || null);
      setCategoryId(product.categoryId && product.categoryId !== 'cat-all' ? product.categoryId : defaultCatId);
      setIsAvailable(product.isAvailable ?? true);
      setImageMode(product.imageUrl ? 'url' : 'url');
    } else {
      setNameUz('');
      setNameUzCyrl('');
      setNameRu('');
      setDescriptionUz('');
      setDescriptionUzCyrl('');
      setDescriptionRu('');
      setIngredients('');
      setStorageConditions('');
      setDeliveryTerms('');
      setPrice('');
      setImageUrl('');
      setImagePreview(null);
      setCategoryId(defaultCatId);
      setIsAvailable(true);
      setImageMode('url');
    }
    setErrors({});
    setImageUploadSuccess(false);
  }, [product, categories, isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: "Rasm hajmi 5 MB dan oshmasligi kerak" }));
      return;
    }

    setErrors(prev => {
      const n = { ...prev };
      delete n.image;
      return n;
    });

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      setImagePreview(base64);
      setImageUploading(true);
      setImageUploadSuccess(false);

      try {
        const response = await apiClient.post('/products/upload-image', {
          imageBase64: base64,
          fileName: file.name.replace(/\.[^.]+$/, ''),
        });
        const uploadedUrl = response.data?.data?.imageUrl;
        if (uploadedUrl) {
          setImageUrl(uploadedUrl);
          setImageUploadSuccess(true);
        } else {
          throw new Error('URL qaytmadi');
        }
      } catch (err) {
        setImageUrl(base64);
        setImageUploadSuccess(true);
        console.warn('Image upload to server failed, using base64');
      } finally {
        setImageUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageUrl('');
    setImagePreview(null);
    setImageUploadSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!nameUz.trim()) {
      newErrors.name = "Mahsulot nomi (O'zbekcha Lotin) kiritilishi shart";
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = "To'g'ri narx kiriting (musbat son)";
    }
    if (!categoryId) {
      newErrors.categoryId = 'Toifani tanlang';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: nameUz.trim(),
      nameUz: nameUz.trim(),
      nameUzCyrl: nameUzCyrl.trim() || undefined,
      nameRu: nameRu.trim() || undefined,
      description: descriptionUz.trim() || undefined,
      descriptionUz: descriptionUz.trim() || undefined,
      descriptionUzCyrl: descriptionUzCyrl.trim() || undefined,
      descriptionRu: descriptionRu.trim() || undefined,
      price: Number(price),
      imageUrl: imageUrl.trim() || undefined,
      categoryId,
      isAvailable,
      ingredients: ingredients.trim() || undefined,
      storageConditions: storageConditions.trim() || undefined,
      deliveryTerms: deliveryTerms.trim() || undefined,
    } as any);
  };

  const isEdit = !!product;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Mahsulotni Tahrirlash" : "Yangi Mahsulot Qo'shish"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Language Tabs Selector */}
        <div className="bg-dinora-bg p-2 rounded-2xl border border-dinora-border">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[11px] font-bold text-dinora-chocolate uppercase tracking-wider flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-dinora-pink" />
              <span>Til bo'yicha ma'lumotlar</span>
            </span>
            <span className="text-[10px] text-dinora-gray">
              {activeLangTab === 'uz' ? "Lotin (Asosiy)" : activeLangTab === 'uz-Cyrl' ? "Кирилл" : "Русский"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setActiveLangTab('uz')}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
                activeLangTab === 'uz'
                  ? 'bg-dinora-chocolate text-white shadow-sm'
                  : 'bg-white text-dinora-chocolate hover:bg-dinora-pink-light'
              }`}
            >
              <span>🇺🇿</span>
              <span>O'zbekcha</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLangTab('uz-Cyrl')}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
                activeLangTab === 'uz-Cyrl'
                  ? 'bg-dinora-chocolate text-white shadow-sm'
                  : 'bg-white text-dinora-chocolate hover:bg-dinora-pink-light'
              }`}
            >
              <span>🇺🇿</span>
              <span>Ўзбекча</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLangTab('ru')}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
                activeLangTab === 'ru'
                  ? 'bg-dinora-chocolate text-white shadow-sm'
                  : 'bg-white text-dinora-chocolate hover:bg-dinora-pink-light'
              }`}
            >
              <span>🇷🇺</span>
              <span>Русский</span>
            </button>
          </div>
        </div>

        {/* Localized Name & Description Inputs based on Active Tab */}
        {activeLangTab === 'uz' && (
          <div className="space-y-3 p-3.5 bg-white rounded-2xl border border-dinora-border shadow-xs">
            <Input
              label="Mahsulot nomi (O'zbekcha Lotin) *"
              placeholder="Masalan: Qulupnayli Royal Tort"
              value={nameUz}
              onChange={(e) => setNameUz(e.target.value)}
              error={errors.name}
              required
            />
            <div>
              <label className="block text-xs font-semibold text-dinora-chocolate uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-dinora-gold" />
                <span>Mahsulot Tavsifi (O'zbekcha Lotin)</span>
              </label>
              <textarea
                rows={3}
                value={descriptionUz}
                onChange={(e) => setDescriptionUz(e.target.value)}
                placeholder="Tarkibi va ta'mi haqida qisqacha ma'lumot..."
                className="w-full rounded-xl border border-dinora-border bg-white p-3 text-sm text-dinora-chocolate focus:border-dinora-gold focus:outline-none focus:ring-2 focus:ring-dinora-gold/30 resize-none"
              />
            </div>
          </div>
        )}

        {activeLangTab === 'uz-Cyrl' && (
          <div className="space-y-3 p-3.5 bg-white rounded-2xl border border-dinora-border shadow-xs">
            <Input
              label="Маҳсулот номи (Ўзбекча Кирилл)"
              placeholder="Масалан: Қулупнайли Роял Торт"
              value={nameUzCyrl}
              onChange={(e) => setNameUzCyrl(e.target.value)}
            />
            <div>
              <label className="block text-xs font-semibold text-dinora-chocolate uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-dinora-gold" />
                <span>Маҳсулот Тавсифи (Ўзбекча Кирилл)</span>
              </label>
              <textarea
                rows={3}
                value={descriptionUzCyrl}
                onChange={(e) => setDescriptionUzCyrl(e.target.value)}
                placeholder="Таркиби ва таъми ҳақида қисқача маълумот..."
                className="w-full rounded-xl border border-dinora-border bg-white p-3 text-sm text-dinora-chocolate focus:border-dinora-gold focus:outline-none focus:ring-2 focus:ring-dinora-gold/30 resize-none"
              />
            </div>
          </div>
        )}

        {activeLangTab === 'ru' && (
          <div className="space-y-3 p-3.5 bg-white rounded-2xl border border-dinora-border shadow-xs">
            <Input
              label="Название товара (Русский)"
              placeholder="Например: Клубничный Роял Торт"
              value={nameRu}
              onChange={(e) => setNameRu(e.target.value)}
            />
            <div>
              <label className="block text-xs font-semibold text-dinora-chocolate uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-dinora-gold" />
                <span>Описание товара (Русский)</span>
              </label>
              <textarea
                rows={3}
                value={descriptionRu}
                onChange={(e) => setDescriptionRu(e.target.value)}
                placeholder="Краткое описание вкуса и ингредиентов..."
                className="w-full rounded-xl border border-dinora-border bg-white p-3 text-sm text-dinora-chocolate focus:border-dinora-gold focus:outline-none focus:ring-2 focus:ring-dinora-gold/30 resize-none"
              />
            </div>
          </div>
        )}

        {/* Category and Price Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-dinora-chocolate uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-dinora-gold" />
              <span>Toifasi *</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl border border-dinora-border bg-white px-3.5 py-2.5 text-sm text-dinora-chocolate focus:border-dinora-gold focus:outline-none focus:ring-2 focus:ring-dinora-gold/30"
              required
            >
              {categories
                .filter((c) => c.id !== 'cat-all')
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-xs text-dinora-pink">{errors.categoryId}</p>
            )}
          </div>

          <Input
            label="Narxi (UZS) *"
            type="number"
            placeholder="Masalan: 120000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            error={errors.price}
            leftIcon={<DollarSign className="w-4 h-4" />}
            required
          />
        </div>

        {/* Image Section */}
        <div>
          <label className="block text-xs font-semibold text-dinora-chocolate uppercase tracking-wider mb-2 flex items-center gap-1">
            <Image className="w-3.5 h-3.5 text-dinora-gold" />
            <span>Mahsulot Rasmi</span>
          </label>

          {/* Mode toggle tabs */}
          <div className="flex rounded-xl overflow-hidden border border-dinora-border mb-3">
            <button
              type="button"
              onClick={() => setImageMode('url')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-colors ${
                imageMode === 'url'
                  ? 'bg-dinora-gold text-white'
                  : 'bg-white text-dinora-chocolate hover:bg-dinora-bg'
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              URL orqali
            </button>
            <button
              type="button"
              onClick={() => setImageMode('file')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-colors ${
                imageMode === 'file'
                  ? 'bg-dinora-gold text-white'
                  : 'bg-white text-dinora-chocolate hover:bg-dinora-bg'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Fayldan yuklash
            </button>
          </div>

          {imageMode === 'url' ? (
            <Input
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setImagePreview(e.target.value || null);
              }}
              leftIcon={<Link className="w-4 h-4" />}
              helperText="Mahsulot rasmi uchun havola manzilini kiriting"
            />
          ) : (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                className="hidden"
                id="product-image-upload"
                onChange={handleFileChange}
              />

              {!imagePreview ? (
                <label
                  htmlFor="product-image-upload"
                  className="flex flex-col items-center justify-center gap-3 w-full h-36 rounded-xl border-2 border-dashed border-dinora-border bg-dinora-bg hover:border-dinora-gold hover:bg-dinora-gold/5 cursor-pointer transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-dinora-gold/10 flex items-center justify-center group-hover:bg-dinora-gold/20 transition-colors">
                    <Upload className="w-5 h-5 text-dinora-gold" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-dinora-chocolate">
                      Rasm tanlash uchun bosing
                    </p>
                    <p className="text-xs text-dinora-chocolate/50 mt-0.5">
                      JPG, PNG, WEBP — max 5 MB
                    </p>
                  </div>
                </label>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-dinora-border bg-white">
                  <img
                    src={getImageUrl(imagePreview)}
                    alt="Rasm ko'rinishi"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logotip.png';
                    }}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    {imageUploading ? (
                      <div className="flex items-center gap-2 bg-white/90 rounded-full px-4 py-2">
                        <div className="w-4 h-4 border-2 border-dinora-gold border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-semibold text-dinora-chocolate">Yuklanmoqda...</span>
                      </div>
                    ) : imageUploadSuccess ? (
                      <div className="flex items-center gap-2 bg-emerald-500/90 rounded-full px-4 py-2">
                        <CheckCircle className="w-4 h-4 text-white" />
                        <span className="text-xs font-semibold text-white">Muvaffaqiyatli yuklandi</span>
                      </div>
                    ) : null}
                  </div>
                  <div className="absolute top-2 right-2 flex gap-2">
                    <label
                      htmlFor="product-image-upload"
                      className="cursor-pointer bg-white/90 hover:bg-white text-dinora-chocolate text-xs font-semibold px-3 py-1.5 rounded-lg shadow transition-colors"
                    >
                      Almashtirish
                    </label>
                    <button
                      type="button"
                      onClick={clearImage}
                      className="bg-red-500/90 hover:bg-red-500 text-white p-1.5 rounded-lg shadow transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
              {errors.image && (
                <p className="mt-1.5 text-xs text-dinora-pink">{errors.image}</p>
              )}
            </div>
          )}

          {imageMode === 'url' && imagePreview && (
            <div className="mt-3 rounded-xl overflow-hidden border border-dinora-border">
              <img
                src={getImageUrl(imagePreview)}
                alt="Ko'rinish"
                className="w-full h-32 object-cover"
                onError={() => setImagePreview(null)}
              />
            </div>
          )}
        </div>

        {/* Initial Stock Switch */}
        <div className="flex items-center justify-between p-3 bg-dinora-bg rounded-xl border border-dinora-border">
          <span className="text-xs font-bold text-dinora-chocolate">Sotuv holati</span>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 relative" />
            <span className="text-xs font-medium text-dinora-chocolate">
              {isAvailable ? 'Sotuvda mavjud' : 'Tugagan'}
            </span>
          </label>
        </div>

        {/* === YANGI: Ingredients, Storage, Delivery === */}
        <div className="space-y-4 p-3.5 bg-white rounded-2xl border border-dinora-border shadow-xs">
          <div className="flex items-center gap-1.5 mb-1">
            <Package className="w-3.5 h-3.5 text-dinora-pink" />
            <span className="text-[11px] font-bold text-dinora-chocolate uppercase tracking-wider">
              Qo'shimcha ma'lumotlar
            </span>
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-xs font-semibold text-dinora-chocolate uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-dinora-gold" />
              <span>Tarkibi va Masalliqlar</span>
            </label>
            <textarea
              rows={3}
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="Masalan: Un, shakar, tuxum, sariyog', vanillin..."
              className="w-full rounded-xl border border-dinora-border bg-white p-3 text-sm text-dinora-chocolate focus:border-dinora-gold focus:outline-none focus:ring-2 focus:ring-dinora-gold/30 resize-none"
            />
          </div>

          {/* Storage Conditions */}
          <div>
            <label className="block text-xs font-semibold text-dinora-chocolate uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-dinora-gold" />
              <span>Saqlash Sharoiti</span>
            </label>
            <textarea
              rows={3}
              value={storageConditions}
              onChange={(e) => setStorageConditions(e.target.value)}
              placeholder="Masalan: Muzlatgichda +2°C dan +6°C gacha, 48 soat saqlash muddati..."
              className="w-full rounded-xl border border-dinora-border bg-white p-3 text-sm text-dinora-chocolate focus:border-dinora-gold focus:outline-none focus:ring-2 focus:ring-dinora-gold/30 resize-none"
            />
          </div>

          {/* Delivery Terms */}
          <div>
            <label className="block text-xs font-semibold text-dinora-chocolate uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-dinora-gold" />
              <span>Yetkazib Berish Shartlari</span>
            </label>
            <textarea
              rows={3}
              value={deliveryTerms}
              onChange={(e) => setDeliveryTerms(e.target.value)}
              placeholder="Masalan: Sirdaryo tumani bo'ylab tezkor yetkazib berish..."
              className="w-full rounded-xl border border-dinora-border bg-white p-3 text-sm text-dinora-chocolate focus:border-dinora-gold focus:outline-none focus:ring-2 focus:ring-dinora-gold/30 resize-none"
            />
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-dinora-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('admin.cancel')}
          </Button>
          <Button
            type="submit"
            variant="gold"
            isLoading={isLoading || imageUploading}
            disabled={imageUploading}
          >
            {isEdit ? t('admin.save') : t('admin.add_product')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductModal;
