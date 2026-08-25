export interface Category {
  id: string;
  name: string;
  nameUz?: string | null;
  nameUzCyrl?: string | null;
  nameRu?: string | null;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  nameUz?: string | null;
  nameUzCyrl?: string | null;
  nameRu?: string | null;
  title?: string; // fallback alias for name
  description?: string | null;
  descriptionUz?: string | null;
  descriptionUzCyrl?: string | null;
  descriptionRu?: string | null;
  price: number | string;
  imageUrl?: string | null;
  isAvailable: boolean;
  categoryId: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDTO {
  name: string;
  nameUz?: string;
  nameUzCyrl?: string;
  nameRu?: string;
  description?: string;
  descriptionUz?: string;
  descriptionUzCyrl?: string;
  descriptionRu?: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
  isAvailable?: boolean;
}

export interface UpdateProductDTO {
  name?: string;
  nameUz?: string;
  nameUzCyrl?: string;
  nameRu?: string;
  description?: string;
  descriptionUz?: string;
  descriptionUzCyrl?: string;
  descriptionRu?: string;
  price?: number;
  imageUrl?: string;
  categoryId?: string;
  isAvailable?: boolean;
}

export interface ProductFilterParams {
  categoryId?: string;
  isAvailable?: boolean;
  search?: string;
}
