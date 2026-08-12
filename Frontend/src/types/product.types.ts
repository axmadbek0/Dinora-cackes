export interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  title?: string; // fallback alias for name
  description?: string | null;
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
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
  isAvailable?: boolean;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
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
